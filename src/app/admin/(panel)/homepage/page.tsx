"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminImageField } from "@/components/admin-image-field";

export default function HomepageAdmin() {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setImage(data.homepageHeroImage || "");
    setLoading(false);
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
    toast.success("Photo uploaded. Click Save to show it on the homepage.");
  }

  async function save() {
    if (!image) {
      toast.error("Upload a necklace photo from this device");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homepageHeroImage: image }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      toast.error(data.error || "Could not save homepage image");
      return;
    }
    toast.success("Homepage necklace photo updated");
  }

  if (loading) return <div className="skeleton h-40 rounded-2xl" />;

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Homepage</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Change the large necklace photo shown on the right side of the homepage banner.
      </p>
      <form
        className="mt-6 rounded-2xl bg-white border p-4 grid gap-3 max-w-xl"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <AdminImageField
          label="Homepage necklace photo"
          previewUrl={image}
          uploading={uploading}
          onFile={upload}
        />
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Homepage necklace preview" className="w-full max-h-80 rounded-2xl object-cover border" />
        ) : null}
        <button className="btn-primary w-fit" type="submit" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save homepage photo"}
        </button>
      </form>
    </div>
  );
}
