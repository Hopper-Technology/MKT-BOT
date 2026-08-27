import { NextResponse } from "next/server";
import { apiError, cronUnauthorized, isCronAuthorized } from "@/lib/api";
import { runAutomationJob, type JobName } from "@/lib/automation";

const jobs = new Set<JobName>(["onboarding", "provision", "video-engagement", "facebook-engagement", "health", "report"]);

export async function GET(request: Request, context: { params: Promise<{ job: string }> }) {
  if (!isCronAuthorized(request)) return cronUnauthorized();
  const { job } = await context.params;
  if (!jobs.has(job as JobName)) return NextResponse.json({ error: "Unknown job" }, { status: 404 });
  try { return NextResponse.json(await runAutomationJob(job as JobName)); } catch (error) { return apiError(error, `Automation job ${job} failed`); }
}
