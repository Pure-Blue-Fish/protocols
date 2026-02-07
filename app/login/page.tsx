// ABOUTME: Login page with phone+PIN authentication
// ABOUTME: Single login form for all users (workers and managers)

"use client";

import { useRouter } from "next/navigation";
import WorkerLoginForm from "@/components/WorkerLoginForm";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Pure Blue Fish</h1>
          <p className="text-sm text-gray-500">ספר הפרוטוקולים</p>
        </div>
        <WorkerLoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
