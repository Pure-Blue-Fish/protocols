// ABOUTME: Colored badge showing shift name
// ABOUTME: Morning=amber, Afternoon=orange, Night=indigo

"use client";

import type { Language } from "@/lib/i18n";

const SHIFT_STYLES = {
  morning: "bg-amber-100 text-amber-800",
  afternoon: "bg-orange-100 text-orange-800",
  night: "bg-indigo-100 text-indigo-800",
} as const;

const SHIFT_LABELS: Record<string, Record<string, string>> = {
  he: { morning: "בוקר", afternoon: "צהריים", night: "לילה" },
  en: { morning: "Morning", afternoon: "Afternoon", night: "Night" },
};

interface ShiftBadgeProps {
  shift: "morning" | "afternoon" | "night";
  lang: Language;
}

export default function ShiftBadge({ shift, lang }: ShiftBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${SHIFT_STYLES[shift]}`}
    >
      {SHIFT_LABELS[lang][shift]}
    </span>
  );
}
