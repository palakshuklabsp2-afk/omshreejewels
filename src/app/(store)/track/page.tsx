"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/utils";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "🟡 Order Confirmed" },
  { key: "processing", label: "📦 Order Processing" },
  { key: "packed", label: "📦 Packed" },
  { key: "shipped", label: "🚚 Shipped" },
  { key: "out_for_delivery", label: "🚛 Out for Delivery" },
  { key: "delivered", label: "✅ Delivered" },
];

function TrackInner() {
  const sp = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(sp.get("order") || "");
  const [data, setData] = useState<{
    orderNumber: string;
    status: OrderStatus;
    timeline: { status: string; at: string }[];
    remainingCod?: number;
    paymentMethod?: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function lookup() {
    setError("");
    const res = await fetch(`/api/orders/track?order=${encodeURIComponent(orderNumber.trim())}`);
    const json = await res.json();
    if (!res.ok) {
      setData(null);
      setError(json.error || "Order not found");
      return;
    }
    setData(json);
  }

  useEffect(() => {
    if (sp.get("order")) void lookup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl text-wine">Track Order</h1>
      <p className="text-sm text-zinc-500 mt-2">Enter your order number, for example OMS-2026-000001.</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="OMS-2026-000001"
          className="flex-1 rounded-full border px-4 py-3"
        />
        <button className="btn-primary" onClick={lookup}>
          Track
        </button>
      </div>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {data && (
        <div className="mt-8 rounded-3xl bg-white border border-gold/20 p-6 shadow-sm">
          <div className="font-semibold">{data.orderNumber}</div>
          <div className="text-crimson mt-1">{ORDER_STATUS_LABEL[data.status]}</div>
          {data.status === "cancelled" && <p className="mt-2 text-sm">This order was cancelled.</p>}
          <ol className="mt-6 space-y-3">
            {STEPS.map((s, i) => {
              const current = STEPS.findIndex((x) => x.key === data.status);
              const done = current >= 0 && i <= current;
              return (
                <li key={s.key} className={done ? "text-wine font-medium" : "text-zinc-400"}>
                  {s.label}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense>
      <TrackInner />
    </Suspense>
  );
}
