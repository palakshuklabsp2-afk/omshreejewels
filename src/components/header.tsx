"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Heart, ShoppingBag, User, X, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { STORE } from "@/lib/utils";
import { useCart } from "@/components/cart-provider";
import { BrandLogo } from "@/components/brand-logo";

export function Header({
  loggedIn,
  categories = [],
}: {
  loggedIn: boolean;
  categories?: { name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-crimson text-white text-center text-[11px] sm:text-xs tracking-[0.18em] py-2 px-3 font-medium">
        🇮🇳 {STORE.shippingBanner}
      </div>
      <div className="glass border-b border-gold/20">
        <div className="mx-auto max-w-7xl px-4 h-[4.5rem] flex items-center gap-2 sm:gap-3">
          <button className="lg:hidden p-2 shrink-0" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-crimson" />
          </button>
          <Link href="/" className="shrink-0" aria-label={`${STORE.name} home`}>
            <div className="font-display text-lg sm:text-2xl tracking-wide text-crimson leading-none">OM SHREE</div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.35em] text-gold mt-0.5">JEWELS</div>
          </Link>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center min-w-0 px-1 md:flex-none md:justify-start"
            aria-label={`${STORE.name} logo`}
          >
            <BrandLogo size="header" priority />
          </Link>
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="flex w-full rounded-full border border-crimson/15 bg-white overflow-hidden">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jewellery, sets, earrings..."
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button className="px-4 text-crimson" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a href={`tel:${STORE.phones[0]}`} className="hidden sm:flex p-2 text-crimson" aria-label="Call">
              <Phone className="h-5 w-5" />
            </a>
            <Link href="/wishlist" className="p-2 text-crimson" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href={loggedIn ? "/account" : "/login"} className="p-2 text-crimson" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="relative p-2 text-crimson" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-crimson text-white text-[10px] min-w-4 h-4 px-1 rounded-full grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <nav className="hidden lg:flex mx-auto max-w-7xl px-4 pb-3 gap-6 text-sm text-wine/80 overflow-x-auto">
          <Link href="/shop">Shop</Link>
          {categories.slice(0, 8).map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/track">Track Order</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <BrandLogo size="header" />
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X />
              </button>
            </div>
            <form onSubmit={onSearch} className="mb-6">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-full border px-4 py-2 text-sm"
              />
            </form>
            <div className="flex flex-col gap-4 text-wine">
              <Link href="/shop">Shop All</Link>
              {categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/track">Track Order</Link>
              <Link href={loggedIn ? "/account" : "/login"}>{loggedIn ? "My Account" : "Login"}</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <a href={`tel:${STORE.phones[0]}`}>Call {STORE.phones[0]}</a>
              <a href={`tel:${STORE.phones[1]}`}>Call {STORE.phones[1]}</a>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
