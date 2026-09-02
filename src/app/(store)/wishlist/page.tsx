"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import Link from "next/link";

export default function WishlistPage() {
  const [items, setItems] = useState<ProductCardData[]>([]);
  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl text-wine">Wishlist</h1>
      {items.length === 0 ? (
        <p className="mt-6">
          Your wishlist is empty. <Link href="/login">Login</Link> and save pieces you love.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
