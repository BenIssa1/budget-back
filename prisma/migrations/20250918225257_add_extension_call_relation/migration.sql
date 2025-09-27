-- AlterTable
ALTER TABLE "public"."Call" ADD COLUMN     "extensionId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Call" ADD CONSTRAINT "Call_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "public"."Extension"("id") ON DELETE SET NULL ON UPDATE CASCADE;
