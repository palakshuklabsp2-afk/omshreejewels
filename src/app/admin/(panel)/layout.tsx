import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, clearAdminCookie } from "@/lib/session";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  async function logout() {
    "use server";
    await clearAdminCookie();
    redirect("/admin/login");
  }

  const links = [
    ["/admin", "Dashboard"],
    ["/admin/homepage", "Homepage"],
    ["/admin/products", "Products"],
    ["/admin/categories", "Categories"],
    ["/admin/orders", "Orders"],
    ["/admin/customers", "Customers"],
  ] as const;

  return (
    <div className="min-h-screen grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-wine text-white p-6 space-y-4">
        <BrandLogo size="footer" className="ring-1 ring-gold/30" />
        <p className="text-xs text-gold">Admin</p>
        <nav className="flex lg:flex-col gap-3 text-sm overflow-x-auto pb-2">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap hover:text-gold">
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="text-sm text-gold mt-2 lg:mt-8">Logout</button>
        </form>
      </aside>
      <div className="p-4 sm:p-6 bg-ivory">{children}</div>
    </div>
  );
}
