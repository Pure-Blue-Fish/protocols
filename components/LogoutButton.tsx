// ABOUTME: Logout button that clears auth cookies and redirects to login
// ABOUTME: Used in all page headers

"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton({ label }: { label: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-2 sm:px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
    >
      {label}
    </button>
  );
}
