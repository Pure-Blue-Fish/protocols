// ABOUTME: System prompt builder for the schedule AI agent
// ABOUTME: Injects workers, protocols, and current schedule into English context

import { getWorkers } from "./db";
import type { Shift } from "./db";
import { getAllProtocols } from "./protocols";
import { getWeekSchedule } from "./schedule";
import { getShiftDefinitions } from "./shifts";
import type { Language } from "./i18n";

const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatScheduleForPrompt(
  schedule: Record<string, Record<Shift, { worker_name: string; protocol_title: string; notes: string | null }[]>>,
): string {
  const lines: string[] = [];
  const dates = Object.keys(schedule).sort();

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayName = DAY_NAMES_EN[i] || date;
    const dayData = schedule[date];

    const shifts: Shift[] = ["morning", "afternoon", "night"];
    for (const shift of shifts) {
      const assignments = dayData[shift] || [];
      if (assignments.length > 0) {
        lines.push(`${dayName} (${date}) - ${shift}:`);
        for (const a of assignments) {
          lines.push(`  - ${a.worker_name}: ${a.protocol_title}${a.notes ? ` (${a.notes})` : ""}`);
        }
      }
    }
  }

  return lines.length > 0 ? lines.join("\n") : "(Empty schedule — no tasks this week)";
}

export async function buildScheduleSystemPrompt(
  week: string,
  lang: Language = "he"
): Promise<string> {
  const workers = await getWorkers();
  const protocols = getAllProtocols(lang);
  const schedule = await getWeekSchedule(week, lang);
  const shiftDefs = await getShiftDefinitions();

  const workersSection = workers
    .map((w) => `- ${w.name} (${w.role}) - default shift: ${w.default_shift}${w.active ? "" : " [INACTIVE]"}`)
    .join("\n");

  const shiftDefsSection = shiftDefs
    .filter((s) => s.active)
    .map((s) => `- ${s.key}: ${s.display_name_he} (${s.start_time}-${s.end_time})`)
    .join("\n");

  const protocolsSection = protocols
    .map((p) => `- ${p.slug}: ${p.title} (${p.category}${p.frequency ? `, ${p.frequency}` : ""})`)
    .join("\n");

  const scheduleSection = formatScheduleForPrompt(schedule);

  // Build explicit date list so the AI knows each day's exact date
  const weekDates: string[] = [];
  const d = new Date(week + "T12:00:00Z");
  for (let i = 0; i < 7; i++) {
    const dateStr = d.toISOString().split("T")[0];
    weekDates.push(`- ${DAY_NAMES_EN[i]}: ${dateStr}`);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  const weekDatesSection = weekDates.join("\n");

  return `You are a schedule management assistant for Pure Blue Fish fish farm.
You help the manager (Roie) create and modify the weekly work schedule.
Respond in the same language the user writes in. The user typically writes in Hebrew.

Current week: ${week}
Week days and their exact dates:
${weekDatesSection}

Workers:
${workersSection}

Available protocols (tasks that can be assigned):
${protocolsSection}

Current schedule:
${scheduleSection}

Shift definitions:
${shiftDefsSection}

Rules:
- CRITICAL: When assigning tasks, use the correct date from the "Week days and their exact dates" list above. Each day has a DIFFERENT date!
- If the manager says "every day" or "all mornings", create a SEPARATE assignment for each of the 7 days with its correct date.
- Each worker has a default shift but can be assigned to other shifts.
- Daily protocols (like oxygen, feeding) should be assigned every day.
- A worker can have multiple protocols per shift.
- When copying a week, keep the structure but update dates.
- If the manager's intent is unclear, ask before making changes.
- Use worker names in Hebrew (not IDs) when identifying workers.
- Use protocol_slug (in English) when identifying protocols.
- You can manage employees (add, update, deactivate) and the weekly roster via tools.
- NEVER set or change PINs via chat — direct the manager to the employees page for that.

When the manager gives instructions, use the available tools to modify the schedule.
After changes, briefly confirm what you did.
If the schedule is empty, suggest copying from the previous week.`;
}
