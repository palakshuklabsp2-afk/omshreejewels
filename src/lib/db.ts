import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

type Sql = NeonQueryFunction<false, false>;

const SCHEMA_VERSION = 4;
const g = globalThis as unknown as { __osbNeon?: Sql; __osbSchemaVersion?: number };

function databaseUrl() {
  const url = process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim() || "";
  if (!url || url.includes("your-neon") || url.includes("<")) {
    throw new Error(
      "DATABASE_URL is missing. Create a Neon project and paste the connection string into .env.local.",
    );
  }
  return url;
}

export function getSql(): Sql {
  if (!g.__osbNeon) g.__osbNeon = neon(databaseUrl());
  return g.__osbNeon;
}

async function ensureSchema(sql: Sql) {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`CREATE TABLE IF NOT EXISTS admins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    image text NOT NULL DEFAULT '',
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price integer NOT NULL DEFAULT 0,
    sale_price integer,
    images text[] NOT NULL DEFAULT '{}',
    stock integer NOT NULL DEFAULT 0,
    sku text NOT NULL DEFAULT '',
    tags text[] NOT NULL DEFAULT '{}',
    featured boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL UNIQUE,
    name text NOT NULL DEFAULT '',
    address jsonb,
    address_locked boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS wishlists (
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (customer_id, product_id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS otps (
    phone text PRIMARY KEY,
    code_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    attempts integer NOT NULL DEFAULT 0,
    last_sent_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS counters (
    key text PRIMARY KEY,
    seq integer NOT NULL DEFAULT 0
  )`;
  await sql`CREATE TABLE IF NOT EXISTS payment_drafts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    razorpay_order_id text NOT NULL UNIQUE,
    method text NOT NULL,
    amount integer NOT NULL,
    subtotal integer NOT NULL,
    items jsonb NOT NULL DEFAULT '[]',
    used boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text NOT NULL UNIQUE,
    customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    customer_name text NOT NULL DEFAULT '',
    customer_phone text NOT NULL DEFAULT '',
    address jsonb NOT NULL,
    items jsonb NOT NULL DEFAULT '[]',
    subtotal integer NOT NULL,
    payment_method text NOT NULL,
    payment_status text NOT NULL DEFAULT 'pending',
    razorpay_order_id text UNIQUE,
    razorpay_payment_id text,
    advance_paid integer NOT NULL DEFAULT 0,
    remaining_cod integer NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'confirmed',
    timeline jsonb NOT NULL DEFAULT '[]',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    value text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS products_active_idx ON products (is_active, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_id, is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS products_featured_idx ON products (featured, is_active)`;
  await sql`CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price integer`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] NOT NULL DEFAULT '{}'`;
  await sql`CREATE TABLE IF NOT EXISTS sizes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
}

export async function connectDb() {
  const sql = getSql();
  if (g.__osbSchemaVersion !== SCHEMA_VERSION) {
    await ensureSchema(sql);
    g.__osbSchemaVersion = SCHEMA_VERSION;
  }
  return sql;
}
