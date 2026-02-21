-- ════════════════════════════════════════════════════════
-- Podi Store — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════

-- 1. Products (parent entity)
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  ingredients TEXT,
  shelf_life  TEXT,
  image_url   TEXT,
  category    TEXT NOT NULL DEFAULT 'podi',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SKUs (purchasable variants of each product)
CREATE TABLE skus (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku_code         TEXT NOT NULL UNIQUE,          -- e.g. IDLI-100G
  label            TEXT NOT NULL,                 -- e.g. "100g"
  price            NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),                 -- optional strikethrough price
  stock_quantity   INT NOT NULL DEFAULT 0,
  is_available     BOOLEAN NOT NULL DEFAULT true,
  weight_grams     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Orders
CREATE TYPE order_status AS ENUM ('pending','confirmed','dispatched','delivered');
CREATE TYPE delivery_zone AS ENUM ('self_delivery','courier');

CREATE TABLE orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name          TEXT NOT NULL,
  phone                  TEXT NOT NULL,
  email                  TEXT,
  address                TEXT NOT NULL,
  pincode                TEXT NOT NULL,
  delivery_zone          delivery_zone NOT NULL,
  subtotal               NUMERIC(10,2) NOT NULL,
  shipping_charge        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total                  NUMERIC(10,2) NOT NULL,
  payment_screenshot_url TEXT,
  status                 order_status NOT NULL DEFAULT 'pending',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Order Items
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku_id     UUID NOT NULL REFERENCES skus(id),
  quantity   INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

-- 5. Enquiries
CREATE TABLE enquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Settings (key-value store)
CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('upi_id',           'yourname@upi'),
  ('whatsapp_number',  '919876543211');

-- ════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- Public can read products + SKUs.
-- Only authenticated users (admin) can write.
-- ════════════════════════════════════════════════════════

ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings    ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read
CREATE POLICY "public_read_products" ON products FOR SELECT USING (true);
CREATE POLICY "auth_write_products"  ON products FOR ALL USING (auth.role() = 'authenticated');

-- SKUs: anyone can read
CREATE POLICY "public_read_skus" ON skus FOR SELECT USING (true);
CREATE POLICY "auth_write_skus"  ON skus FOR ALL USING (auth.role() = 'authenticated');

-- Orders: only authenticated (admin) can read and write
-- BUT we also need anonymous INSERT for customer checkout
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_all_orders"    ON orders FOR ALL USING (auth.role() = 'authenticated');

-- Order items: anon insert (tied to checkout) + admin read
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_all_order_items"    ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- Enquiries: anon insert + admin read
CREATE POLICY "anon_insert_enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "auth_all_enquiries"    ON enquiries FOR ALL USING (auth.role() = 'authenticated');

-- Settings: only admin can read/write (anon blocked)
CREATE POLICY "auth_all_settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
