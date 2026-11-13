CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Session_customerId_revokedAt_expiresAt_idx" ON "Session"("customerId", "revokedAt", "expiresAt");
ALTER TABLE "Session" ADD CONSTRAINT "Session_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
