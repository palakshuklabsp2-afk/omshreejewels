import type { Metadata } from "next";
import Link from "next/link";
import { getActiveCategories, searchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string; min?: string; max?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page || 1);
  let result = { items: [] as Awaited<ReturnType<typeof searchProducts>>["items"], total: 0, pages: 0, page: 1 };
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  try {
    [result, categories] = await Promise.all([
      searchProducts({
        q: sp.q,
        category: sp.category,
        sort: sp.sort,
        page,
        min: sp.min ? Number(sp.min) : undefined,
        max: sp.max ? Number(sp.max) : undefined,
      }),
      getActiveCategories(),
    ]);
  } catch {
    /* empty */
  }

  function href(next: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { ...sp, ...next };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return `/shop?${p.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <BrandLogo size="footer" className="mb-4" />
      <h1 className="font-display text-4xl text-wine">Shop</h1>
      <p className="text-sm text-zinc-500 mt-1">🇮🇳 All over India shipping available</p>
      <form className="mt-6 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input name="q" defaultValue={sp.q} placeholder="Search name, tags, SKU" className="rounded-full border px-4 py-2 text-sm" />
        <select name="category" defaultValue={sp.category || ""} className="rounded-full border px-4 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={String(c._id)} value={String(c._id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort || "newest"} className="rounded-full border px-4 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
        <input name="min" defaultValue={sp.min} placeholder="Min ₹" className="rounded-full border px-4 py-2 text-sm" />
        <input name="max" defaultValue={sp.max} placeholder="Max ₹" className="rounded-full border px-4 py-2 text-sm" />
        <button className="btn-primary">Filter</button>
      </form>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {result.items.map((p) => (
          <ProductCard
            key={String(p._id)}
            product={{
              _id: String(p._id),
              name: p.name,
              slug: p.slug,
              price: p.price,
              salePrice: p.salePrice,
              images: p.images,
              stock: p.stock,
            }}
          />
        ))}
      </div>
      {result.items.length === 0 && <p className="mt-8 text-zinc-500">No products found.</p>}
      {result.pages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {result.page > 1 && (
            <Link href={href({ page: String(result.page - 1) })} className="btn-ghost">
              Previous
            </Link>
          )}
          <span className="py-2 text-sm">
            Page {result.page} of {result.pages}
          </span>
          {result.page < result.pages && (
            <Link href={href({ page: String(result.page + 1) })} className="btn-primary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
