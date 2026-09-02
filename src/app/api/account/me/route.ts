import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/session";
import { getCustomerById } from "@/lib/data";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ customer: null });
  const customer = await getCustomerById(session.customerId);
  return NextResponse.json({ customer });
}
