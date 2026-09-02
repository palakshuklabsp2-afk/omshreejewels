import { STORE } from "@/lib/utils";

export default function robots() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

export const store = STORE.name;
