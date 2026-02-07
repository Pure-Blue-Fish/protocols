// ABOUTME: Chat types and utilities for protocol assistant
// ABOUTME: Builds system prompt from protocol content and worker tasks

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Language } from "./protocols";
import { getWorkerById } from "./db";
import { getWorkerTasksForDate, getTodayISO, getSundayOfWeek, getWeekDates } from "./schedule";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content/protocols");

const SHIFT_LABELS: Record<string, string> = {
  morning: "Morning (06:00-14:00)",
  afternoon: "Afternoon (14:00-22:00)",
  night: "Night (22:00-06:00)",
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function buildWorkerContext(workerId: number, lang: Language): Promise<string> {
  if (!workerId) return "";

  const worker = await getWorkerById(workerId);
  if (!worker) return "";

  const today = getTodayISO();
  const sunday = getSundayOfWeek(today);
  const dates = getWeekDates(sunday);

  const lines: string[] = [
    `\n---\nCURRENT USER: ${worker.name} (${worker.role}), default shift: ${worker.default_shift}`,
    `Today: ${today}`,
    `\nThis week's tasks for ${worker.name}:`,
  ];

  let hasTasks = false;
  for (let i = 0; i < dates.length; i++) {
    const tasks = await getWorkerTasksForDate(workerId, dates[i], lang);
    if (tasks.length > 0) {
      hasTasks = true;
      const isToday = dates[i] === today;
      lines.push(`${DAY_NAMES[i]} (${dates[i]})${isToday ? " [TODAY]" : ""}:`);
      for (const t of tasks) {
        const status = t.completed ? "[DONE]" : "[PENDING]";
        lines.push(`  ${status} ${t.protocol_title} - ${SHIFT_LABELS[t.shift] || t.shift}${t.notes ? ` (${t.notes})` : ""}`);
      }
    }
  }

  if (!hasTasks) {
    lines.push("(No tasks assigned this week)");
  }

  return lines.join("\n");
}

export async function buildSystemPrompt(lang: Language, workerId: number = 0): Promise<string> {
  const protocolsDirectory = path.join(contentDirectory, lang);

  if (!fs.existsSync(protocolsDirectory)) {
    const base = getBasePrompt(lang);
    const workerCtx = await buildWorkerContext(workerId, lang);
    return base + workerCtx;
  }

  const fileNames = fs.readdirSync(protocolsDirectory);
  const protocolContents: string[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md")) continue;

    const fullPath = path.join(protocolsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const slug = fileName.replace(".md", "");
    protocolContents.push(
      `## ${data.title || fileName} (${data.protocolNumber || "N/A"})\nSlug: ${slug}\nCategory: ${data.category || "other"}\nFrequency: ${data.frequency || "N/A"}\n\n${content}`
    );
  }

  const basePrompt = getBasePrompt(lang);
  const workerCtx = await buildWorkerContext(workerId, lang);

  return `${basePrompt}
${workerCtx}
---
PROTOCOLS:
${protocolContents.join("\n\n---\n\n")}
`;
}

function getBasePrompt(_lang: Language): string {
  return `You are a helpful assistant for Pure Blue Fish farm workers.
Respond in the same language the user writes to you.
You have access to all farm protocols. Answer questions about procedures, help workers understand steps, and provide guidance based on the protocols.

EDITING PROTOCOLS:
You can edit existing protocols and create new ones using edit_protocol and create_protocol tools.
- If the user gives a clear, specific instruction (e.g., "in protocol X, change Y to Z"), execute it directly
- If the request is vague or you need to interpret what they want, first explain your proposed changes and ask for confirmation

If asked about something not in the protocols, say you don't have that information and suggest consulting the biologist.`;
}
