// ABOUTME: Phone number + PIN login form for workers
// ABOUTME: Sends credentials to /api/auth/worker

"use client";

import { useState } from "react";

interface WorkerLoginFormProps {
  onSuccess: () => void;
}

export default function WorkerLoginForm({ onSuccess }: WorkerLoginFormProps) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), pin }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        setError("מספר טלפון או קוד שגוי");
      }
    } catch {
      setError("שגיאת התחברות");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-text-secondary mb-1 text-right">מספר טלפון</label>
        <input
          type="tel"
          dir="ltr"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05X-XXXXXXX"
          className="w-full px-4 py-3 border border-border-default rounded-lg text-lg text-center tracking-wider focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
          autoFocus
          disabled={loading}
        />
      </div>
      <div>
        <label className="block text-sm text-text-secondary mb-1 text-right">קוד כניסה</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className="w-full px-4 py-3 border border-border-default rounded-lg text-lg text-center tracking-widest focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
          disabled={loading}
        />
      </div>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading || phone.length < 9 || pin.length < 4}
        className="w-full bg-brand-primary text-white py-3 rounded-lg hover:bg-brand-primary-hover disabled:opacity-50 text-lg font-heading font-semibold transition-all"
      >
        {loading ? "מתחבר..." : "כניסה"}
      </button>
    </form>
  );
}
