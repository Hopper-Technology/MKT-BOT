import type { AffiliateAccount, AutomationJob, InteractionLog, Subscription } from "./types";

const channel = (
  userId: string | null,
  enabled = true,
  health: "Accessible" | "Inaccessible" | "Pending" = userId ? "Accessible" : "Pending",
  issueCount = 0,
  issueMessage = "",
) => ({
  userId,
  enabled,
  health,
  healthMessage: health === "Inaccessible" ? "Authentication needs attention" : "Connection verified",
  issueCount,
  issueMessage,
});

export const initialAccounts: AffiliateAccount[] = [
  {
    email: "affiliate01@hopper.capital",
    gmailHealth: "Accessible",
    createdAt: "2026-08-18T07:15:00.000Z",
    channels: {
      TikTok: channel("@hopper.daily"),
      Facebook: channel("hopper.daily"),
      YouTube: channel("@HopperDaily"),
    },
  },
  {
    email: "creator.lab@hopper.capital",
    gmailHealth: "Accessible",
    createdAt: "2026-08-19T10:30:00.000Z",
    channels: {
      TikTok: channel("@creator.lab"),
      Facebook: channel("creator.lab", false, "Inaccessible", 1, "Session expired"),
      YouTube: channel("@CreatorLab"),
    },
  },
  {
    email: "marketing.pro@hopper.capital",
    gmailHealth: "Accessible",
    createdAt: "2026-08-21T04:05:00.000Z",
    channels: {
      TikTok: channel("@marketing.pro"),
      Facebook: channel("marketing.pro"),
      YouTube: channel("@MarketingPro", false, "Inaccessible", 1, "Policy warning requires review"),
    },
  },
  {
    email: "new.channel@hopper.capital",
    gmailHealth: "Accessible",
    createdAt: "2026-08-25T12:20:00.000Z",
    provisioningDue: true,
    channels: {
      TikTok: channel(null, false),
      Facebook: channel(null, false),
      YouTube: channel(null, false),
    },
  },
];

export const initialSubscriptions: Subscription[] = [
  { id: "sub-1", userId: "@greenstudio", channel: "TikTok", frequency: "Once a day", timePeriod: "06:00–12:00", enabled: true, createdAt: "2026-08-18" },
  { id: "sub-2", userId: "hopper-partners", channel: "Facebook", frequency: "Once a week", timePeriod: "Mon · 12:00–18:00", enabled: true, createdAt: "2026-08-19" },
  { id: "sub-3", userId: "@buildwithus", channel: "YouTube", frequency: "Once a month", timePeriod: "1–10 · 18:00–24:00", enabled: false, createdAt: "2026-08-20" },
  { id: "sub-4", userId: "@dailycraft", channel: "TikTok", frequency: "Once a day", timePeriod: "18:00–24:00", enabled: true, createdAt: "2026-08-21" },
  { id: "sub-5", userId: "future-makers", channel: "Facebook", frequency: "Once a week", timePeriod: "Fri · 06:00–12:00", enabled: true, createdAt: "2026-08-22" },
];

export const initialHistory: InteractionLog[] = [
  { id: "log-1", time: "2026-08-26T10:42:15+07:00", source: "@hopper.daily", target: "@greenstudio", channel: "TikTok", action: "Like video", duration: "28.4s", status: "Success" },
  { id: "log-2", time: "2026-08-26T10:41:03+07:00", source: "creator.lab", target: "hopper-partners", channel: "Facebook", action: "Follow channel", duration: "3.5s", status: "Success" },
  { id: "log-3", time: "2026-08-26T10:39:50+07:00", source: "@MarketingPro", target: "@buildwithus", channel: "YouTube", action: "View video", duration: "2m 14s", status: "Failed", message: "Target video unavailable" },
  { id: "log-4", time: "2026-08-26T10:35:12+07:00", source: "@creator.lab", target: "@dailycraft", channel: "TikTok", action: "View video", duration: "45.0s", status: "Success" },
  { id: "log-5", time: "2026-08-26T10:30:05+07:00", source: "marketing.pro", target: "future-makers", channel: "Facebook", action: "Share post", duration: "2.1s", status: "Success" },
  { id: "log-6", time: "2026-08-26T09:55:20+07:00", source: "hopper.daily", target: "future-makers", channel: "Facebook", action: "Comment post", duration: "4.8s", status: "Success" },
];

export const automationJobs: AutomationJob[] = [
  { name: "Provision social accounts", schedule: "22:00 daily", description: "YouTube → Facebook → TikTok, approval-gated", lastRun: "Yesterday, 22:00", status: "Success" },
  { name: "Onboard new targets", schedule: "21:00 daily", description: "Queue follows for new owned and partner channels", lastRun: "Yesterday, 21:00", status: "Success" },
  { name: "Video engagement", schedule: "Every 30 min · 06:00–24:00", description: "Select up to 10 eligible targets per run", lastRun: "11 minutes ago", status: "Running" },
  { name: "Facebook post engagement", schedule: "Every 2 hr · from 06:15", description: "View and queue approved post actions", lastRun: "1 hour ago", status: "Success" },
  { name: "Channel health check", schedule: "Sunday · 00:00", description: "Verify access and unresolved policy issues", lastRun: "3 days ago", status: "Failed" },
  { name: "Daily operations report", schedule: "Daily · 00:15", description: "Send summary through Brevo", lastRun: "Yesterday, 00:15", status: "Success" },
];
