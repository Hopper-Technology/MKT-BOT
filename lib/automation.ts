import { InteractionAction, Platform, Prisma, RunStatus, TargetType } from "@prisma/client";
import { prisma } from "./db";

export type JobName = "onboarding" | "provision" | "video-engagement" | "facebook-engagement" | "health" | "report";

const isDryRun = () => process.env.AUTOMATION_DRY_RUN !== "false";

function bangkokHour() {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", hour12: false }).format(new Date()));
}

function withinEngagementWindow(kind: JobName) {
  const hour = bangkokHour();
  if (kind === "video-engagement") return hour >= 6;
  if (kind === "facebook-engagement") return hour >= 6;
  return true;
}

async function createRun(jobName: JobName) {
  return prisma.automationRun.create({ data: { jobName, status: RunStatus.RUNNING, startedAt: new Date(), metadata: { dryRun: isDryRun(), timezone: "Asia/Bangkok" } } });
}

async function finishRun(id: string, status: RunStatus, processed: number, failed = 0, metadata?: Prisma.InputJsonObject) {
  return prisma.automationRun.update({ where: { id }, data: { status, processed, failed, finishedAt: new Date(), ...(metadata ? { metadata } : {}) } });
}

async function planProvisioning(runId: string) {
  const accounts = await prisma.affiliateAccount.findMany({ where: { provisioningDue: true }, take: 100, orderBy: { createdAt: "asc" } });
  // External account creation must be implemented by an approved provider. The
  // control plane records reviewable work; it never bypasses CAPTCHA or platform controls.
  await Promise.all(accounts.map((account) => prisma.interactionLog.create({ data: { sourceEmail: account.email, targetUserId: account.email, targetType: TargetType.OWNED, channel: Platform.YOUTUBE, action: InteractionAction.ACCOUNT_PROVISION, status: RunStatus.QUEUED, message: `Operator/provider handoff required (run ${runId})`, processedDate: new Date() } })));
  return { processed: accounts.length, metadata: { mode: "approval-gated", order: ["YOUTUBE", "FACEBOOK", "TIKTOK"], delaySeconds: 60 } };
}

async function planOnboarding() {
  const accountCount = await prisma.affiliateAccount.count({ where: { engagementDue: true } });
  const partnerCount = await prisma.subscription.count({ where: { engagementDue: true, status: true } });
  return { processed: accountCount + partnerCount, metadata: { plannedOwned: accountCount, plannedPartners: partnerCount, dryRun: isDryRun() } };
}

async function planEngagement(kind: "video-engagement" | "facebook-engagement") {
  if (!withinEngagementWindow(kind)) return { processed: 0, metadata: { skipped: "cutoff-window", timezone: "Asia/Bangkok" } };
  const channel = kind === "facebook-engagement" ? Platform.FACEBOOK : undefined;
  const targets = await prisma.subscription.findMany({ where: { status: true, ...(channel ? { channel } : {}) }, take: 10, orderBy: [{ frequency: "asc" }, { createdAt: "asc" }] });
  return { processed: targets.length, metadata: { candidates: targets.map((target) => `${target.channel}:${target.userId}`), execution: "official-provider-only", dryRun: isDryRun() } };
}

async function planHealthChecks() {
  const accounts = await prisma.affiliateAccount.count();
  return { processed: accounts, metadata: { sequence: ["YOUTUBE", "FACEBOOK", "TIKTOK"], delaySeconds: 60, execution: "official-provider-only" } };
}

async function sendReport() {
  const [accounts, partners, runs, failed] = await Promise.all([prisma.affiliateAccount.count(), prisma.subscription.count(), prisma.interactionLog.count({ where: { createdAt: { gte: new Date(Date.now() - 86_400_000) } } }), prisma.interactionLog.count({ where: { status: RunStatus.FAILED, createdAt: { gte: new Date(Date.now() - 86_400_000) } } })]);
  const summary = { accounts, partners, interactions24h: runs, failed24h: failed };
  if (isDryRun() || !process.env.BREVO_API_KEY || !process.env.REPORT_TO_EMAIL || !process.env.REPORT_FROM_EMAIL) return { processed: 1, metadata: { summary, delivery: "dry-run" } };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "content-type": "application/json" }, body: JSON.stringify({ sender: { email: process.env.REPORT_FROM_EMAIL, name: "MKT-BOT" }, to: [{ email: process.env.REPORT_TO_EMAIL }], subject: "MKT-BOT daily operations report", htmlContent: `<h1>Daily operations</h1><p>Accounts: ${accounts}</p><p>Partners: ${partners}</p><p>Interactions (24h): ${runs}</p><p>Failed: ${failed}</p>` }) });
  if (!response.ok) throw new Error(`Brevo returned ${response.status}`);
  return { processed: 1, metadata: { summary, delivery: "brevo" } };
}

export async function runAutomationJob(jobName: JobName) {
  const run = await createRun(jobName);
  try {
    const result = jobName === "provision" ? await planProvisioning(run.id) : jobName === "onboarding" ? await planOnboarding() : jobName === "video-engagement" || jobName === "facebook-engagement" ? await planEngagement(jobName) : jobName === "health" ? await planHealthChecks() : await sendReport();
    await finishRun(run.id, RunStatus.SUCCESS, result.processed, 0, { ...result.metadata, dryRun: isDryRun() });
    return { runId: run.id, status: "success", ...result };
  } catch (error) {
    await finishRun(run.id, RunStatus.FAILED, 0, 1, { error: error instanceof Error ? error.message : "Unknown error", dryRun: isDryRun() });
    throw error;
  }
}
