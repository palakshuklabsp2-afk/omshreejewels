import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listOrders, updateOrderStatus } from "@/lib/data";
import { ORDER_STATUSES } from "@/lib/utils";
import { isId } from "@/lib/id";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  return NextResponse.json(await listOrders(page));
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id, status } = await req.json();
  if (!isId(id) || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await updateOrderStatus(id, status);
  return NextResponse.json(order);
}
