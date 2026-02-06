// ABOUTME: Worker daily task view - shows today's assignments
// ABOUTME: Mobile-first layout with completion toggles and protocol links

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import { UI_STRINGS, type Language } from "@/lib/i18n";

interface TaskData {
  id: number;
  protocol_slug: string;
  protocol_title: string;
  shift: "morning" | "afternoon" | "night";
  notes: string | null;
  completed: boolean;
}

interface MyTasksResponse {
  date: string;
  worker: { id: number; name: string; role: string };
  tasks: TaskData[];
}

export default function MyTasksPage() {
  const [data, setData] = useState<MyTasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang] = useState<Language>("he");

  const ui = UI_STRINGS[lang];

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/my-tasks?lang=${lang}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent fail — will show empty state
    }
    setLoading(false);
  }, [lang]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completedCount = data?.tasks.filter((t) => t.completed).length || 0;
  const totalCount = data?.tasks.length || 0;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Pure Blue Fish" width={80} height={32} className="h-8 w-auto" />
              {data && (
                <div>
                  <p className="text-sm font-medium text-gray-800">{data.worker.name}</p>
                  <p className="text-xs text-gray-400">{data.worker.role}</p>
                </div>
              )}
            </div>
            <Link
              href={`/?lang=${lang}`}
              className="px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {ui.protocols}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : !data || data.tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-lg text-gray-500">{ui.noTasks}</p>
          </div>
        ) : (
          <>
            {/* Date & progress */}
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-800 mb-1">
                {ui.myTasks}
              </h1>
              <p className="text-sm text-gray-500">{formatDate(data.date)}</p>
              {totalCount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{completedCount} / {totalCount}</span>
                    <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Task cards */}
            <div className="space-y-3">
              {data.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  assignmentId={task.id}
                  protocolSlug={task.protocol_slug}
                  protocolTitle={task.protocol_title}
                  shift={task.shift}
                  notes={task.notes}
                  completed={task.completed}
                  lang={lang}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
