// ABOUTME: Main dashboard page for protocol book
// ABOUTME: Shows categories as cards with protocol counts

import Link from "next/link";
import { getProtocolsByCategory, getAllProtocols, CATEGORIES } from "@/lib/protocols";

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

export default function HomePage() {
  const protocolsByCategory = getProtocolsByCategory();
  const allProtocols = getAllProtocols();
  const categoryCount = Object.keys(protocolsByCategory).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Pure Blue Fish</h1>
            <p className="text-sm text-gray-500">ספר הפרוטוקולים</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
          >
            <span>עריכה</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600">{allProtocols.length}</div>
            <div className="text-sm text-gray-500">פרוטוקולים</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-cyan-600">{categoryCount}</div>
            <div className="text-sm text-gray-500">קטגוריות</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600">
              {protocolsByCategory["feeding"]?.length || 0}
            </div>
            <div className="text-sm text-gray-500">פרוטוקולי האכלה</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600">
              {protocolsByCategory["water-quality"]?.length || 0}
            </div>
            <div className="text-sm text-gray-500">פרוטוקולי מים</div>
          </div>
        </div>

        {/* Category Cards */}
        <h2 className="text-lg font-semibold mb-4 text-gray-700">קטגוריות</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(CATEGORIES).map(([key, label]) => {
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
                    <p className="text-xs text-gray-400">{protocols.length} פרוטוקולים</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {protocols.map((protocol) => (
                    <li key={protocol.slug}>
                      <Link
                        href={`/${protocol.slug}`}
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
        <h2 className="text-lg font-semibold mb-4 text-gray-700">גישה מהירה</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allProtocols.slice(0, 8).map((protocol) => (
            <Link
              key={protocol.slug}
              href={`/${protocol.slug}`}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow transition-all text-sm"
            >
              <div className="font-medium text-gray-800 truncate">{protocol.title}</div>
              <div className="text-xs text-gray-400">{protocol.protocolNumber}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-gray-400">
          <span>Pure Blue Fish - חוות דגים</span>
          <Link href="/admin" className="hover:text-gray-600">
            כניסת מנהל
          </Link>
        </div>
      </footer>
    </div>
  );
}
