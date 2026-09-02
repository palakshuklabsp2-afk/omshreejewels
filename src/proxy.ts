import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!req.cookies.get("osb_admin")) {
      const redirect = NextResponse.redirect(new URL("/admin/login", req.url));
      redirect.headers.set("Cache-Control", "no-store");
      return redirect;
    }
  }
  const next = NextResponse.next();
  next.headers.set("Cache-Control", "no-store");
  return next;
}

export const config = {
  matcher: ["/admin/:path*"],
};
