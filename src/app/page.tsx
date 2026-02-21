import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import type { Product, Sku } from "@/types";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, skus(*)")
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as (Product & { skus: Sku[] })[];
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            🏠 Homemade in Chennai
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Authentic Podis,<br />Straight from Our Kitchen
          </h1>
          <p className="max-w-xl text-lg text-brand-100">
            Hand-ground, preservative-free South Indian spice powders made with
            traditional recipes passed down through generations.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
              Shop All Podis
            </Link>
            <a
              href="https://wa.me/919876543211"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              💬 Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-orange-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: "🌿", title: "No Preservatives", desc: "100% natural ingredients" },
              { icon: "🏠", title: "Home Kitchen", desc: "Fresh, small-batch production" },
              { icon: "🚚", title: "Chennai Delivery", desc: "Self-delivery + pan-India courier" },
              { icon: "💳", title: "Easy Payment", desc: "Pay via UPI or WhatsApp order" },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-2 text-center">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="text-sm font-semibold text-stone-800">{f.title}</h3>
                <p className="text-xs text-stone-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-2xl font-bold text-stone-800">Our Podis</h2>
              <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      <section className="bg-brand-700 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">Not sure what to order?</h2>
          <p className="mb-6 text-brand-200">
            Chat with us on WhatsApp and we&apos;ll help you pick the perfect podi!
          </p>
          <a
            href="https://wa.me/919876543211"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            💬 Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
