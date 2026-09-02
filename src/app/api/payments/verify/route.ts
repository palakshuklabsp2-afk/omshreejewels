import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { fulfillDraft } from "@/lib/place-order";

export async function POST(req: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }
    if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const result = await fulfillDraft({
      customerId: session.customerId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
