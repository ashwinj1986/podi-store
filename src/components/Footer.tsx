import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌶️</span>
              <span className="text-lg font-bold text-white">Podi Store</span>
            </div>
            <p className="text-sm leading-relaxed">
              Authentic homemade South Indian podis, made fresh in Chennai with
              love and the finest spices.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-300">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">Shop</Link></li>
              <li><Link href="/about"    className="hover:text-white">About Us</Link></li>
              <li><Link href="/contact"  className="hover:text-white">Contact</Link></li>
              <li><Link href="/cart"     className="hover:text-white">Cart</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-300">
              Get in Touch
            </h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Chennai, Tamil Nadu</li>
              <li>
                <a
                  href="https://wa.me/919876543211"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  💬 WhatsApp us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-stone-800 pt-6 text-center text-xs text-stone-600">
          © {new Date().getFullYear()} Podi Store. Made with ❤️ in Chennai.
        </div>
      </div>
    </footer>
  );
}
