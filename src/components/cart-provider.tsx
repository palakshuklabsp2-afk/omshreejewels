"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "osb_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (item, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((p) => p.productId === item.productId);
        if (found) {
          const nextQty = Math.min(item.stock || 99, found.qty + qty);
          toast.success("Cart updated");
          return prev.map((p) => (p.productId === item.productId ? { ...p, qty: nextQty } : p));
        }
        toast.success("Added to cart");
        return [...prev, { ...item, qty }];
      });
    };
    const setQty = (productId: string, qty: number) => {
      setItems((prev) =>
        prev
          .map((p) => (p.productId === productId ? { ...p, qty: Math.max(1, Math.min(p.stock || 99, qty)) } : p))
          .filter((p) => p.qty > 0),
      );
    };
    const remove = (productId: string) => {
      setItems((prev) => prev.filter((p) => p.productId !== productId));
      toast.message("Removed from cart");
    };
    const clear = () => setItems([]);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
    return { items, add, setQty, remove, clear, count, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
