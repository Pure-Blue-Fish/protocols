// ABOUTME: Extract protocols from existing HTML and create markdown files
// ABOUTME: Parses the protocolsHe object from protocol-explorer.html

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const html = readFileSync("../farm-protocols/protocol-explorer.html", "utf-8");

// Extract protocolsHe object
const match = html.match(/const protocolsHe = \{([\s\S]*?)\n\s*\};/);
if (!match) {
  console.error("Could not find protocolsHe");
  process.exit(1);
}

// Parse the JS object (hacky but works)
const protocolsCode = `return {${match[1]}};`;
const getProtocols = new Function(protocolsCode);
const protocols = getProtocols();

const CATEGORY_MAP: Record<string, string> = {
  "feed-": "feeding",
  "oxygen-": "water-quality",
  "ph-": "water-quality",
  "temp-": "water-quality",
  "salinity-": "water-quality",
  "ammonia-": "water-quality",
  "co2-": "water-quality",
  "sodium-": "water-quality",
  "formalin": "treatments",
  "copper": "treatments",
  "size-sort": "treatments",
  "tank-": "tank-procedures",
  "pool-": "pool-procedures",
  "transfer": "transfers",
  "filter-": "transfers",
  "weigh-": "monitoring",
  "lab-": "lab",
  "arrival-": "arrival",
  "acclimate": "arrival",
  "unbox": "arrival",
  "prepare-": "arrival",
};

function getCategory(slug: string): string {
  for (const [prefix, category] of Object.entries(CATEGORY_MAP)) {
    if (slug.includes(prefix)) return category;
  }
  return "other";
}

function sectionToMarkdown(section: any): string {
  let md = `## ${section.title}\n\n`;

  if (section.items) {
    for (const item of section.items) {
      if (typeof item === "string") {
        md += `- [ ] ${item}\n`;
      } else if (item.text) {
        md += `- [ ] ${item.text}`;
        if (item.note) md += ` *(${item.note})*`;
        md += "\n";
      }
    }
  }

  if (section.content) {
    // Parse HTML table to markdown
    const tableMatch = section.content.match(/<table[^>]*>([\s\S]*?)<\/table>/);
    if (tableMatch) {
      const rows = tableMatch[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
      let isFirst = true;
      for (const row of rows) {
        const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g) || [];
        const values = cells.map((c: string) => c.replace(/<[^>]+>/g, "").trim());
        md += `| ${values.join(" | ")} |\n`;
        if (isFirst) {
          md += `| ${values.map(() => "---").join(" | ")} |\n`;
          isFirst = false;
        }
      }
    } else {
      // Plain content
      md += section.content.replace(/<[^>]+>/g, "").trim() + "\n";
    }
  }

  return md + "\n";
}

if (!existsSync("content/protocols")) {
  mkdirSync("content/protocols", { recursive: true });
}

let count = 0;
for (const [slug, data] of Object.entries(protocols) as [string, any][]) {
  const category = getCategory(slug);

  // Extract protocol number and frequency from meta
  const metaParts = data.meta?.split("|").map((s: string) => s.trim()) || ["", ""];
  const protocolNumber = metaParts[0] || "";
  const frequency = metaParts[1] || "";

  let content = `---
title: "${data.title}"
category: "${category}"
protocolNumber: "${protocolNumber}"
frequency: "${frequency}"
---

`;

  for (const section of data.sections || []) {
    content += sectionToMarkdown(section);
  }

  writeFileSync(`content/protocols/${slug}.md`, content);
  console.log(`✓ ${slug}`);
  count++;
}

console.log(`\nExtracted ${count} protocols`);
