"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatInr } from "@/lib/utils";

function SuccessInner() {
  const sp = useSearchParams();
  const order = sp.get("order");
  const advance = Number(sp.get("advance") || 0);
  const remaining = Number(sp.get("cod") || 0);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-4xl text-wine">🎉 Thank you for ordering from us!</h1>
      <p className="mt-4">Your order has been successfully placed.</p>
      {order && <p className="mt-2 font-semibold">Order Number: {order}</p>}
      {advance > 0 && remaining > 0 && (
        <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-left">
          <div>₹{advance} Advance Paid</div>
          <div>Remaining COD Amount: {formatInr(remaining)}</div>
        </div>
      )}
      <Link href={`/track?order=${order || ""}`} className="btn-primary mt-6">
        Track Order
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
