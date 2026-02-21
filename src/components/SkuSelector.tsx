"use client";

import type { Sku } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  skus: Sku[];
  selectedSkuId: string | null;
  onChange: (skuId: string) => void;
}

export default function SkuSelector({ skus, selectedSkuId, onChange }: Props) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-stone-700">Select Size</p>
      <div className="flex flex-wrap gap-2">
        {skus.map((sku) => {
          const isSelected = sku.id === selectedSkuId;
          const isDisabled = !sku.is_available || sku.stock_quantity <= 0;

          return (
            <button
              key={sku.id}
              type="button"
              onClick={() => !isDisabled && onChange(sku.id)}
              disabled={isDisabled}
              className={[
                "relative rounded-lg border px-4 py-2 text-sm font-medium transition",
                isSelected
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-300"
                  : "border-stone-200 bg-white text-stone-700 hover:border-brand-300",
                isDisabled ? "cursor-not-allowed opacity-50 line-through" : "cursor-pointer",
              ].join(" ")}
            >
              <span>{sku.label}</span>
              <span className="ml-1.5 text-xs text-stone-500">
                {formatPrice(sku.price)}
              </span>
              {sku.compare_at_price && sku.compare_at_price > sku.price && (
                <span className="ml-1 text-xs text-stone-400 line-through">
                  {formatPrice(sku.compare_at_price)}
                </span>
              )}
              {isDisabled && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-stone-200 px-1.5 py-px text-[10px] text-stone-600">
                  sold out
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
