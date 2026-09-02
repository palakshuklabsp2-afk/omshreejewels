import bcrypt from "bcryptjs";
import { connectDb } from "@/lib/db";
import { createAdmin, getAdminByUsername, updateAdminPassword } from "@/lib/data";

export async function ensureAdmin() {
  await connectDb();
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env.local");
  }
  const existing = await getAdminByUsername(username);
  if (!existing) {
    await createAdmin(username, await bcrypt.hash(password, 12));
    return;
  }
  if (!(await bcrypt.compare(password, existing.passwordHash))) {
    existing.passwordHash = await bcrypt.hash(password, 12);
    await updateAdminPassword(existing._id, existing.passwordHash);
  }
}
