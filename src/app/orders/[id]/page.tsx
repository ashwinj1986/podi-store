"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem, OrderStatus } from "@/types";

// ─── Status timeline config ───────────────────────────────────────────────────

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending",    label: "Order Placed",  icon: "📋" },
  { key: "confirmed",  label: "Confirmed",     icon: "✅" },
  { key: "dispatched", label: "Dispatched",    icon: "🚚" },
  { key: "delivered",  label: "Delivered",     icon: "🎉" },
];

const STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0, confirmed: 1, dispatched: 2, delivered: 3,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [skippedItems, setSkippedItems] = useState<string[]>([]);

  const { addItem } = useCart();

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setOrder(data);
        setLoading(false);
      });
  }, [orderId]);

  async function handleReorder() {
    if (!order?.order_items?.length) return;
    setReordering(true);
    setSkippedItems([]);

    const skipped: string[] = [];

    for (const item of order.order_items as OrderItem[]) {
      // @ts-expect-error — joined relational data from Supabase
      const sku = item.sku;
      // @ts-expect-error — nested product inside sku
      const product = sku?.product;

      if (!sku || !product || !sku.is_available || sku.stock_quantity <= 0) {
        skipped.push(product?.name ? `${product.name} (${sku?.label ?? ""})` : "One item");
        continue;
      }

      addItem(
        {
          ...sku,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            image_url: product.image_url,
          },
        },
        item.quantity
      );
    }

    setSkippedItems(skipped);
    setReordering(false);

    if (skipped.length < (order.order_items?.length ?? 0)) {
      // At least some items were added — go to cart
      router.push("/cart");
    }
  }

  // ─── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-stone-400">
        Loading your order…
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-4xl">🔍</p>
        <h1 className="text-2xl font-bold text-stone-700">Order not found</h1>
        <p className="text-stone-500">The order ID may be incorrect.</p>
        <Link href="/orders" className="btn-secondary">Search by phone number</Link>
      </div>
    );
  }

  const currentStepIndex = STEP_INDEX[order.status];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/orders" className="text-sm text-stone-400 hover:text-brand-600">
            ← All Orders
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-stone-800">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-stone-500">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
          {order.status}
        </span>
      </div>

      {/* Status timeline */}
      <div className="card p-5 mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Order Status
        </h2>
        <div className="flex items-start justify-between">
          {STEPS.map((step, idx) => {
            const done    = idx <= currentStepIndex;
            const current = idx === currentStepIndex;

            return (
              <div key={step.key} className="flex flex-1 flex-col items-center gap-1">
                {/* Circle */}
                <div
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-full text-lg transition",
                    done
                      ? "bg-brand-600 text-white shadow"
                      : "bg-stone-100 text-stone-400",
                    current ? "ring-2 ring-brand-300 ring-offset-2" : "",
                  ].join(" ")}
                >
                  {step.icon}
                </div>

                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={[
                      "absolute mt-5 h-0.5 w-full",
                      // CSS trick: place line using translate; simpler approach below
                    ].join(" ")}
                  />
                )}

                {/* Label */}
                <p
                  className={[
                    "text-center text-xs font-medium mt-1",
                    done ? "text-stone-800" : "text-stone-400",
                  ].join(" ")}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress bar connecting the circles */}
        <div className="relative -mt-8 mb-4 flex px-5">
          <div className="h-0.5 w-full bg-stone-200 rounded-full">
            <div
              className="h-0.5 bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="card p-5 mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Items Ordered
        </h2>
        <ul className="space-y-3">
          {(order.order_items ?? []).map((item) => {
            // @ts-expect-error — joined relational data
            const sku = item.sku;
            // @ts-expect-error — nested product
            const product = sku?.product;
            return (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {product?.name ?? "Product"}
                  </p>
                  <p className="text-xs text-stone-500">
                    {sku?.label ?? ""} · {sku?.sku_code ?? ""}
                  </p>
                </div>
                <div className="text-right shrink-0 text-sm">
                  <p className="text-stone-600">×{item.quantity}</p>
                  <p className="font-semibold text-stone-800">{formatPrice(item.line_total)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Totals */}
        <div className="mt-4 border-t border-stone-100 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping ({order.delivery_zone === "self_delivery" ? "Self-delivery" : "Courier"})</span>
            <span>{formatPrice(order.shipping_charge)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-800 pt-1 border-t border-stone-100">
            <span>Total</span>
            <span className="text-brand-700">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="card p-5 mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">
          Delivery Address
        </h2>
        <p className="text-sm text-stone-700">{order.customer_name}</p>
        <p className="text-sm text-stone-700">{order.address}</p>
        <p className="text-sm text-stone-700">{order.pincode}</p>
      </div>

      {/* Skipped items warning */}
      {skippedItems.length > 0 && (
        <div className="mb-4 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">Some items couldn&apos;t be added:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {skippedItems.map((s) => <li key={s}>{s} — currently out of stock</li>)}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleReorder}
          disabled={reordering}
          className="btn-primary flex-1 justify-center"
        >
          {reordering ? "Adding to cart…" : "🔁 Reorder"}
        </button>
        <a
          href="https://wa.me/919876543211"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-1 justify-center"
        >
          💬 Contact Us
        </a>
        <Link href="/products" className="btn-secondary flex-1 justify-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
