import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { product_id, sku_code, label, price, compare_at_price, stock_quantity, weight_grams, is_available } = body;

  if (!product_id || !sku_code || !label || price == null) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("skus")
    .insert({ product_id, sku_code, label, price, compare_at_price, stock_quantity, weight_grams, is_available })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
