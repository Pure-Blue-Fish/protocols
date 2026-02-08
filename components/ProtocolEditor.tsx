// ABOUTME: WYSIWYG editor for protocol content using Tiptap
// ABOUTME: Converts markdown to HTML on load, HTML to markdown on save

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useMemo } from "react";
import { EditorToolbar } from "./EditorToolbar";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

interface ProtocolEditorProps {
  content: string; // markdown body (without frontmatter)
  onChange: (markdown: string) => void;
  lang: "he" | "en";
}

// Convert markdown to HTML for Tiptap (client-side)
function markdownToHtml(md: string): string {
  // Simple markdown to HTML conversion for editor initialization
  // Handles: headings, bold, italic, lists, task lists, tables
  let html = md;

  // Tables (do before other conversions)
  html = html.replace(/^\|(.+)\|$/gm, (match, content) => {
    const cells = content.split("|").map((c: string) => c.trim());
    return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join("")}</tr>`;
  });
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
    const rows = match.trim().split("\n").filter(Boolean);
    if (rows.length === 0) return match;
    // Check if second row is separator
    const hasSeparator = rows.length > 1 && /^<tr><td>[-:| ]+<\/td>/.test(rows[1]);
    if (hasSeparator) {
      const headerRow = rows[0].replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
      const bodyRows = rows.slice(2).join("\n");
      return `<table><thead>${headerRow}</thead><tbody>${bodyRows}</tbody></table>`;
    }
    return `<table><tbody>${match}</tbody></table>`;
  });

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Task lists (checkboxes)
  html = html.replace(/^- \[ \] (.+)$/gm, '<li data-type="taskItem" data-checked="false">$1</li>');
  html = html.replace(/^- \[x\] (.+)$/gim, '<li data-type="taskItem" data-checked="true">$1</li>');
  html = html.replace(/(<li data-type="taskItem"[^>]*>.*<\/li>\n?)+/g, (match) => `<ul data-type="taskList">${match}</ul>`);

  // Bullet lists (regular)
  html = html.replace(/^- (?!\[)(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>(?!.*data-type).*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Paragraphs (lines that aren't already wrapped)
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return line;
      return `<p>${line}</p>`;
    })
    .join("\n");

  return html;
}

// Create turndown service for HTML to markdown
function createTurndownService(): TurndownService {
  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });
  turndown.use(gfm);

  // Task list items
  turndown.addRule("taskListItem", {
    filter: (node) => {
      return node.nodeName === "LI" && node.getAttribute("data-type") === "taskItem";
    },
    replacement: (content, node) => {
      const checked = (node as Element).getAttribute("data-checked") === "true";
      return `- [${checked ? "x" : " "}] ${content.trim()}\n`;
    },
  });

  // Task lists
  turndown.addRule("taskList", {
    filter: (node) => {
      return node.nodeName === "UL" && node.getAttribute("data-type") === "taskList";
    },
    replacement: (content) => content,
  });

  return turndown;
}

export function ProtocolEditor({ content, onChange, lang }: ProtocolEditorProps) {
  const isRtl = lang === "he";

  const turndownService = useMemo(() => createTurndownService(), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none",
        dir: isRtl ? "rtl" : "ltr",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  return (
    <div className="border border-border-default rounded-lg overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <EditorToolbar editor={editor} lang={lang} />
      <EditorContent editor={editor} />
      <style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          text-align: ${isRtl ? "right" : "left"};
        }
        .ProseMirror th {
          background: #f1f5f9;
          font-weight: 600;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-top: 0.125rem;
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror ul:not([data-type="taskList"]) {
          list-style-type: disc;
          padding-inline-start: 1.5rem;
        }
      `}</style>
    </div>
  );
}
