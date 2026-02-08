# Protocol Editor - Claude Instructions

## Project Overview
Next.js 16 protocol viewer + work management system for Pure Blue Fish fish farm. Bilingual (Hebrew/English) with RTL support. Workers log in with phone+PIN, view protocols, see their assigned tasks, and mark them done. The manager (Roie) uses an AI chat assistant to build the weekly schedule.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS + TypeScript
- Gemini 2.5 Flash (AI chat for protocols + schedule management)
- Vercel Postgres (Neon) for workers, assignments, completions
- Deployed on Vercel under `pure-blue-fish` team

## Auth System
Single auth: phone + 4-digit PIN for everyone. Cookie `auth_token` is HMAC-SHA256 signed with `AUTH_SECRET`, format: `{workerId}:{isManager}:{timestamp}:{signature}`. Legacy password login (`auth=true` cookie) still exists but is unused — all users use phone+PIN.

Manager: Roie (רועי לביא), `is_manager: true` in DB. Worker phone numbers are placeholder (`050000000X`), PINs are `1234`.

**Known gotcha**: Middleware PUBLIC_PATHS uses exact matching (`includes`) not prefix matching, because `/api/auth` prefix was catching `/api/auth/me` and skipping auth header injection.

## Directory Structure
```
app/
  page.tsx              # Main dashboard: metrics (managers), protocol search, categories
  [slug]/page.tsx       # Protocol detail view
  schedule/page.tsx     # Weekly calendar + AI chat (mobile: tab switcher, desktop: side panel)
  task-status/page.tsx  # Manager task status: sortable table, filter chips, skeleton loading
  my-tasks/page.tsx     # Worker's own weekly tasks with completion toggles
  employees/page.tsx    # Manager-only employee CRUD (add, edit, deactivate)
  shifts/page.tsx       # Manager-only shift definitions + weekly roster grid
  login/page.tsx        # Phone+PIN login (single form, no tabs)
  recommendations/      # Best practices recommendations
  admin/                # Protocol editor (markdown)
  api/
    auth/route.ts       # Legacy password auth (kept but unused)
    auth/worker/route.ts # Phone+PIN login endpoint
    auth/me/route.ts    # Returns current user info {workerId, isManager, name}
    auth/logout/route.ts # Clears all auth cookies
    chat/route.ts       # Protocol AI chat (Gemini, streaming SSE)
    schedule/route.ts   # GET week schedule / POST bulk assign
    schedule-chat/route.ts # Schedule AI chat (Gemini + tools, streaming SSE)
    task-status/route.ts # Manager-only: flat assignment list with completion status
    my-tasks/route.ts   # Worker's tasks (single date or week mode)
    my-tasks/[assignmentId]/complete/route.ts # Toggle task completion
    workers/route.ts    # List workers (manager only)
    employees/route.ts  # Manager: list all / create employee
    employees/[id]/route.ts # Manager: update/deactivate employee
    shifts/route.ts     # Manager: list / create shift definitions
    shifts/[key]/route.ts # Manager: update shift definition
    roster/route.ts     # Manager: get/update weekly roster grid
    protocols/          # Protocol CRUD
components/
  ScheduleChat.tsx      # AI chat panel for schedule management
  WeeklyCalendar.tsx    # 7-day x 3-shift grid with assignments
  AssignmentCard.tsx    # Worker+protocol card in calendar cell
  TaskCard.tsx          # Worker task with checkbox + protocol link
  ShiftBadge.tsx        # Colored shift badge (morning/afternoon/night)
  WorkerLoginForm.tsx   # Phone + PIN form
  LogoutButton.tsx      # Client component, clears cookies
  LanguageToggle.tsx    # Hebrew/English switcher
  ChatWidget.tsx        # Protocol chat floating widget
  PrintButton.tsx       # Print protocol
  MobileNav.tsx         # Top navigation header
  BottomNav.tsx         # Fixed bottom tab bar for workers (mobile only)
  DashboardMetrics.tsx  # Manager dashboard stat cards
  ProtocolSearch.tsx    # Client-side protocol search
  ui/                   # 14 shared UI components (see MEMORY.md for details)
lib/
  db.ts                 # Vercel Postgres pool + query helpers
  auth.ts               # Cookie signing, PIN hashing (Node crypto)
  schedule.ts           # Schedule CRUD operations
  schedule-ai.ts        # Schedule AI system prompt builder (English)
  schedule-ai-tools.ts  # Gemini function definitions + executor (schedule + employee + roster tools)
  employees.ts          # Employee CRUD (getAllEmployees, createEmployee, updateEmployee)
  shifts.ts             # Shift definitions + roster CRUD
  chat.ts               # Protocol chat system prompt (includes worker tasks)
  chat-tools.ts         # Protocol chat tool definitions
  protocols.ts          # Protocol parsing, server-side i18n
  i18n.ts               # Client-safe i18n (UI_STRINGS, CATEGORIES)
content/protocols/
  he/                   # Hebrew markdown files (~21 protocols)
  en/                   # English markdown files
middleware.ts           # Auth middleware, role-based route protection
scripts/setup-db.ts     # DB migration + worker seed script
```

## Database (Vercel Postgres / Neon)
5 tables: `workers`, `schedule_assignments`, `task_completions`, `shift_definitions`, `worker_weekly_shifts`. 7 seeded workers. Roie is the only manager. 3 default shifts (morning/afternoon/night).

## AI Agents (Gemini 2.5 Flash)
Two separate chat agents:
1. **Protocol chat** (`/api/chat`): Answers questions about farm protocols. Tools: `edit_protocol`, `create_protocol`. System prompt includes all protocol content + logged-in worker's weekly tasks.
2. **Schedule chat** (`/api/schedule-chat`): Manager-only. Manages weekly assignments + employees + roster. Tools: `assign_task`, `remove_task`, `copy_week`, `get_schedule`, `clear_day`, `list_employees`, `add_employee`, `update_employee`, `set_roster`. System prompt includes workers, protocols, current schedule, shift definitions, roster, explicit date mapping for the week.

Both use streaming SSE: `data: {text}`, `data: {toolCall}`, `data: {toolResult}`, `data: [DONE]`.

**Known gotcha**: Gemini tool follow-ups must be batched — send ALL functionCall parts in one model message and ALL functionResponse parts in one user message, then ONE follow-up API call. Otherwise you hit rate limits.

## Environment Variables
- `POSTGRES_URL` — Neon connection string
- `GEMINI_API_KEY` — Google Gemini API key
- `AUTH_SECRET` — HMAC signing secret for auth cookies

## Key Commands
```bash
npm run dev      # Development
npm run build    # Production build
vercel --prod    # Deploy to production (pure-blue-fish team)
```

## Vercel Deployment
Team: `pure-blue-fish`. If `vercel` deploys to wrong project, run `vercel switch pure-blue-fish && vercel link --yes`. Production URL: https://protocol-editor.vercel.app

## Git Remote
Origin: https://github.com/Pure-Blue-Fish/protocols.git

## i18n
Language via URL param `?lang=he|en` + cookie. RTL/LTR in layout.tsx. UI strings split: `lib/protocols.ts` (server) and `lib/i18n.ts` (client). Default language: Hebrew.

## Categories
feeding, water-quality, treatments, tank-procedures, pool-procedures, transfers, monitoring, arrival, lab, other

## Protocol Markdown Format
```yaml
---
title: "Protocol Title"
category: "feeding|water-quality|treatments|..."
protocolNumber: "PRO.X.X.X"
frequency: "Daily|Weekly|..."
---
Content with markdown, checklists, tables
```
