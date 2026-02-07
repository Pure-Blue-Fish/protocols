// ABOUTME: Schedule AI tools - supports both OpenAI and Gemini providers
// ABOUTME: Tool definitions, fuzzy name matching, and provider-agnostic executor

import { Type, type FunctionDeclaration } from "@google/genai";
import { getWorkers, type Worker, type Shift } from "./db";
import {
  assignTask,
  removeTask,
  clearDay,
  copyWeek,
  getWeekSchedule,
} from "./schedule";
import { getAllProtocols } from "./protocols";
import { getAllEmployees, createEmployee, updateEmployee } from "./employees";
import { getShiftDefinitions } from "./shifts";
import type { Language } from "./i18n";

// Fuzzy match a worker name to a worker record
async function resolveWorker(name: string): Promise<Worker | null> {
  const workers = await getWorkers();

  // Exact match
  const exact = workers.find((w) => w.name === name);
  if (exact) return exact;

  // First name match
  const firstName = name.trim().split(" ")[0];
  const byFirst = workers.filter((w) => w.name.startsWith(firstName));
  if (byFirst.length === 1) return byFirst[0];

  // Partial match (any word)
  const partial = workers.filter((w) =>
    w.name.includes(name) || name.includes(w.name.split(" ")[0])
  );
  if (partial.length === 1) return partial[0];

  return null;
}

// Fuzzy match a protocol slug/name
function resolveProtocol(input: string, lang: Language = "he"): string | null {
  const protocols = getAllProtocols(lang);

  // Exact slug match
  const exact = protocols.find((p) => p.slug === input);
  if (exact) return exact.slug;

  // Title match
  const byTitle = protocols.find(
    (p) => p.title === input || p.title.includes(input) || input.includes(p.title)
  );
  if (byTitle) return byTitle.slug;

  // Partial slug match
  const bySlug = protocols.find((p) => p.slug.includes(input) || input.includes(p.slug));
  if (bySlug) return bySlug.slug;

  return null;
}

export interface ToolResult {
  success: boolean;
  message: string;
  error?: string;
}

