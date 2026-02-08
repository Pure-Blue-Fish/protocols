// ABOUTME: Manager dashboard metrics - 4 clickable stat cards
// ABOUTME: Links to task-status (with filters) and employees page

import Link from "next/link";

interface DashboardMetricsProps {
  totalTasks: number;
  completedTasks: number;
  activeWorkers: number;
  lang: string;
  labels: {
    weeklyOverview: string;
    totalTasks: string;
    completedTasks: string;
    completionRate: string;
    activeWorkersCount: string;
  };
}

const METRIC_ICONS: React.ReactNode[] = [
  <svg key="tasks" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h.01M12 16h.01" />
  </svg>,
  <svg key="done" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg key="rate" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2l3-8 4 16 3-8h6" />
  </svg>,
  <svg key="workers" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>,
];

const METRIC_STYLES = [
  { bg: "bg-brand-primary-light", text: "text-brand-primary", ring: "ring-brand-primary/20" },
  { bg: "bg-brand-success-light", text: "text-brand-success", ring: "ring-brand-success/20" },
  { bg: "bg-[#f5f3ff]", text: "text-[#7c3aed]", ring: "ring-[#7c3aed]/20" },
  { bg: "bg-brand-warning-light", text: "text-brand-warning", ring: "ring-brand-warning/20" },
];

export default function DashboardMetrics({
  totalTasks,
  completedTasks,
  activeWorkers,
  lang,
  labels,
}: DashboardMetricsProps) {
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const metrics = [
    { label: labels.totalTasks, value: totalTasks, href: `/task-status?lang=${lang}` },
    { label: labels.completedTasks, value: completedTasks, href: `/task-status?lang=${lang}&status=completed` },
    { label: labels.completionRate, value: `${rate}%`, href: `/task-status?lang=${lang}` },
    { label: labels.activeWorkersCount, value: activeWorkers, href: `/employees?lang=${lang}` },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 text-text-primary font-heading">{labels.weeklyOverview}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const style = METRIC_STYLES[i];
          return (
            <Link
              key={m.label}
              href={m.href}
              className={`${style.bg} rounded-2xl p-4 ring-1 ${style.ring} animate-fade-in-up hover:shadow-card-hover hover:translate-y-[-1px] transition-all`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`mb-2 ${style.text}`}>{METRIC_ICONS[i]}</div>
              <div className={`text-2xl font-bold font-heading ${style.text}`}>{m.value}</div>
              <div className="text-xs text-text-muted mt-0.5">{m.label}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
