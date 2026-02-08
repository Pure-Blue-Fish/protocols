// ABOUTME: Formatting toolbar for Tiptap WYSIWYG editor
// ABOUTME: Buttons for headings, text styles, lists, tables

"use client";

import { type Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
  lang: "he" | "en";
}

export function EditorToolbar({ editor, lang }: EditorToolbarProps) {
  if (!editor) return null;

  const isRtl = lang === "he";

  const labels = {
    he: { insertTable: "הוסף טבלה", addRow: "הוסף שורה", addCol: "הוסף עמודה", delTable: "מחק טבלה" },
    en: { insertTable: "Insert Table", addRow: "Add Row", addCol: "Add Column", delTable: "Delete Table" },
  };

  const btn = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded transition-colors ${active ? "bg-brand-primary text-white" : "bg-surface-card border border-border-default hover:bg-surface-subtle"}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-surface-subtle border border-border-default rounded-t-lg sticky top-0 z-10" dir={isRtl ? "rtl" : "ltr"}>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
        H2
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
        H3
      </button>
      <div className="w-px bg-border-default mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
        <span className="font-bold">B</span>
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
        <span className="italic">I</span>
      </button>
      <div className="w-px bg-border-default mx-1" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
        • List
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={btn(editor.isActive("taskList"))}>
        ☑ Task
      </button>
      <div className="w-px bg-border-default mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className={btn(false)}
        title={labels[lang].insertTable}
      >
        ⊞ Table
      </button>
      {editor.isActive("table") && (
        <>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={btn(false)} title={labels[lang].addRow}>
            + Row
          </button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={btn(false)} title={labels[lang].addCol}>
            + Col
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={btn(false)} title={labels[lang].delTable}>
            ✕ Table
          </button>
        </>
      )}
    </div>
  );
}
