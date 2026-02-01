import Link from "next/link";
import { getProtocolsByCategory, CATEGORIES } from "@/lib/protocols";

export default function HomePage() {
  const protocolsByCategory = getProtocolsByCategory();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-s border-gray-200 p-5 overflow-y-auto no-print">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-blue-600">Pure Blue Fish</h1>
          <p className="text-sm text-gray-500">פרוטוקולים לעובדי החווה</p>
        </div>

        <nav className="space-y-4">
          {Object.entries(CATEGORIES).map(([key, label]) => {
            const protocols = protocolsByCategory[key] || [];
            if (protocols.length === 0) return null;

            return (
              <div key={key}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 pb-1 border-b border-gray-100">
                  {label}
                </h2>
                <ul className="space-y-1">
                  {protocols.map((protocol) => (
                    <li key={protocol.slug}>
                      <Link
                        href={`/${protocol.slug}`}
                        className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                      >
                        {protocol.title}
                        {protocol.frequency && (
                          <span className="block text-xs text-gray-400">
                            {protocol.frequency}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-gray-100">
          <Link href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
            כניסת מנהל
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold mb-2">צ'קליסטים לעובדי החווה</h1>
          <p className="text-gray-500">בחר פרוטוקול מהתפריט</p>
        </div>
      </main>
    </div>
  );
}
