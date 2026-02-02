// ABOUTME: Protocol detail page with i18n support
// ABOUTME: Shows single protocol content with sidebar navigation

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getProtocol,
  getAllLanguageSlugs,
  getProtocolsByCategory,
  CATEGORIES,
  UI_STRINGS,
  type Language,
} from "@/lib/protocols";
import PrintButton from "@/components/PrintButton";
import LanguageToggle from "@/components/LanguageToggle";

export async function generateStaticParams() {
  const slugs = getAllLanguageSlugs();
  return slugs.map(({ lang, slug }) => ({ slug, lang }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = (sp.lang || "he") as Language;
  const protocol = await getProtocol(slug, lang);
  if (!protocol) return { title: "Not Found" };
  return { title: `${protocol.title} - Pure Blue Fish` };
}

export default async function ProtocolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  const lang = (sp.lang || cookieLang || "he") as Language;

  const protocol = await getProtocol(slug, lang);
  const protocolsByCategory = getProtocolsByCategory(lang);
  const categories = CATEGORIES[lang];
  const ui = UI_STRINGS[lang];

  if (!protocol) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-e border-gray-200 p-5 overflow-y-auto no-print">
        <div className="mb-4">
          <Link href={`/?lang=${lang}`} className="block">
            <Image
              src="/logo.png"
              alt="Pure Blue Fish"
              width={140}
              height={56}
              className="h-14 w-auto mb-2"
            />
            <p className="text-sm text-gray-500">{ui.farmProtocols}</p>
          </Link>
        </div>

        <div className="mb-6">
          <LanguageToggle currentLang={lang} />
        </div>

        <nav className="space-y-4">
          {Object.entries(categories).map(([key, label]) => {
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
                        href={`/${p.slug}?lang=${lang}`}
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
          <Link
            href={`/admin?lang=${lang}`}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {ui.adminLogin}
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
            <PrintButton label={ui.print} />
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
