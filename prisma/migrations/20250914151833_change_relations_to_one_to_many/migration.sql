/*
  Warnings:

  - You are about to drop the column `extensionId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `extensionId` on the `budget` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_extensionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."budget" DROP CONSTRAINT "budget_extensionId_fkey";

-- DropIndex
DROP INDEX "public"."Service_extensionId_key";

-- DropIndex
DROP INDEX "public"."budget_extensionId_key";

-- AlterTable
ALTER TABLE "public"."Extension" ADD COLUMN     "budgetId" INTEGER,
ADD COLUMN     "serviceId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "extensionId";

-- AlterTable
ALTER TABLE "public"."budget" DROP COLUMN "extensionId";

-- AddForeignKey
ALTER TABLE "public"."Extension" ADD CONSTRAINT "Extension_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Extension" ADD CONSTRAINT "Extension_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "public"."budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
