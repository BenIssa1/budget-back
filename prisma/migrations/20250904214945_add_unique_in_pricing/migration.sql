/*
  Warnings:

  - A unique constraint covering the columns `[ordernumber]` on the table `PaidPricing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact]` on the table `PricingFree` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PaidPricing_ordernumber_key" ON "public"."PaidPricing"("ordernumber");

-- CreateIndex
CREATE UNIQUE INDEX "PricingFree_contact_key" ON "public"."PricingFree"("contact");
