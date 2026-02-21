"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌶️</span>
          <span className="text-xl font-bold text-brand-700 tracking-tight">
            Podi Store
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-6 md:flex">
          <Link href="/products" className="text-sm font-medium text-stone-600 hover:text-brand-600">
            Shop
          </Link>
          <Link href="/about" className="text-sm font-medium text-stone-600 hover:text-brand-600">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-stone-600 hover:text-brand-600">
            Contact
          </Link>
          <Link href="/orders" className="text-sm font-medium text-stone-600 hover:text-brand-600">
            My Orders
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <span>🛒</span>
            <span>Cart</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-stone-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700">Shop</Link>
            <Link href="/about"    onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700">About</Link>
            <Link href="/contact"  onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700">Contact</Link>
            <Link href="/orders"   onClick={() => setMenuOpen(false)} className="text-sm font-medium text-stone-700">My Orders</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
