import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { createSize, listAllSizes, slugTaken } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const items = await listAllSizes();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = z
    .object({
      name: z.string().min(1).max(40),
      sortOrder: z.number().optional(),
      isActive: z.boolean().optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter a size name" }, { status: 400 });
  await connectDb();
  let slug = slugify(parsed.data.name) || `size-${Date.now().toString().slice(-4)}`;
  if (await slugTaken("sizes", slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  try {
    const size = await createSize({ ...parsed.data, slug });
    return NextResponse.json(size);
  } catch {
    return NextResponse.json({ error: "That size already exists" }, { status: 400 });
  }
}
