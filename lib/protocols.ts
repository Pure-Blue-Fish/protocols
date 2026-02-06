// ABOUTME: Protocol reading and parsing utilities with i18n support
// ABOUTME: Reads markdown files with frontmatter, converts to HTML

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

// Re-export i18n constants so existing server-side imports still work
export { CATEGORIES, UI_STRINGS, type Language } from "./i18n";

const contentDirectory = path.join(process.cwd(), "content/protocols");

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

type Language = "he" | "en";

function getProtocolsDirectory(lang: Language): string {
  return path.join(contentDirectory, lang);
}

export function getAllProtocols(lang: Language = "he"): ProtocolMeta[] {
  const protocolsDirectory = getProtocolsDirectory(lang);
  if (!fs.existsSync(protocolsDirectory)) {
    return [];
  }

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
    .sort((a, b) => a.title.localeCompare(b.title, lang));
}

export function getProtocolsByCategory(
  lang: Language = "he"
): Record<string, ProtocolMeta[]> {
  const protocols = getAllProtocols(lang);
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

export async function getProtocol(
  slug: string,
  lang: Language = "he"
): Promise<Protocol | null> {
  const protocolsDirectory = getProtocolsDirectory(lang);
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

export function getAllProtocolSlugs(lang: Language = "he"): string[] {
  const protocolsDirectory = getProtocolsDirectory(lang);
  if (!fs.existsSync(protocolsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(protocolsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getAllLanguageSlugs(): { lang: Language; slug: string }[] {
  const slugs: { lang: Language; slug: string }[] = [];

  for (const lang of ["he", "en"] as Language[]) {
    for (const slug of getAllProtocolSlugs(lang)) {
      slugs.push({ lang, slug });
    }
  }

  return slugs;
}