// --- OpenAI format ---
export const openaiToolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "assign_task",
      description: "Assign a protocol/task to a worker for a specific day and shift",
      parameters: {
        type: "object",
        properties: {
          worker_name: {
            type: "string",
            description: "Worker's name (Hebrew, can be first name only)",
          },
          protocol_slug: {
            type: "string",
            description: "Protocol slug identifier (e.g. 'feed-fattening', 'oxygen', 'daily-clean')",
          },
          date: {
            type: "string",
            description: "ISO date string (YYYY-MM-DD)",
          },
          shift: {
            type: "string",
            enum: ["morning", "afternoon", "night"],
            description: "Shift: morning, afternoon, or night",
          },
          notes: {
            type: "string",
            description: "Optional notes for this assignment",
          },
        },
        required: ["worker_name", "protocol_slug", "date", "shift"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "remove_task",
      description: "Remove a specific assignment from the schedule",
      parameters: {
        type: "object",
        properties: {
          worker_name: { type: "string", description: "Worker's name" },
          protocol_slug: { type: "string", description: "Protocol slug" },
          date: { type: "string", description: "ISO date (YYYY-MM-DD)" },
          shift: { type: "string", enum: ["morning", "afternoon", "night"] },
        },
        required: ["worker_name", "protocol_slug", "date", "shift"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "copy_week",
      description:
        "Copy all assignments from one week to another. Overwrites the target week. Week dates should be Sunday dates.",
      parameters: {
        type: "object",
        properties: {
          source_week: {
            type: "string",
            description: "Sunday date of source week (YYYY-MM-DD)",
          },
          target_week: {
            type: "string",
            description: "Sunday date of target week (YYYY-MM-DD)",
          },
        },
        required: ["source_week", "target_week"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_schedule",
      description: "Get the current schedule for a specific week",
      parameters: {
        type: "object",
        properties: {
          week: {
            type: "string",
            description: "Sunday date of the week (YYYY-MM-DD)",
          },
        },
        required: ["week"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "clear_day",
      description: "Remove all assignments for a specific day, optionally filtered by shift",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "ISO date (YYYY-MM-DD)" },
          shift: {
            type: "string",
            enum: ["morning", "afternoon", "night"],
            description: "Optional: clear only this shift",
          },
        },
        required: ["date"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_employees",
      description: "List all employees with their roles, default shifts, and active status",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "add_employee",
      description: "Add a new employee to the system",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Employee full name (Hebrew)" },
          role: { type: "string", description: "Job role/title (Hebrew)" },
          phone: { type: "string", description: "Phone number (10 digits, e.g. 0501234567)" },
          pin: { type: "string", description: "4-digit PIN code for login" },
          default_shift: { type: "string", description: "Default shift: morning, afternoon, or night" },
        },
        required: ["name", "role", "phone", "pin", "default_shift"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_employee",
      description: "Update an employee's role, default shift, or active status. Cannot change PIN via chat.",
      parameters: {
        type: "object",
        properties: {
          employee_name: { type: "string", description: "Employee name (Hebrew, can be first name only)" },
          role: { type: "string", description: "New role (optional)" },
          default_shift: { type: "string", description: "New default shift (optional)" },
          active: { type: "boolean", description: "Set to false to deactivate, true to reactivate (optional)" },
        },
        required: ["employee_name"],
      },
    },
  },
];

// --- Gemini format ---
export const geminiToolDeclarations: FunctionDeclaration[] = [
  {
    name: "assign_task",
    description: "Assign a protocol/task to a worker for a specific day and shift",
    parameters: {
      type: Type.OBJECT,
      properties: {
        worker_name: { type: Type.STRING, description: "Worker's name (Hebrew, can be first name only)" },
        protocol_slug: { type: Type.STRING, description: "Protocol slug identifier (e.g. 'feed-fattening', 'oxygen')" },
        date: { type: Type.STRING, description: "ISO date string (YYYY-MM-DD)" },
        shift: { type: Type.STRING, description: "Shift: morning, afternoon, or night" },
        notes: { type: Type.STRING, description: "Optional notes for this assignment" },
      },
      required: ["worker_name", "protocol_slug", "date", "shift"],
    },
  },
  {
    name: "remove_task",
    description: "Remove a specific assignment from the schedule",
    parameters: {
      type: Type.OBJECT,
      properties: {
        worker_name: { type: Type.STRING, description: "Worker's name" },
        protocol_slug: { type: Type.STRING, description: "Protocol slug" },
        date: { type: Type.STRING, description: "ISO date (YYYY-MM-DD)" },
        shift: { type: Type.STRING, description: "Shift: morning, afternoon, or night" },
      },
      required: ["worker_name", "protocol_slug", "date", "shift"],
    },
  },
  {
    name: "copy_week",
    description: "Copy all assignments from one week to another. Overwrites the target week. Week dates should be Sunday dates.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        source_week: { type: Type.STRING, description: "Sunday date of source week (YYYY-MM-DD)" },
        target_week: { type: Type.STRING, description: "Sunday date of target week (YYYY-MM-DD)" },
      },
      required: ["source_week", "target_week"],
    },
  },
  {
    name: "get_schedule",
    description: "Get the current schedule for a specific week",
    parameters: {
      type: Type.OBJECT,
      properties: {
        week: { type: Type.STRING, description: "Sunday date of the week (YYYY-MM-DD)" },
      },
      required: ["week"],
    },
  },
  {
    name: "clear_day",
    description: "Remove all assignments for a specific day, optionally filtered by shift",
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "ISO date (YYYY-MM-DD)" },
        shift: { type: Type.STRING, description: "Optional: morning, afternoon, or night" },
      },
      required: ["date"],
    },
  },
  {
    name: "list_employees",
    description: "List all employees with their roles, default shifts, and active status",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "add_employee",
    description: "Add a new employee to the system",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Employee full name (Hebrew)" },
        role: { type: Type.STRING, description: "Job role/title (Hebrew)" },
        phone: { type: Type.STRING, description: "Phone number (10 digits, e.g. 0501234567)" },
        pin: { type: Type.STRING, description: "4-digit PIN code for login" },
        default_shift: { type: Type.STRING, description: "Default shift: morning, afternoon, or night" },
      },
      required: ["name", "role", "phone", "pin", "default_shift"],
    },
  },
  {
    name: "update_employee",
    description: "Update an employee's role, default shift, or active status. Cannot change PIN via chat.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        employee_name: { type: Type.STRING, description: "Employee name (Hebrew, can be first name only)" },
        role: { type: Type.STRING, description: "New role (optional)" },
        default_shift: { type: Type.STRING, description: "New default shift (optional)" },
        active: { type: Type.BOOLEAN, description: "Set to false to deactivate, true to reactivate (optional)" },
      },
      required: ["employee_name"],
    },
  },
];

