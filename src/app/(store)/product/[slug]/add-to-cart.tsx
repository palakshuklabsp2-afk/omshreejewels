"use client";

import { useCart } from "@/components/cart-provider";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export function AddToCart({
  product,
}: {
  product: { productId: string; name: string; image: string; price: number; stock: number };
}) {
  const { add } = useCart();

  async function wishlist() {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.productId }),
    });
    if (res.status === 401) {
      toast.error("Login to save wishlist");
      return;
    }
    const data = (await res.json()) as { inWishlist?: boolean };
    toast.success(data.inWishlist ? "Added to wishlist" : "Removed from wishlist");
  }

  return (
    <div className="mt-6 flex gap-3">
      <button className="btn-primary flex-1" disabled={product.stock < 1} onClick={() => add(product)}>
        Add to Cart
      </button>
      <button className="btn-ghost" onClick={wishlist} aria-label="Wishlist">
        <Heart className="h-4 w-4" /> Wishlist
      </button>
    </div>
  );
}
