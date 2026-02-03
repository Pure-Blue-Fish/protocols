// ABOUTME: Protocol reading and parsing utilities with i18n support
// ABOUTME: Reads markdown files with frontmatter, converts to HTML

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

export type Language = "he" | "en";

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

export const CATEGORIES: Record<Language, Record<string, string>> = {
  he: {
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
  },
  en: {
    feeding: "Feeding",
    "water-quality": "Water Quality",
    treatments: "Treatments",
    "tank-procedures": "Tank Procedures",
    "pool-procedures": "Pool Procedures",
    transfers: "Transfers",
    monitoring: "Fish Monitoring",
    arrival: "Fish Arrival",
    lab: "Laboratory",
    other: "Other",
  },
};

export const UI_STRINGS: Record<Language, Record<string, string>> = {
  he: {
    protocolBook: "ספר הפרוטוקולים",
    protocols: "פרוטוקולים",
    categories: "קטגוריות",
    quickAccess: "גישה מהירה",
    edit: "עריכה",
    adminLogin: "כניסת מנהל",
    farmProtocols: "פרוטוקולים לעובדי החווה",
    fishFarm: "חוות דגים",
    feedingProtocols: "פרוטוקולי האכלה",
    waterProtocols: "פרוטוקולי מים",
    print: "הדפסה",
    recommendations: "המלצות",
    chatTitle: "עוזר פרוטוקולים",
    chatPlaceholder: "שאל שאלה...",
  },
  en: {
    protocolBook: "Protocol Book",
    protocols: "Protocols",
    categories: "Categories",
    quickAccess: "Quick Access",
    edit: "Edit",
    adminLogin: "Admin Login",
    farmProtocols: "Farm Worker Protocols",
    fishFarm: "Fish Farm",
    feedingProtocols: "Feeding Protocols",
    waterProtocols: "Water Protocols",
    print: "Print",
    recommendations: "Recommendations",
    chatTitle: "Protocol Assistant",
    chatPlaceholder: "Ask a question...",
  },
};

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
