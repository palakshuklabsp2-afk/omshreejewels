"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatInr, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/utils";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

type Props = {
  customer: {
    name: string;
    phone: string;
    address: {
      fullName: string;
      phone: string;
      house: string;
      street: string;
      city: string;
      state: string;
      pinCode: string;
    } | null;
    addressLocked: boolean;
  };
  orders: {
    id: string;
    orderNumber: string;
    createdAt: string;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    subtotal: number;
    remainingCod?: number | null;
    customerName?: string;
    customerPhone?: string;
    address?: {
      fullName: string;
      phone: string;
      house: string;
      street: string;
      city: string;
      state: string;
      pinCode: string;
    } | null;
    items: { name: string; qty: number; price: number }[];
  }[];
};

export function AccountClient({ customer, orders }: Props) {
  const [name, setName] = useState(customer.name);
  const [confirm, setConfirm] = useState(false);
  const [address, setAddress] = useState({
    fullName: customer.address?.fullName || "",
    phone: customer.address?.phone || customer.phone,
    house: customer.address?.house || "",
    street: customer.address?.street || "",
    city: customer.address?.city || "",
    state: customer.address?.state || "",
    pinCode: customer.address?.pinCode || "",
  });
  const router = useRouter();

  async function saveProfile() {
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) toast.success("Profile updated");
  }

  async function saveAddress() {
    if (!confirm) {
      toast.error("Please confirm that the address cannot be changed later");
      return;
    }
    const res = await fetch("/api/account/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not save address");
      return;
    }
    toast.success("Address saved permanently");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <BrandLogo size="footer" />
      <div className="flex justify-between items-center">
        <h1 className="font-display text-4xl text-wine">My Account</h1>
        <button onClick={logout} className="btn-ghost">
          Logout
        </button>
      </div>

      <section className="rounded-3xl bg-white border p-6">
        <h2 className="font-display text-2xl">My Profile</h2>
        <div className="mt-4 grid gap-3">
          <label className="text-sm">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-full border px-4 py-2" />
          <label className="text-sm">Phone</label>
          <input value={customer.phone} disabled className="rounded-full border px-4 py-2 bg-zinc-50" />
          <button className="btn-primary w-fit" onClick={saveProfile}>
            Save Name
          </button>
        </div>
      </section>

      <section className="rounded-3xl bg-white border p-6">
        <h2 className="font-display text-2xl">Delivery Address</h2>
        {customer.addressLocked && customer.address ? (
          <p className="mt-4 whitespace-pre-line text-zinc-700">
            {customer.address.fullName}
            {"\n"}
            {customer.address.phone}
            {"\n"}
            {customer.address.house}, {customer.address.street}
            {"\n"}
            {customer.address.city}, {customer.address.state} - {customer.address.pinCode}
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            <p className="text-sm text-crimson">
              Please check your address carefully. Once saved, your address cannot be changed or replaced.
            </p>
            {["fullName", "phone", "house", "street", "city", "state", "pinCode"].map((key) => (
              <input
                key={key}
                placeholder={
                  {
                    fullName: "Full Name",
                    phone: "Phone Number",
                    house: "House / Flat",
                    street: "Street / Area",
                    city: "City",
                    state: "State",
                    pinCode: "PIN Code",
                  }[key]
                }
                value={address[key as keyof typeof address]}
                onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                className="rounded-full border px-4 py-2"
              />
            ))}
            <label className="text-sm flex gap-2 items-start">
              <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              I confirm this address is correct and cannot be edited later.
            </label>
            <button className="btn-primary w-fit" onClick={saveAddress}>
              Save Address Forever
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-white border p-6">
        <h2 className="font-display text-2xl">My Orders</h2>
        <div className="mt-4 space-y-4">
          {orders.length === 0 && <p>No orders yet.</p>}
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-semibold">{o.orderNumber}</div>
                  <div className="text-sm text-zinc-500">{new Date(o.createdAt).toLocaleString("en-IN")}</div>
                  <div className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                    {[
                      o.customerName || o.address?.fullName,
                      o.customerPhone || o.address?.phone,
                      o.address
                        ? `${o.address.house}, ${o.address.street}, ${o.address.city}, ${o.address.state} – ${o.address.pinCode}`
                        : "",
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>{ORDER_STATUS_LABEL[o.status as OrderStatus] || o.status}</div>
                  <div>{o.paymentMethod === "cod" ? "COD + Advance" : "Online"} · {o.paymentStatus}</div>
                </div>
              </div>
              <ul className="mt-2 text-sm">
                {o.items.map((i) => (
                  <li key={i.name}>
                    {i.name} × {i.qty} — {formatInr(i.price * i.qty)}
                  </li>
                ))}
              </ul>
              <Link href={`/track?order=${o.orderNumber}`} className="text-crimson text-sm mt-2 inline-block">
                Track this order
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
