import { NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";
import { isValidIndianPhone, indianPhone } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
    const limit = rateLimit(`otp:${ip}`, process.env.NODE_ENV === "production" ? 8 : 40, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many OTP requests. Try later." }, { status: 429 });
  }
  const body = await req.json();
  const parsed = z.object({ phone: z.string() }).safeParse(body);
  if (!parsed.success || !isValidIndianPhone(parsed.data.phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }
  const phone = indianPhone(parsed.data.phone);
  const phoneLimit = rateLimit(`otp-phone:${phone}`, process.env.NODE_ENV === "production" ? 5 : 20, 10 * 60_000);
  if (!phoneLimit.ok) {
    return NextResponse.json({ error: "OTP limit reached for this number" }, { status: 429 });
  }
  try {
    const result = await sendOtp(phone);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "OTP failed";
    const status = message.toLowerCase().includes("wait") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
