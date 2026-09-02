import { ensureAdmin } from "@/lib/ensure-admin";
import { removeDemoCatalog as remove } from "@/lib/data";

export async function seedCatalogIfEmpty() {
  await ensureAdmin();
  return { seeded: false };
}

export async function removeDemoCatalog() {
  await ensureAdmin();
  return remove();
}
