ALTER TYPE "LedgerEntryType" ADD VALUE 'WALLET_FUNDING';
CREATE TYPE "VirtualAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'FAILED');
CREATE TYPE "WalletFundingStatus" AS ENUM ('RECEIVED', 'SETTLED', 'REJECTED', 'REVERSED');

ALTER TABLE "LedgerEntry" ALTER COLUMN "reservationId" DROP NOT NULL;
ALTER TABLE "LedgerEntry" ADD COLUMN "walletFundingId" TEXT;

CREATE TABLE "VirtualAccount" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountRef" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "VirtualAccountStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VirtualAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WalletFunding" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "virtualAccountId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerTransactionId" TEXT NOT NULL,
  "amountKobo" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "WalletFundingStatus" NOT NULL DEFAULT 'RECEIVED',
  "settledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletFunding_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletFunding_amountKobo_check" CHECK ("amountKobo" > 0)
);

CREATE UNIQUE INDEX "VirtualAccount_provider_providerAccountRef_key" ON "VirtualAccount"("provider", "providerAccountRef");
CREATE UNIQUE INDEX "VirtualAccount_provider_accountNumber_key" ON "VirtualAccount"("provider", "accountNumber");
CREATE INDEX "VirtualAccount_customerId_status_idx" ON "VirtualAccount"("customerId", "status");
CREATE UNIQUE INDEX "WalletFunding_provider_providerTransactionId_key" ON "WalletFunding"("provider", "providerTransactionId");
CREATE INDEX "WalletFunding_customerId_createdAt_idx" ON "WalletFunding"("customerId", "createdAt");
CREATE INDEX "WalletFunding_virtualAccountId_status_idx" ON "WalletFunding"("virtualAccountId", "status");
CREATE UNIQUE INDEX "LedgerEntry_walletFundingId_key" ON "LedgerEntry"("walletFundingId");

ALTER TABLE "VirtualAccount" ADD CONSTRAINT "VirtualAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WalletFunding" ADD CONSTRAINT "WalletFunding_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WalletFunding" ADD CONSTRAINT "WalletFunding_virtualAccountId_fkey" FOREIGN KEY ("virtualAccountId") REFERENCES "VirtualAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletFundingId_fkey" FOREIGN KEY ("walletFundingId") REFERENCES "WalletFunding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
