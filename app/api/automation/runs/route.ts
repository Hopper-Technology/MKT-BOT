import { NextResponse } from "next/server";
import { adminUnauthorized, apiError, requireAdmin } from "@/lib/api";
import { runAutomationJob, type JobName } from "@/lib/automation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!await requireAdmin()) return adminUnauthorized();

  try {
    const rawLimit = Number(new URL(request.url).searchParams.get("limit") ?? 20);
    const take = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.floor(rawLimit), 100)) : 20;
    const runs = await prisma.automationRun.findMany({
      take,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(runs.map((run) => ({
      id: run.id,
      jobName: run.jobName,
      status: run.status,
      startedAt: run.startedAt?.toISOString() ?? null,
      finishedAt: run.finishedAt?.toISOString() ?? null,
      processed: run.processed,
      failed: run.failed,
      metadata: run.metadata,
      createdAt: run.createdAt.toISOString(),
    })));
  } catch (error) { return apiError(error, "Unable to load automation runs"); }
}

const jobs: JobName[] = ["onboarding", "provision", "video-engagement", "facebook-engagement", "health", "report"];

export async function POST(request: Request) {
  if (!await requireAdmin()) return adminUnauthorized();
  try {
    const body = await request.json() as { jobName?: string };
    if (!body.jobName || !jobs.includes(body.jobName as JobName)) return NextResponse.json({ error: "A valid jobName is required" }, { status: 400 });
    const result = await runAutomationJob(body.jobName as JobName);
    return NextResponse.json(result, { status: 202 });
  } catch (error) { return apiError(error, "Unable to run automation job"); }
}
