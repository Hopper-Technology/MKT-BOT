import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiError } from "@/lib/api";
import { serializeAccount } from "@/lib/serializers";

const initialChannelState = { TikTok: { status: false }, Facebook: { status: false }, YouTube: { status: false } };
const initialHealth = { Gmail: { status: "Pending", message: "Awaiting verification" }, TikTok: { status: "Pending", message: "Awaiting provisioning" }, Facebook: { status: "Pending", message: "Awaiting provisioning" }, YouTube: { status: "Pending", message: "Awaiting provisioning" } };
const initialIssues = { TikTok: { count: 0, message: "" }, Facebook: { count: 0, message: "" }, YouTube: { count: 0, message: "" } };

export async function GET() {
  try {
    const accounts = await prisma.affiliateAccount.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(accounts.map(serializeAccount));
  } catch (error) { return apiError(error, "Unable to load accounts"); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    const account = await prisma.affiliateAccount.create({ data: { email, health: initialHealth, issues: initialIssues, channelStatus: initialChannelState } });
    return NextResponse.json(serializeAccount(account), { status: 201 });
  } catch (error) { return apiError(error, "Unable to create account"); }
}
