// ABOUTME: Login page for site access
// ABOUTME: Simple password form

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("סיסמה שגויה");
      }
    } catch {
      setError("שגיאת התחברות");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-80">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Pure Blue Fish</h1>
          <p className="text-sm text-gray-500">ספר הפרוטוקולים</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-right text-lg"
          autoFocus
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg"
        >
          {loading ? "מתחבר..." : "כניסה"}
        </button>
      </form>
    </div>
  );
}
