export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  try {
    const { connectDb } = await import("@/lib/db");
    const { ensureAdmin } = await import("@/lib/ensure-admin");
    await connectDb();
    await ensureAdmin();
    console.info("[startup] Neon database ready.");
  } catch (err) {
    console.warn("[startup] Database warmup failed (first login will retry):", err);
  }
}
