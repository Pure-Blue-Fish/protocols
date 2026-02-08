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
    <div className="min-h-screen flex items-center justify-center bg-surface-page px-4">
      <div className="bg-surface-card p-6 sm:p-8 rounded-2xl shadow-elevated w-full max-w-sm border-t-4 border-brand-primary">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-primary font-heading">Pure Blue Fish</h1>
          <p className="text-sm text-text-muted">ספר הפרוטוקולים</p>
        </div>
        <WorkerLoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
