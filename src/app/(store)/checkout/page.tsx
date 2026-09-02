"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { COD_ADVANCE, MIN_ORDER_AMOUNT, formatInr, STORE } from "@/lib/utils";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [method, setMethod] = useState<"online" | "cod">("online");
  const [terms, setTerms] = useState(false);
  const [paying, setPaying] = useState(false);
  const [me, setMe] = useState<{ name?: string; phone?: string; address?: unknown; addressLocked?: boolean } | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.customer) router.push("/login?next=/checkout");
        else setMe(d.customer);
      });
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      s.remove();
    };
  }, [router]);

  const belowMinimum = subtotal < MIN_ORDER_AMOUNT;
  const payable = method === "cod" ? Math.min(COD_ADVANCE, subtotal) : subtotal;
  const remaining = method === "cod" ? Math.max(0, subtotal - COD_ADVANCE) : 0;

  async function pay() {
    if (belowMinimum) {
      toast.error(`Minimum order is ${formatInr(MIN_ORDER_AMOUNT)}. Add more items to your cart.`);
      return;
    }
    if (!terms) {
      toast.error("Please accept Terms & Conditions including No Return / No Exchange");
      return;
    }
    if (!me?.addressLocked) {
      toast.error("Save your delivery address in My Account first");
      return;
    }
    if (!items.length || paying) return;
    setPaying(true);

    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, method }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      demo?: boolean;
      keyId?: string;
      amount?: number;
      razorpayOrderId?: string;
      draftId?: string;
    };
    if (!res.ok) {
      setPaying(false);
      toast.error(data.error || "Could not start payment");
      return;
    }

    if (data.demo) {
      const confirm = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: data.draftId, razorpayOrderId: data.razorpayOrderId }),
      });
      const result = (await confirm.json().catch(() => ({}))) as {
        error?: string;
        orderNumber?: string;
        advancePaid?: number;
        remainingCod?: number;
      };
      setPaying(false);
      if (!confirm.ok) {
        toast.error(result.error || "Could not place demo order");
        return;
      }
      toast.success("Order placed (demo payment — add Razorpay keys for live payments)");
      clear();
      const qs = new URLSearchParams({ order: result.orderNumber || "" });
      if (result.advancePaid) qs.set("advance", String(result.advancePaid));
      if (result.remainingCod) qs.set("cod", String(result.remainingCod));
      router.push(`/order-success?${qs.toString()}`);
      return;
    }

    if (!data.keyId) {
      setPaying(false);
      toast.error("Payment key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID on the server.");
      return;
    }

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setPaying(false);
      toast.error("Payment gateway is loading. Wait a moment and tap Pay again.");
      return;
    }

    const rzp = new Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: "INR",
      name: STORE.name,
      description: method === "cod" ? "₹200 COD Advance" : "Order payment",
      order_id: data.razorpayOrderId,
      prefill: {
        name: me?.name || "",
        contact: me?.phone || "",
      },
      theme: { color: "#9b1b30" },
      modal: {
        ondismiss: () => setPaying(false),
      },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const confirm = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            method,
            items,
            draftId: data.draftId,
          }),
        });
        const result = (await confirm.json().catch(() => ({}))) as {
          error?: string;
          orderNumber?: string;
          advancePaid?: number;
          remainingCod?: number;
        };
        setPaying(false);
        if (!confirm.ok) {
          toast.error(result.error || "Payment verification failed");
          return;
        }
        toast.success("Payment successful");
        clear();
        const qs = new URLSearchParams({ order: result.orderNumber || "" });
        if (result.advancePaid) qs.set("advance", String(result.advancePaid));
        if (result.remainingCod) qs.set("cod", String(result.remainingCod));
        router.push(`/order-success?${qs.toString()}`);
      },
    });
    rzp.on("payment.failed", (response) => {
      setPaying(false);
      toast.error(response.error?.description || "Payment failed. Try again.");
    });
    rzp.open();
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        Cart is empty.{" "}
        <Link href="/shop" className="text-crimson">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BrandLogo size="footer" className="mb-4" />
      <h1 className="font-display text-4xl text-wine">Checkout</h1>
      <p className="text-sm text-zinc-500 mt-1">🇮🇳 All over India shipping available</p>
      <div className="mt-6 rounded-3xl bg-white border border-gold/20 p-6 space-y-4 shadow-sm">
        <div className="text-lg font-semibold">Total Amount: {formatInr(subtotal)}</div>
        {belowMinimum ? (
          <p className="text-sm text-crimson">
            Minimum order is {formatInr(MIN_ORDER_AMOUNT)}. Add {formatInr(MIN_ORDER_AMOUNT - subtotal)} more in{" "}
            <Link href="/shop" className="underline">
              Shop
            </Link>{" "}
            to place this order.
          </p>
        ) : null}
        <label className="flex gap-2 items-center rounded-2xl border p-3">
          <input type="radio" checked={method === "online"} onChange={() => setMethod("online")} />
          Full Online Payment
        </label>
        <label className="flex gap-2 items-center rounded-2xl border p-3">
          <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
          Cash on Delivery (₹200 advance required)
        </label>
        {method === "cod" && (
          <div className="rounded-2xl bg-rose-50 p-4 text-sm space-y-1">
            <div>Total Amount: {formatInr(subtotal)}</div>
            <div>Advance Payment Required: {formatInr(COD_ADVANCE)}</div>
            <div>Remaining COD Amount: {formatInr(remaining)}</div>
          </div>
        )}
        {!me?.addressLocked && (
          <p className="text-sm text-crimson">
            Save your delivery address in{" "}
            <Link href="/account" className="underline">
              My Account
            </Link>{" "}
            before paying. Once saved it cannot be changed.
          </p>
        )}
        <label className="flex gap-2 items-start text-sm">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          I have read and agree to the Terms & Conditions, including the No Return and No Exchange policy.
        </label>
        <p className="text-xs text-zinc-500">
          Pay now: {formatInr(payable)}. Live Razorpay checkout is enabled.
        </p>
        <button className="btn-primary w-full" onClick={pay} disabled={paying || belowMinimum}>
          {paying ? "Please wait…" : belowMinimum ? `Minimum order ${formatInr(MIN_ORDER_AMOUNT)}` : `Pay ${formatInr(payable)}`}
        </button>
        <Link href="/terms" className="text-sm text-crimson">
          Read Terms & Conditions
        </Link>
      </div>
    </div>
  );
}
