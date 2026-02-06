// ABOUTME: Vercel Postgres connection and shared types
// ABOUTME: Central DB access layer for workers and schedule

import { sql } from "@vercel/postgres";

export type Shift = "morning" | "afternoon" | "night";

export interface Worker {
  id: number;
  name: string;
  role: string;
  phone: string;
  default_shift: Shift;
  is_manager: boolean;
  active: boolean;
}

export interface Assignment {
  id: number;
  worker_id: number;
  worker_name: string;
  protocol_slug: string;
  protocol_title: string;
  date: string;
  shift: Shift;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
}

export async function getWorkers(): Promise<Worker[]> {
  const { rows } = await sql<Worker>`
    SELECT id, name, role, phone, default_shift, is_manager, active
    FROM workers WHERE active = true ORDER BY name
  `;
  return rows;
}

export async function getWorkerByPhone(phone: string): Promise<(Worker & { pin: string }) | null> {
  const { rows } = await sql<Worker & { pin: string }>`
    SELECT id, name, role, phone, pin, default_shift, is_manager, active
    FROM workers WHERE phone = ${phone} AND active = true LIMIT 1
  `;
  return rows[0] || null;
}

export async function getWorkerById(id: number): Promise<Worker | null> {
  const { rows } = await sql<Worker>`
    SELECT id, name, role, phone, default_shift, is_manager, active
    FROM workers WHERE id = ${id} AND active = true LIMIT 1
  `;
  return rows[0] || null;
}

export { sql };
