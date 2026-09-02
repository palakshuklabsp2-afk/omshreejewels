"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminImageField } from "@/components/admin-image-field";

export default function HomepageAdmin() {
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setImage(data.homepageHeroImage || "");
    setVideo(data.homepageVideo || "");
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

  async function uploadVideo(file: File) {
    setUploadingVideo(true);
    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/admin/upload-video", { method: "POST", body: form });
    const data = await res.json();
    setUploadingVideo(false);
    if (!res.ok) {
      toast.error(data.error || "Video upload failed");
      return;
    }
    setVideo(data.url);
    toast.success("Video uploaded. Click Save video to show it on the homepage.");
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

  async function saveVideo() {
    setSavingVideo(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homepageVideo: video.trim() }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setSavingVideo(false);
    if (!res.ok) {
      toast.error(data.error || "Could not save homepage video");
      return;
    }
    toast.success(video.trim() ? "Homepage film updated — only this one video will play" : "Homepage video removed");
  }

  if (loading) return <div className="skeleton h-40 rounded-2xl" />;

  return (
    <div>
      <h1 className="font-display text-4xl text-wine">Homepage</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Change the banner photo and the single cinematic film shown on the homepage.
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

      <form
        className="mt-8 rounded-2xl bg-white border p-4 grid gap-3 max-w-xl"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void saveVideo();
        }}
      >
        <h2 className="font-display text-2xl text-wine">Homepage film (only one)</h2>
        <p className="text-xs text-zinc-500">
          Upload one MP4/WebM/MOV (under 60 MB) or paste a YouTube/Vimeo link. The homepage shows this single video in a
          gold cinematic frame.
        </p>
        <label className="block rounded-2xl border border-dashed border-crimson/30 bg-ivory/60 px-4 py-4 cursor-pointer">
          <span className="block text-sm font-medium text-wine">Upload jewellery video</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            className="mt-3 block w-full text-sm"
            disabled={uploadingVideo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadVideo(file);
              e.target.value = "";
            }}
          />
        </label>
        {uploadingVideo ? <p className="text-xs text-zinc-500">Uploading video… this can take a minute.</p> : null}
        <label className="text-sm">
          Or paste YouTube / Vimeo / video URL
          <input
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded-full border px-4 py-2"
          />
        </label>
        {video && !video.includes("youtu") && !video.includes("vimeo") ? (
          <video src={video} controls className="w-full max-h-64 rounded-2xl bg-black" />
        ) : video ? (
          <p className="text-xs text-zinc-500">Linked film will play on the homepage only.</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary w-fit" type="submit" disabled={savingVideo || uploadingVideo}>
            {savingVideo ? "Saving…" : "Save homepage video"}
          </button>
          {video ? (
            <button
              type="button"
              className="btn-ghost"
              disabled={savingVideo}
              onClick={() => {
                setVideo("");
                void (async () => {
                  setSavingVideo(true);
                  const res = await fetch("/api/admin/settings", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ homepageVideo: "" }),
                  });
                  setSavingVideo(false);
                  if (res.ok) toast.success("Homepage video removed");
                })();
              }}
            >
              Remove video
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
