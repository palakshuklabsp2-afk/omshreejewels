import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/components/cart-provider";
import { STORE } from "@/lib/utils";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE.name} | Imitation Jewellery & Fashion Accessories`,
    template: `%s | ${STORE.name}`,
  },
  description:
    `Premium imitation jewellery and fashion accessories from ${STORE.name}, Baloda Bazar. All India shipping. Rated 4.9 on Google.`,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${sans.variable} antialiased`}>
        <CartProvider>
          {children}
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
