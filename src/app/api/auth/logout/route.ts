import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/session";

export async function POST() {
  return clearAuthCookies(NextResponse.json({ ok: true }), "customer");
}
