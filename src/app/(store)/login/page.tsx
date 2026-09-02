"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { isValidIndianPhone } from "@/lib/utils";

function LoginForm() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [shownOtp, setShownOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function send() {
    if (!isValidIndianPhone(phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        signal: AbortSignal.timeout(90_000),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; cooldown?: number; displayOtp?: string };
      if (!res.ok) {
        toast.error(data.error || "Could not send OTP");
        return;
      }
      setStep("otp");
      setCooldown(data.cooldown || 45);
      if (data.displayOtp) {
        setShownOtp(data.displayOtp);
        setOtp(data.displayOtp);
        toast.success("OTP is shown on this screen");
      } else {
        setShownOtp("");
        toast.success("OTP sent to your phone");
      }
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
        signal: AbortSignal.timeout(90_000),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Invalid OTP");
        return;
      }
      toast.success("Login successful");
      window.location.assign(next.startsWith("/") ? next : "/account");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl text-wine">Phone OTP Login</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Enter your 10-digit mobile number. A 6-digit OTP will appear on this screen — no SMS app and no Twilio.
      </p>
      <div className="mt-8 rounded-3xl bg-white border p-6 space-y-4">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit mobile number"
          className="w-full rounded-full border px-4 py-3"
          disabled={step === "otp"}
          inputMode="numeric"
          maxLength={10}
        />
        {step === "otp" && shownOtp && (
          <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-rose-50 to-white p-4 text-center">
            <p className="text-xs tracking-[0.2em] text-crimson">YOUR OTP</p>
            <p className="mt-1 font-display text-4xl tracking-[0.35em] text-wine">{shownOtp}</p>
            <p className="mt-2 text-xs text-zinc-500">Enter this code below. It is shown here on purpose (on-screen OTP).</p>
            <button
              type="button"
              className="mt-3 text-xs text-crimson underline"
              onClick={() => {
                void navigator.clipboard.writeText(shownOtp);
                toast.success("OTP copied");
              }}
            >
              Copy OTP
            </button>
          </div>
        )}
        {step === "otp" && (
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-full border px-4 py-3"
            inputMode="numeric"
          />
        )}
        {step === "phone" ? (
          <button className="btn-primary w-full" onClick={send} disabled={loading}>
            {loading ? "Sending..." : "Get OTP"}
          </button>
        ) : (
          <>
            <button className="btn-primary w-full" onClick={verify} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              className="btn-ghost w-full"
              onClick={() => {
                setStep("phone");
                setShownOtp("");
                setOtp("");
              }}
              disabled={loading}
            >
              Change number
            </button>
            <button className="btn-ghost w-full" onClick={send} disabled={cooldown > 0 || loading}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
