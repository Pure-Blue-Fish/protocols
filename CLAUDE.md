# Protocol Editor - Claude Instructions

## Project Overview
Next.js 16 protocol viewer for Pure Blue Fish farm workers. Bilingual (Hebrew/English) with RTL support.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS
- TypeScript
- Deployed on Vercel (connected to `protocols` repo)

## Directory Structure
```
app/
  page.tsx           # Main dashboard with category cards
  [slug]/page.tsx    # Protocol detail view
  recommendations/   # Best practices recommendations
  admin/             # Protocol editor (markdown)
  login/             # Auth page
  api/               # Protocol CRUD endpoints
components/
  LanguageToggle.tsx # Hebrew/English switcher
  PrintButton.tsx    # Print protocol
content/protocols/
  he/                # Hebrew markdown files
  en/                # English markdown files
lib/
  protocols.ts       # Protocol parsing, i18n strings
public/
  logo.png           # Pure Blue Fish logo
```

## i18n Implementation
- Language via URL param `?lang=he|en` + cookie persistence
- RTL/LTR set dynamically in layout.tsx based on language
- `CATEGORIES` and `UI_STRINGS` in lib/protocols.ts
- Protocol content in separate `he/` and `en/` directories

## Protocol Markdown Format
```yaml
---
title: "Protocol Title"
category: "feeding|water-quality|treatments|tank-procedures|..."
protocolNumber: "PRO.X.X.X"
frequency: "Daily|Weekly|..."
---

## Section Title
- [ ] Checkbox item
- [ ] Another item

| Table | Header |
|-------|--------|
| data  | here   |
```

## Categories
feeding, water-quality, treatments, tank-procedures, pool-procedures, transfers, monitoring, arrival, lab, other

## Key Commands
```bash
npm run dev      # Development
npm run build    # Production build
vercel --prod    # Deploy to production
```

## Git Remote
Origin: https://github.com/Pure-Blue-Fish/protocols.git
(Not protocol-editor repo - that one is outdated)
