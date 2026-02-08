// ABOUTME: Logout button that clears auth cookies and redirects to login
// ABOUTME: Used in all page headers

"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ label, dark = false }: { label: string; dark?: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition-all ${
        dark
          ? "text-white/70 hover:text-white hover:bg-white/10"
          : "text-brand-danger bg-brand-danger-light hover:bg-red-100"
      }`}
    >
      {label}
    </button>
  );
}
