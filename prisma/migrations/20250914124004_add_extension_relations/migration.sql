/*
  Warnings:

  - A unique constraint covering the columns `[extensionId]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[extensionId]` on the table `budget` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "extensionId" INTEGER;

-- AlterTable
ALTER TABLE "public"."budget" ADD COLUMN     "extensionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Service_extensionId_key" ON "public"."Service"("extensionId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_extensionId_key" ON "public"."budget"("extensionId");

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "public"."Extension"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."budget" ADD CONSTRAINT "budget_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "public"."Extension"("id") ON DELETE SET NULL ON UPDATE CASCADE;
