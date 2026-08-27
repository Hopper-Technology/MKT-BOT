import { Platform } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeSubscription } from "@/lib/serializers";

const platformMap = { TikTok: Platform.TIKTOK, Facebook: Platform.FACEBOOK, YouTube: Platform.YOUTUBE } as const;

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { userId?: string; channel?: keyof typeof platformMap; status?: boolean };
    if (!body.userId || !body.channel || typeof body.status !== "boolean") return NextResponse.json({ error: "userId, channel and status are required" }, { status: 400 });
    const item = await prisma.subscription.update({ where: { userId_channel: { userId: body.userId, channel: platformMap[body.channel] } }, data: { status: body.status, ...(body.status ? { engagementDue: true } : {}) } });
    return NextResponse.json(serializeSubscription(item));
  } catch (error) { return apiError(error, "Unable to update subscription"); }
}
