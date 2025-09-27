-- CreateTable
CREATE TABLE "Extension" (
    "id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "callerIdName" TEXT NOT NULL,
    "emailAddr" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "presenceStatus" TEXT NOT NULL,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);
