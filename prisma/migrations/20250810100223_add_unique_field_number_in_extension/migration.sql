/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Extension` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Extension_number_key" ON "public"."Extension"("number");
