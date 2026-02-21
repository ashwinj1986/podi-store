"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  confirmed:  "bg-blue-100 text-blue-700",
  dispatched: "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
};

interface OrderSummary {
  id: string;
  customer_name: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: {
    quantity: number;
    sku: { label: string; product: { name: string } } | null;
  }[];
}

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSearched(true);

    const res = await fetch(`/api/orders/by-phone?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setOrders(null);
    } else {
      setOrders(data);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-800">My Orders</h1>
        <p className="mt-2 text-stone-500">
          Enter the phone number you used at checkout to see your orders.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="card p-5 flex gap-3 mb-8">
        <input
          className="input flex-1"
          type="tel"
          placeholder="Your phone number (e.g. 9876543210)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Results */}
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600 text-center">{error}</p>
      )}

      {orders !== null && orders.length === 0 && (
        <div className="card p-10 text-center text-stone-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No orders found for this number.</p>
          <p className="mt-1 text-sm">Double-check the number or reach out on WhatsApp.</p>
          <a
            href="https://wa.me/919876543211"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-5 inline-flex"
          >
            💬 Contact Us on WhatsApp
          </a>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-500">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
          {orders.map((order) => {
            const itemSummary = order.order_items
              .map((i) => `${i.sku?.product?.name ?? "Item"} (${i.sku?.label ?? ""}) ×${i.quantity}`)
              .join(", ");

            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                <div className="card p-4 transition hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-stone-800">{order.customer_name}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-400">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                        {" · "}
                        <span className="font-mono">{order.id.slice(0, 8)}…</span>
                      </p>
                      {itemSummary && (
                        <p className="mt-1 text-sm text-stone-600 line-clamp-1">{itemSummary}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-brand-700">{formatPrice(order.total)}</p>
                      <p className="mt-1 text-xs text-stone-400 group-hover:text-brand-600">
                        View details →
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
