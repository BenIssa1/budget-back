-- AlterTable
ALTER TABLE "public"."Extension" ALTER COLUMN "callerIdName" DROP NOT NULL,
ALTER COLUMN "emailAddr" DROP NOT NULL,
ALTER COLUMN "mobileNumber" DROP NOT NULL,
ALTER COLUMN "timezone" DROP NOT NULL,
ALTER COLUMN "presenceStatus" DROP NOT NULL;