export async function executeScheduleTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "assign_task": {
      const workerName = args.worker_name as string;
      const protocolInput = args.protocol_slug as string;
      const date = args.date as string;
      const shift = args.shift as Shift;
      const notes = args.notes as string | undefined;

      const worker = await resolveWorker(workerName);
      if (!worker) {
        return {
          success: false,
          message: `לא מצאתי עובד בשם "${workerName}"`,
          error: "worker_not_found",
        };
      }

      const slug = resolveProtocol(protocolInput);
      if (!slug) {
        return {
          success: false,
          message: `לא מצאתי פרוטוקול "${protocolInput}"`,
          error: "protocol_not_found",
        };
      }

      await assignTask(worker.id, slug, date, shift, notes);
      return {
        success: true,
        message: `שובץ ${worker.name} → ${slug} ביום ${date} (${shift})`,
      };
    }

    case "remove_task": {
      const worker = await resolveWorker(args.worker_name as string);
      if (!worker) {
        return {
          success: false,
          message: `לא מצאתי עובד בשם "${args.worker_name}"`,
          error: "worker_not_found",
        };
      }

      const slug = resolveProtocol(args.protocol_slug as string);
      if (!slug) {
        return {
          success: false,
          message: `לא מצאתי פרוטוקול "${args.protocol_slug}"`,
          error: "protocol_not_found",
        };
      }

      const removed = await removeTask(
        worker.id,
        slug,
        args.date as string,
        args.shift as Shift
      );
      return {
        success: removed,
        message: removed
          ? `הוסר: ${worker.name} ← ${slug} (${args.date}, ${args.shift})`
          : `לא נמצא שיבוץ למחיקה`,
      };
    }

    case "copy_week": {
      const source = args.source_week as string;
      const target = args.target_week as string;
      const copied = await copyWeek(source, target);
      return {
        success: true,
        message: `הועתקו ${copied} שיבוצים משבוע ${source} לשבוע ${target}`,
      };
    }

    case "get_schedule": {
      const week = args.week as string;
      const schedule = await getWeekSchedule(week, "he");
      const dates = Object.keys(schedule).sort();
      const lines: string[] = [];
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const day = schedule[date];
        const shifts: Shift[] = ["morning", "afternoon", "night"];
        for (const shift of shifts) {
          const assignments = day[shift] || [];
          if (assignments.length > 0) {
            lines.push(`${dayNames[i]} (${date}) ${shift}:`);
            for (const a of assignments) {
              lines.push(`  ${a.worker_name}: ${a.protocol_title}`);
            }
          }
        }
      }

      return {
        success: true,
        message: lines.length > 0 ? lines.join("\n") : "Schedule is empty for this week",
      };
    }

    case "clear_day": {
      const cleared = await clearDay(
        args.date as string,
        args.shift as Shift | undefined
      );
      return {
        success: true,
        message: `נמחקו ${cleared} שיבוצים מ-${args.date}${args.shift ? ` (${args.shift})` : ""}`,
      };
    }

    case "list_employees": {
      const employees = await getAllEmployees();
      const lines = employees.map(
        (e) =>
          `- ${e.name} (${e.role}) — ${e.default_shift}${e.is_manager ? " [מנהל]" : ""}${!e.active ? " [לא פעיל]" : ""}`
      );
      return {
        success: true,
        message: lines.length > 0 ? lines.join("\n") : "No employees found",
      };
    }

    case "add_employee": {
      const empName = args.name as string;
      const role = args.role as string;
      const phone = (args.phone as string).replace(/\D/g, "");
      const pin = args.pin as string;
      const defaultShift = args.default_shift as string;

      if (!empName || !role || !phone || !pin || !defaultShift) {
        return { success: false, message: "חסרים שדות חובה" };
      }

      try {
        const emp = await createEmployee({
          name: empName,
          role,
          phone,
          pin,
          default_shift: defaultShift,
          is_manager: false,
        });
        return {
          success: true,
          message: `נוסף עובד: ${emp.name} (${emp.role}), טלפון: ${emp.phone}, משמרת: ${emp.default_shift}`,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { success: false, message: `שגיאה ביצירת עובד: ${msg}` };
      }
    }

    case "update_employee": {
      const worker = await resolveWorker(args.employee_name as string);
      if (!worker) {
        return {
          success: false,
          message: `לא מצאתי עובד בשם "${args.employee_name}"`,
          error: "worker_not_found",
        };
      }

      const updates: Record<string, unknown> = {};
      if (args.role) updates.role = args.role;
      if (args.default_shift) updates.default_shift = args.default_shift;
      if (args.active !== undefined) updates.active = args.active;

      if (Object.keys(updates).length === 0) {
        return { success: false, message: "לא צוינו שדות לעדכון" };
      }

      try {
        await updateEmployee(worker.id, updates);
        const parts: string[] = [];
        if (updates.role) parts.push(`תפקיד: ${updates.role}`);
        if (updates.default_shift) parts.push(`משמרת: ${updates.default_shift}`);
        if (updates.active !== undefined) parts.push(updates.active ? "הופעל" : "הושבת");
        return {
          success: true,
          message: `עודכן ${worker.name}: ${parts.join(", ")}`,
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { success: false, message: `שגיאה בעדכון: ${msg}` };
      }
    }

    default:
      return { success: false, message: `כלי לא מוכר: ${name}` };
  }
}
