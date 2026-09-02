import type { MetadataRoute } from "next";
import { sitemapRows } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes = ["", "/shop", "/about", "/contact", "/privacy", "/terms", "/shipping", "/track", "/login"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }),
  );

  try {
    const { cats, products } = await sitemapRows();
    return [
      ...staticRoutes,
      ...cats.map((c) => ({ url: `${base}/category/${c.slug}`, lastModified: c.updatedAt || new Date() })),
      ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt || new Date() })),
    ];
  } catch {
    return staticRoutes;
  }
}
