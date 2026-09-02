import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 60 * 1024 * 1024;
const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg"]);

function extFor(file: File) {
  const fromName = extname(file.name || "").toLowerCase();
  if ([".mp4", ".webm", ".mov", ".ogg"].includes(fromName)) return fromName;
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";
  if (file.type === "video/ogg") return ".ogg";
  return ".mp4";
}

async function saveLocal(buffer: Buffer, file: File) {
  const dir = join(process.cwd(), "public", "uploads", "videos");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${extFor(file)}`;
  await writeFile(join(dir, name), buffer);
  return `/uploads/videos/${name}`;
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a video from your device" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Video must be under 60 MB" }, { status: 400 });
  if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Upload an MP4, WebM, or MOV video" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  const hasCloudinary =
    !!process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    !!process.env.CLOUDINARY_API_KEY?.trim() &&
    !!process.env.CLOUDINARY_API_SECRET?.trim();

  if (hasCloudinary) {
    try {
      const cloudinary = getCloudinary();
      const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "om-shree-jewels/videos", resource_type: "video" }, (err, result) => {
            if (err || !result) reject(err || new Error("Cloudinary video upload failed"));
            else resolve(result as { secure_url: string });
          })
          .end(buffer);
      });
      return NextResponse.json({ url: uploaded.secure_url });
    } catch (err) {
      console.error("[upload-video] Cloudinary failed", err);
      return NextResponse.json(
        { error: "Video upload failed. Check Cloudinary keys, or use a YouTube/Vimeo link." },
        { status: 502 },
      );
    }
  }

  const url = await saveLocal(buffer, file);
  return NextResponse.json({ url });
}
