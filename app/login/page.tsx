// ABOUTME: Login page with worker (phone+PIN) and manager (password) tabs
// ABOUTME: Redirects to appropriate view after login

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WorkerLoginForm from "@/components/WorkerLoginForm";

export default function LoginPage() {
  const [tab, setTab] = useState<"worker" | "manager">("worker");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWorkerSuccess = () => {
    router.push("/my-tasks");
    router.refresh();
  };

  const handleManagerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Pure Blue Fish</h1>
          <p className="text-sm text-gray-500">ספר הפרוטוקולים</p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("worker")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "worker"
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-500"
            }`}
          >
            עובד
          </button>
          <button
            onClick={() => setTab("manager")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "manager"
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-500"
            }`}
          >
            מנהל
          </button>
        </div>

        {tab === "worker" ? (
          <WorkerLoginForm onSuccess={handleWorkerSuccess} />
        ) : (
          <form onSubmit={handleManagerLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-right text-lg"
              autoFocus
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg"
            >
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
