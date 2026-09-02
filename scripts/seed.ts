import { readFileSync } from "fs";
import { resolve } from "path";

for (const file of [".env.local", ".env"]) {
  try {
    const text = readFileSync(resolve(file), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* optional */
  }
}

import { connectDb } from "./src/lib/db";
import { ensureAdmin } from "./src/lib/ensure-admin";
import { removeDemoCatalog } from "./src/lib/seed-catalog";

async function run() {
  await connectDb();
  const removed = await removeDemoCatalog();
  await ensureAdmin();
  console.log(
    `Admin ready. Removed demo products: ${removed.productsRemoved}, demo categories: ${removed.categoriesRemoved}.`,
  );
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
