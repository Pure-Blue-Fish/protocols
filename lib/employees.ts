// ABOUTME: Employee CRUD operations for the management page
// ABOUTME: Wraps workers table with create/update/list including inactive

import { sql } from "./db";
import type { Worker } from "./db";
import { hashPin } from "./auth";

export type EmployeeRow = Worker & { created_at: string };

export async function getAllEmployees(): Promise<EmployeeRow[]> {
  const { rows } = await sql<EmployeeRow>`
    SELECT id, name, role, phone, default_shift, is_manager, active, created_at
    FROM workers ORDER BY active DESC, name
  `;
  return rows;
}

export async function createEmployee(data: {
  name: string;
  role: string;
  phone: string;
  pin: string;
  default_shift: string;
  is_manager: boolean;
}): Promise<EmployeeRow> {
  const hashedPin = hashPin(data.pin, data.phone);
  const { rows } = await sql<EmployeeRow>`
    INSERT INTO workers (name, role, phone, pin, default_shift, is_manager)
    VALUES (${data.name}, ${data.role}, ${data.phone}, ${hashedPin}, ${data.default_shift}, ${data.is_manager})
    RETURNING id, name, role, phone, default_shift, is_manager, active, created_at
  `;
  return rows[0];
}

export async function updateEmployee(
  id: number,
  data: {
    name?: string;
    role?: string;
    phone?: string;
    pin?: string;
    default_shift?: string;
    is_manager?: boolean;
    active?: boolean;
  }
): Promise<EmployeeRow | null> {
  // Build dynamic update — Vercel Postgres sql template doesn't support dynamic SET,
  // so we read current values and merge, then do a full UPDATE.
  const { rows: current } = await sql<EmployeeRow & { pin: string }>`
    SELECT id, name, role, phone, pin, default_shift, is_manager, active, created_at
    FROM workers WHERE id = ${id}
  `;
  if (current.length === 0) return null;

  const old = current[0];
  const name = data.name ?? old.name;
  const role = data.role ?? old.role;
  const phone = data.phone ?? old.phone;
  const default_shift = data.default_shift ?? old.default_shift;
  const is_manager = data.is_manager ?? old.is_manager;
  const active = data.active ?? old.active;

  // If PIN changed, hash with the (possibly new) phone
  const pin = data.pin ? hashPin(data.pin, phone) : old.pin;

  const { rows } = await sql<EmployeeRow>`
    UPDATE workers
    SET name = ${name}, role = ${role}, phone = ${phone}, pin = ${pin},
        default_shift = ${default_shift}, is_manager = ${is_manager}, active = ${active}
    WHERE id = ${id}
    RETURNING id, name, role, phone, default_shift, is_manager, active, created_at
  `;
  return rows[0] || null;
}
