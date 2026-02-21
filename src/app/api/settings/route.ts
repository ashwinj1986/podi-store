import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return as key-value map
  const map: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    map[row.key] = row.value;
  });
  return NextResponse.json(map);
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const updates: Record<string, string> = await req.json();

  const upserts = Object.entries(updates).map(([key, value]) => ({ key, value }));

  const { error } = await supabase
    .from("settings")
    .upsert(upserts, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
