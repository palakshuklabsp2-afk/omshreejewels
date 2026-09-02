import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ direct: false });
  }

  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const folder = body.folder?.trim() || "om-shree-jewels/videos";
  const timestamp = Math.round(Date.now() / 1000);
  const cloudinary = getCloudinary();
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({
    direct: true,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  });
}
