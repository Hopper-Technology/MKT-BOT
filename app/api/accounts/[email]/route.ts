import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { serializeAccount } from "@/lib/serializers";
import type { AffiliateAccount, Platform } from "@/lib/types";

const platforms: Platform[] = ["TikTok", "Facebook", "YouTube"];

export async function PATCH(request: Request, context: { params: Promise<{ email: string }> }) {
  try {
    const { email } = await context.params;
    const body = await request.json() as AffiliateAccount;
    if (!body.channels) return NextResponse.json({ error: "Account channels are required" }, { status: 400 });
    const health = {
      Gmail: { status: body.gmailHealth, message: "" },
      ...Object.fromEntries(platforms.map((platform) => [platform, { status: body.channels[platform].health, message: body.channels[platform].healthMessage }])),
    };
    const issues = Object.fromEntries(platforms.map((platform) => [platform, { count: body.channels[platform].issueCount, message: body.channels[platform].issueMessage }]));
    const channelStatus = Object.fromEntries(platforms.map((platform) => [platform, { status: body.channels[platform].enabled }]));
    const account = await prisma.affiliateAccount.update({
      where: { email: decodeURIComponent(email) },
      data: {
        tiktokUserId: body.channels.TikTok.userId,
        facebookUserId: body.channels.Facebook.userId,
        youtubeUserId: body.channels.YouTube.userId,
        health,
        issues,
        channelStatus,
        provisioningDue: platforms.some((platform) => !body.channels[platform].userId),
        healthRecheckDue: platforms.some((platform) => body.channels[platform].enabled && body.channels[platform].health !== "Accessible"),
      },
    });
    return NextResponse.json(serializeAccount(account));
  } catch (error) { return apiError(error, "Unable to update account"); }
}
