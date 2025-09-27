-- CreateTable
CREATE TABLE "public"."Call" (
    "id" SERIAL NOT NULL,
    "call_id" TEXT NOT NULL,
    "extension_number" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "cost" DOUBLE PRECISION,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_call_id_key" ON "public"."Call"("call_id");
