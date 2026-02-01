// ABOUTME: Protocol reading and parsing utilities
// ABOUTME: Reads markdown files with frontmatter, converts to HTML

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const protocolsDirectory = path.join(process.cwd(), "content/protocols");

export interface Protocol {
  slug: string;
  title: string;
  category: string;
  protocolNumber: string;
  frequency: string;
  content: string;
}

export interface ProtocolMeta {
  slug: string;
  title: string;
  category: string;
  protocolNumber: string;
  frequency: string;
}

export const CATEGORIES: Record<string, string> = {
  feeding: "האכלה",
  "water-quality": "איכות מים",
  treatments: "טיפולים",
  "tank-procedures": "פרוצדורות מיכלים",
  "pool-procedures": "פרוצדורות בריכות",
  transfers: "העברות",
  monitoring: "מעקב דגים",
  arrival: "הגעת דגים",
  lab: "מעבדה",
  other: "אחר",
};

export function getAllProtocols(): ProtocolMeta[] {
  const fileNames = fs.readdirSync(protocolsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(protocolsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        category: data.category || "other",
        protocolNumber: data.protocolNumber || "",
        frequency: data.frequency || "",
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "he"));
}

export function getProtocolsByCategory(): Record<string, ProtocolMeta[]> {
  const protocols = getAllProtocols();
  const byCategory: Record<string, ProtocolMeta[]> = {};

  for (const protocol of protocols) {
    const category = protocol.category;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(protocol);
  }

  return byCategory;
}

export async function getProtocol(slug: string): Promise<Protocol | null> {
  const fullPath = path.join(protocolsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(gfm).use(html).process(content);

  let htmlContent = processedContent.toString();
  // Make checkboxes interactive
  htmlContent = htmlContent.replace(
    /<li><input[^>]*type="checkbox"[^>]*disabled[^>]*>\s*/g,
    '<li class="flex items-start gap-2 py-1"><input type="checkbox" class="mt-1 w-4 h-4"> '
  );

  return {
    slug,
    title: data.title || slug,
    category: data.category || "other",
    protocolNumber: data.protocolNumber || "",
    frequency: data.frequency || "",
    content: htmlContent,
  };
}

export function getAllProtocolSlugs(): string[] {
  const fileNames = fs.readdirSync(protocolsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}
