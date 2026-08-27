export type Platform = "TikTok" | "Facebook" | "YouTube";
export type Frequency = "Once a day" | "Once a week" | "Once a month";
export type HealthState = "Accessible" | "Inaccessible" | "Pending";
export type RunState = "Success" | "Failed" | "Running" | "Queued" | "Skipped";

export interface ChannelState {
  userId: string | null;
  enabled: boolean;
  health: HealthState;
  healthMessage: string;
  issueCount: number;
  issueMessage: string;
}

export interface AffiliateAccount {
  email: string;
  channels: Record<Platform, ChannelState>;
  gmailHealth: HealthState;
  createdAt: string;
  provisioningDue?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  channel: Platform;
  frequency: Frequency;
  timePeriod: string;
  enabled: boolean;
  createdAt: string;
}

export interface InteractionLog {
  id: string;
  time: string;
  source: string;
  target: string;
  channel: Platform;
  action: string;
  duration: string;
  status: RunState;
  message?: string;
}

export interface AutomationJob {
  name: string;
  schedule: string;
  description: string;
  lastRun: string;
  status: RunState;
}
