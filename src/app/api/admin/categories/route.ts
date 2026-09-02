import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { createCategory, listAllCategories, slugTaken } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const items = await listAllCategories();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = z
    .object({
      name: z.string().min(2),
      image: z.string().optional(),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  await connectDb();
  let slug = slugify(parsed.data.name);
  if (await slugTaken("categories", slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  const category = await createCategory({ ...parsed.data, slug });
  return NextResponse.json(category);
}
