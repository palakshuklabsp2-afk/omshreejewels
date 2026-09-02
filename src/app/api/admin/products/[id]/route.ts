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
  if (typeof body.name === "string") allowed.name = body.name;
  if (typeof body.description === "string") allowed.description = body.description;
  if (typeof body.category === "string") allowed.category = body.category;
  if (body.price !== undefined) allowed.price = Number(body.price);
  if (body.salePrice !== undefined) {
    allowed.salePrice = body.salePrice === null || body.salePrice === "" ? null : Number(body.salePrice);
  }
  if (Array.isArray(body.images)) allowed.images = body.images;
  if (body.stock !== undefined) allowed.stock = Number(body.stock);
  if (typeof body.sku === "string") allowed.sku = body.sku;
  if (Array.isArray(body.tags)) allowed.tags = body.tags;
  if (typeof body.featured === "boolean") allowed.featured = body.featured;
  if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
  if (allowed.price != null && (!Number.isFinite(allowed.price) || allowed.price <= 0)) {
    return NextResponse.json({ error: "Enter a valid price in rupees" }, { status: 400 });
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
