CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "PasswordResetToken_customerId_createdAt_idx" ON "PasswordResetToken"("customerId", "createdAt");
CREATE INDEX "PasswordResetToken_expiresAt_usedAt_idx" ON "PasswordResetToken"("expiresAt", "usedAt");

ALTER TABLE "PasswordResetToken"
ADD CONSTRAINT "PasswordResetToken_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
