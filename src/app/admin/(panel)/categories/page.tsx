"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminImageField } from "@/components/admin-image-field";

type Cat = { _id: string; name: string; image?: string; isActive: boolean };

export default function CategoriesAdmin() {
  const [items, setItems] = useState<Cat[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setItems(data.items || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error || "Upload failed");
      return;
    }
    setImage(data.url);
  }

  async function save() {
    if (!name.trim()) {
      toast.error("Enter a category name");
      return;
    }
    if (!image) {
      toast.error("Upload a category image from this device");
      return;
    }
    const res = await fetch(editId ? `/api/admin/categories/${editId}` : "/api/admin/categories", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), image, isActive: true }),
    });
    if (!res.ok) {
      toast.error("Could not save category");
      return;
    }
    toast.success(editId ? "Category updated" : "Category created");
    setName("");
    setImage("");
    setEditId(null);
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Categories</h1>
      <p className="text-sm text-zinc-500 mt-1">Homepage collections update automatically from this list.</p>
      <form
        className="mt-6 rounded-2xl bg-white border p-4 grid gap-3 max-w-xl"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <input type="text" className="hidden" autoComplete="username" tabIndex={-1} aria-hidden />
        <input type="password" className="hidden" autoComplete="new-password" tabIndex={-1} aria-hidden />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          name="osb-category-name"
          autoComplete="off"
          className="rounded-full border px-4 py-2"
        />
        <AdminImageField label="Category image" previewUrl={image} uploading={uploading} onFile={upload} />
        <div className="flex gap-2">
          <button className="btn-primary w-fit" type="submit">
            {editId ? "Update Category" : "Create Category"}
          </button>
          {editId && (
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                setEditId(null);
                setName("");
                setImage("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {items.map((c) => (
          <div key={c._id} className="rounded-2xl bg-white border p-4 flex justify-between gap-3">
            <div className="flex gap-3 items-center min-w-0">
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image} alt="" className="h-12 w-12 rounded-xl object-cover border shrink-0" />
              ) : null}
              <div className="min-w-0">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-zinc-500">{c.isActive ? "Active" : "Hidden"}</div>
              </div>
            </div>
            <div className="flex gap-3 text-sm shrink-0">
              <button
                className="text-crimson"
                type="button"
                onClick={() => {
                  setEditId(c._id);
                  setName(c.name);
                  setImage(c.image || "");
                }}
              >
                Edit
              </button>
              <button className="text-red-600" type="button" onClick={() => remove(c._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
