"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatInr, productPricing } from "@/lib/utils";
import { optimizedImage } from "@/lib/images";
import { useCart } from "@/components/cart-provider";
import { toast } from "sonner";

export type ProductCardData = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  sizes?: string[];
  stock?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add } = useCart();
  const pricing = productPricing(product.price, product.salePrice);
  const img = optimizedImage(product.images?.[0]);

  async function wishlist() {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id }),
    });
    if (res.status === 401) {
      toast.error("Login to save wishlist");
      return;
    }
    const data = (await res.json()) as { inWishlist?: boolean };
    toast.success(data.inWishlist ? "Added to wishlist" : "Removed from wishlist");
  }

  return (
    <article className="group rounded-2xl bg-white border border-crimson/10 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] bg-rose-50">
        <Image
          src={img}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        {pricing.discounted && (
          <span className="absolute top-2 left-2 rounded-full bg-crimson text-white text-[10px] font-semibold px-2 py-1">
            {pricing.percent}% OFF
          </span>
        )}
      </Link>
      <div className="p-3">
        <Link href={`/product/${product.slug}`} className="font-medium text-sm line-clamp-2 min-h-10">
          {product.name}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-crimson font-semibold">{formatInr(pricing.selling)}</span>
          {pricing.discounted && (
            <>
              <span className="text-xs text-zinc-400 line-through">{formatInr(pricing.mrp)}</span>
              <span className="text-[11px] text-crimson">Save {formatInr(pricing.saved)}</span>
            </>
          )}
        </div>
        {product.sizes?.length ? (
          <p className="mt-1 text-[11px] text-zinc-500">Sizes: {product.sizes.join(", ")}</p>
        ) : null}
        <div className="mt-3 flex gap-2">
          {product.sizes?.length ? (
            <Link href={`/product/${product.slug}`} className="flex-1 btn-primary text-xs py-2 justify-center">
              <ShoppingBag className="h-3.5 w-3.5" /> Select size
            </Link>
          ) : (
            <button
              onClick={() =>
                add({
                  productId: String(product._id),
                  name: product.name,
                  image: img,
                  price: pricing.selling,
                  stock: product.stock || 10,
                })
              }
              className="flex-1 btn-primary text-xs py-2"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Add
            </button>
          )}
          <button onClick={wishlist} className="btn-ghost px-3" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductSkeleton() {
  return <div className="rounded-2xl aspect-[3/4] skeleton" />;
}
