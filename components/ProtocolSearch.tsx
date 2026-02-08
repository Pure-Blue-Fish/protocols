// ABOUTME: Client component wrapping SearchInput + category grid
// ABOUTME: Filters protocols by title across all categories

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui";

interface Protocol {
  slug: string;
  title: string;
}

const CATEGORY_COLORS: Record<string, { iconBg: string; iconText: string; border: string; hoverBg: string; hoverText: string }> = {
  feeding:            { iconBg: "bg-[#fffbeb]", iconText: "text-[#b45309]", border: "#d97706", hoverBg: "hover:bg-[#fffbeb]", hoverText: "hover:text-[#b45309]" },
  "water-quality":    { iconBg: "bg-[#ecfeff]", iconText: "text-[#0e7490]", border: "#0891b2", hoverBg: "hover:bg-[#ecfeff]", hoverText: "hover:text-[#0e7490]" },
  treatments:         { iconBg: "bg-[#fff1f2]", iconText: "text-[#be123c]", border: "#e11d48", hoverBg: "hover:bg-[#fff1f2]", hoverText: "hover:text-[#be123c]" },
  "tank-procedures":  { iconBg: "bg-[#f1f5f9]", iconText: "text-[#475569]", border: "#64748b", hoverBg: "hover:bg-[#f1f5f9]", hoverText: "hover:text-[#475569]" },
  "pool-procedures":  { iconBg: "bg-[#f0f9ff]", iconText: "text-[#0369a1]", border: "#0284c7", hoverBg: "hover:bg-[#f0f9ff]", hoverText: "hover:text-[#0369a1]" },
  transfers:          { iconBg: "bg-[#eef2ff]", iconText: "text-[#4338ca]", border: "#4f46e5", hoverBg: "hover:bg-[#eef2ff]", hoverText: "hover:text-[#4338ca]" },
  monitoring:         { iconBg: "bg-[#f0fdfa]", iconText: "text-[#0f766e]", border: "#0d9488", hoverBg: "hover:bg-[#f0fdfa]", hoverText: "hover:text-[#0f766e]" },
  arrival:            { iconBg: "bg-[#fff7ed]", iconText: "text-[#c2410c]", border: "#ea580c", hoverBg: "hover:bg-[#fff7ed]", hoverText: "hover:text-[#c2410c]" },
  lab:                { iconBg: "bg-[#f5f3ff]", iconText: "text-[#6d28d9]", border: "#7c3aed", hoverBg: "hover:bg-[#f5f3ff]", hoverText: "hover:text-[#6d28d9]" },
  other:              { iconBg: "bg-brand-primary-light", iconText: "text-brand-primary", border: "#0f4c81", hoverBg: "hover:bg-brand-primary-light", hoverText: "hover:text-brand-primary" },
};

interface ProtocolSearchProps {
  categories: Record<string, string>;
  protocolsByCategory: Record<string, Protocol[]>;
  categoryIcons: Record<string, React.ReactNode>;
  lang: string;
  labels: {
    protocols: string;
    searchProtocols: string;
  };
}

export default function ProtocolSearch({
  categories,
  protocolsByCategory,
  categoryIcons,
  lang,
  labels,
}: ProtocolSearchProps) {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    const result: Record<string, Protocol[]> = {};
    for (const [key, protocols] of Object.entries(protocolsByCategory)) {
      const matches = protocols.filter((p) =>
        p.title.toLowerCase().includes(q)
      );
      if (matches.length > 0) result[key] = matches;
    }
    return result;
  }, [query, protocolsByCategory]);

  const displayData = filteredCategories ?? protocolsByCategory;

  return (
    <>
      <div className="mb-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={labels.searchProtocols}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categories).map(([key, label]) => {
          const protocols = displayData[key] || [];
          if (protocols.length === 0) return null;
          const colors = CATEGORY_COLORS[key] || CATEGORY_COLORS.other;

          return (
            <div
              key={key}
              className="bg-surface-card rounded-2xl p-5 shadow-card border border-border-subtle border-s-4 hover:shadow-card-hover hover:translate-y-[-1px] transition-all"
              style={{ borderInlineStartColor: colors.border }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center shrink-0`}>
                  {categoryIcons[key] || categoryIcons.other}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary font-heading">{label}</h3>
                  <p className="text-xs text-text-muted">
                    {protocols.length} {labels.protocols}
                  </p>
                </div>
              </div>
              <ul className="space-y-1">
                {protocols.map((protocol) => (
                  <li key={protocol.slug}>
                    <Link
                      href={`/${protocol.slug}?lang=${lang}`}
                      className={`block px-3 py-2 text-sm text-text-secondary rounded-lg ${colors.hoverBg} ${colors.hoverText} transition-colors`}
                    >
                      {protocol.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {query.trim() && Object.keys(displayData).length === 0 && (
          <div className="col-span-full text-center py-12 text-text-muted text-sm">
            {lang === "he" ? "לא נמצאו פרוטוקולים" : "No protocols found"}
          </div>
        )}
      </div>
    </>
  );
}
