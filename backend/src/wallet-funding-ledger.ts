import { LedgerDirection, LedgerEntryType, Prisma, PrismaClient, WalletFundingStatus } from '@prisma/client';

/**
 * Credits a wallet only after an upstream provider adapter has independently
 * verified the bank-transfer notification and marked the funding record eligible.
 *
 * The status transition and ledger insert share one database transaction. A
 * repeated call for an already-settled funding returns the existing ledger row.
 */
export async function settleVerifiedWalletFunding(
  db: PrismaClient,
  walletFundingId: string
) {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const funding = await tx.walletFunding.findUnique({
      where: { id: walletFundingId },
      include: { virtualAccount: true }
    });

    if (!funding) throw new Error('Wallet funding record not found');

    if (funding.status === WalletFundingStatus.SETTLED) {
      const existing = await tx.ledgerEntry.findUnique({
        where: { walletFundingId: funding.id }
      });
      if (!existing) throw new Error('Settled funding is missing its ledger entry');
      return existing;
    }

    if (funding.status !== WalletFundingStatus.RECEIVED) {
      throw new Error('Wallet funding is not eligible for settlement');
    }
    if (funding.virtualAccount.customerId !== funding.customerId) {
      throw new Error('Funding customer does not own the receiving virtual account');
    }
    if (funding.amountKobo <= 0n) throw new Error('Funding amount must be positive');
    if (funding.currency !== 'NGN' || funding.virtualAccount.currency !== 'NGN') {
      throw new Error('Only NGN wallet funding is supported');
    }

    // Conditional update is the concurrency gate: only one caller can claim
    // a RECEIVED record. The unique ledger relation is a second idempotency guard.
    const claimed = await tx.walletFunding.updateMany({
      where: { id: funding.id, status: WalletFundingStatus.RECEIVED },
      data: { status: WalletFundingStatus.SETTLED, settledAt: new Date() }
    });
    if (claimed.count !== 1) {
      const latest = await tx.ledgerEntry.findUnique({ where: { walletFundingId: funding.id } });
      if (latest) return latest;
      throw new Error('Wallet funding is being processed; retry safely');
    }

    return tx.ledgerEntry.create({
      data: {
        customerId: funding.customerId,
        walletFundingId: funding.id,
        direction: LedgerDirection.CREDIT,
        entryType: LedgerEntryType.WALLET_FUNDING,
        amountKobo: funding.amountKobo,
        currency: funding.currency,
        reference: `wallet-funding:${funding.provider}:${funding.providerTransactionId}`,
        description: 'Verified bank transfer wallet funding'
      }
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
