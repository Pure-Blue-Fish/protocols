// ABOUTME: Main dashboard page for protocol book with i18n support
// ABOUTME: Shows categories as cards with protocol counts

import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  getProtocolsByCategory,
  CATEGORIES,
  UI_STRINGS,
  type Language,
} from "@/lib/protocols";
import { getWorkerById, getWorkers } from "@/lib/db";
import { getTaskStatusList, getSundayOfWeek, getTodayISO } from "@/lib/schedule";
import MobileNav from "@/components/MobileNav";
import DashboardMetrics from "@/components/DashboardMetrics";
import ProtocolSearch from "@/components/ProtocolSearch";
import BottomNav from "@/components/BottomNav";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  feeding: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.582-9 8 0 2.2 1.06 4.19 2.76 5.61L4.5 21l3.24-1.62C9.04 19.78 10.48 20 12 20c4.97 0 9-3.582 9-8s-4.03-8-9-8z" />
      <circle cx="8.5" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  "water-quality": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.5c-3.04 0-5.5-2.686-5.5-6 0-4.186 5.5-11 5.5-11s5.5 6.814 5.5 11c0 3.314-2.46 6-5.5 6z" />
    </svg>
  ),
  treatments: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v3H9zm0 3v3a3 3 0 003 3v0a3 3 0 003-3V6m-3 6v9m-4 0h8" />
    </svg>
  ),
  "tank-procedures": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.59-5.59a2 2 0 010-2.83l5.59-5.59a2 2 0 012.83 0l5.59 5.59a2 2 0 010 2.83l-5.59 5.59a2 2 0 01-2.83 0zM7.5 21h9" />
    </svg>
  ),
  "pool-procedures": (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15c2.483 0 4.345-1 6-3 1.655 2 3.517 3 6 3s4.345-1 6-3M3 19c2.483 0 4.345-1 6-3 1.655 2 3.517 3 6 3s4.345-1 6-3M3 11c2.483 0 4.345-1 6-3 1.655 2 3.517 3 6 3s4.345-1 6-3" />
    </svg>
  ),
  transfers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12l-4-4m0 0l4 4M4 17h12l-4 4m0 0l4-4" />
    </svg>
  ),
  monitoring: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2l3-8 4 16 3-8h6" />
    </svg>
  ),
  arrival: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  lab: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-4 0v5.172a2 2 0 01-.586 1.414l-4.828 4.828A2 2 0 005 15.828V17a3 3 0 003 3h8a3 3 0 003-3v-1.172a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0113 8.172V3" />
    </svg>
  ),
  other: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01M12 16h.01" />
    </svg>
  ),
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLang = cookieStore.get("lang")?.value;
  const lang = (params.lang || cookieLang || "he") as Language;
  const isManager = headerStore.get("x-is-manager") === "true";
  const workerId = headerStore.get("x-worker-id");
  const workerIdNum = parseInt(workerId || "0", 10);
  let userName = "";
  if (workerIdNum > 0) {
    const worker = await getWorkerById(workerIdNum);
    if (worker) userName = worker.name;
  } else if (isManager) {
    userName = "מנהל";
  }

  // Fetch dashboard metrics for managers
  let totalTasks = 0;
  let completedTasks = 0;
  let activeWorkers = 0;
  if (isManager) {
    const sunday = getSundayOfWeek(getTodayISO());
    const [assignments, workers] = await Promise.all([
      getTaskStatusList(sunday, lang),
      getWorkers(),
    ]);
    totalTasks = assignments.length;
    completedTasks = assignments.filter((a) => a.completed).length;
    activeWorkers = workers.length;
  }

  const protocolsByCategory = getProtocolsByCategory(lang);
  const categories = CATEGORIES[lang];
  const ui = UI_STRINGS[lang];

  return (
    <div className="min-h-screen bg-surface-page">
      <MobileNav lang={lang} userName={userName} currentPage="protocols" isManager={isManager} workerId={workerId} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Manager Dashboard Metrics */}
        {isManager && (
          <DashboardMetrics
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            activeWorkers={activeWorkers}
            lang={lang}
            labels={{
              weeklyOverview: ui.weeklyOverview,
              totalTasks: ui.totalTasks,
              completedTasks: ui.completedTasks,
              completionRate: ui.completionRate,
              activeWorkersCount: ui.activeWorkersCount,
            }}
          />
        )}

        {/* Category Cards with Search */}
        <h2 className="text-lg font-semibold mb-4 text-text-primary font-heading">
          {ui.categories}
        </h2>
        <ProtocolSearch
          categories={categories}
          protocolsByCategory={Object.fromEntries(
            Object.entries(protocolsByCategory).map(([key, protocols]) => [
              key,
              protocols.map((p) => ({ slug: p.slug, title: p.title })),
            ])
          )}
          categoryIcons={CATEGORY_ICONS}
          lang={lang}
          labels={{
            protocols: ui.protocols,
            searchProtocols: ui.searchProtocols,
          }}
        />
      </div>

      {/* Footer */}
      <footer className={`mt-12 py-6 border-t border-border-default bg-surface-card ${!isManager ? "pb-20 md:pb-6" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-text-muted">
          <span>Pure Blue Fish - {ui.fishFarm}</span>
          <Link href={`/admin?lang=${lang}`} className="hover:text-text-secondary">
            {ui.adminLogin}
          </Link>
        </div>
      </footer>

      {!isManager && <BottomNav lang={lang} currentPage="protocols" />}
    </div>
  );
}
