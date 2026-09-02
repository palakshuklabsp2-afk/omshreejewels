import type { Metadata } from "next";
import { STORE } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Call ${STORE.name} at 8959026300 or 9926155200. Visit us in Baloda Bazar, Chhattisgarh.`,
};

export default function ContactPage() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.mapsQuery)}`;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-wine">Contact Us</h1>
      <p className="mt-2 text-zinc-600">Click a number to call. WhatsApp is also available from the floating button.</p>
      <div className="mt-6 rounded-3xl bg-white border border-gold/20 p-6 space-y-3 shadow-sm">
        {STORE.phones.map((p) => (
          <a key={p} href={`tel:${p}`} className="block text-crimson text-xl font-semibold">
            📞 {p}
          </a>
        ))}
        <p className="whitespace-pre-line mt-4">{STORE.addressLines.join("\n")}</p>
        <a href={maps} target="_blank" rel="noreferrer" className="btn-primary mt-2">
          Get Directions
        </a>
      </div>
    </div>
  );
}
