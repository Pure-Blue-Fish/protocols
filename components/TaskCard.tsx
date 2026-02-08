// ABOUTME: Worker task card with completion checkbox and protocol link
// ABOUTME: Mobile-optimized card for the "My Tasks" view

"use client";

import { useState } from "react";
import Link from "next/link";
import ShiftBadge from "./ShiftBadge";
import { useToast } from "@/components/ui/Toast";
import { UI_STRINGS, type Language } from "@/lib/i18n";

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
  const { toast } = useToast();
  const ui = UI_STRINGS[lang];

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch(`/api/my-tasks/${assignmentId}/complete`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setCompleted(data.completed);
        toast("success", data.completed ? ui.taskMarkedDone : ui.taskMarkedUndone);
      } else {
        toast("error", ui.errorSaving);
      }
    } catch {
      toast("error", ui.connectionError);
    }
    setToggling(false);
  };

  return (
    <div
      className={`bg-surface-card rounded-xl p-4 shadow-card border transition-all ${
        completed ? "border-brand-success/20 bg-brand-success-light/50" : "border-border-subtle"
      } ${toggling ? "scale-[0.98]" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            completed
              ? "bg-brand-success border-brand-success text-white"
              : "border-border-default hover:border-brand-primary"
          } ${toggling ? "opacity-50" : ""}`}
        >
          {completed && (
            <svg className="w-4 h-4 animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                ? "text-text-muted line-through"
                : "text-text-primary hover:text-brand-primary"
            }`}
          >
            {protocolTitle}
          </Link>
          {notes && (
            <p className="text-sm text-text-secondary mt-1">{notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
