import type { AffiliateAccount as DbAccount, InteractionLog as DbLog, Subscription as DbSubscription } from "@prisma/client";
import type { AffiliateAccount, ChannelState, Frequency, HealthState, InteractionLog, Platform, RunState, Subscription } from "./types";

type JsonMap = Record<string, unknown>;

const platformKeys: Record<Platform, "TikTok" | "Facebook" | "YouTube"> = {
  TikTok: "TikTok",
  Facebook: "Facebook",
  YouTube: "YouTube",
};

function record(value: unknown): JsonMap {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonMap : {};
}

function nested(value: unknown, key: string) {
  return record(record(value)[key]);
}

function healthValue(value: unknown): HealthState {
  if (value === "Accessible" || value === "Inaccessible" || value === "Pending") return value;
  if (value === "Good") return "Accessible";
  if (value === "Bad") return "Inaccessible";
  return "Pending";
}

function channelState(account: DbAccount, platform: Platform): ChannelState {
  const key = platformKeys[platform];
  const health = nested(account.health, key);
  const issue = nested(account.issues, key);
  const status = nested(account.channelStatus, key);
  const userId = platform === "TikTok" ? account.tiktokUserId : platform === "Facebook" ? account.facebookUserId : account.youtubeUserId;
  return {
    userId,
    enabled: status.status === true,
    health: healthValue(health.status ?? health.Status),
    healthMessage: String(health.message ?? health.Message ?? ""),
    issueCount: Number(issue.count ?? issue.SL ?? 0),
    issueMessage: String(issue.message ?? issue.Message ?? ""),
  };
}

export function serializeAccount(account: DbAccount): AffiliateAccount {
  const gmail = nested(account.health, "Gmail");
  return {
    email: account.email,
    gmailHealth: healthValue(gmail.status ?? gmail.Status),
    createdAt: account.createdAt.toISOString(),
    provisioningDue: account.provisioningDue,
    channels: {
      TikTok: channelState(account, "TikTok"),
      Facebook: channelState(account, "Facebook"),
      YouTube: channelState(account, "YouTube"),
    },
  };
}

const frequencyFromDb: Record<DbSubscription["frequency"], Frequency> = {
  DAILY: "Once a day",
  WEEKLY: "Once a week",
  MONTHLY: "Once a month",
};

const platformFromDb: Record<DbSubscription["channel"], Platform> = {
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
};

export function serializeSubscription(item: DbSubscription): Subscription {
  const period = typeof item.timePeriod === "string" ? item.timePeriod : String(record(item.timePeriod).label ?? "System default");
  return {
    id: `${item.channel}:${item.userId}`,
    userId: item.userId,
    channel: platformFromDb[item.channel],
    frequency: frequencyFromDb[item.frequency],
    timePeriod: period,
    enabled: item.status,
    createdAt: item.createdAt.toISOString(),
  };
}

const actionLabels: Record<DbLog["action"], string> = {
  FOLLOW: "Follow channel",
  VIEW_VIDEO: "View video",
  LIKE_VIDEO: "Like video",
  VIEW_POST: "View post",
  LIKE_POST: "Like post",
  COMMENT_POST: "Comment post",
  SHARE_POST: "Share post",
  HEALTH_CHECK: "Health check",
  ACCOUNT_PROVISION: "Account provision",
};

const runStates: Record<DbLog["status"], RunState> = {
  QUEUED: "Queued",
  RUNNING: "Running",
  SUCCESS: "Success",
  FAILED: "Failed",
  SKIPPED: "Skipped",
};

export function serializeLog(item: DbLog): InteractionLog {
  return {
    id: item.id,
    time: item.createdAt.toISOString(),
    source: item.sourceEmail,
    target: item.targetUserId,
    channel: platformFromDb[item.channel],
    action: actionLabels[item.action],
    duration: item.durationMs == null ? "—" : item.durationMs >= 60_000 ? `${(item.durationMs / 60_000).toFixed(1)}m` : `${(item.durationMs / 1000).toFixed(1)}s`,
    status: runStates[item.status],
    message: item.message ?? undefined,
  };
}
