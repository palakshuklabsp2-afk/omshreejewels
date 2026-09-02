import { featuredCount } from "@/lib/data";
import { HOME_FEATURED_LIMIT } from "@/lib/utils";

export async function canFeatureProduct(excludeId?: string) {
  const count = await featuredCount(excludeId);
  return count < HOME_FEATURED_LIMIT;
}
