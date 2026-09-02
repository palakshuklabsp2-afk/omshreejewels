import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteProduct, updateProduct } from "@/lib/data";
import { canFeatureProduct } from "@/lib/featured";
import { isId } from "@/lib/id";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await req.json();
  const allowed: {
    name?: string;
    description?: string;
    category?: string;
    price?: number;
    salePrice?: number | null;
    images?: string[];
    stock?: number;
    sku?: string;
    tags?: string[];
    featured?: boolean;
    isActive?: boolean;
  } = {};
  for (const key of [
    "name",
    "description",
    "category",
    "price",
    "salePrice",
    "images",
    "stock",
    "sku",
    "tags",
    "featured",
    "isActive",
  ] as const) {
    if (body[key] !== undefined) allowed[key] = body[key];
  }
  if (allowed.featured === true && !(await canFeatureProduct(id))) {
    return NextResponse.json({ error: "Homepage can feature a maximum of 20 products" }, { status: 400 });
  }
  const product = await updateProduct(id, allowed);
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
