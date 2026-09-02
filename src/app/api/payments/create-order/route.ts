import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { createPaymentDraft, getCustomerById, productsByIds } from "@/lib/data";
import { getRazorpay } from "@/lib/razorpay";
import { COD_ADVANCE, productPricing } from "@/lib/utils";
import { isId } from "@/lib/id";
import { rateLimit } from "@/lib/rate-limit";
import { demoPaymentsAllowed } from "@/lib/place-order";

const itemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).max(20),
});

export async function POST(req: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Please login before placing an order" }, { status: 401 });
  const limit = rateLimit(`pay:${session.customerId}`, 20, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many payment attempts" }, { status: 429 });
  const parsed = z
    .object({
      method: z.enum(["online", "cod"]),
      items: z.array(itemSchema).min(1),
    })
    .safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });

  await connectDb();
  const customer = await getCustomerById(session.customerId);
  if (!customer?.addressLocked || !customer.address) {
    return NextResponse.json({ error: "Save your address before checkout" }, { status: 400 });
  }

  const ids = parsed.data.items.map((i) => i.productId).filter((id) => isId(id));
  const products = await productsByIds(ids);
  const map = new Map(products.map((p) => [String(p._id), p]));
  const items = [];
  let subtotal = 0;
  for (const line of parsed.data.items) {
    const p = map.get(line.productId);
    if (!p || p.stock < line.qty) {
      return NextResponse.json({ error: "A product is out of stock" }, { status: 400 });
    }
    const price = productPricing(p.price, p.salePrice).selling;
    subtotal += price * line.qty;
    items.push({
      productId: p._id,
      name: p.name,
      image: p.images?.[0] || "",
      qty: line.qty,
      price,
    });
  }

  const payable = parsed.data.method === "cod" ? Math.min(COD_ADVANCE, subtotal) : subtotal;
  let razorpayOrderId: string;
  let amountPaise = Math.round(payable * 100);
  let demo = false;
  let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `osb_${Date.now()}`,
    });
    razorpayOrderId = order.id;
    amountPaise = Number(order.amount);
  } catch {
    if (!demoPaymentsAllowed()) {
      return NextResponse.json({ error: "Payment gateway is not configured yet" }, { status: 503 });
    }
    demo = true;
    razorpayOrderId = `demo_order_${Date.now()}`;
  }

  const draft = await createPaymentDraft({
    customerId: customer._id,
    razorpayOrderId,
    method: parsed.data.method,
    amount: payable,
    subtotal,
    items,
  });

  return NextResponse.json({
    demo,
    keyId,
    razorpayOrderId,
    amount: amountPaise,
    draftId: String(draft._id),
  });
}
