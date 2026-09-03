import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/lib/data";
import { searchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { BrandLogo } from "@/components/brand-logo";
import { STORE } from "@/lib/utils";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug, true);
    return { title: category?.name || "Category", description: `Shop ${category?.name || "collection"} at ${STORE.name}` };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  let category;
  try {
    category = await getCategoryBySlug(slug, true);
  } catch {
    notFound();
  }
  if (!category) notFound();
  const result = await searchProducts({
    category: String(category._id),
    page: Number(sp.page || 1),
    sort: sp.sort,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <BrandLogo size="footer" className="mb-4" />
      <h1 className="font-display text-4xl text-wine">{category.name}</h1>
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
              sizes: p.sizes,
            }}
          />
        ))}
      </div>
      {result.pages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          {result.page > 1 && (
            <Link href={`/category/${slug}?page=${result.page - 1}`} className="btn-ghost">
              Previous
            </Link>
          )}
          {result.page < result.pages && (
            <Link href={`/category/${slug}?page=${result.page + 1}`} className="btn-primary">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
