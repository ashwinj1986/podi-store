"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
};

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "dispatched", "delivered"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, []);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Orders</h1>

      {loading ? (
        <p className="text-stone-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="card p-10 text-center text-stone-400">
          <p className="text-4xl mb-3">📦</p>
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              {/* Order header */}
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left hover:bg-stone-50"
                onClick={() => setExpanded((e) => (e === order.id ? null : order.id))}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs text-stone-400">#{order.id.slice(0, 8)}</span>
                  <span className="font-semibold text-stone-800">{order.customer_name}</span>
                  <span className="text-sm text-stone-500">{order.phone}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-brand-700">{formatPrice(order.total)}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden text-xs text-stone-400 sm:block">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </span>
                  <span className="text-stone-400">{expanded === order.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="border-t border-stone-100 p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-stone-400 mb-1">Delivery Address</p>
                      <p className="text-sm text-stone-700">{order.address}</p>
                      <p className="text-sm text-stone-700">{order.pincode} — {order.delivery_zone === "self_delivery" ? "Self Delivery" : "Courier"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-stone-400 mb-1">Payment</p>
                      <p className="text-sm text-stone-700">Subtotal: {formatPrice(order.subtotal)}</p>
                      <p className="text-sm text-stone-700">Shipping: {formatPrice(order.shipping_charge)}</p>
                      <p className="text-sm font-bold text-stone-800">Total: {formatPrice(order.total)}</p>
                      {order.payment_screenshot_url && (
                        <a
                          href={order.payment_screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-brand-600 underline"
                        >
                          View Payment Screenshot ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase text-stone-400 mb-2">Items</p>
                      <ul className="space-y-1">
                        {order.order_items.map((item) => (
                          <li key={item.id} className="flex justify-between text-sm text-stone-700">
                            <span>
                              {item.sku?.product?.name ?? "Product"} ({item.sku?.label ?? ""}) × {item.quantity}
                            </span>
                            <span className="font-medium">{formatPrice(item.line_total)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status updater */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-stone-600">Update Status:</span>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateStatus(order.id, s)}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                          order.status === s
                            ? STATUS_COLORS[s]
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
