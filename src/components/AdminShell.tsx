"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const NAV = [
  { href: "/admin/orders",    label: "Orders",    icon: "📦" },
  { href: "/admin/products",  label: "Products",  icon: "🌶️" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "✉️" },
  { href: "/admin/settings",  label: "Settings",  icon: "⚙️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/admin");
      setChecking(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-stone-900 text-stone-300 md:flex">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-stone-800">
          <span className="text-2xl">🌶️</span>
          <span className="font-bold text-white text-sm">Podi Store Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                pathname.startsWith(item.href)
                  ? "bg-brand-700 text-white"
                  : "hover:bg-stone-800 hover:text-white",
              ].join(" ")}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-stone-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            🔓 Logout
          </button>
          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            🌐 View Site
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-stone-900 px-4 py-3 md:hidden">
        <span className="font-bold text-white text-sm">🌶️ Admin</span>
        <div className="flex gap-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded px-2 py-1 text-xs font-medium",
                pathname.startsWith(item.href) ? "bg-brand-700 text-white" : "text-stone-400",
              ].join(" ")}
            >
              {item.icon}
            </Link>
          ))}
          <button onClick={handleLogout} className="text-stone-400 text-xs px-2">
            🔓
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
