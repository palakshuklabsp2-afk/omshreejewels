import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getStats } from "@/lib/data";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  return NextResponse.json(await getStats());
}
