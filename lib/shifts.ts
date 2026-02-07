// ABOUTME: Shift definition CRUD operations
// ABOUTME: Manages shift types (name, times, active status)

import { sql } from "./db";

export interface ShiftDefinition {
  id: number;
  key: string;
  display_name_he: string;
  display_name_en: string;
  start_time: string;
  end_time: string;
  sort_order: number;
  active: boolean;
}

export async function getShiftDefinitions(): Promise<ShiftDefinition[]> {
  const { rows } = await sql<ShiftDefinition>`
    SELECT id, key, display_name_he, display_name_en, start_time, end_time, sort_order, active
    FROM shift_definitions ORDER BY sort_order, key
  `;
  return rows;
}

export async function createShiftDefinition(data: {
  key: string;
  display_name_he: string;
  display_name_en: string;
  start_time: string;
  end_time: string;
  sort_order?: number;
}): Promise<ShiftDefinition> {
  const order = data.sort_order ?? 0;
  const { rows } = await sql<ShiftDefinition>`
    INSERT INTO shift_definitions (key, display_name_he, display_name_en, start_time, end_time, sort_order)
    VALUES (${data.key}, ${data.display_name_he}, ${data.display_name_en}, ${data.start_time}, ${data.end_time}, ${order})
    RETURNING id, key, display_name_he, display_name_en, start_time, end_time, sort_order, active
  `;
  return rows[0];
}

export async function updateShiftDefinition(
  key: string,
  data: {
    display_name_he?: string;
    display_name_en?: string;
    start_time?: string;
    end_time?: string;
    sort_order?: number;
    active?: boolean;
  }
): Promise<ShiftDefinition | null> {
  const { rows: current } = await sql<ShiftDefinition>`
    SELECT * FROM shift_definitions WHERE key = ${key}
  `;
  if (current.length === 0) return null;

  const old = current[0];
  const he = data.display_name_he ?? old.display_name_he;
  const en = data.display_name_en ?? old.display_name_en;
  const start = data.start_time ?? old.start_time;
  const end = data.end_time ?? old.end_time;
  const order = data.sort_order ?? old.sort_order;
  const active = data.active ?? old.active;

  const { rows } = await sql<ShiftDefinition>`
    UPDATE shift_definitions
    SET display_name_he = ${he}, display_name_en = ${en},
        start_time = ${start}, end_time = ${end},
        sort_order = ${order}, active = ${active}
    WHERE key = ${key}
    RETURNING id, key, display_name_he, display_name_en, start_time, end_time, sort_order, active
  `;
  return rows[0] || null;
}
