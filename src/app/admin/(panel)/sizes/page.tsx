"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Size = { _id: string; name: string; isActive: boolean };

export default function SizesAdmin() {
  const [items, setItems] = useState<Size[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/sizes");
    const data = await res.json();
    setItems(data.items || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!name.trim()) {
      toast.error("Enter a size, e.g. Free size, 2.4, Adjustable");
      return;
    }
    const res = await fetch(editId ? `/api/admin/sizes/${editId}` : "/api/admin/sizes", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), isActive: true }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Could not save size");
      return;
    }
    toast.success(editId ? "Size updated" : "Size created");
    setName("");
    setEditId(null);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/sizes/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Sizes</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Create sizes here, then select them on each product. Customers see these sizes on the product page.
      </p>
      <form
        className="mt-6 rounded-2xl bg-white border p-4 grid gap-3 max-w-xl"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Size name — e.g. Free size, 2.4, 2.6, Adjustable"
          name="osb-size-name"
          autoComplete="off"
          className="rounded-full border px-4 py-2"
        />
        <div className="flex gap-2">
          <button className="btn-primary w-fit" type="submit">
            {editId ? "Update Size" : "Create Size"}
          </button>
          {editId && (
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setEditId(null);
                setName("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl">
        {items.length === 0 ? <p className="text-sm text-zinc-500">No sizes yet. Add the first one above.</p> : null}
        {items.map((s) => (
          <div key={s._id} className="rounded-2xl bg-white border p-4 flex justify-between gap-3">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-zinc-500">{s.isActive ? "Active" : "Hidden"}</div>
            </div>
            <div className="flex gap-3 text-sm shrink-0">
              <button
                className="text-crimson"
                type="button"
                onClick={() => {
                  setEditId(s._id);
                  setName(s.name);
                }}
              >
                Edit
              </button>
              <button className="text-red-600" type="button" onClick={() => remove(s._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
