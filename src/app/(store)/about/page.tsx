import type { Metadata } from "next";
import { STORE } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: `${STORE.name} — premium imitation jewellery and fashion accessories from Baloda Bazar, shipping all over India.`,
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 space-y-4">
      <h1 className="font-display text-4xl text-wine">About Us</h1>
      <p>
        {STORE.name} offers premium imitation jewellery and fashion accessories for customers across India.
      </p>
      <p>⭐ Rated {STORE.rating} on Google</p>
      <p>🇮🇳 {STORE.shippingBanner}</p>
      <p className="whitespace-pre-line">{STORE.addressLines.join("\n")}</p>
      <Link href="/shop" className="btn-primary mt-4">
        Shop the collection
      </Link>
    </article>
  );
}
