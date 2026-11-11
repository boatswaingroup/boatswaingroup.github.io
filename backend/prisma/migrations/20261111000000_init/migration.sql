CREATE TYPE "CustomerRole" AS ENUM ('CUSTOMER', 'ADMIN', 'SALES', 'FINANCE');
CREATE TYPE "PlotStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ALLOCATED', 'WITHDRAWN');
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'CONVERTED');

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "CustomerRole" NOT NULL DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Estate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estate_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Plot" (
  "id" TEXT NOT NULL,
  "estateId" TEXT NOT NULL,
  "plotCode" TEXT NOT NULL,
  "sizeSqm" INTEGER,
  "priceKobo" BIGINT,
  "status" "PlotStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Reservation" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "plotId" TEXT NOT NULL,
  "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Enquiry" (
  "id" TEXT NOT NULL,
  "customerId" TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "interest" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Estate_slug_key" ON "Estate"("slug");
CREATE UNIQUE INDEX "Plot_estateId_plotCode_key" ON "Plot"("estateId", "plotCode");
CREATE INDEX "Plot_estateId_status_idx" ON "Plot"("estateId", "status");
CREATE INDEX "Reservation_plotId_status_expiresAt_idx" ON "Reservation"("plotId", "status", "expiresAt");
CREATE INDEX "Reservation_customerId_createdAt_idx" ON "Reservation"("customerId", "createdAt");
CREATE INDEX "Enquiry_createdAt_idx" ON "Enquiry"("createdAt");

ALTER TABLE "Plot" ADD CONSTRAINT "Plot_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "Estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
