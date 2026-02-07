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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
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
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
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
      <footer className={`mt-12 py-6 border-t border-gray-200 bg-white ${!isManager ? "pb-20 md:pb-6" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <span>Pure Blue Fish - {ui.fishFarm}</span>
          <Link href={`/admin?lang=${lang}`} className="hover:text-gray-600">
            {ui.adminLogin}
          </Link>
        </div>
      </footer>

      {!isManager && <BottomNav lang={lang} currentPage="protocols" />}
    </div>
  );
}
