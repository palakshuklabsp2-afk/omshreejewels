import {
  createOrder,
  decrementStock,
  getCustomerById,
  getDraft,
  getOrderByRazorpay,
  markDraftUsed,
  nextOrderNumber,
} from "@/lib/data";
import { COD_ADVANCE } from "@/lib/utils";

export async function fulfillDraft(opts: {
  customerId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const existing = await getOrderByRazorpay(opts.razorpayOrderId);
  if (existing) {
    return {
      orderNumber: existing.orderNumber,
      remainingCod: existing.remainingCod,
      advancePaid: existing.advancePaid,
    };
  }

  const draft = await getDraft({ razorpayOrderId: opts.razorpayOrderId, customerId: opts.customerId });
  if (!draft || draft.used) throw new Error("Payment session expired");

  const customer = await getCustomerById(opts.customerId);
  if (!customer?.address) throw new Error("Address missing");

  for (const item of draft.items) {
    const ok = await decrementStock(String(item.productId), item.qty || 1);
    if (!ok) throw new Error("Stock changed. Contact support.");
  }

  const remainingCod = draft.method === "cod" ? Math.max(0, draft.subtotal - COD_ADVANCE) : 0;
  const orderNumber = await nextOrderNumber();
  await createOrder({
    orderNumber,
    customerId: customer._id,
    customerName: customer.address.fullName || customer.name,
    customerPhone: customer.address.phone || customer.phone,
    address: customer.address,
    items: draft.items,
    subtotal: draft.subtotal,
    paymentMethod: draft.method,
    paymentStatus: draft.method === "cod" ? "advance_paid" : "paid",
    razorpayOrderId: opts.razorpayOrderId,
    razorpayPaymentId: opts.razorpayPaymentId,
    advancePaid: draft.method === "cod" ? COD_ADVANCE : draft.subtotal,
    remainingCod,
    status: "confirmed",
    timeline: [{ status: "confirmed", at: new Date().toISOString(), note: "Order placed" }],
  });
  await markDraftUsed(draft._id);
  return {
    orderNumber,
    remainingCod,
    advancePaid: draft.method === "cod" ? COD_ADVANCE : draft.subtotal,
  };
}

export function demoPaymentsAllowed() {
  return process.env.NODE_ENV !== "production" || process.env.PAYMENTS_DEMO === "true";
}
