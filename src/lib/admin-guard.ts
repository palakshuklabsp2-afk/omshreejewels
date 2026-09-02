import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  return { error: null, session };
}
