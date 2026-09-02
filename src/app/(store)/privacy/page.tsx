import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <BrandLogo size="hero" />
      <h1 className="font-display text-4xl text-wine">Privacy Policy</h1>
      <p>
        Customer data is private and will not be sold, shared, or provided to any third party for marketing or unrelated
        commercial purposes.
      </p>
      <p>Customer information may only be used for:</p>
      <ul className="list-disc pl-6">
        <li>Order processing</li>
        <li>Delivery</li>
        <li>Customer support</li>
        <li>Legal compliance where required</li>
      </ul>
      <p>
        We store account, address, and order data securely in our database. Payment card details are handled by Razorpay
        and are never stored on our servers.
      </p>
    </article>
  );
}
