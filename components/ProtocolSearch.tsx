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

interface ProtocolSearchProps {
  categories: Record<string, string>;
  protocolsByCategory: Record<string, Protocol[]>;
  categoryIcons: Record<string, string>;
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

          return (
            <div
              key={key}
              className="bg-white rounded-xl p-5 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{categoryIcons[key] || "📋"}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{label}</h3>
                  <p className="text-xs text-gray-400">
                    {protocols.length} {labels.protocols}
                  </p>
                </div>
              </div>
              <ul className="space-y-1">
                {protocols.map((protocol) => (
                  <li key={protocol.slug}>
                    <Link
                      href={`/${protocol.slug}?lang=${lang}`}
                      className="block px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            {lang === "he" ? "לא נמצאו פרוטוקולים" : "No protocols found"}
          </div>
        )}
      </div>
    </>
  );
}
