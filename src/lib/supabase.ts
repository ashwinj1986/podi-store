import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client (safe to use in browser components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
