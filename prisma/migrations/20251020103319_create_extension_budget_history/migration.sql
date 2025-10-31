-- CreateTable
CREATE TABLE "public"."ExtensionBudgetHistory" (
    "id" SERIAL NOT NULL,
    "extensionId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "budgetAmount" DOUBLE PRECISION NOT NULL,
    "budgetLabel" VARCHAR(225),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtensionBudgetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExtensionBudgetHistory_year_month_idx" ON "public"."ExtensionBudgetHistory"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionBudgetHistory_extensionId_year_month_key" ON "public"."ExtensionBudgetHistory"("extensionId", "year", "month");

-- AddForeignKey
ALTER TABLE "public"."ExtensionBudgetHistory" ADD CONSTRAINT "ExtensionBudgetHistory_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "public"."Extension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
