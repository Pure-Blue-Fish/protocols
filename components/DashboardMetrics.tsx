// ABOUTME: Manager dashboard metrics - 4 stat cards (tasks, completed, rate, workers)
// ABOUTME: Server component receiving pre-fetched data as props

interface DashboardMetricsProps {
  totalTasks: number;
  completedTasks: number;
  activeWorkers: number;
  labels: {
    weeklyOverview: string;
    totalTasks: string;
    completedTasks: string;
    completionRate: string;
    activeWorkersCount: string;
  };
}

const METRIC_STYLES = [
  { icon: "📋", bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200" },
  { icon: "✅", bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200" },
  { icon: "📊", bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200" },
  { icon: "👥", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200" },
];

export default function DashboardMetrics({
  totalTasks,
  completedTasks,
  activeWorkers,
  labels,
}: DashboardMetricsProps) {
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const metrics = [
    { label: labels.totalTasks, value: totalTasks },
    { label: labels.completedTasks, value: completedTasks },
    { label: labels.completionRate, value: `${rate}%` },
    { label: labels.activeWorkersCount, value: activeWorkers },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 text-gray-700">{labels.weeklyOverview}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => {
          const style = METRIC_STYLES[i];
          return (
            <div
              key={m.label}
              className={`${style.bg} rounded-xl p-4 ring-1 ${style.ring} animate-fade-in-up`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-2xl mb-1">{style.icon}</div>
              <div className={`text-2xl font-bold ${style.text}`}>{m.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
