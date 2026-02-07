// ABOUTME: Schedule CRUD operations for assignments
// ABOUTME: Core data layer used by both API routes and AI agent

import { sql, type Assignment, type Shift } from "./db";
import { getAllProtocols, type Language } from "./protocols";

// Israel timezone for "today" calculations
export function getTodayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

// Get Monday of the week containing a given date (ISO week starts Sunday for Israel)
export function getSundayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay(); // 0=Sunday
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().split("T")[0];
}

export function getWeekDates(sundayStr: string): string[] {
  const dates: string[] = [];
  const d = new Date(sundayStr + "T12:00:00Z");
  for (let i = 0; i < 7; i++) {
    dates.push(d.toISOString().split("T")[0]);
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dates;
}

// Build a protocol title lookup map
function buildProtocolTitleMap(lang: Language): Record<string, string> {
  const protocols = getAllProtocols(lang);
  const map: Record<string, string> = {};
  for (const p of protocols) {
    map[p.slug] = p.title;
  }
  return map;
}

export async function getWorkerTasksForDate(
  workerId: number,
  date: string,
  lang: Language = "he"
): Promise<Assignment[]> {
  const titleMap = buildProtocolTitleMap(lang);

  const { rows } = await sql<{
    id: number;
    worker_id: number;
    worker_name: string;
    protocol_slug: string;
    date: string;
    shift: Shift;
    notes: string | null;
    completed_at: string | null;
  }>`
    SELECT sa.id, sa.worker_id, w.name as worker_name, sa.protocol_slug,
           sa.date::text, sa.shift, sa.notes,
           tc.completed_at::text
    FROM schedule_assignments sa
    JOIN workers w ON w.id = sa.worker_id
    LEFT JOIN task_completions tc ON tc.assignment_id = sa.id
    WHERE sa.worker_id = ${workerId} AND sa.date = ${date}
    ORDER BY
      CASE sa.shift WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'night' THEN 3 END,
      sa.protocol_slug
  `;

  return rows.map((r) => ({
    id: r.id,
    worker_id: r.worker_id,
    worker_name: r.worker_name,
    protocol_slug: r.protocol_slug,
    protocol_title: titleMap[r.protocol_slug] || r.protocol_slug,
    date: r.date,
    shift: r.shift,
    notes: r.notes,
    completed: r.completed_at !== null,
    completed_at: r.completed_at,
  })) as Assignment[];
}

export async function getWeekSchedule(
  sundayStr: string,
  lang: Language = "he"
): Promise<Record<string, Record<Shift, Assignment[]>>> {
  const dates = getWeekDates(sundayStr);
  const titleMap = buildProtocolTitleMap(lang);
  const startDate = dates[0];
  const endDate = dates[6];

  const { rows } = await sql<{
    id: number;
    worker_id: number;
    worker_name: string;
    protocol_slug: string;
    date: string;
    shift: Shift;
    notes: string | null;
    completed_at: string | null;
  }>`
    SELECT sa.id, sa.worker_id, w.name as worker_name, sa.protocol_slug,
           sa.date::text, sa.shift, sa.notes,
           tc.completed_at::text
    FROM schedule_assignments sa
    JOIN workers w ON w.id = sa.worker_id
    LEFT JOIN task_completions tc ON tc.assignment_id = sa.id
    WHERE sa.date >= ${startDate} AND sa.date <= ${endDate}
    ORDER BY sa.date, sa.shift, w.name
  `;

  // Initialize empty structure
  const schedule: Record<string, Record<Shift, Assignment[]>> = {};
  for (const date of dates) {
    schedule[date] = { morning: [], afternoon: [], night: [] };
  }

  for (const r of rows) {
    const dateKey = r.date;
    if (schedule[dateKey] && schedule[dateKey][r.shift]) {
      schedule[dateKey][r.shift].push({
        id: r.id,
        worker_id: r.worker_id,
        worker_name: r.worker_name,
        protocol_slug: r.protocol_slug,
        protocol_title: titleMap[r.protocol_slug] || r.protocol_slug,
        date: r.date,
        shift: r.shift,
        notes: r.notes,
        completed: r.completed_at !== null,
        completed_at: r.completed_at,
      } as Assignment);
    }
  }

  return schedule;
}

export async function getTaskStatusList(
  sundayStr: string,
  lang: Language = "he",
  workerId?: number
): Promise<Assignment[]> {
  const dates = getWeekDates(sundayStr);
  const titleMap = buildProtocolTitleMap(lang);
  const startDate = dates[0];
  const endDate = dates[6];

  const { rows } = workerId
    ? await sql<{
        id: number;
        worker_id: number;
        worker_name: string;
        protocol_slug: string;
        date: string;
        shift: Shift;
        notes: string | null;
        completed_at: string | null;
      }>`
        SELECT sa.id, sa.worker_id, w.name as worker_name, sa.protocol_slug,
               sa.date::text, sa.shift, sa.notes,
               tc.completed_at::text
        FROM schedule_assignments sa
        JOIN workers w ON w.id = sa.worker_id
        LEFT JOIN task_completions tc ON tc.assignment_id = sa.id
        WHERE sa.date >= ${startDate} AND sa.date <= ${endDate}
          AND sa.worker_id = ${workerId}
        ORDER BY sa.date, w.name,
          CASE sa.shift WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'night' THEN 3 END
      `
    : await sql<{
        id: number;
        worker_id: number;
        worker_name: string;
        protocol_slug: string;
        date: string;
        shift: Shift;
        notes: string | null;
        completed_at: string | null;
      }>`
        SELECT sa.id, sa.worker_id, w.name as worker_name, sa.protocol_slug,
               sa.date::text, sa.shift, sa.notes,
               tc.completed_at::text
        FROM schedule_assignments sa
        JOIN workers w ON w.id = sa.worker_id
        LEFT JOIN task_completions tc ON tc.assignment_id = sa.id
        WHERE sa.date >= ${startDate} AND sa.date <= ${endDate}
        ORDER BY sa.date, w.name,
          CASE sa.shift WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 WHEN 'night' THEN 3 END
      `;

  return rows.map((r) => ({
    id: r.id,
    worker_id: r.worker_id,
    worker_name: r.worker_name,
    protocol_slug: r.protocol_slug,
    protocol_title: titleMap[r.protocol_slug] || r.protocol_slug,
    date: r.date,
    shift: r.shift,
    notes: r.notes,
    completed: r.completed_at !== null,
    completed_at: r.completed_at,
  })) as Assignment[];
}

export async function assignTask(
  workerId: number,
  protocolSlug: string,
  date: string,
  shift: Shift,
  notes?: string
): Promise<{ id: number }> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO schedule_assignments (worker_id, protocol_slug, date, shift, notes)
    VALUES (${workerId}, ${protocolSlug}, ${date}, ${shift}, ${notes || null})
    ON CONFLICT (worker_id, protocol_slug, date, shift)
    DO UPDATE SET notes = COALESCE(${notes || null}, schedule_assignments.notes)
    RETURNING id
  `;
  return rows[0];
}

export async function removeTask(
  workerId: number,
  protocolSlug: string,
  date: string,
  shift: Shift
): Promise<boolean> {
  const { rowCount } = await sql`
    DELETE FROM schedule_assignments
    WHERE worker_id = ${workerId} AND protocol_slug = ${protocolSlug}
      AND date = ${date} AND shift = ${shift}
  `;
  return (rowCount ?? 0) > 0;
}

export async function clearDay(date: string, shift?: Shift): Promise<number> {
  if (shift) {
    const { rowCount } = await sql`
      DELETE FROM schedule_assignments WHERE date = ${date} AND shift = ${shift}
    `;
    return rowCount ?? 0;
  }
  const { rowCount } = await sql`
    DELETE FROM schedule_assignments WHERE date = ${date}
  `;
  return rowCount ?? 0;
}

export async function copyWeek(
  sourceSunday: string,
  targetSunday: string
): Promise<number> {
  const sourceDates = getWeekDates(sourceSunday);
  const targetDates = getWeekDates(targetSunday);

  // Clear target week first
  await sql`
    DELETE FROM schedule_assignments
    WHERE date >= ${targetDates[0]} AND date <= ${targetDates[6]}
  `;

  // Copy with date offset
  let copied = 0;
  for (let i = 0; i < 7; i++) {
    const { rowCount } = await sql`
      INSERT INTO schedule_assignments (worker_id, protocol_slug, date, shift, notes)
      SELECT worker_id, protocol_slug, ${targetDates[i]}::date, shift, notes
      FROM schedule_assignments
      WHERE date = ${sourceDates[i]}
      ON CONFLICT DO NOTHING
    `;
    copied += rowCount ?? 0;
  }
  return copied;
}

export async function toggleComplete(
  assignmentId: number,
  workerId: number
): Promise<boolean> {
  // Check if already completed
  const { rows: existing } = await sql<{ id: number }>`
    SELECT id FROM task_completions WHERE assignment_id = ${assignmentId} LIMIT 1
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM task_completions WHERE assignment_id = ${assignmentId}`;
    return false;
  }

  await sql`
    INSERT INTO task_completions (assignment_id, completed_by)
    VALUES (${assignmentId}, ${workerId})
  `;
  return true;
}
