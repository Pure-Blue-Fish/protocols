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

    const slug = fileName.replace(".md", "");
    protocolContents.push(
      `## ${data.title || fileName} (${data.protocolNumber || "N/A"})\nSlug: ${slug}\nCategory: ${data.category || "other"}\nFrequency: ${data.frequency || "N/A"}\n\n${content}`
    );
  }

  const basePrompt = getBasePrompt(lang);

  return `${basePrompt}

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
