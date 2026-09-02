import { NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerSession } from "@/lib/session";
import { updateCustomerName } from "@/lib/data";

export async function POST(req: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  const parsed = z.object({ name: z.string().min(1).max(80) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  await updateCustomerName(session.customerId, parsed.data.name);
  return NextResponse.json({ ok: true });
}
