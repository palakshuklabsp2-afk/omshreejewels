import Link from "next/link";
import { STORE } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

export function Footer({ categories }: { categories: { name: string; slug: string }[] }) {
  return (
    <footer className="mt-16 bg-wine text-rose-50">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <BrandLogo size="footer" className="ring-1 ring-gold/30" />
          <div className="font-display text-2xl mt-4">{STORE.name}</div>
          <p className="mt-3 text-xs tracking-widest text-gold">⭐ Rated {STORE.rating} on Google</p>
          <p className="mt-3 text-sm">🇮🇳 {STORE.shippingBanner}</p>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Explore</h3>
          <div className="flex flex-col gap-2 text-sm text-rose-100/80">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
            <Link href="/shipping">Shipping Policy</Link>
            <Link href="/track">Track Order</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Categories</h3>
          <div className="flex flex-col gap-2 text-sm text-rose-100/80">
            {categories.slice(0, 8).map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}>
                {c.name}
              </Link>
            ))}
            {categories.length === 0 && <span>Collections coming soon</span>}
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg mb-3">Visit & Call</h3>
          <p className="text-sm text-rose-100/80 whitespace-pre-line">{STORE.addressLines.join("\n")}</p>
          <div className="mt-3 flex flex-col gap-1 text-sm">
            {STORE.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="hover:text-gold">
                📞 {p}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-rose-100/70">
        © {STORE.name}. All Rights Reserved.
      </div>
    </footer>
  );
}
