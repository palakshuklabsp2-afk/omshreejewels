import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listCustomers } from "@/lib/data";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  return NextResponse.json(await listCustomers(page));
}
