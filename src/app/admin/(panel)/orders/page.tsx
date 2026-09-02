"use client";

import { useEffect, useState } from "react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  formatStreetAddress,
  formatInr,
  type OrderStatus,
  type DeliveryAddress,
} from "@/lib/utils";

type Order = {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address?: DeliveryAddress | null;
  items: { name?: string; qty: number; price?: number }[];
  subtotal: number;
  paymentMethod: string;
  paymentStatus: string;
  remainingCod?: number;
  status: OrderStatus;
  createdAt: string;
};

export default function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  async function load(p = 1) {
    const res = await fetch(`/api/admin/orders?page=${p}`);
    const data = await res.json();
    setItems(data.items || []);
    setPages(data.pages || 1);
    setPage(p);
  }
  useEffect(() => {
    load();
  }, []);

  async function update(id: string, status: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load(page);
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Orders</h1>
      <div className="mt-6 space-y-3">
        {items.map((o) => {
          const name = o.customerName || o.address?.fullName || "—";
          const phone = o.customerPhone || o.address?.phone || "—";
          return (
            <div key={o._id} className="rounded-2xl bg-white border p-4 text-sm">
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{o.orderNumber}</div>
                  <div className="mt-2 space-y-1 text-zinc-800">
                    <div>
                      <span className="text-zinc-500">Name:</span> {name}
                    </div>
                    <div>
                      <span className="text-zinc-500">Phone:</span>{" "}
                      {phone !== "—" ? (
                        <a className="text-crimson" href={`tel:${phone}`}>
                          {phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="whitespace-pre-line">
                      <span className="text-zinc-500">Address:</span>
                      {"\n"}
                      {formatStreetAddress(o.address || null) || "Not saved"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div>{formatInr(o.subtotal)}</div>
                  <div>
                    {o.paymentMethod} · {o.paymentStatus}
                  </div>
                  {o.remainingCod ? <div>COD remaining {formatInr(o.remainingCod)}</div> : null}
                  <div className="text-zinc-500 text-xs mt-1">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ""}
                  </div>
                </div>
              </div>
              <div className="mt-2">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</div>
              <select
                className="mt-3 rounded-full border px-3 py-1"
                value={o.status}
                onChange={(e) => update(o._id, e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <button className="btn-ghost" onClick={() => load(page - 1)}>
            Previous
          </button>
        )}
        {page < pages && (
          <button className="btn-primary" onClick={() => load(page + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
