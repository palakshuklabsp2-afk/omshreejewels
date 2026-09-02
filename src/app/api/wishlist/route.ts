import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/session";
import { toggleWishlist, wishlistItems } from "@/lib/data";
import { isId } from "@/lib/id";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ items: [] });
  const items = await wishlistItems(session.customerId);
  return NextResponse.json({
    items: items.map((prod) => ({
      _id: prod._id,
      name: prod.name,
      slug: prod.slug,
      price: prod.price,
      salePrice: prod.salePrice,
      images: prod.images,
      stock: prod.stock,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { productId } = await req.json();
  if (!isId(productId)) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const inWishlist = await toggleWishlist(session.customerId, productId);
  return NextResponse.json({ inWishlist });
}
