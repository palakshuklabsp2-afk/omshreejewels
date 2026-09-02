"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminImageField } from "@/components/admin-image-field";

type Product = {
  _id: string;
  name: string;
  description?: string;
  stock: number;
  images?: string[];
  isActive: boolean;
  category?: { _id?: string; name?: string } | string;
};

const emptyForm = {
  name: "",
  description: "",
  category: "",
  stock: 1,
  images: [] as string[],
};

export default function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<{ _id: string; name: string }[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load(p = 1, query = q) {
    const res = await fetch(`/api/admin/products?page=${p}&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setItems(data.items || []);
    setPages(data.pages || 1);
    setPage(p);
  }
  useEffect(() => {
    load();
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCats(d.items || []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error || "Upload failed");
      return;
    }
    setForm((f) => ({ ...f, images: [data.url] }));
  }

  async function save() {
    if (!form.name.trim() || !form.category) {
      toast.error("Enter name and category");
      return;
    }
    if (!form.images.length) {
      toast.error("Upload a product photo from this device");
      return;
    }
    const res = await fetch(editId ? `/api/admin/products/${editId}` : "/api/admin/products", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        stock: form.stock,
        images: form.images,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error || "Could not save product");
      return;
    }
    toast.success(editId ? "Product updated" : "Product added");
    setEditId(null);
    setForm(emptyForm);
    load(page);
  }

  function startEdit(p: Product) {
    setEditId(p._id);
    const catId = typeof p.category === "string" ? p.category : p.category?._id || "";
    setForm({
      name: p.name,
      description: p.description || "",
      category: catId,
      stock: p.stock,
      images: p.images || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id: string) {
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load(page);
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Products</h1>
      <form
        className="mt-4 flex gap-2"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          load(1, q);
        }}
      >
        <input
          className="rounded-full border px-4 py-2 flex-1"
          placeholder="Search products"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          name="osb-product-search"
        />
        <button className="btn-primary">Search</button>
      </form>
      <form
        className="mt-6 rounded-2xl bg-white border p-4 grid sm:grid-cols-2 gap-3"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <input type="text" className="hidden" autoComplete="username" tabIndex={-1} aria-hidden />
        <input type="password" className="hidden" autoComplete="new-password" tabIndex={-1} aria-hidden />
        <input
          className="rounded-full border px-4 py-2"
          placeholder="Name"
          name="osb-product-name"
          autoComplete="off"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <select
          className="rounded-full border px-4 py-2"
          name="osb-product-category"
          autoComplete="off"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Category</option>
          {cats.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          className="rounded-full border px-4 py-2"
          placeholder="Quantity"
          name="osb-product-qty"
          autoComplete="off"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <textarea
          className="sm:col-span-2 rounded-2xl border px-4 py-2"
          placeholder="Description"
          name="osb-product-description"
          autoComplete="off"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <AdminImageField
          label="Product photo"
          previewUrl={form.images[0]}
          uploading={uploading}
          onFile={upload}
        />
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary w-fit" type="submit">
            {editId ? "Update Product" : "Add Product"}
          </button>
          {editId && (
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-6 overflow-auto rounded-2xl bg-white border">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Name</th>
              <th>Quantity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td>{p.stock}</td>
                <td className="space-x-3 p-3 whitespace-nowrap">
                  <button className="text-crimson" type="button" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button className="text-red-600" type="button" onClick={() => remove(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex gap-2">
        {page > 1 && (
          <button className="btn-ghost" type="button" onClick={() => load(page - 1)}>
            Previous
          </button>
        )}
        {page < pages && (
          <button className="btn-primary" type="button" onClick={() => load(page + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
