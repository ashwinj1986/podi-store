"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";

interface Settings {
  upi_id: string;
  whatsapp_number: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ upi_id: "", whatsapp_number: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { setSettings({ upi_id: data.upi_id ?? "", whatsapp_number: data.whatsapp_number ?? "" }); setLoading(false); });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Settings</h1>

      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : (
        <form onSubmit={handleSave} className="card max-w-md p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              UPI ID
            </label>
            <input
              className="input"
              placeholder="yourname@upi"
              value={settings.upi_id}
              onChange={(e) => setSettings((s) => ({ ...s, upi_id: e.target.value }))}
            />
            <p className="mt-1 text-xs text-stone-400">
              This is shown at checkout for customers to pay.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              WhatsApp Number
            </label>
            <input
              className="input"
              placeholder="919876543210 (with country code, no +)"
              value={settings.whatsapp_number}
              onChange={(e) => setSettings((s) => ({ ...s, whatsapp_number: e.target.value }))}
            />
            <p className="mt-1 text-xs text-stone-400">
              Include country code without +. Example: 919876543210
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </form>
      )}
    </AdminShell>
  );
}
