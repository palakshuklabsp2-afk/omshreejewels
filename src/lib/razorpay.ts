import "server-only";
import crypto from "crypto";

function env(name: string) {
  return (process.env[name] || "").trim();
}

export function razorpayKeys() {
  const keyId = env("RAZORPAY_KEY_ID") || env("NEXT_PUBLIC_RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  return { keyId, keySecret };
}

export function isRazorpayConfigured() {
  const { keyId, keySecret } = razorpayKeys();
  return keyId.startsWith("rzp_") && keySecret.length >= 8;
}

export async function createRazorpayOrder(opts: { amountPaise: number; receipt: string }) {
  const { keyId, keySecret } = razorpayKeys();
  if (!isRazorpayConfigured()) {
    throw Object.assign(new Error("Razorpay keys are missing"), { code: "missing_keys" as const });
  }
  if (!Number.isFinite(opts.amountPaise) || opts.amountPaise < 100) {
    throw Object.assign(new Error("Order amount must be at least ₹1"), { code: "amount" as const });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(opts.amountPaise),
      currency: "INR",
      receipt: opts.receipt.slice(0, 40),
      payment_capture: 1,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    amount?: number;
    error?: { description?: string; reason?: string; code?: string };
  };

  if (!res.ok || !data.id) {
    const description =
      data.error?.description || data.error?.reason || `Razorpay could not create the order (${res.status})`;
    throw Object.assign(new Error(description), { code: "razorpay" as const, status: res.status });
  }

  return { id: data.id, amount: Number(data.amount), keyId };
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = razorpayKeys();
  if (!keySecret) return false;
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}
