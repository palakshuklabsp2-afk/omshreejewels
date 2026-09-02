import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const order = searchParams.get("order")?.trim();
  if (!order) return NextResponse.json({ error: "Order number required" }, { status: 400 });
  const doc = await getOrderByNumber(order);
  if (!doc) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({
    orderNumber: doc.orderNumber,
    status: doc.status,
    paymentMethod: doc.paymentMethod,
    remainingCod: doc.remainingCod,
    timeline: doc.timeline,
  });
}
