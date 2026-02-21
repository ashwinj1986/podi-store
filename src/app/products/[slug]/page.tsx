"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import SkuSelector from "@/components/SkuSelector";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCart } from "@/context/CartContext";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import type { Product, Sku } from "@/types";

const WHATSAPP_PHONE = "919876543211"; // update in settings

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<(Product & { skus: Sku[] }) | null>(null);
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, skus(*)")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        setProduct(data as Product & { skus: Sku[] });
        const firstAvailable = (data.skus as Sku[]).find(
          (s) => s.is_available && s.stock_quantity > 0
        );
        setSelectedSkuId(firstAvailable?.id ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-stone-400">
        Loading...
      </div>
    );
  }

  if (!product) return notFound();

  const selectedSku = product.skus.find((s) => s.id === selectedSkuId) ?? null;

  function handleAddToCart() {
    if (!selectedSku || !product) return;
    addItem(
      {
        ...selectedSku,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image_url: product.image_url,
        },
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const whatsappMessage = selectedSku
    ? `Hi! I'd like to order:\n• ${product.name} (${selectedSku.label}) × ${quantity}\n\nPlease confirm availability and total price.`
    : `Hi! I'm interested in ${product.name}. Can you please help me with ordering?`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-orange-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">🌶️</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">
              {product.category}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-stone-800">{product.name}</h1>
            <p className="mt-3 text-stone-600 leading-relaxed">{product.description}</p>
          </div>

          {/* SKU selector */}
          <SkuSelector
            skus={product.skus}
            selectedSkuId={selectedSkuId}
            onChange={setSelectedSkuId}
          />

          {/* Price display */}
          {selectedSku && (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-700">
                {formatPrice(selectedSku.price)}
              </span>
              {selectedSku.compare_at_price && selectedSku.compare_at_price > selectedSku.price && (
                <span className="text-sm text-stone-400 line-through">
                  {formatPrice(selectedSku.compare_at_price)}
                </span>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-stone-700">Qty</label>
            <div className="flex items-center rounded-lg border border-stone-200 bg-white">
              <button
                type="button"
                className="px-3 py-2 text-stone-600 hover:text-brand-600"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2 text-stone-600 hover:text-brand-600"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSku || !selectedSku.is_available}
              className="btn-primary flex-1"
            >
              {added ? "✓ Added!" : "Add to Cart"}
            </button>
            <WhatsAppButton
              phone={WHATSAPP_PHONE}
              message={whatsappMessage}
              className="flex-1"
            />
          </div>

          {/* Product details */}
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 text-sm text-stone-600 space-y-2">
            {product.ingredients && (
              <p><span className="font-medium text-stone-800">Ingredients:</span> {product.ingredients}</p>
            )}
            {product.shelf_life && (
              <p><span className="font-medium text-stone-800">Shelf Life:</span> {product.shelf_life}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
