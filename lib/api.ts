import { NextResponse } from "next/server";

export function apiError(error: unknown, fallback = "Unexpected server error") {
  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export function isCronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export function cronUnauthorized() {
  return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
}
