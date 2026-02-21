import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn the story behind our authentic homemade podi business in Chennai.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-5xl">🌶️</span>
        <h1 className="mt-4 text-3xl font-bold text-stone-800">Our Story</h1>
        <p className="mt-3 text-stone-500">
          From our Chennai kitchen to your table
        </p>
      </div>

      {/* Story */}
      <div className="prose prose-stone max-w-none space-y-6 text-stone-700 leading-relaxed">
        <p>
          Every jar of podi we make carries the flavour of generations. Our
          recipes have been passed down through our family in Chennai, refined
          over decades to achieve that perfect balance of heat, aroma, and
          depth.
        </p>
        <p>
          We started this home business to share something we believed the
          world deserved — <strong>genuinely homemade, preservative-free South
          Indian spice powders</strong>, made with whole spices sourced fresh
          from local markets and ground in small batches by hand.
        </p>
        <p>
          Unlike mass-produced podis, ours contain no artificial colours, no
          preservatives, and no fillers. Just spices, sesame, and love — the
          same combination that made our family&apos;s idlis and dosas the talk
          of every Sunday morning.
        </p>
      </div>

      {/* Values */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { icon: "🌿", title: "Pure Ingredients", desc: "No preservatives, colours or artificial additives. Ever." },
          { icon: "🏠", title: "Made at Home", desc: "Small-batch production ensures freshness and consistent quality." },
          { icon: "❤️", title: "Made with Love", desc: "Every jar is packed with care by our family for yours." },
        ].map((v) => (
          <div key={v.title} className="card p-5 text-center">
            <span className="text-3xl">{v.icon}</span>
            <h3 className="mt-3 text-sm font-semibold text-stone-800">{v.title}</h3>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link href="/products" className="btn-primary">
          Explore Our Podis
        </Link>
      </div>
    </div>
  );
}
