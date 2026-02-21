import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Podi Store — Authentic Homemade Podis from Chennai",
    template: "%s | Podi Store",
  },
  description:
    "Authentic homemade South Indian podi (spice powder) made fresh in Chennai. Idli podi, dosa podi, and more. Order online with fast delivery.",
  keywords: ["podi", "idli podi", "dosa podi", "Chennai", "homemade spice powder", "South Indian"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Podi Store",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <CartProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
