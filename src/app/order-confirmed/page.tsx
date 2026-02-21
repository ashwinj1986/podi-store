"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
        ✅
      </div>
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Order Placed!</h1>
        <p className="mt-2 text-stone-500 max-w-sm mx-auto">
          Thank you! Your order has been received. We will review your payment
          and confirm your order shortly on WhatsApp or via call.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row flex-wrap justify-center">
        {orderId && (
          <Link href={`/orders/${orderId}`} className="btn-primary">
            📦 Track This Order
          </Link>
        )}
        <Link href="/orders" className="btn-secondary">
          🔍 View All My Orders
        </Link>
        <a
          href="https://wa.me/919876543211"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp"
        >
          💬 Contact on WhatsApp
        </a>
      </div>

      <Link href="/products" className="text-sm text-stone-400 hover:text-brand-600">
        Continue Shopping →
      </Link>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense>
      <OrderConfirmedContent />
    </Suspense>
  );
}
