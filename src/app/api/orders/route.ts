import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, sku:skus(*, product:products(*)))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  const formData = await req.formData();

  const customer_name   = formData.get("customer_name") as string;
  const phone           = formData.get("phone") as string;
  const email           = formData.get("email") as string | null;
  const address         = formData.get("address") as string;
  const pincode         = formData.get("pincode") as string;
  const delivery_zone   = formData.get("delivery_zone") as string;
  const subtotal        = parseFloat(formData.get("subtotal") as string);
  const shipping_charge = parseFloat(formData.get("shipping_charge") as string);
  const total           = parseFloat(formData.get("total") as string);
  const itemsJson       = formData.get("items") as string;
  const screenshot      = formData.get("screenshot") as File | null;

  let payment_screenshot_url: string | null = null;

  // Upload screenshot to Supabase Storage if provided
  if (screenshot && screenshot.size > 0) {
    const ext = screenshot.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("payment-screenshots")
      .upload(fileName, screenshot, { contentType: screenshot.type });

    if (uploadError) {
      return NextResponse.json({ error: "Screenshot upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("payment-screenshots")
      .getPublicUrl(uploadData.path);

    payment_screenshot_url = publicUrl;
  }

  // Insert order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name,
      phone,
      email: email || null,
      address,
      pincode,
      delivery_zone,
      subtotal,
      shipping_charge,
      total,
      payment_screenshot_url,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Insert order items
  const items = JSON.parse(itemsJson) as {
    sku_id: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({ ...item, order_id: order.id }))
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
}
