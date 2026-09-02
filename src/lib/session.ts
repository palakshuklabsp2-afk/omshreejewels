import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "osb_session";
const ADMIN_COOKIE = "osb_admin";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(value);
}

function cookieSecure() {
  const url = process.env.NEXT_PUBLIC_APP_URL || "";
  if (url.startsWith("http://")) return false;
  if (url.startsWith("https://")) return true;
  return process.env.NODE_ENV === "production";
}

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
  };
}

export type CustomerSession = { role: "customer"; customerId: string; phone: string };
export type AdminSession = { role: "admin"; adminId: string; username: string };
export type Session = CustomerSession | AdminSession;

async function sign(payload: Session, maxAge = "30d") {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(maxAge)
    .sign(secret());
}

async function readToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function attachCustomerCookie(res: NextResponse, session: CustomerSession) {
  const token = await sign(session);
  res.cookies.set(COOKIE, token, { ...cookieBase(), maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function attachAdminCookie(res: NextResponse, session: AdminSession) {
  const token = await sign(session, "12h");
  res.cookies.set(ADMIN_COOKIE, token, { ...cookieBase(), maxAge: 60 * 60 * 12 });
  return res;
}

export function clearAuthCookies(res: NextResponse, which: "customer" | "admin" | "all" = "all") {
  const base = { ...cookieBase(), maxAge: 0 };
  if (which === "customer" || which === "all") res.cookies.set(COOKIE, "", base);
  if (which === "admin" || which === "all") res.cookies.set(ADMIN_COOKIE, "", base);
  return res;
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const session = await readToken(token);
    return session?.role === "customer" ? session : null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    const session = await readToken(token);
    return session?.role === "admin" ? session : null;
  } catch {
    return null;
  }
}

export async function clearCustomerCookie() {
  (await cookies()).delete(COOKIE);
}

export async function clearAdminCookie() {
  (await cookies()).delete(ADMIN_COOKIE);
}
