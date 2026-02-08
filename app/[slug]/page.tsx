// ABOUTME: Protocol detail page with i18n support
// ABOUTME: Shows single protocol content with responsive sidebar/header

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
    <div className="min-h-screen">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-header-from to-header-to shadow-elevated sticky top-0 z-10 no-print">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href={`/?lang=${lang}`} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="bg-white/95 rounded-lg p-1">
              <Image
                src="/logo.png"
                alt="Pure Blue Fish"
                width={80}
                height={32}
                className="h-7 w-auto"
              />
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle currentLang={lang} />
            <PrintButton label={ui.print} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-72 bg-surface-card border-e border-border-default p-5 overflow-y-auto no-print fixed h-screen">
          <div className="mb-4">
            <Link href={`/?lang=${lang}`} className="block">
              <Image
                src="/logo.png"
                alt="Pure Blue Fish"
                width={140}
                height={56}
                className="h-14 w-auto mb-2"
              />
              <p className="text-sm text-text-secondary">{ui.farmProtocols}</p>
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
                  <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 pb-1 border-b border-border-subtle font-heading">
                    {label}
                  </h2>
                  <ul className="space-y-1">
                    {protocols.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/${p.slug}?lang=${lang}`}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            p.slug === slug
                              ? "bg-brand-primary text-white"
                              : "text-text-secondary hover:bg-brand-primary-light hover:text-brand-primary"
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

          <div className="mt-8 pt-4 border-t border-border-subtle">
            <Link
              href={`/admin?lang=${lang}`}
              className="text-xs text-text-muted hover:text-text-secondary"
            >
              {ui.adminLogin}
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ms-72">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 no-print">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{protocol.title}</h1>
                  <p className="text-text-secondary text-sm mt-1">
                    {protocol.protocolNumber} | {protocol.frequency}
                  </p>
                </div>
                <div className="hidden lg:block">
                  <PrintButton label={ui.print} />
                </div>
              </div>

              <div
                className="protocol-content bg-surface-card rounded-2xl p-4 sm:p-6 shadow-card border border-border-subtle"
                dangerouslySetInnerHTML={{ __html: protocol.content }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
