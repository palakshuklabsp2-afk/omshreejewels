import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession } from "@/lib/session";
import { getCustomerById, lockCustomerAddress } from "@/lib/data";
import { isValidIndianPhone, indianPhone } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string(),
  house: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pinCode: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || !isValidIndianPhone(parsed.data.phone)) {
    return NextResponse.json({ error: "Please fill a valid address" }, { status: 400 });
  }
  const customer = await getCustomerById(session.customerId);
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (customer.addressLocked) {
    return NextResponse.json({ error: "Address is locked and cannot be changed" }, { status: 400 });
  }
  const address = { ...parsed.data, phone: indianPhone(parsed.data.phone) };
  await lockCustomerAddress(session.customerId, address, parsed.data.fullName);
  return NextResponse.json({ ok: true });
}
