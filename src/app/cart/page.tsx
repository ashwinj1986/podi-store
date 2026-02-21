"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import { formatPrice } from "@/lib/utils";

const WHATSAPP_PHONE = "919876543211";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, count } = useCart();

  const whatsappMessage =
    items.length > 0
      ? `Hi! I'd like to order the following:\n\n` +
        items
          .map((i) => `• ${i.sku.product?.name} (${i.sku.label}) × ${i.quantity} = ${formatPrice(i.sku.price * i.quantity)}`)
          .join("\n") +
        `\n\nTotal: ${formatPrice(subtotal)}\n\nCan you confirm availability?`
      : "Hi! I'd like to place an order.";

  if (count === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="text-2xl font-bold text-stone-700">Your cart is empty</h1>
        <p className="text-stone-500">Add some delicious podis to get started!</p>
        <Link href="/products" className="btn-primary">Browse Podis</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Your Cart</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cart items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.sku.id} className="card flex items-center gap-4 p-4">
              {/* Thumbnail */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-orange-50">
                {item.sku.product?.image_url ? (
                  <Image
                    src={item.sku.product.image_url}
                    alt={item.sku.product.name ?? ""}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🌶️</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-800 truncate">
                  {item.sku.product?.name}
                </p>
                <p className="text-xs text-stone-500">{item.sku.label} · {item.sku.sku_code}</p>
                <p className="mt-0.5 text-sm font-medium text-brand-700">
                  {formatPrice(item.sku.price)}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white">
                <button
                  type="button"
                  className="px-2.5 py-1.5 text-stone-600 hover:text-brand-600"
                  onClick={() => updateQuantity(item.sku.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1.5 text-stone-600 hover:text-brand-600"
                  onClick={() => updateQuantity(item.sku.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-stone-800">
                  {formatPrice(item.sku.price * item.quantity)}
                </p>
                <button
                  type="button"
                  className="mt-1 text-xs text-stone-400 hover:text-red-500"
                  onClick={() => removeItem(item.sku.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="card h-fit p-5 space-y-4">
          <h2 className="font-semibold text-stone-800">Order Summary</h2>
          <div className="flex justify-between text-sm text-stone-600">
            <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-stone-400">Shipping calculated at checkout based on your pincode.</p>

          <div className="pt-2 border-t border-stone-100 flex justify-between text-base font-bold text-stone-800">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <Link href="/checkout" className="btn-primary w-full text-center">
            Proceed to Checkout
          </Link>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t border-stone-200" />
            <span className="text-xs text-stone-400">or</span>
            <div className="flex-1 border-t border-stone-200" />
          </div>

          <WhatsAppButton
            phone={WHATSAPP_PHONE}
            message={whatsappMessage}
            label="Order via WhatsApp"
            className="w-full justify-center"
          />
        </div>
      </div>
    </div>
  );
}
