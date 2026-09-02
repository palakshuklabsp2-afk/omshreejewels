"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    products: number;
    orders: number;
    pending: number;
    delivered: number;
    customers: number;
    categories: number;
    revenue: number;
    recent: { orderNumber: string; subtotal: number; status: string }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="skeleton h-40 rounded-2xl" />;

  const cards = [
    ["Products", stats.products],
    ["Orders", stats.orders],
    ["Pending", stats.pending],
    ["Delivered", stats.delivered],
    ["Customers", stats.customers],
    ["Categories", stats.categories],
    ["Revenue collected", formatInr(stats.revenue)],
  ];

  const chart = [
    { name: "Orders", value: stats.orders },
    { name: "Pending", value: stats.pending },
    { name: "Delivered", value: stats.delivered },
    { name: "Customers", value: stats.customers },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Dashboard</h1>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl bg-white border p-4">
            <div className="text-sm text-zinc-500">{l}</div>
            <div className="text-2xl font-semibold mt-1">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 h-64 rounded-2xl bg-white border p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#9b1b30" radius={8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 rounded-2xl bg-white border p-4">
        <h2 className="font-display text-2xl">Recent Orders</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {stats.recent?.map((o) => (
            <li key={o.orderNumber} className="flex justify-between">
              <span>{o.orderNumber}</span>
              <span>
                {o.status} · {formatInr(o.subtotal)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
