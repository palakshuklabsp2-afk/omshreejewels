import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getHomepageHeroImage, getHomepageVideo, setHomepageHeroImage, setHomepageVideo } from "@/lib/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const [homepageHeroImage, homepageVideo] = await Promise.all([getHomepageHeroImage(), getHomepageVideo()]);
  return NextResponse.json({ homepageHeroImage, homepageVideo });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = z
    .object({
      homepageHeroImage: z.string().min(1).optional(),
      homepageVideo: z.string().optional(),
    })
    .refine((d) => d.homepageHeroImage !== undefined || d.homepageVideo !== undefined, {
      message: "Nothing to save",
    })
    .safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid settings" }, { status: 400 });
  }
  const homepageHeroImage =
    parsed.data.homepageHeroImage !== undefined
      ? await setHomepageHeroImage(parsed.data.homepageHeroImage)
      : await getHomepageHeroImage();
  const homepageVideo =
    parsed.data.homepageVideo !== undefined ? await setHomepageVideo(parsed.data.homepageVideo) : await getHomepageVideo();
  revalidatePath("/");
  return NextResponse.json({ homepageHeroImage, homepageVideo });
}
