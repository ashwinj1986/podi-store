"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import type { Enquiry } from "@/types";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries")
      .then((r) => r.json())
      .then((data) => { setEnquiries(data); setLoading(false); });
  }, []);

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Enquiries</h1>

      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : enquiries.length === 0 ? (
        <div className="card p-10 text-center text-stone-400">
          <p className="text-4xl mb-3">✉️</p>
          <p>No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((eq) => (
            <div key={eq.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-800">{eq.name}</p>
                  <p className="text-sm text-stone-500">{eq.phone}</p>
                </div>
                <span className="text-xs text-stone-400 shrink-0">
                  {new Date(eq.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mt-3 text-sm text-stone-700 leading-relaxed">{eq.message}</p>
              <div className="mt-3 flex gap-3">
                <a
                  href={`https://wa.me/91${eq.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-green-600 hover:underline"
                >
                  💬 Reply on WhatsApp
                </a>
                <a
                  href={`tel:${eq.phone}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  📞 Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
