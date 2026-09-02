import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { getHomepageHeroImage, setHomepageHeroImage } from "@/lib/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const homepageHeroImage = await getHomepageHeroImage();
  return NextResponse.json({ homepageHeroImage });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = z
    .object({
      homepageHeroImage: z.string().min(1),
    })
    .safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Upload a necklace photo first" }, { status: 400 });
  }
  const homepageHeroImage = await setHomepageHeroImage(parsed.data.homepageHeroImage);
  revalidatePath("/");
  return NextResponse.json({ homepageHeroImage });
}
