// ABOUTME: Worker task card with completion checkbox and protocol link
// ABOUTME: Mobile-optimized card for the "My Tasks" view

"use client";

import { useState } from "react";
import Link from "next/link";
import ShiftBadge from "./ShiftBadge";
import type { Language } from "@/lib/i18n";

interface TaskCardProps {
  assignmentId: number;
  protocolSlug: string;
  protocolTitle: string;
  shift: "morning" | "afternoon" | "night";
  notes: string | null;
  completed: boolean;
  lang: Language;
}

export default function TaskCard({
  assignmentId,
  protocolSlug,
  protocolTitle,
  shift,
  notes,
  completed: initialCompleted,
  lang,
}: TaskCardProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/my-tasks/${assignmentId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setCompleted(data.completed);
      }
    } catch {
      // Revert on error
    }
    setToggling(false);
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
        completed ? "border-green-200 bg-green-50/50" : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-blue-400"
          } ${toggling ? "opacity-50" : ""}`}
        >
          {completed && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShiftBadge shift={shift} lang={lang} />
          </div>
          <Link
            href={`/${protocolSlug}?lang=${lang}`}
            className={`block text-base font-medium transition-colors ${
              completed
                ? "text-gray-400 line-through"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {protocolTitle}
          </Link>
          {notes && (
            <p className="text-sm text-gray-500 mt-1">{notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
