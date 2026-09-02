import { getHomepageHeroImage, listActiveCategories, listFeaturedProducts, searchProducts as search } from "@/lib/data";

export async function getActiveCategories() {
  return listActiveCategories();
}

export async function getFeaturedProducts() {
  return listFeaturedProducts();
}

export async function getHomepageNecklaceImage() {
  return getHomepageHeroImage();
}

export async function searchProducts(params: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  min?: number;
  max?: number;
}) {
  return search(params);
}
