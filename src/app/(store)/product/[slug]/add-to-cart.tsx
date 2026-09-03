"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export function AddToCart({
  product,
}: {
  product: {
    productId: string;
    name: string;
    image: string;
    price: number;
    stock: number;
    sizes?: string[];
  };
}) {
  const { add } = useCart();
  const sizes = product.sizes || [];
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");

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

  function addToCart() {
    if (sizes.length && !size) {
      toast.error("Please select a size");
      return;
    }
    add({
      productId: product.productId,
      name: size ? `${product.name} · Size ${size}` : product.name,
      image: product.image,
      price: product.price,
      stock: product.stock,
      size: size || undefined,
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {sizes.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-wine mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  size === s ? "bg-crimson text-white border-crimson" : "bg-white hover:border-crimson"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex gap-3">
        <button className="btn-primary flex-1" disabled={product.stock < 1} onClick={addToCart}>
          Add to Cart
        </button>
        <button className="btn-ghost" onClick={wishlist} aria-label="Wishlist">
          <Heart className="h-4 w-4" /> Wishlist
        </button>
      </div>
    </div>
  );
}
