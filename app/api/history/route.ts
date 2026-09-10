import { NextResponse } from "next/server";
import { adminUnauthorized, apiError, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeLog } from "@/lib/serializers";

export async function GET(request: Request) {
  if (!await requireAdmin()) return adminUnauthorized();
  try {
    const params = new URL(request.url).searchParams;
    const rawLimit = Number(params.get("limit") ?? 100);
    const take = Number.isFinite(rawLimit) ? Math.max(1, Math.min(Math.floor(rawLimit), 500)) : 100;
    const from = params.get("from");
    const to = params.get("to");
    const createdAt = {
      ...(from && !Number.isNaN(Date.parse(from)) ? { gte: new Date(from) } : {}),
      ...(to && !Number.isNaN(Date.parse(to)) ? { lte: new Date(to) } : {}),
    };
    const items = await prisma.interactionLog.findMany({
      take, where: Object.keys(createdAt).length ? { createdAt } : undefined, orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items.map(serializeLog));
  } catch (error) { return apiError(error, "Unable to load history"); }
}
