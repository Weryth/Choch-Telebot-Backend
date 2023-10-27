-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "quest" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
