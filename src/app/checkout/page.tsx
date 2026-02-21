"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice, getDeliveryZone, getShippingCharge } from "@/lib/utils";

const UPI_ID = "yourname@upi"; // will be fetched from settings in future

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, count } = useCart();

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", pincode: "",
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const zone = form.pincode.length >= 6 ? getDeliveryZone(form.pincode) : null;
  const shippingCharge = zone ? getShippingCharge(zone) : 0;
  const total = subtotal + shippingCharge;

  useEffect(() => {
    if (count === 0) router.replace("/cart");
  }, [count, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setScreenshotFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setScreenshotPreview(url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!zone) { setError("Please enter a valid 6-digit pincode."); return; }
    if (!form.name || !form.phone || !form.address) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("customer_name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("address", form.address);
      formData.append("pincode", form.pincode);
      formData.append("delivery_zone", zone);
      formData.append("subtotal", subtotal.toString());
      formData.append("shipping_charge", shippingCharge.toString());
      formData.append("total", total.toString());
      formData.append("items", JSON.stringify(
        items.map((i) => ({
          sku_id: i.sku.id,
          quantity: i.quantity,
          unit_price: i.sku.price,
          line_total: i.sku.price * i.quantity,
        }))
      ));
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await fetch("/api/orders", { method: "POST", body: formData });
      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg ?? "Something went wrong");
      }

      const { orderId } = await res.json();
      clearCart();
      router.push(`/order-confirmed?id=${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-5">
        {/* Left: form */}
        <div className="md:col-span-3 space-y-6">
          {/* Customer details */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Your Details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Anitha Rajesh" required />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" required />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-700">Email (optional)</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="anitha@email.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-700">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House number, Street, Area, Chennai"
                required
              />
            </div>
            <div className="sm:w-1/2">
              <label className="mb-1 block text-xs font-medium text-stone-700">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                className="input"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="600001"
                maxLength={6}
                required
              />
              {zone && (
                <p className={`mt-1 text-xs font-medium ${zone === "self_delivery" ? "text-green-600" : "text-blue-600"}`}>
                  {zone === "self_delivery"
                    ? "✅ Self-delivery available in your area"
                    : "📦 Will be shipped via courier"}
                </p>
              )}
            </div>
          </div>

          {/* UPI payment */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Pay via UPI</h2>
            <p className="text-sm text-stone-500">
              Please transfer the total amount to our UPI ID and upload the
              payment screenshot below.
            </p>
            <div className="flex items-center gap-4 rounded-xl bg-orange-50 p-4">
              {/* QR placeholder — replace with real QR in production */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-brand-300 bg-white text-xs text-stone-400 text-center p-2">
                QR Code (add yours)
              </div>
              <div>
                <p className="text-xs text-stone-500">UPI ID</p>
                <p className="text-base font-bold text-stone-800 select-all">{UPI_ID}</p>
                <p className="mt-2 text-xs text-stone-500">Amount to pay</p>
                <p className="text-xl font-extrabold text-brand-700">{formatPrice(total)}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-stone-700">
                Upload Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshot}
                className="block w-full text-sm text-stone-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              {screenshotPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={screenshotPreview}
                  alt="Payment screenshot preview"
                  className="mt-3 max-h-40 rounded-lg border border-stone-200 object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right: order summary */}
        <div className="md:col-span-2">
          <div className="card sticky top-24 p-5 space-y-4">
            <h2 className="font-semibold text-stone-800">Order Summary</h2>

            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.sku.id} className="flex justify-between text-stone-600">
                  <span className="flex-1 truncate pr-2">
                    {item.sku.product?.name} ({item.sku.label}) × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(item.sku.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping {zone ? `(${zone === "self_delivery" ? "Self-delivery" : "Courier"})` : ""}</span>
                <span>{zone ? formatPrice(shippingCharge) : "—"}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-800 border-t border-stone-100 pt-2">
                <span>Total</span>
                <span className="text-brand-700">{zone ? formatPrice(total) : "—"}</span>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !zone}
              className="btn-primary w-full justify-center"
            >
              {submitting ? "Placing Order..." : "Confirm Order"}
            </button>
            <p className="text-center text-xs text-stone-400">
              Enter your pincode to calculate shipping
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
