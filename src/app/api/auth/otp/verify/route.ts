import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { connectDb } from "@/lib/db";
import { createCustomer, getCustomerByPhone } from "@/lib/data";
import { attachCustomerCookie } from "@/lib/session";
import { indianPhone, isValidIndianPhone } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = z.object({ phone: z.string(), otp: z.string().min(4) }).safeParse(body);
    if (!parsed.success || !isValidIndianPhone(parsed.data.phone)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const phone = indianPhone(parsed.data.phone);
    const ok = await verifyOtp(phone, parsed.data.otp);
    if (!ok) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    await connectDb();
    let customer = await getCustomerByPhone(phone);
    if (!customer) customer = await createCustomer(phone);
    const res = NextResponse.json({ ok: true });
    return attachCustomerCookie(res, { role: "customer", customerId: String(customer._id), phone });
  } catch (e) {
    console.error("[otp-verify]", e);
    return NextResponse.json({ error: "Could not verify OTP. Try again." }, { status: 500 });
  }
}
