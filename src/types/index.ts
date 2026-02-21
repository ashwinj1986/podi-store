// ─────────────────────────────────────────────
// Database types (mirror of Supabase schema)
// ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string;
  shelf_life: string;
  image_url: string | null;
  category: string;
  created_at: string;
  skus?: Sku[];
}

export interface Sku {
  id: string;
  product_id: string;
  sku_code: string;
  label: string;         // e.g. "100g", "250g"
  price: number;         // in rupees
  compare_at_price: number | null;
  stock_quantity: number;
  is_available: boolean;
  weight_grams: number;
  created_at: string;
  product?: Product;
}

export type OrderStatus = "pending" | "confirmed" | "dispatched" | "delivered";
export type DeliveryZone = "self_delivery" | "courier";

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  delivery_zone: DeliveryZone;
  subtotal: number;
  shipping_charge: number;
  total: number;
  payment_screenshot_url: string | null;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  sku?: Sku & { product?: Product };
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

// ─────────────────────────────────────────────
// Cart types (client-side only)
// ─────────────────────────────────────────────

export interface CartItem {
  sku: Sku & { product: Pick<Product, "id" | "name" | "slug" | "image_url"> };
  quantity: number;
}
