import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop, WhatsAppButton } from "@/components/floaters";
import { getCustomerSession } from "@/lib/session";
import { getActiveCategories } from "@/lib/queries";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession();
  let categories: { name: string; slug: string }[] = [];
  try {
    const docs = await getActiveCategories();
    categories = docs.map((c) => ({ name: c.name, slug: c.slug }));
  } catch {
    categories = [];
  }

  return (
    <>
      <Header loggedIn={Boolean(session)} categories={categories} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer categories={categories} />
      <WhatsAppButton />
      <BackToTop />
    </>
  );
}
