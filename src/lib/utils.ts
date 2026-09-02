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
  tagline: "Elegance You Can Wear, Beauty You Can Own.",
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
