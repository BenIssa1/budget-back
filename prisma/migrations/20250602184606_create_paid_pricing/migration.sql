-- CreateTable
CREATE TABLE "PaidPricing" (
    "id" SERIAL NOT NULL,
    "ordernumber" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaidPricing_pkey" PRIMARY KEY ("id")
);
