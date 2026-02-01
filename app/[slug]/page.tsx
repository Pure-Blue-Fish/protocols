import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProtocol,
  getAllProtocolSlugs,
  getProtocolsByCategory,
  CATEGORIES,
} from "@/lib/protocols";
import PrintButton from "@/components/PrintButton";

export async function generateStaticParams() {
  const slugs = getAllProtocolSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const protocol = await getProtocol(slug);
  if (!protocol) return { title: "לא נמצא" };
  return { title: `${protocol.title} - Pure Blue Fish` };
}

export default async function ProtocolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const protocol = await getProtocol(slug);
  const protocolsByCategory = getProtocolsByCategory();

  if (!protocol) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-s border-gray-200 p-5 overflow-y-auto no-print">
        <div className="mb-6">
          <Link href="/">
            <h1 className="text-xl font-bold text-blue-600">Pure Blue Fish</h1>
            <p className="text-sm text-gray-500">פרוטוקולים לעובדי החווה</p>
          </Link>
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
                  {protocols.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/${p.slug}`}
                        className={`block px-3 py-2 text-sm rounded-lg ${
                          p.slug === slug
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        {p.title}
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
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-start mb-6 no-print">
            <div>
              <h1 className="text-2xl font-bold">{protocol.title}</h1>
              <p className="text-gray-500 text-sm">
                {protocol.protocolNumber} | {protocol.frequency}
              </p>
            </div>
            <PrintButton />
          </div>

          <div
            className="protocol-content bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            dangerouslySetInnerHTML={{ __html: protocol.content }}
          />
        </div>
      </main>
    </div>
  );
}
