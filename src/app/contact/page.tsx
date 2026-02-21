"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Note: metadata doesn't work in "use client" components.
// If you need metadata, create a separate server component wrapper.

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-800">Get in Touch</h1>
        <p className="mt-2 text-stone-500">
          Have a question or custom order? Send us a message!
        </p>
      </div>

      {/* Contact options */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="https://wa.me/919876543211"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp flex-1 justify-center"
        >
          💬 Chat on WhatsApp
        </a>
        <a
          href="tel:+919876543211"
          className="btn-secondary flex-1 justify-center"
        >
          📞 Call Us
        </a>
      </div>

      <div className="relative mb-8 flex items-center gap-3">
        <div className="flex-1 border-t border-stone-200" />
        <span className="text-sm text-stone-400">or send a message</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      {/* Enquiry form */}
      {status === "success" ? (
        <div className="card p-8 text-center">
          <span className="text-4xl">✅</span>
          <h2 className="mt-4 text-xl font-semibold text-stone-800">Message Sent!</h2>
          <p className="mt-2 text-stone-500">
            We&apos;ll get back to you via WhatsApp or call soon.
          </p>
          <button
            type="button"
            className="btn-secondary mt-6"
            onClick={() => setStatus("idle")}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input min-h-[120px] resize-none"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you need..."
              required
            />
          </div>

          {status === "error" && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Something went wrong. Please try WhatsApp instead.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn-primary w-full justify-center"
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
