"use client";

import { useEffect, useState } from "react";

type Customer = {
  _id: string;
  name?: string;
  phone: string;
  address?: {
    fullName?: string;
    phone?: string;
    house?: string;
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  } | null;
  totalOrders: number;
};

export default function CustomersAdmin() {
  const [items, setItems] = useState<Customer[]>([]);
  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, []);
  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Customers</h1>
      <p className="text-sm text-zinc-500 mt-1">Use only for order processing and support.</p>
      <div className="mt-6 overflow-auto rounded-2xl bg-white border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="p-3">{c.name || c.address?.fullName || "—"}</td>
                <td>
                  <div>{c.phone}</div>
                  {c.address?.phone && c.address.phone !== c.phone ? (
                    <div className="text-xs text-zinc-500">Address: {c.address.phone}</div>
                  ) : null}
                </td>
                <td className="whitespace-pre-line">
                  {c.address
                    ? [
                        c.address.fullName,
                        c.address.phone,
                        [c.address.house, c.address.street].filter(Boolean).join(", "),
                        [c.address.city, c.address.state].filter(Boolean).join(", ") +
                          (c.address.pinCode ? ` – ${c.address.pinCode}` : ""),
                      ]
                        .filter(Boolean)
                        .join("\n")
                    : "Not saved"}
                </td>
                <td>{c.totalOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
