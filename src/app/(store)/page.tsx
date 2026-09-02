import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck, Truck, Star, Lock, Gem } from "lucide-react";
import { getActiveCategories, getFeaturedProducts, getHomepageNecklaceImage } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { DEFAULT_HOMEPAGE_NECKLACE_IMAGE, STORE } from "@/lib/utils";
import { optimizedImage } from "@/lib/images";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: Awaited<ReturnType<typeof getActiveCategories>> = [];
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  let heroImage = DEFAULT_HOMEPAGE_NECKLACE_IMAGE;
  try {
    [categories, products, heroImage] = await Promise.all([
      getActiveCategories(),
      getFeaturedProducts(),
      getHomepageNecklaceImage(),
    ]);
  } catch {
    /* DB not configured yet */
  }

  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(STORE.mapsQuery)}`;

  return (
    <div>
      <section className="hero-glow text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="fade-up">
            <p className="text-gold tracking-[0.35em] text-[11px] sm:text-xs mb-3">IMITATION JEWELLERY · INDIA</p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[0.95]">{STORE.name}</h1>
            <p className="mt-5 text-lg sm:text-xl text-rose-50 max-w-xl">{STORE.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary !bg-white !text-crimson">
                🛍 Shop Now
              </Link>
              <Link href="/shop" className="btn-ghost !border-white/40 !text-white !bg-transparent">
                ✨ Explore Collection
              </Link>
            </div>
            <p className="mt-6 text-xs tracking-[0.2em] text-gold">🇮🇳 {STORE.shippingBanner}</p>
          </div>
          <div className="relative h-72 sm:h-[28rem] rounded-3xl overflow-hidden border border-gold/40 shadow-2xl">
            <Image
              src={optimizedImage(heroImage)}
              alt={`Premium jewellery from ${STORE.name}`}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-wine/50 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 glass rounded-2xl px-4 py-3 text-wine">
              ⭐ Rated {STORE.rating} on Google · Trusted jewellers, Baloda Bazar
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 -mt-8 relative z-10">
        <div className="rounded-2xl bg-white shadow-xl border border-gold/30 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-crimson font-semibold">
            <Star className="fill-gold text-gold" />
            {STORE.rating} Rated on Google
          </div>
          <p className="text-sm text-zinc-600 text-center">{STORE.name}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs">COLLECTIONS</p>
            <h2 className="font-display text-4xl text-wine">Shop by Category</h2>
          </div>
        </div>
        {categories.length === 0 ? (
          <p className="text-zinc-500">Categories appear here as soon as they are created in the admin portal.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={String(c._id)}
                href={`/category/${c.slug}`}
                className="rounded-2xl overflow-hidden border border-crimson/10 bg-white shadow-sm group"
              >
                <div className="relative aspect-square">
                  <Image
                    src={optimizedImage(c.image)}
                    alt={c.name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 text-center font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs">FEATURED · MAX 20</p>
            <h2 className="font-display text-4xl text-wine">Featured Pieces</h2>
          </div>
          <Link href="/shop" className="text-crimson text-sm font-semibold">
            View All Products
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-zinc-500">Mark products as featured in admin to showcase up to 20 items here.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
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
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <h2 className="font-display text-4xl text-wine mb-6">Why Choose Us</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            ["✨", "Premium Imitation Jewellery"],
            ["🚚", "All India Shipping"],
            ["💎", "Latest Fashion Collections"],
            ["🔒", "Secure Payments"],
            ["⭐", `Rated ${STORE.rating} on Google`],
          ].map(([icon, label]) => (
            <div key={label} className="rounded-2xl bg-white border border-crimson/10 p-5 text-center shadow-sm">
              <div className="text-2xl">{icon}</div>
              <div className="mt-2 font-medium text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16">
        <h2 className="font-display text-4xl text-wine mb-6">Customer Trust</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            [Lock, "Secure Payments"],
            [ShieldCheck, "Privacy Protected"],
            [Truck, "All India Delivery"],
            [Gem, "Trusted Store"],
          ].map(([Icon, label]) => (
            <div key={String(label)} className="rounded-2xl p-5 flex items-center gap-3 bg-white border border-crimson/10">
              <Icon className="text-crimson" />
              <span className="font-medium">{label as string}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 mt-16 grid lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-white border border-crimson/10 p-8 shadow-sm">
          <h2 className="font-display text-3xl text-wine">Visit Our Store</h2>
          <p className="mt-4 whitespace-pre-line text-zinc-700">{STORE.addressLines.join("\n")}</p>
          <a href={maps} target="_blank" rel="noreferrer" className="btn-primary mt-6">
            <MapPin className="h-4 w-4" /> Get Directions
          </a>
        </div>
        <div className="rounded-3xl hero-glow text-white p-8">
          <h2 className="font-display text-3xl">Call Us</h2>
          <p className="mt-2 text-rose-100">Click to call — we are happy to help you choose.</p>
          <div className="mt-6 flex flex-col gap-3">
            {STORE.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="btn-ghost !text-white !border-white/30 !bg-white/10">
                📞 {p}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
