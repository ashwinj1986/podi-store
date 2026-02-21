import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import type { Product, Sku } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Podis",
  description: "Browse our range of authentic homemade South Indian podis — Idli podi, Dosa podi and more.",
};

async function getProducts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, skus(*)")
    .order("created_at", { ascending: false });
  if (error) console.error("[products page] Supabase error:", error);
  return (data ?? []) as (Product & { skus: Sku[] })[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-stone-800">Our Podis</h1>
      <p className="mb-8 text-stone-500">
        Handmade fresh in small batches — no preservatives, just pure flavour.
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center text-stone-500">
          <span className="text-5xl">🌶️</span>
          <p className="text-lg font-medium">Products coming soon!</p>
          <p className="text-sm">Check back later or reach out on WhatsApp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
