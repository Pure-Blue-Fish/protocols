// ABOUTME: System prompt builder for the schedule AI agent
// ABOUTME: Injects workers, protocols, and current schedule into context

import { getWorkers } from "./db";
import type { Shift } from "./db";
import { getAllProtocols } from "./protocols";
import { getWeekSchedule } from "./schedule";
import type { Language } from "./i18n";

function formatShift(shift: Shift, lang: Language): string {
  const labels: Record<Shift, Record<Language, string>> = {
    morning: { he: "בוקר", en: "morning" },
    afternoon: { he: "צהריים", en: "afternoon" },
    night: { he: "לילה", en: "night" },
  };
  return labels[shift][lang];
}

const DAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function formatScheduleForPrompt(
  schedule: Record<string, Record<Shift, { worker_name: string; protocol_title: string; notes: string | null }[]>>,
): string {
  const lines: string[] = [];
  const dates = Object.keys(schedule).sort();

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayName = DAY_NAMES_HE[i] || date;
    const dayData = schedule[date];

    const shifts: Shift[] = ["morning", "afternoon", "night"];
    for (const shift of shifts) {
      const assignments = dayData[shift] || [];
      if (assignments.length > 0) {
        lines.push(`יום ${dayName} (${date}) - ${formatShift(shift, "he")}:`);
        for (const a of assignments) {
          lines.push(`  - ${a.worker_name}: ${a.protocol_title}${a.notes ? ` (${a.notes})` : ""}`);
        }
      }
    }
  }

  return lines.length > 0 ? lines.join("\n") : "(לוח ריק - אין משימות השבוע)";
}

export async function buildScheduleSystemPrompt(
  week: string,
  lang: Language = "he"
): Promise<string> {
  const workers = await getWorkers();
  const protocols = getAllProtocols(lang);
  const schedule = await getWeekSchedule(week, lang);

  const workersSection = workers
    .map((w) => `- ${w.name} (${w.role}) - משמרת ברירת מחדל: ${formatShift(w.default_shift, "he")}`)
    .join("\n");

  const protocolsSection = protocols
    .map((p) => `- ${p.slug}: ${p.title} (${p.category}${p.frequency ? `, ${p.frequency}` : ""})`)
    .join("\n");

  const scheduleSection = formatScheduleForPrompt(schedule);

  return `אתה עוזר ניהול לוח עבודה של חוות הדגים Pure Blue Fish.
אתה עוזר למנהל (רועי) ליצור ולשנות את לוח העבודה השבועי.
ענה בעברית. אתה מבין עברית ואנגלית.

שבוע נוכחי: ${week}

עובדים:
${workersSection}

פרוטוקולים זמינים (משימות שאפשר לשבץ):
${protocolsSection}

לוח עבודה נוכחי:
${scheduleSection}

משמרות:
- morning (בוקר): 06:00-14:00
- afternoon (צהריים): 14:00-22:00
- night (לילה): 22:00-06:00

כללים:
- לכל עובד יש משמרת ברירת מחדל אבל אפשר לשבץ אותו למשמרות אחרות
- פרוטוקולים יומיים (כמו חמצן, האכלה) צריכים להיות משובצים כל יום
- לעובד יכולים להיות מספר פרוטוקולים במשמרת
- כשמעתיקים שבוע, שמור על המבנה אבל עדכן תאריכים
- אם לא ברור מה המנהל רוצה, שאל לפני שתבצע שינויים
- השתמש בשם העובד בעברית (לא ID) כשמזהה עובדים
- השתמש ב-protocol_slug (באנגלית) כשמזהה פרוטוקולים

כשהמנהל נותן הוראות, השתמש בכלים הזמינים כדי לשנות את הלוח.
אחרי שינויים, אשר בקצרה מה עשית.
אם הלוח ריק, תציע להעתיק מהשבוע הקודם.`;
}
