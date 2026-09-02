import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-guard";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"]);

function extFor(file: File) {
  const fromName = extname(file.name || "").toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName)) return fromName;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}

async function saveLocal(buffer: Buffer, file: File) {
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${extFor(file)}`;
  await writeFile(join(dir, name), buffer);
  return `/uploads/${name}`;
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a photo from your device" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be under 8 MB" }, { status: 400 });
  if (file.type && !ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please upload an image file" }, { status: 400 });
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
          .upload_stream({ folder: "om-shree-jewels", resource_type: "image" }, (err, result) => {
            if (err || !result) reject(err || new Error("Cloudinary upload failed"));
            else resolve(result as { secure_url: string });
          })
          .end(buffer);
      });
      return NextResponse.json({ url: uploaded.secure_url });
    } catch (err) {
      console.error("[upload] Cloudinary failed", err);
      return NextResponse.json(
        { error: "Cloudinary upload failed. Check CLOUDINARY_* keys in .env.local." },
        { status: 502 },
      );
    }
  }

  const url = await saveLocal(buffer, file);
  return NextResponse.json({ url });
}
