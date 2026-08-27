import { Frequency, Platform, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeSubscription } from "@/lib/serializers";

const frequencyMap = { "Once a day": Frequency.DAILY, "Once a week": Frequency.WEEKLY, "Once a month": Frequency.MONTHLY } as const;
const platformMap = { TikTok: Platform.TIKTOK, Facebook: Platform.FACEBOOK, YouTube: Platform.YOUTUBE } as const;

export async function GET() {
  try {
    const items = await prisma.subscription.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(items.map(serializeSubscription));
  } catch (error) { return apiError(error, "Unable to load subscriptions"); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string; channel?: keyof typeof platformMap; frequency?: keyof typeof frequencyMap; timePeriod?: string };
    if (!body.userId || !body.channel || !body.frequency) return NextResponse.json({ error: "userId, channel and frequency are required" }, { status: 400 });
    const item = await prisma.subscription.create({ data: { userId: body.userId.trim(), channel: platformMap[body.channel], frequency: frequencyMap[body.frequency], timePeriod: (body.timePeriod ?? "System default") as Prisma.InputJsonValue } });
    return NextResponse.json(serializeSubscription(item), { status: 201 });
  } catch (error) { return apiError(error, "Unable to create subscription"); }
}
