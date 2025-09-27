-- CreateTable
CREATE TABLE "PricingFree" (
    "id" SERIAL NOT NULL,
    "contact" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingFree_pkey" PRIMARY KEY ("id")
);
