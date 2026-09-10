ALTER TABLE "interaction_logs" DROP CONSTRAINT IF EXISTS "interaction_logs_targetUserId_channel_fkey";
ALTER TABLE "interaction_logs" ADD COLUMN "dedupe_key" TEXT;
CREATE UNIQUE INDEX "interaction_logs_dedupe_key_key" ON "interaction_logs"("dedupe_key");
