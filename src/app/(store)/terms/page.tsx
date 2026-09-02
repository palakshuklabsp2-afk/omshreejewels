import type { Metadata } from "next";
import { STORE } from "@/lib/utils";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <h1 className="font-display text-4xl text-wine">Terms & Conditions</h1>
      <h2 className="text-2xl font-semibold text-crimson">🚫 NO RETURN</h2>
      <h2 className="text-2xl font-semibold text-crimson">🚫 NO EXCHANGE</h2>
      <p>
        All purchases from {STORE.name} are final. We do not accept returns or exchanges on imitation jewellery and
        fashion accessories.
      </p>
      <p>Please check product images, descriptions, prices, and your delivery address carefully before placing an order.</p>
      <p>Orders are confirmed only after successful Razorpay payment (full payment or ₹200 COD advance).</p>
      <p>Cash on Delivery requires a non-refundable-process ₹200 advance. Remaining amount is collected at delivery.</p>
      <p>By placing an order you agree to these terms, including the No Return and No Exchange policy.</p>
    </article>
  );
}
