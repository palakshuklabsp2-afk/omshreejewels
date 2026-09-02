"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatInr, MIN_ORDER_AMOUNT } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BrandLogo size="footer" className="mb-4" />
      <h1 className="font-display text-4xl text-wine">Your Cart</h1>
      {items.length === 0 ? (
        <p className="mt-6">
          Cart is empty. <Link href="/shop" className="text-crimson">Continue shopping</Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl bg-white border p-3">
              <div className="relative h-24 w-24 rounded-xl overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-crimson text-sm">{formatInr(item.price)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="h-8 w-8 rounded-full border" onClick={() => setQty(item.productId, item.qty - 1)}>
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button className="h-8 w-8 rounded-full border" onClick={() => setQty(item.productId, item.qty + 1)}>
                    +
                  </button>
                  <button className="ml-3 text-sm text-red-600" onClick={() => remove(item.productId)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="font-semibold">{formatInr(item.price * item.qty)}</div>
            </div>
          ))}
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">Total {formatInr(subtotal)}</div>
              {subtotal >= MIN_ORDER_AMOUNT ? (
                <Link href="/checkout" className="btn-primary">
                  Checkout
                </Link>
              ) : (
                <button type="button" className="btn-primary opacity-50 cursor-not-allowed" disabled>
                  Checkout
                </button>
              )}
            </div>
            <p className={subtotal >= MIN_ORDER_AMOUNT ? "text-sm text-zinc-500" : "text-sm text-crimson"}>
              {subtotal >= MIN_ORDER_AMOUNT
                ? `Minimum order ${formatInr(MIN_ORDER_AMOUNT)} met.`
                : `Minimum order is ${formatInr(MIN_ORDER_AMOUNT)}. Add ${formatInr(MIN_ORDER_AMOUNT - subtotal)} more to checkout.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
