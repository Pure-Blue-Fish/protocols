// ABOUTME: Main dashboard page for protocol book with i18n support
// ABOUTME: Shows categories as cards with protocol counts

import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  getProtocolsByCategory,
  getAllProtocols,
  CATEGORIES,
  UI_STRINGS,
  type Language,
} from "@/lib/protocols";
import LanguageToggle from "@/components/LanguageToggle";

const CATEGORY_ICONS: Record<string, string> = {
  feeding: "🐟",
  "water-quality": "💧",
  treatments: "💊",
  "tank-procedures": "🔧",
  "pool-procedures": "🏊",
  transfers: "🚚",
  monitoring: "📊",
  arrival: "📦",
  lab: "🔬",
  other: "📋",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const lang = (params.lang || cookieLang || "he") as Language;

  const protocolsByCategory = getProtocolsByCategory(lang);
  const allProtocols = getAllProtocols(lang);
  const categoryCount = Object.keys(protocolsByCategory).length;
  const categories = CATEGORIES[lang];
  const ui = UI_STRINGS[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Pure Blue Fish"
              width={120}
              height={48}
              className="h-12 w-auto"
            />
            <p className="text-sm text-gray-500">{ui.protocolBook}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} />
            <Link
              href={`/recommendations?lang=${lang}`}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm"
            >
              {ui.recommendations}
            </Link>
            <Link
              href={`/admin?lang=${lang}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
            >
              <span>{ui.edit}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">
              {allProtocols.length}
            </div>
            <div className="text-sm text-gray-500">{ui.protocols}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-cyan-600">
              {categoryCount}
            </div>
            <div className="text-sm text-gray-500">{ui.categories}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">
              {protocolsByCategory["feeding"]?.length || 0}
            </div>
            <div className="text-sm text-gray-500">{ui.feedingProtocols}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">
              {protocolsByCategory["water-quality"]?.length || 0}
            </div>
            <div className="text-sm text-gray-500">{ui.waterProtocols}</div>
          </div>
        </div>

        {/* Category Cards */}
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {ui.categories}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(categories).map(([key, label]) => {
            const protocols = protocolsByCategory[key] || [];
            if (protocols.length === 0) return null;

            return (
              <div
                key={key}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{CATEGORY_ICONS[key] || "📋"}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{label}</h3>
                    <p className="text-xs text-gray-400">
                      {protocols.length} {ui.protocols}
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
        </div>

        {/* Quick Access */}
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {ui.quickAccess}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allProtocols.slice(0, 8).map((protocol) => (
            <Link
              key={protocol.slug}
              href={`/${protocol.slug}?lang=${lang}`}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow transition-all text-sm"
            >
              <div className="font-medium text-gray-800 truncate">
                {protocol.title}
              </div>
              <div className="text-xs text-gray-400">
                {protocol.protocolNumber}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
          <span>Pure Blue Fish - {ui.fishFarm}</span>
          <Link href={`/admin?lang=${lang}`} className="hover:text-gray-600">
            {ui.adminLogin}
          </Link>
        </div>
      </footer>
    </div>
  );
}
