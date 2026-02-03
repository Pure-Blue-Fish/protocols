// ABOUTME: Chat types and utilities for protocol assistant
// ABOUTME: Builds system prompt from protocol content

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Language } from "./protocols";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content/protocols");

export function buildSystemPrompt(lang: Language): string {
  const protocolsDirectory = path.join(contentDirectory, lang);

  if (!fs.existsSync(protocolsDirectory)) {
    return getBasePrompt(lang);
  }

  const fileNames = fs.readdirSync(protocolsDirectory);
  const protocolContents: string[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md")) continue;

    const fullPath = path.join(protocolsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    protocolContents.push(
      `## ${data.title || fileName} (${data.protocolNumber || "N/A"})\nCategory: ${data.category || "other"}\nFrequency: ${data.frequency || "N/A"}\n\n${content}`
    );
  }

  const basePrompt = getBasePrompt(lang);

  return `${basePrompt}

---
PROTOCOLS:
${protocolContents.join("\n\n---\n\n")}
`;
}

function getBasePrompt(lang: Language): string {
  if (lang === "he") {
    return `אתה עוזר מועיל לעובדי חוות הדגים של Pure Blue Fish.
ענה תמיד בעברית.
יש לך גישה לכל פרוטוקולי החווה. ענה על שאלות לגבי נהלים, עזור לעובדים להבין שלבים, ותן הנחיות על סמך הפרוטוקולים.
אם נשאלת על משהו שלא בפרוטוקולים, אמור שאין לך את המידע הזה והמלץ לפנות לביולוג.`;
  }

  return `You are a helpful assistant for Pure Blue Fish farm workers.
Always respond in English.
You have access to all farm protocols. Answer questions about procedures, help workers understand steps, and provide guidance based on the protocols.
If asked about something not in the protocols, say you don't have that information and suggest consulting the biologist.`;
}
