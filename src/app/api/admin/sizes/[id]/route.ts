import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteSize, updateSize } from "@/lib/data";
import { isId } from "@/lib/id";
import { slugify } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  if (!isId(id)) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const raw = await req.json();
  const body: { name?: string; slug?: string; isActive?: boolean; sortOrder?: number } = {};
  if (typeof raw.name === "string") {
    body.name = raw.name.trim();
    body.slug = slugify(raw.name) || undefined;
  }
  if (typeof raw.isActive === "boolean") body.isActive = raw.isActive;
  if (typeof raw.sortOrder === "number") body.sortOrder = raw.sortOrder;
  const size = await updateSize(id, body);
  return NextResponse.json(size);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  await deleteSize(id);
  return NextResponse.json({ ok: true });
}
