// ABOUTME: Database setup script - creates tables and seeds initial workers
// ABOUTME: Run with: bun scripts/setup-db.ts

import { sql } from "@vercel/postgres";
import crypto from "crypto";

function hashPin(pin: string, phone: string): string {
  return crypto.createHmac("sha256", phone).update(pin).digest("hex");
}

async function setup() {
  console.log("Creating tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      default_shift TEXT NOT NULL,
      is_manager BOOLEAN NOT NULL DEFAULT FALSE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS schedule_assignments (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL REFERENCES workers(id),
      protocol_slug TEXT NOT NULL,
      date DATE NOT NULL,
      shift TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(worker_id, protocol_slug, date, shift)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS task_completions (
      id SERIAL PRIMARY KEY,
      assignment_id INTEGER NOT NULL REFERENCES schedule_assignments(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_by INTEGER NOT NULL REFERENCES workers(id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS shift_definitions (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      display_name_he TEXT NOT NULL,
      display_name_en TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_assignments_date ON schedule_assignments(date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_assignments_worker_date ON schedule_assignments(worker_id, date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_completions_assignment ON task_completions(assignment_id)`;

  // Seed default shift definitions
  const shifts = [
    { key: "morning", he: "בוקר", en: "Morning", start: "06:00", end: "14:00", order: 1 },
    { key: "afternoon", he: "צהריים", en: "Afternoon", start: "14:00", end: "22:00", order: 2 },
    { key: "night", he: "לילה", en: "Night", start: "22:00", end: "06:00", order: 3 },
  ];

  for (const s of shifts) {
    await sql`
      INSERT INTO shift_definitions (key, display_name_he, display_name_en, start_time, end_time, sort_order)
      VALUES (${s.key}, ${s.he}, ${s.en}, ${s.start}, ${s.end}, ${s.order})
      ON CONFLICT (key) DO NOTHING
    `;
  }

  console.log("Tables created.");

  // Seed workers - phone numbers and PINs are placeholders, update with real values
  const workers = [
    { name: "אודי בריל", role: "מנהל משמרת", phone: "0500000001", pin: "1234", shift: "morning", isManager: false },
    { name: "רועי לביא", role: "ביולוג", phone: "0500000002", pin: "1234", shift: "morning", isManager: true },
    { name: "סדאם סוועד", role: "טכנאי", phone: "0500000003", pin: "1234", shift: "morning", isManager: false },
    { name: "דריה גולוביצקי", role: "ביולוגית", phone: "0500000004", pin: "1234", shift: "morning", isManager: false },
    { name: "רן אייזנברג", role: "טכנאי/ביולוג", phone: "0500000005", pin: "1234", shift: "afternoon", isManager: false },
    { name: "איתי רוזן", role: "טכנאי", phone: "0500000006", pin: "1234", shift: "night", isManager: false },
    { name: "עמנואל לוישנקו", role: "טכנאי", phone: "0500000007", pin: "1234", shift: "night", isManager: false },
  ];

  console.log("Seeding workers...");
  for (const w of workers) {
    const hashedPin = hashPin(w.pin, w.phone);
    try {
      await sql`
        INSERT INTO workers (name, role, phone, pin, default_shift, is_manager)
        VALUES (${w.name}, ${w.role}, ${w.phone}, ${hashedPin}, ${w.shift}, ${w.isManager})
        ON CONFLICT (phone) DO NOTHING
      `;
      console.log(`  + ${w.name}`);
    } catch (e) {
      console.log(`  ~ ${w.name} (already exists or error: ${e})`);
    }
  }

  console.log("Done! Update phone numbers and PINs with real values.");
}

setup().catch(console.error);
