import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { getAdminByUsername } from "@/lib/data";
import { ensureAdmin } from "@/lib/ensure-admin";
import { attachAdminCookie } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const parsed = z.object({ username: z.string().min(1), password: z.string().min(1) }).safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Enter username and password" }, { status: 400 });

    const username = parsed.data.username.trim();
    const password = parsed.data.password;

    await connectDb();
    await ensureAdmin();

    const admin = await getAdminByUsername(username);
    if (!admin) {
      const ip = req.headers.get("x-forwarded-for") || "local";
      const limit = rateLimit(`admin-login:${ip}`, process.env.NODE_ENV === "production" ? 8 : 80, 15 * 60_000);
      if (!limit.ok) {
        return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      const ip = req.headers.get("x-forwarded-for") || "local";
      const limit = rateLimit(`admin-login:${ip}`, process.env.NODE_ENV === "production" ? 8 : 80, 15 * 60_000);
      if (!limit.ok) {
        return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.headers.set("Cache-Control", "no-store");
    return attachAdminCookie(res, { role: "admin", adminId: String(admin._id), username: admin.username });
  } catch (e) {
    console.error("[admin-login]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error && e.message.includes("DATABASE_URL")
            ? e.message
            : "Could not reach Neon. Check DATABASE_URL in .env.local and try again.",
      },
      { status: 503 },
    );
  }
}
