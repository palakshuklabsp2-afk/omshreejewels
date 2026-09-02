import type { Metadata } from "next";
import { STORE } from "@/lib/utils";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <h1 className="font-display text-4xl text-wine">Shipping Policy</h1>
      <p className="text-lg font-semibold">🇮🇳 ALL OVER INDIA SHIPPING AVAILABLE</p>
      <p>
        {STORE.name} ships imitation jewellery and fashion accessories across India. Delivery timelines vary by
        destination and courier partner.
      </p>
      <p>You can track your order anytime using your Order Number on the Track Order page.</p>
    </article>
  );
}
