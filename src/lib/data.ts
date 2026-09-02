import { connectDb, getSql } from "@/lib/db";
import { DEFAULT_HOMEPAGE_NECKLACE_IMAGE, HOME_FEATURED_LIMIT, PAGE_SIZE } from "@/lib/utils";
import { isId } from "@/lib/id";

export type Address = {
  fullName: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
};

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function strArr(v: unknown) {
  return Array.isArray(v) ? v.map(String) : [];
}

export function mapCategory(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    image: String(row.image || ""),
    sortOrder: num(row.sort_order),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProduct(row: Record<string, unknown>) {
  const catId = row.cat_id ? String(row.cat_id) : String(row.category_id);
  const category =
    row.cat_name != null
      ? { _id: catId, name: String(row.cat_name), slug: String(row.cat_slug || "") }
      : catId;
  return {
    _id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description || ""),
    category,
    price: num(row.price),
    salePrice: row.sale_price == null ? null : num(row.sale_price),
    images: strArr(row.images),
    stock: num(row.stock),
    sku: String(row.sku || ""),
    tags: strArr(row.tags),
    featured: Boolean(row.featured),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export function mapCustomer(row: Record<string, unknown>) {
  return {
    _id: String(row.id),
    phone: String(row.phone),
    name: String(row.name || ""),
    address: (row.address as Address | null) || null,
    addressLocked: Boolean(row.address_locked),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrder(row: Record<string, unknown>) {
  const items = Array.isArray(row.items) ? row.items : [];
  const timeline = Array.isArray(row.timeline) ? row.timeline : [];
  return {
    _id: String(row.id),
    orderNumber: String(row.order_number),
    customer: String(row.customer_id),
    customerName: String(row.customer_name || ""),
    customerPhone: String(row.customer_phone || ""),
    address: row.address as Address,
    items: items as { productId: string; name: string; image: string; qty: number; price: number }[],
    subtotal: num(row.subtotal),
    paymentMethod: String(row.payment_method),
    paymentStatus: String(row.payment_status),
    razorpayOrderId: row.razorpay_order_id ? String(row.razorpay_order_id) : undefined,
    razorpayPaymentId: row.razorpay_payment_id ? String(row.razorpay_payment_id) : undefined,
    advancePaid: num(row.advance_paid),
    remainingCod: num(row.remaining_cod),
    status: String(row.status),
    timeline,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function listActiveCategories() {
  await connectDb();
  const rows = await getSql()`SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC`;
  return rows.map(mapCategory);
}

export async function listAllCategories() {
  await connectDb();
  const rows = await getSql()`SELECT * FROM categories ORDER BY sort_order ASC, name ASC`;
  return rows.map(mapCategory);
}

export async function getCategoryBySlug(slug: string, activeOnly = false) {
  await connectDb();
  const rows = activeOnly
    ? await getSql()`SELECT * FROM categories WHERE slug = ${slug} AND is_active = true LIMIT 1`
    : await getSql()`SELECT * FROM categories WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function getCategoryById(id: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM categories WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function createCategory(input: { name: string; slug: string; image?: string; isActive?: boolean; sortOrder?: number }) {
  await connectDb();
  const rows = await getSql()`
    INSERT INTO categories (name, slug, image, is_active, sort_order)
    VALUES (${input.name}, ${input.slug}, ${input.image || ""}, ${input.isActive ?? true}, ${input.sortOrder ?? 0})
    RETURNING *
  `;
  return mapCategory(rows[0]);
}

export async function updateCategory(id: string, input: { name?: string; slug?: string; image?: string; isActive?: boolean; sortOrder?: number }) {
  await connectDb();
  const current = await getCategoryById(id);
  if (!current) return null;
  const name = input.name ?? current.name;
  const slug = input.slug ?? current.slug;
  const image = input.image ?? current.image;
  const isActive = input.isActive ?? current.isActive;
  const sortOrder = input.sortOrder ?? current.sortOrder;
  const rows = await getSql()`
    UPDATE categories SET name = ${name}, slug = ${slug}, image = ${image}, is_active = ${isActive},
      sort_order = ${sortOrder}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapCategory(rows[0]) : null;
}

export async function deleteCategory(id: string) {
  await connectDb();
  await getSql()`DELETE FROM categories WHERE id = ${id}`;
}

export async function slugTaken(table: "categories" | "products", slug: string) {
  await connectDb();
  if (table === "categories") {
    const rows = await getSql()`SELECT id FROM categories WHERE slug = ${slug} LIMIT 1`;
    return rows.length > 0;
  }
  const rows = await getSql()`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
  return rows.length > 0;
}

export async function listFeaturedProducts() {
  await connectDb();
  const rows = await getSql()`
    SELECT * FROM products
    WHERE featured = true AND is_active = true
    ORDER BY updated_at DESC
    LIMIT ${HOME_FEATURED_LIMIT}
  `;
  return rows.map(mapProduct);
}

export async function featuredCount(excludeId?: string) {
  await connectDb();
  const rows = excludeId
    ? await getSql()`SELECT count(*)::int AS n FROM products WHERE featured = true AND id <> ${excludeId}`
    : await getSql()`SELECT count(*)::int AS n FROM products WHERE featured = true`;
  return num(rows[0]?.n);
}

export async function getProductBySlug(slug: string) {
  await connectDb();
  const rows = await getSql()`
    SELECT p.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.is_active = true
    LIMIT 1
  `;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductById(id: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function searchProducts(params: {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  min?: number;
  max?: number;
  admin?: boolean;
}) {
  await connectDb();
  const page = Math.max(1, params.page || 1);
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  const q = params.q?.trim() || "";
  const like = q ? `%${q.replace(/[%_]/g, "\\$&")}%` : "";
  const cat = params.category && isId(params.category) ? params.category : "";
  const min = params.min;
  const max = params.max;
  const activeOnly = !params.admin;

  const none = "00000000-0000-0000-0000-000000000000";
  const catId = cat || none;
  const minVal = min ?? 0;
  const maxVal = max ?? 0;
  const sortKey = params.sort || "newest";

  const rows = await getSql()`
    SELECT p.*, c.id AS cat_id, c.name AS cat_name, c.slug AS cat_slug,
      count(*) OVER() AS total_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE (${!activeOnly} OR p.is_active = true)
      AND (${!cat} OR p.category_id = ${catId}::uuid)
      AND (${min == null} OR p.price >= ${minVal})
      AND (${max == null} OR p.price <= ${maxVal})
      AND (
        ${!q} OR p.name ILIKE ${like}
        OR p.description ILIKE ${like}
        OR p.sku ILIKE ${like}
        OR EXISTS (SELECT 1 FROM unnest(p.tags) t WHERE t ILIKE ${like})
        OR c.name ILIKE ${like}
      )
    ORDER BY
      CASE WHEN ${sortKey} = 'price_asc' THEN p.price END ASC NULLS LAST,
      CASE WHEN ${sortKey} = 'price_desc' THEN p.price END DESC NULLS LAST,
      CASE WHEN ${sortKey} = 'name' THEN p.name END ASC NULLS LAST,
      p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const total = rows[0] ? num(rows[0].total_count) : 0;
  return { items: rows.map(mapProduct), total, page, pages: Math.ceil(total / limit), limit };
}

export async function createProduct(input: {
  name: string;
  slug: string;
  description?: string;
  category: string;
  images: string[];
  stock: number;
  price?: number;
  isActive?: boolean;
}) {
  await connectDb();
  const rows = await getSql()`
    INSERT INTO products (name, slug, description, category_id, price, sale_price, images, stock, sku, tags, featured, is_active)
    VALUES (
      ${input.name}, ${input.slug}, ${input.description || ""}, ${input.category},
      ${input.price ?? 0}, ${null}, ${input.images}, ${input.stock}, ${""}, ${[] as string[]},
      ${false}, ${input.isActive ?? true}
    )
    RETURNING *
  `;
  return mapProduct(rows[0]);
}

export async function updateProduct(
  id: string,
  input: {
    name?: string;
    description?: string;
    category?: string;
    images?: string[];
    stock?: number;
    featured?: boolean;
    isActive?: boolean;
    price?: number;
    salePrice?: number | null;
    sku?: string;
    tags?: string[];
  },
) {
  await connectDb();
  const current = await getProductById(id);
  if (!current) return null;
  const categoryId = typeof current.category === "string" ? current.category : current.category._id;
  const rows = await getSql()`
    UPDATE products SET
      name = ${input.name ?? current.name},
      description = ${input.description ?? current.description},
      category_id = ${input.category ?? categoryId},
      images = ${input.images ?? current.images},
      stock = ${input.stock ?? current.stock},
      featured = ${input.featured ?? current.featured},
      is_active = ${input.isActive ?? current.isActive},
      price = ${input.price ?? current.price},
      sale_price = ${input.salePrice === undefined ? current.salePrice : input.salePrice},
      sku = ${input.sku ?? current.sku},
      tags = ${input.tags ?? current.tags},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function deleteProduct(id: string) {
  await connectDb();
  await getSql()`DELETE FROM wishlists WHERE product_id = ${id}`;
  await getSql()`DELETE FROM products WHERE id = ${id}`;
}

export async function productsByIds(ids: string[]) {
  await connectDb();
  if (!ids.length) return [];
  const rows = await getSql()`SELECT * FROM products WHERE id = ANY(${ids}) AND is_active = true`;
  return rows.map(mapProduct);
}

export async function decrementStock(productId: string, qty: number) {
  await connectDb();
  const rows = await getSql()`
    UPDATE products SET stock = stock - ${qty}, updated_at = now()
    WHERE id = ${productId} AND stock >= ${qty}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function getAdminByUsername(username: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM admins WHERE lower(username) = lower(${username}) LIMIT 1`;
  if (!rows[0]) return null;
  return { _id: String(rows[0].id), username: String(rows[0].username), passwordHash: String(rows[0].password_hash) };
}

export async function createAdmin(username: string, passwordHash: string) {
  await connectDb();
  const rows = await getSql()`
    INSERT INTO admins (username, password_hash) VALUES (${username}, ${passwordHash})
    RETURNING *
  `;
  return { _id: String(rows[0].id), username: String(rows[0].username), passwordHash: String(rows[0].password_hash) };
}

export async function updateAdminPassword(id: string, passwordHash: string) {
  await connectDb();
  await getSql()`UPDATE admins SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${id}`;
}

export async function getCustomerById(id: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM customers WHERE id = ${id} LIMIT 1`;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function getCustomerByPhone(phone: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM customers WHERE phone = ${phone} LIMIT 1`;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function createCustomer(phone: string, name = "") {
  await connectDb();
  const rows = await getSql()`INSERT INTO customers (phone, name) VALUES (${phone}, ${name}) RETURNING *`;
  return mapCustomer(rows[0]);
}

export async function updateCustomerName(id: string, name: string) {
  await connectDb();
  await getSql()`UPDATE customers SET name = ${name}, updated_at = now() WHERE id = ${id}`;
}

export async function lockCustomerAddress(id: string, address: Address, name?: string) {
  await connectDb();
  await getSql()`
    UPDATE customers SET
      address = ${JSON.stringify(address)}::jsonb,
      address_locked = true,
      name = CASE WHEN coalesce(name, '') = '' THEN ${name || address.fullName} ELSE name END,
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function listCustomers(page: number) {
  await connectDb();
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  const rows = await getSql()`
    SELECT c.*, count(*) OVER() AS total_count,
      (SELECT count(*)::int FROM orders o WHERE o.customer_id = c.id) AS total_orders
    FROM customers c
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const total = rows[0] ? num(rows[0].total_count) : 0;
  return {
    items: rows.map((r) => ({ ...mapCustomer(r), totalOrders: num(r.total_orders) })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function wishlistItems(customerId: string) {
  await connectDb();
  const rows = await getSql()`
    SELECT p.* FROM wishlists w
    JOIN products p ON p.id = w.product_id
    WHERE w.customer_id = ${customerId}
  `;
  return rows.map(mapProduct);
}

export async function toggleWishlist(customerId: string, productId: string) {
  await connectDb();
  const existing = await getSql()`
    SELECT 1 FROM wishlists WHERE customer_id = ${customerId} AND product_id = ${productId} LIMIT 1
  `;
  if (existing.length) {
    await getSql()`DELETE FROM wishlists WHERE customer_id = ${customerId} AND product_id = ${productId}`;
    return false;
  }
  await getSql()`INSERT INTO wishlists (customer_id, product_id) VALUES (${customerId}, ${productId})`;
  return true;
}

export async function upsertOtp(phone: string, codeHash: string, expiresAt: Date) {
  await connectDb();
  await getSql()`
    INSERT INTO otps (phone, code_hash, expires_at, attempts, last_sent_at)
    VALUES (${phone}, ${codeHash}, ${expiresAt.toISOString()}, 0, now())
    ON CONFLICT (phone) DO UPDATE SET
      code_hash = excluded.code_hash,
      expires_at = excluded.expires_at,
      attempts = 0,
      last_sent_at = now()
  `;
}

export async function getOtp(phone: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM otps WHERE phone = ${phone} LIMIT 1`;
  if (!rows[0]) return null;
  return {
    phone: String(rows[0].phone),
    codeHash: String(rows[0].code_hash),
    expiresAt: new Date(String(rows[0].expires_at)),
    attempts: num(rows[0].attempts),
    lastSentAt: new Date(String(rows[0].last_sent_at)),
  };
}

export async function bumpOtpAttempts(phone: string) {
  await connectDb();
  await getSql()`UPDATE otps SET attempts = attempts + 1 WHERE phone = ${phone}`;
}

export async function deleteOtp(phone: string) {
  await connectDb();
  await getSql()`DELETE FROM otps WHERE phone = ${phone}`;
}

export async function nextOrderNumber() {
  await connectDb();
  const year = new Date().getFullYear();
  const key = `order-${year}`;
  const rows = await getSql()`
    INSERT INTO counters (key, seq) VALUES (${key}, 1)
    ON CONFLICT (key) DO UPDATE SET seq = counters.seq + 1
    RETURNING seq
  `;
  return `OMS-${year}-${String(num(rows[0].seq)).padStart(6, "0")}`;
}

export async function createPaymentDraft(input: {
  customerId: string;
  razorpayOrderId: string;
  method: string;
  amount: number;
  subtotal: number;
  items: unknown[];
}) {
  await connectDb();
  const rows = await getSql()`
    INSERT INTO payment_drafts (customer_id, razorpay_order_id, method, amount, subtotal, items)
    VALUES (${input.customerId}, ${input.razorpayOrderId}, ${input.method}, ${input.amount}, ${input.subtotal}, ${JSON.stringify(input.items)}::jsonb)
    RETURNING *
  `;
  return {
    _id: String(rows[0].id),
    razorpayOrderId: String(rows[0].razorpay_order_id),
    method: String(rows[0].method),
    amount: num(rows[0].amount),
    subtotal: num(rows[0].subtotal),
    items: rows[0].items as { productId: string; name?: string; image?: string; qty?: number; price?: number }[],
    used: Boolean(rows[0].used),
    customer: String(rows[0].customer_id),
  };
}

export async function getDraft(opts: { id?: string; razorpayOrderId?: string; customerId: string }) {
  await connectDb();
  const rows = opts.id
    ? await getSql()`SELECT * FROM payment_drafts WHERE id = ${opts.id} AND customer_id = ${opts.customerId} LIMIT 1`
    : await getSql()`SELECT * FROM payment_drafts WHERE razorpay_order_id = ${opts.razorpayOrderId || ""} AND customer_id = ${opts.customerId} LIMIT 1`;
  if (!rows[0]) return null;
  return {
    _id: String(rows[0].id),
    razorpayOrderId: String(rows[0].razorpay_order_id),
    method: String(rows[0].method),
    amount: num(rows[0].amount),
    subtotal: num(rows[0].subtotal),
    items: rows[0].items as { productId: string; name?: string; image?: string; qty?: number; price?: number }[],
    used: Boolean(rows[0].used),
    customer: String(rows[0].customer_id),
  };
}

export async function markDraftUsed(id: string) {
  await connectDb();
  await getSql()`UPDATE payment_drafts SET used = true WHERE id = ${id}`;
}

export async function getOrderByRazorpay(razorpayOrderId: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM orders WHERE razorpay_order_id = ${razorpayOrderId} LIMIT 1`;
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getOrderByNumber(orderNumber: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM orders WHERE order_number = ${orderNumber} LIMIT 1`;
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function createOrder(input: {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: Address;
  items: unknown[];
  subtotal: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  advancePaid: number;
  remainingCod: number;
  status: string;
  timeline: unknown[];
}) {
  await connectDb();
  const rows = await getSql()`
    INSERT INTO orders (
      order_number, customer_id, customer_name, customer_phone, address, items, subtotal,
      payment_method, payment_status, razorpay_order_id, razorpay_payment_id, advance_paid,
      remaining_cod, status, timeline
    ) VALUES (
      ${input.orderNumber}, ${input.customerId}, ${input.customerName}, ${input.customerPhone},
      ${JSON.stringify(input.address)}::jsonb, ${JSON.stringify(input.items)}::jsonb, ${input.subtotal},
      ${input.paymentMethod}, ${input.paymentStatus}, ${input.razorpayOrderId}, ${input.razorpayPaymentId},
      ${input.advancePaid}, ${input.remainingCod}, ${input.status}, ${JSON.stringify(input.timeline)}::jsonb
    )
    RETURNING *
  `;
  return mapOrder(rows[0]);
}

export async function listOrders(page: number) {
  await connectDb();
  const limit = PAGE_SIZE;
  const offset = (page - 1) * limit;
  const rows = await getSql()`
    SELECT *, count(*) OVER() AS total_count FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const total = rows[0] ? num(rows[0].total_count) : 0;
  return { items: rows.map(mapOrder), total, page, pages: Math.ceil(total / limit) };
}

export async function listCustomerOrders(customerId: string) {
  await connectDb();
  const rows = await getSql()`SELECT * FROM orders WHERE customer_id = ${customerId} ORDER BY created_at DESC LIMIT 50`;
  return rows.map(mapOrder);
}

export async function updateOrderStatus(id: string, status: string) {
  await connectDb();
  const current = await getSql()`SELECT timeline FROM orders WHERE id = ${id} LIMIT 1`;
  if (!current[0]) return null;
  const timeline = Array.isArray(current[0].timeline) ? current[0].timeline : [];
  timeline.push({ status, at: new Date().toISOString() });
  const rows = await getSql()`
    UPDATE orders SET status = ${status}, timeline = ${JSON.stringify(timeline)}::jsonb, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? mapOrder(rows[0]) : null;
}

export async function getStats() {
  await connectDb();
  const sql = getSql();
  const [products] = await sql`SELECT count(*)::int AS n FROM products`;
  const [orders] = await sql`SELECT count(*)::int AS n FROM orders`;
  const [pending] = await sql`SELECT count(*)::int AS n FROM orders WHERE status NOT IN ('delivered', 'cancelled')`;
  const [delivered] = await sql`SELECT count(*)::int AS n FROM orders WHERE status = 'delivered'`;
  const [customers] = await sql`SELECT count(*)::int AS n FROM customers`;
  const [categories] = await sql`SELECT count(*)::int AS n FROM categories`;
  const [paid] = await sql`SELECT coalesce(sum(advance_paid), 0)::int AS total FROM orders WHERE payment_status IN ('paid', 'advance_paid')`;
  const recentRows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`;
  return {
    products: num(products?.n),
    orders: num(orders?.n),
    pending: num(pending?.n),
    delivered: num(delivered?.n),
    customers: num(customers?.n),
    categories: num(categories?.n),
    revenue: num(paid?.total),
    recent: recentRows.map(mapOrder),
  };
}

export async function sitemapRows() {
  await connectDb();
  const cats = await getSql()`SELECT slug, updated_at FROM categories WHERE is_active = true`;
  const products = await getSql()`SELECT slug, updated_at FROM products WHERE is_active = true LIMIT 5000`;
  return {
    cats: cats.map((c) => ({ slug: String(c.slug), updatedAt: c.updated_at as Date })),
    products: products.map((p) => ({ slug: String(p.slug), updatedAt: p.updated_at as Date })),
  };
}

const HOMEPAGE_HERO_KEY = "homepage_hero_image";

export async function getHomepageHeroImage() {
  await connectDb();
  const rows = await getSql()`SELECT value FROM site_settings WHERE key = ${HOMEPAGE_HERO_KEY} LIMIT 1`;
  const value = rows[0]?.value;
  return typeof value === "string" && value.trim() ? value.trim() : DEFAULT_HOMEPAGE_NECKLACE_IMAGE;
}

export async function setHomepageHeroImage(url: string) {
  await connectDb();
  const value = url.trim();
  await getSql()`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (${HOMEPAGE_HERO_KEY}, ${value}, now())
    ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now()
  `;
  return value;
}

export async function removeDemoCatalog() {
  await connectDb();
  const demoSkus = Array.from({ length: 10 }, (_, i) => `OSB-${1000 + i}`);
  const demoProductSlugs = [
    "kundan-bridal-necklace-set",
    "pearl-drop-earrings",
    "temple-jhumkas",
    "gold-plated-bangle-pair",
    "ad-stone-bracelet",
    "american-diamond-ring",
    "traditional-mangalsutra",
    "meenakari-choker-set",
    "floral-hair-clips-set",
    "oxidised-necklace",
  ];
  const demoCatSlugs = [
    "jewellery-sets",
    "necklaces",
    "earrings",
    "jhumkas",
    "bangles",
    "bracelets",
    "rings",
    "mangalsutra",
    "bridal-jewellery",
    "hair-accessories",
  ];
  const products = await getSql()`
    DELETE FROM products
    WHERE sku = ANY(${demoSkus}) OR slug = ANY(${demoProductSlugs})
    RETURNING id
  `;
  const cats = await getSql()`
    DELETE FROM categories
    WHERE slug = ANY(${demoCatSlugs})
      AND NOT EXISTS (SELECT 1 FROM products p WHERE p.category_id = categories.id)
    RETURNING id
  `;
  return { productsRemoved: products.length, categoriesRemoved: cats.length };
}
