-- CreateTable
CREATE TABLE "public"."Configuration" (
    "id" SERIAL NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "clientId" VARCHAR(255) NOT NULL,
    "secretId" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);
