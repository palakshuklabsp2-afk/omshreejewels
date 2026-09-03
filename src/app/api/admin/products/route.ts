import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { createProduct, searchProducts, slugTaken } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { isId } from "@/lib/id";
import { z } from "zod";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const q = searchParams.get("q") || "";
  const result = await searchProducts({ page, q, admin: true, sort: "newest" });
  return NextResponse.json(result);
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string(),
  images: z.array(z.string().min(1)).min(1),
  stock: z.coerce.number().int().min(0),
  price: z.coerce.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  sizes: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || !isId(parsed.data.category)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  await connectDb();
  let slug = slugify(parsed.data.name);
  if (await slugTaken("products", slug)) slug = `${slug}-${Date.now().toString().slice(-4)}`;
  const product = await createProduct({ ...parsed.data, slug });
  return NextResponse.json(product);
}
