// ABOUTME: Client component for print button
// ABOUTME: Handles window.print() for PDF export

"use client";

interface PrintButtonProps {
  label?: string;
}

export default function PrintButton({ label = "הדפס" }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
    >
      {label}
    </button>
  );
}
