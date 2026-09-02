import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DEFAULT_HOMEPAGE_NECKLACE_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80";

export const STORE = {
  name: "OM SHREE JEWELS",
  legalName: "OM SHREE JEWELS",
  tagline: "Unique Jewellery, Unique Products",
  logo: "/brand-om-shree.png",
  rating: 4.9,
  phones: ["8959026300", "9926155200"],
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918959026300",
  pin: "493332",
  addressLines: [
    "OM SHREE JEWELS",
    "Kedia Business Centre",
    "Near Bajpai Nursing Home",
    "In Front of Om Bazar",
    "Ambedkar Chowk",
    "Baloda Bazar",
    "Chhattisgarh – 493332",
    "India",
  ],
  mapsQuery:
    "Kedia Business Centre, Near Bajpai Nursing Home, Om Bazar, Ambedkar Chowk, Baloda Bazar, Chhattisgarh 493332",
  shippingBanner: "ALL OVER INDIA SHIPPING AVAILABLE",
};

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function productPricing(price: number, salePrice?: number | null) {
  const mrp = Math.max(0, Math.round(Number(price) || 0));
  const saleNum = salePrice == null ? NaN : Math.round(Number(salePrice));
  const discounted = Number.isFinite(saleNum) && saleNum > 0 && saleNum < mrp;
  const selling = discounted ? saleNum : mrp;
  const saved = discounted ? mrp - selling : 0;
  const percent = discounted && mrp > 0 ? Math.round((saved / mrp) * 100) : 0;
  return { mrp, selling, discounted, percent, saved };
}

export function salePriceFromDiscount(price: number, percent: number) {
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(percent) || percent <= 0) return null;
  const capped = Math.min(99, percent);
  return Math.max(1, Math.round(price * (1 - capped / 100)));
}

export type DeliveryAddress = {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

export function parseAddress(raw: unknown): DeliveryAddress | null {
  if (!raw) return null;
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value !== "object" || value === null) return null;
  const o = value as Record<string, unknown>;
  const fullName = String(o.fullName || o.full_name || o.name || "").trim();
  const phone = String(o.phone || o.phoneNumber || o.mobile || "").trim();
  const house = String(o.house || o.houseFlat || o.line1 || o.addressLine1 || "").trim();
  const street = String(o.street || o.area || o.line2 || o.addressLine2 || o.landmark || "").trim();
  const city = String(o.city || "").trim();
  const state = String(o.state || "").trim();
  const pinCode = String(o.pinCode || o.pin_code || o.pincode || "").trim();
  if (!fullName && !phone && !house && !street && !city) return null;
  return { fullName, phone, house, street, city, state, pinCode };
}

export function formatStreetAddress(address: DeliveryAddress | null | undefined) {
  if (!address) return "";
  return [
    [address.house, address.street].filter(Boolean).join(", "),
    [address.city, address.state].filter(Boolean).join(", ") + (address.pinCode ? ` – ${address.pinCode}` : ""),
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatAddressBlock(address: DeliveryAddress | null | undefined) {
  if (!address) return "";
  return [address.fullName, address.phone, formatStreetAddress(address)].filter(Boolean).join("\n");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function indianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function isValidIndianPhone(value: string) {
  return /^[6-9]\d{9}$/.test(indianPhone(value));
}

export const PAGE_SIZE = 24;
export const HOME_FEATURED_LIMIT = 20;
export const COD_ADVANCE = 200;
export const ORDER_STATUSES = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  confirmed: "Order Confirmed",
  processing: "Order Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
