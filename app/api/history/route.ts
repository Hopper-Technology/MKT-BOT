import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeLog } from "@/lib/serializers";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const take = Math.min(Number(params.get("limit") ?? 100), 500);
    const items = await prisma.interactionLog.findMany({ take, orderBy: { createdAt: "desc" } });
    return NextResponse.json(items.map(serializeLog));
  } catch (error) { return apiError(error, "Unable to load history"); }
}
