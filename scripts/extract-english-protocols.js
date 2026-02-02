// ABOUTME: Extracts English protocols from protocol-explorer.html
// ABOUTME: Converts JS object format to markdown files

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../farm-protocols/protocol-explorer.html');
const outputDir = path.join(__dirname, '../content/protocols/en');

// Read the HTML file
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the protocolsEn object using regex
const match = html.match(/const protocolsEn = \{([\s\S]*?)\n    \};/);
if (!match) {
  console.error('Could not find protocolsEn in HTML');
  process.exit(1);
}

// We need to eval this carefully - wrap in a function
const jsCode = `(function() { return {${match[1]}}; })()`;
const protocolsEn = eval(jsCode);

// Category mapping (slug -> category)
const categoryMap = {
  'feed-quarantine': 'feeding',
  'feed-fattening': 'feeding',
  'dead-fish': 'monitoring',
  'oxygen': 'water-quality',
  'oxygen-fattening': 'water-quality',
  'ph-fattening': 'water-quality',
  'ammonia-fattening': 'water-quality',
  'daily-clean': 'tank-procedures',
  'acclimate': 'arrival',
  'formalin': 'treatments',
  'copper': 'treatments',
  'weighing': 'monitoring',
  'sorting': 'transfers',
  'prep-quarantine': 'tank-procedures',
  'open-boxes': 'arrival',
  'drain-tank': 'tank-procedures',
  'fill-tank': 'tank-procedures',
  'lab-nitrite': 'lab',
  'lab-nitrate': 'lab',
  'lab-alkalinity': 'lab',
};

// English category names
const categoryNames = {
  feeding: 'Feeding',
  'water-quality': 'Water Quality',
  treatments: 'Treatments',
  'tank-procedures': 'Tank Procedures',
  'pool-procedures': 'Pool Procedures',
  transfers: 'Transfers',
  monitoring: 'Fish Monitoring',
  arrival: 'Fish Arrival',
  lab: 'Laboratory',
  other: 'Other',
};

function convertToMarkdown(slug, protocol) {
  const [protocolNumber, frequency] = protocol.meta.split(' | ');
  const category = categoryMap[slug] || 'other';

  let md = `---
title: "${protocol.title}"
category: "${category}"
protocolNumber: "${protocolNumber}"
frequency: "${frequency}"
---

`;

  for (const section of protocol.sections) {
    md += `## ${section.title}\n\n`;

    if (section.type === 'info' || section.type === 'table') {
      // Extract table from HTML content
      md += section.content.trim() + '\n\n';
    } else if (section.items) {
      for (const item of section.items) {
        if (typeof item === 'string') {
          md += `- [ ] ${item}\n`;
        } else {
          md += `- [ ] ${item.text}`;
          if (item.note) {
            md += ` *(${item.note})*`;
          }
          md += '\n';
        }
      }
      md += '\n';
    }
  }

  return md;
}

// Create output directory if needed
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Convert each protocol
for (const [slug, protocol] of Object.entries(protocolsEn)) {
  const markdown = convertToMarkdown(slug, protocol);
  const outputPath = path.join(outputDir, `${slug}.md`);
  fs.writeFileSync(outputPath, markdown);
  console.log(`Created: ${slug}.md`);
}

console.log(`\nDone! Created ${Object.keys(protocolsEn).length} protocol files.`);
