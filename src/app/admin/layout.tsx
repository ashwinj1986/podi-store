import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — Podi Store" },
  robots: "noindex",
};

// Admin pages have their own layout — no public Navbar/Footer
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      {children}
    </div>
  );
}
