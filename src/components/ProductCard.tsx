import Link from "next/link";
import Image from "next/image";
import type { Product, Sku } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product & { skus: Sku[] };
}

export default function ProductCard({ product }: Props) {
  const availableSkus = product.skus.filter((s) => s.is_available);
  const lowestPrice = availableSkus.length
    ? Math.min(...availableSkus.map((s) => s.price))
    : null;
  const allOutOfStock = availableSkus.length === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card overflow-hidden transition hover:shadow-md">
        {/* Product image */}
        <div className="relative aspect-square w-full bg-orange-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              🌶️
            </div>
          )}

          {allOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="badge-out-of-stock">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h2 className="text-base font-semibold text-stone-800 group-hover:text-brand-700">
            {product.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-stone-500">
            {product.description}
          </p>
          <div className="mt-3 flex items-center justify-between">
            {lowestPrice !== null ? (
              <span className="text-sm font-bold text-brand-600">
                From {formatPrice(lowestPrice)}
              </span>
            ) : (
              <span className="badge-out-of-stock">Unavailable</span>
            )}
            <span className="text-xs text-stone-400">
              {availableSkus.length} size{availableSkus.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
