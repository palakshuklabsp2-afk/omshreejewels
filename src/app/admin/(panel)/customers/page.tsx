"use client";

import { useEffect, useState } from "react";

type Customer = {
  _id: string;
  name?: string;
  phone: string;
  address?: { city?: string; house?: string; street?: string };
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
                <td className="p-3">{c.name || "—"}</td>
                <td>{c.phone}</td>
                <td>
                  {c.address ? `${c.address.house}, ${c.address.street}, ${c.address.city}` : "Not saved"}
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
