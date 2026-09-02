import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/session";
import { getDraft } from "@/lib/data";
import { demoPaymentsAllowed, fulfillDraft } from "@/lib/place-order";

export async function POST(req: Request) {
  if (!demoPaymentsAllowed()) {
    return NextResponse.json({ error: "Demo payments are disabled in production" }, { status: 403 });
  }
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = (await req.json()) as { draftId?: string; razorpayOrderId?: string };
  const draft = await getDraft({
    id: body.draftId,
    razorpayOrderId: body.razorpayOrderId,
    customerId: session.customerId,
  });
  if (!draft) return NextResponse.json({ error: "Payment session expired" }, { status: 400 });
  try {
    const result = await fulfillDraft({
      customerId: session.customerId,
      razorpayOrderId: draft.razorpayOrderId,
      razorpayPaymentId: `demo_${Date.now()}`,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not place order" }, { status: 400 });
  }
}
