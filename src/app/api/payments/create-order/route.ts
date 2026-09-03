import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession } from "@/lib/session";
import { connectDb } from "@/lib/db";
import { createPaymentDraft, getCustomerById, productsByIds } from "@/lib/data";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { COD_ADVANCE, MIN_ORDER_AMOUNT, productPricing } from "@/lib/utils";
import { isId } from "@/lib/id";
import { rateLimit } from "@/lib/rate-limit";
import { demoPaymentsAllowed } from "@/lib/place-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemSchema = z.object({
  productId: z.string(),
  qty: z.number().int().min(1).max(20),
  size: z.string().optional(),
});

function fallbackDemo() {
  return {
    demo: true as const,
    razorpayOrderId: `demo_order_${Date.now()}`,
  };
}

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
    const sizes = p.sizes || [];
    if (sizes.length) {
      const chosen = (line.size || "").trim();
      if (!chosen || !sizes.includes(chosen)) {
        return NextResponse.json({ error: `Select a size for ${p.name}` }, { status: 400 });
      }
    }
    const price = productPricing(p.price, p.salePrice).selling;
    subtotal += price * line.qty;
    items.push({
      productId: p._id,
      name: line.size ? `${p.name} · Size ${line.size}` : p.name,
      image: p.images?.[0] || "",
      qty: line.qty,
      price,
      size: line.size || "",
    });
  }

  if (subtotal < MIN_ORDER_AMOUNT) {
    return NextResponse.json(
      { error: `Minimum order is ₹${MIN_ORDER_AMOUNT}. Add more items to continue.` },
      { status: 400 },
    );
  }

  const payable = parsed.data.method === "cod" ? Math.min(COD_ADVANCE, subtotal) : subtotal;
  let amountPaise = Math.max(100, Math.round(payable * 100));
  let demo = false;
  let keyId = "";
  let razorpayOrderId = "";

  if (!isRazorpayConfigured()) {
    if (!demoPaymentsAllowed()) {
      return NextResponse.json(
        {
          error:
            "Razorpay is not set on this server. Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID in the host environment (Vercel/hosting), then redeploy.",
        },
        { status: 503 },
      );
    }
    const fallback = fallbackDemo();
    demo = fallback.demo;
    razorpayOrderId = fallback.razorpayOrderId;
  } else {
    try {
      const order = await createRazorpayOrder({
        amountPaise,
        receipt: `osb_${Date.now()}`,
      });
      razorpayOrderId = order.id;
      amountPaise = order.amount;
      keyId = order.keyId;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Razorpay payment could not be started";
      console.error("[payments/create-order]", message);
      if (!demoPaymentsAllowed()) {
        return NextResponse.json(
          {
            error: `Payment gateway error: ${message}. Use the Razorpay Key Id and Key Secret from the same mode (test or live).`,
          },
          { status: 503 },
        );
      }
      const fallback = fallbackDemo();
      demo = fallback.demo;
      razorpayOrderId = fallback.razorpayOrderId;
    }
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
