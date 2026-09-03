import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { optimizedImage } from "@/lib/images";
import { formatInr, productPricing, STORE } from "@/lib/utils";
import { AddToCart } from "./add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    if (!product) return { title: "Product" };
    return {
      title: product.name,
      description: product.description?.slice(0, 160) || `Buy ${product.name} at ${STORE.name}`,
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }
  if (!product) notFound();
  const pricing = productPricing(product.price, product.salePrice);
  const images = product.images?.length ? product.images : ["/placeholder-jewellery.svg"];
  const category = typeof product.category === "object" ? product.category : undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-2 gap-10">
      <ProductGallery images={images} name={product.name} />
      <div>
        <BrandLogo size="footer" className="mb-3" />
        <p className="text-gold tracking-widest text-xs">{STORE.name}</p>
        {category?.slug && (
          <Link href={`/category/${category.slug}`} className="text-sm text-crimson mt-2 inline-block">
            {category.name}
          </Link>
        )}
        <h1 className="font-display text-4xl text-wine mt-2">{product.name}</h1>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <span className="text-2xl font-semibold text-crimson">{formatInr(pricing.selling)}</span>
          {pricing.discounted && (
            <>
              <span className="line-through text-zinc-400">{formatInr(pricing.mrp)}</span>
              <span className="rounded-full bg-crimson text-white text-xs font-semibold px-3 py-1">
                {pricing.percent}% OFF
              </span>
            </>
          )}
        </div>
        {pricing.discounted ? (
          <p className="mt-2 text-sm text-crimson">You save {formatInr(pricing.saved)} on this piece</p>
        ) : null}
        <p className="mt-6 text-zinc-700 whitespace-pre-line">{product.description}</p>
        {product.sizes?.length ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-wine">Available sizes</p>
            <p className="text-sm text-zinc-600 mt-1">{product.sizes.join(" · ")}</p>
          </div>
        ) : null}
        <p className="mt-4 text-sm">Stock: {product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
        <AddToCart
          product={{
            productId: String(product._id),
            name: product.name,
            image: optimizedImage(images[0]),
            price: pricing.selling,
            stock: product.stock,
            sizes: product.sizes,
          }}
        />
        <p className="mt-6 text-sm text-crimson">🇮🇳 All over India shipping available</p>
        <p className="mt-2 text-xs text-zinc-500">No Return · No Exchange. Please review details before ordering.</p>
      </div>
    </div>
  );
}
