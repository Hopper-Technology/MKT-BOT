-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TIKTOK', 'FACEBOOK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "InteractionAction" AS ENUM ('FOLLOW', 'VIEW_VIDEO', 'LIKE_VIDEO', 'VIEW_POST', 'LIKE_POST', 'COMMENT_POST', 'SHARE_POST', 'HEALTH_CHECK', 'ACCOUNT_PROVISION');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('OWNED', 'PARTNER');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_accounts" (
    "email" VARCHAR(320) NOT NULL,
    "tiktok_userid" VARCHAR(191),
    "tiktok_pass" TEXT,
    "facebook_userid" VARCHAR(191),
    "facebook_pass" TEXT,
    "youtube_userid" VARCHAR(191),
    "youtube_pass" TEXT,
    "health" JSONB NOT NULL DEFAULT '{}',
    "issue" JSONB NOT NULL DEFAULT '{}',
    "status" JSONB NOT NULL DEFAULT '{}',
    "provisioningDue" BOOLEAN NOT NULL DEFAULT true,
    "engagementDue" BOOLEAN NOT NULL DEFAULT true,
    "healthRecheckDue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_accounts_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "userid" VARCHAR(191) NOT NULL,
    "channel" "Platform" NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "time_period" JSONB,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "engagementDue" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("userid","channel")
);

-- CreateTable
CREATE TABLE "interaction_logs" (
    "id" TEXT NOT NULL,
    "sourceEmail" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "channel" "Platform" NOT NULL,
    "action" "InteractionAction" NOT NULL,
    "durationMs" INTEGER,
    "status" "RunStatus" NOT NULL DEFAULT 'QUEUED',
    "message" TEXT,
    "externalRef" TEXT,
    "processedDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "processed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_accounts_tiktok_userid_key" ON "affiliate_accounts"("tiktok_userid");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_accounts_facebook_userid_key" ON "affiliate_accounts"("facebook_userid");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_accounts_youtube_userid_key" ON "affiliate_accounts"("youtube_userid");

-- CreateIndex
CREATE INDEX "subscriptions_status_frequency_idx" ON "subscriptions"("status", "frequency");

-- CreateIndex
CREATE INDEX "interaction_logs_createdAt_channel_action_status_idx" ON "interaction_logs"("createdAt", "channel", "action", "status");

-- CreateIndex
CREATE INDEX "interaction_logs_sourceEmail_processedDate_idx" ON "interaction_logs"("sourceEmail", "processedDate");

-- CreateIndex
CREATE INDEX "automation_runs_jobName_createdAt_idx" ON "automation_runs"("jobName", "createdAt");

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_sourceEmail_fkey" FOREIGN KEY ("sourceEmail") REFERENCES "affiliate_accounts"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_targetUserId_channel_fkey" FOREIGN KEY ("targetUserId", "channel") REFERENCES "subscriptions"("userid", "channel") ON DELETE RESTRICT ON UPDATE CASCADE;
