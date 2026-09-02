import { NextResponse } from "next/server";
import { mkdir, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024;
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".ogg", ".m4v", ".avi", ".mkv"]);

function extFor(file: { name?: string; type?: string }) {
  const fromName = extname(file.name || "").toLowerCase();
  if (VIDEO_EXT.has(fromName)) return fromName;
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  if (file.type === "video/ogg") return ".ogg";
  if (file.type === "video/x-m4v") return ".m4v";
  return ".mp4";
}

function isVideoFile(file: { name?: string; type?: string }) {
  const ext = extname(file.name || "").toLowerCase();
  if (VIDEO_EXT.has(ext)) return true;
  if (!file.type || file.type === "application/octet-stream") return true;
  return file.type.startsWith("video/");
}

function hasCloudinary() {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    !!process.env.CLOUDINARY_API_KEY?.trim() &&
    !!process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

async function uploadCloudinaryFromBuffer(buffer: Buffer) {
  const cloudinary = getCloudinary();
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "om-shree-jewels/videos",
        resource_type: "video",
        timeout: 120_000,
      },
      (err, result) => {
        if (err || !result?.secure_url) reject(err || new Error("Cloudinary returned no URL"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

async function saveLocal(buffer: Buffer, file: { name?: string; type?: string }) {
  const dir = join(process.cwd(), "public", "uploads", "videos");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${extFor(file)}`;
  await writeFile(join(dir, name), buffer);
  return `/uploads/videos/${name}`;
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Video is too large for this server. Use an MP4 under 100 MB, or paste a YouTube/Vimeo link." },
      { status: 413 },
    );
  }

  const raw = form.get("file");
  if (!raw || typeof raw === "string") {
    return NextResponse.json({ error: "Choose a video from your device" }, { status: 400 });
  }
  const file = raw as File;
  if (file.size <= 0) {
    return NextResponse.json({ error: "That video file is empty. Pick another file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Video must be under 100 MB. Compress it or use a YouTube/Vimeo link." },
      { status: 400 },
    );
  }
  if (!isVideoFile(file)) {
    return NextResponse.json({ error: "Upload an MP4, WebM, or MOV video" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (err) {
    console.error("[upload-video] read failed", err);
    return NextResponse.json({ error: "Could not read the video. Try a smaller MP4." }, { status: 500 });
  }

  if (hasCloudinary()) {
    const tempPath = join(/* turbopackIgnore: true */ tmpdir(), `${randomUUID()}${extFor(file)}`);
    try {
      const url = await uploadCloudinaryFromBuffer(buffer);
      return NextResponse.json({ url });
    } catch (streamErr) {
      console.error("[upload-video] Cloudinary stream failed, trying file upload", streamErr);
      try {
        await writeFile(tempPath, buffer);
        const cloudinary = getCloudinary();
        const uploaded = await cloudinary.uploader.upload(tempPath, {
          folder: "om-shree-jewels/videos",
          resource_type: "video",
          chunk_size: 6_000_000,
          timeout: 120_000,
        });
        if (!uploaded?.secure_url) throw new Error("Cloudinary returned no URL");
        return NextResponse.json({ url: uploaded.secure_url });
      } catch (err) {
        console.error("[upload-video] Cloudinary failed", err);
        return NextResponse.json(
          { error: "Video upload to Cloudinary failed. Paste a YouTube/Vimeo link, or try a smaller MP4." },
          { status: 502 },
        );
      } finally {
        await unlink(tempPath).catch(() => undefined);
      }
    }
  }

  try {
    const url = await saveLocal(buffer, file);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload-video] local save failed", err);
    return NextResponse.json(
      { error: "Could not save the video on this server. Add Cloudinary keys or paste a YouTube/Vimeo link." },
      { status: 500 },
    );
  }
}
