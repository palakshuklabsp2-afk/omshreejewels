import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { bumpOtpAttempts, deleteOtp, getOtp, upsertOtp } from "@/lib/data";
import { indianPhone } from "@/lib/utils";

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function provider() {
  const raw = (process.env.OTP_PROVIDER || "display").toLowerCase();
  if (raw === "twilio" || raw === "sms") return "display";
  return raw;
}

async function sendSmsMsg91(phone: string, code: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey || !templateId) throw new Error("MSG91 keys missing");
  const res = await fetch("https://control.msg91.com/api/v5/otp", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile: `91${phone}`,
      otp: code,
    }),
  });
  if (!res.ok) throw new Error("Failed to send OTP via MSG91");
}

export async function sendOtp(rawPhone: string) {
  await connectDb();
  const phone = indianPhone(rawPhone);
  const existing = await getOtp(phone);
  if (existing?.lastSentAt && Date.now() - existing.lastSentAt.getTime() < 45_000) {
    const wait = 45 - Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
    throw new Error(`Please wait ${wait}s before resending OTP`);
  }

  const mode = provider();
  const code = process.env.OTP_DEV_CODE && mode !== "msg91" ? process.env.OTP_DEV_CODE : randomOtp();

  if (mode === "msg91") {
    await sendSmsMsg91(phone, code);
  }

  const codeHash = await bcrypt.hash(code, 10);
  await upsertOtp(phone, codeHash, new Date(Date.now() + 10 * 60_000));

  return {
    cooldown: 45,
    displayOtp: mode === "msg91" ? undefined : code,
  };
}

export async function verifyOtp(rawPhone: string, code: string) {
  await connectDb();
  const phone = indianPhone(rawPhone);
  const record = await getOtp(phone);
  if (!record || record.expiresAt.getTime() < Date.now()) return false;
  if (record.attempts >= 5) return false;
  await bumpOtpAttempts(phone);
  const ok = await bcrypt.compare(code, record.codeHash);
  if (ok) await deleteOtp(phone);
  return ok;
}
