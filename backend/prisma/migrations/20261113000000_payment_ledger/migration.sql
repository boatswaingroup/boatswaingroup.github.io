CREATE TYPE "PaymentProvider" AS ENUM ('MOCK', 'PAYSTACK', 'FLUTTERWAVE', 'MANUAL');
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED');
CREATE TYPE "InstallmentStatus" AS ENUM ('DUE', 'PAID', 'OVERDUE', 'WAIVED');
CREATE TYPE "LedgerDirection" AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT', 'INSTALLMENT', 'REFUND', 'ADJUSTMENT');

CREATE TABLE "PaymentPlan" (
  "id" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "totalPriceKobo" BIGINT NOT NULL,
  "depositDueKobo" BIGINT NOT NULL,
  "installmentCount" INTEGER NOT NULL DEFAULT 0,
  "intervalDays" INTEGER,
  "status" "PaymentPlanStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentPlan_totalPriceKobo_check" CHECK ("totalPriceKobo" > 0),
  CONSTRAINT "PaymentPlan_depositDueKobo_check" CHECK ("depositDueKobo" >= 0 AND "depositDueKobo" <= "totalPriceKobo"),
  CONSTRAINT "PaymentPlan_installmentCount_check" CHECK ("installmentCount" >= 0),
  CONSTRAINT "PaymentPlan_intervalDays_check" CHECK ("intervalDays" IS NULL OR "intervalDays" > 0)
);

CREATE TABLE "Installment" (
  "id" TEXT NOT NULL,
  "paymentPlanId" TEXT NOT NULL,
  "sequenceNumber" INTEGER NOT NULL,
  "amountKobo" BIGINT NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "status" "InstallmentStatus" NOT NULL DEFAULT 'DUE',
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Installment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Installment_sequenceNumber_check" CHECK ("sequenceNumber" > 0),
  CONSTRAINT "Installment_amountKobo_check" CHECK ("amountKobo" > 0)
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "paymentPlanId" TEXT,
  "installmentId" TEXT,
  "provider" "PaymentProvider" NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
  "amountKobo" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "idempotencyKey" TEXT NOT NULL,
  "providerReference" TEXT,
  "checkoutUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_amountKobo_check" CHECK ("amountKobo" > 0)
);

CREATE TABLE "PaymentEvent" (
  "id" TEXT NOT NULL,
  "provider" "PaymentProvider" NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  "processingError" TEXT,
  CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LedgerEntry" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "paymentPlanId" TEXT,
  "paymentId" TEXT,
  "direction" "LedgerDirection" NOT NULL,
  "entryType" "LedgerEntryType" NOT NULL,
  "amountKobo" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "reference" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LedgerEntry_amountKobo_check" CHECK ("amountKobo" > 0)
);

CREATE UNIQUE INDEX "PaymentPlan_reservationId_key" ON "PaymentPlan"("reservationId");
CREATE INDEX "PaymentPlan_customerId_status_idx" ON "PaymentPlan"("customerId", "status");
CREATE UNIQUE INDEX "Installment_paymentPlanId_sequenceNumber_key" ON "Installment"("paymentPlanId", "sequenceNumber");
CREATE INDEX "Installment_dueAt_status_idx" ON "Installment"("dueAt", "status");
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
CREATE UNIQUE INDEX "Payment_providerReference_key" ON "Payment"("providerReference");
CREATE INDEX "Payment_customerId_createdAt_idx" ON "Payment"("customerId", "createdAt");
CREATE INDEX "Payment_reservationId_status_idx" ON "Payment"("reservationId", "status");
CREATE UNIQUE INDEX "PaymentEvent_provider_providerEventId_key" ON "PaymentEvent"("provider", "providerEventId");
CREATE INDEX "PaymentEvent_receivedAt_idx" ON "PaymentEvent"("receivedAt");
CREATE UNIQUE INDEX "LedgerEntry_reference_key" ON "LedgerEntry"("reference");
CREATE INDEX "LedgerEntry_customerId_createdAt_idx" ON "LedgerEntry"("customerId", "createdAt");
CREATE INDEX "LedgerEntry_reservationId_createdAt_idx" ON "LedgerEntry"("reservationId", "createdAt");

ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "PaymentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "PaymentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentPlanId_fkey" FOREIGN KEY ("paymentPlanId") REFERENCES "PaymentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Financial ledger rows are immutable. Corrections must be recorded as compensating entries.
CREATE FUNCTION prevent_ledger_entry_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable; post a compensating entry instead';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "LedgerEntry_immutable_update"
BEFORE UPDATE OR DELETE ON "LedgerEntry"
FOR EACH ROW EXECUTE FUNCTION prevent_ledger_entry_mutation();
