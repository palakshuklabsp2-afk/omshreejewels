import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ensureAdmin } from "@/lib/ensure-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    await connectDb();
    void ensureAdmin().catch((e) => console.warn("[health] admin ensure skipped", e));
    return NextResponse.json({ ok: true, db: "neon" });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Database failed" },
      { status: 500 },
    );
  }
}
