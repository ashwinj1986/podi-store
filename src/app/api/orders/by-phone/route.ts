import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const phone = new URL(req.url).searchParams.get("phone")?.replace(/\D/g, "");

  if (!phone || phone.length < 10) {
    return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, customer_name, status, total, created_at, order_items(quantity, sku:skus(label, product:products(name)))"
    )
    .eq("phone", phone)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
