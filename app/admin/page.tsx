// ABOUTME: Admin page for protocol editing with WYSIWYG editor
// ABOUTME: Uses Tiptap for rich text, separates frontmatter from body

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FrontmatterForm, type FrontmatterData } from "../../components/FrontmatterForm";
import { ProtocolEditor } from "../../components/ProtocolEditor";

interface Protocol {
  slug: string;
  sha: string;
  content: string;
  lang: string;
}

// Parse frontmatter from markdown content
function parseFrontmatter(content: string): { frontmatter: FrontmatterData; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: { title: "", category: "other", protocolNumber: "", frequency: "" },
      body: content,
    };
  }

  const [, yamlStr, body] = match;
  const frontmatter: FrontmatterData = {
    title: "",
    category: "other",
    protocolNumber: "",
    frequency: "",
  };

  // Parse YAML manually (simple key: "value" format)
  for (const line of yamlStr.split("\n")) {
    const m = line.match(/^(\w+):\s*["']?([^"'\n]*)["']?$/);
    if (m) {
      const [, key, value] = m;
      if (key === "title") frontmatter.title = value;
      else if (key === "category") frontmatter.category = value;
      else if (key === "protocolNumber") frontmatter.protocolNumber = value;
      else if (key === "frequency") frontmatter.frequency = value;
    }
  }

  return { frontmatter, body: body.trim() };
}

// Serialize frontmatter back to YAML
function serializeFrontmatter(fm: FrontmatterData): string {
  return `---
title: "${fm.title}"
category: "${fm.category}"
protocolNumber: "${fm.protocolNumber}"
frequency: "${fm.frequency}"
---`;
}

export default function AdminPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [frontmatter, setFrontmatter] = useState<FrontmatterData>({
    title: "",
    category: "other",
    protocolNumber: "",
    frequency: "",
  });
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"he" | "en">("he");

  useEffect(() => {
    loadProtocols(lang);
  }, [lang]);

  const loadProtocols = async (language: string) => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/protocols?lang=${language}`);
      const data = await res.json();
      setProtocols(data);
    } catch {
      console.error("Failed to load protocols");
    }
    setLoading(false);
  };

  const selectProtocol = (p: Protocol) => {
    setSelected(p);
    const { frontmatter: fm, body: b } = parseFrontmatter(p.content);
    setFrontmatter(fm);
    setBody(b);
  };

  const saveProtocol = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const content = `${serializeFrontmatter(frontmatter)}\n\n${body}`;
      const res = await fetch(`/api/protocols/${selected.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          sha: selected.sha,
          lang: selected.lang,
          message: `עדכון ${selected.slug}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected({ ...selected, sha: data.sha, content });
        setProtocols(
          protocols.map((p) =>
            p.slug === selected.slug ? { ...p, sha: data.sha, content } : p
          )
        );
        alert(lang === "he" ? "נשמר בהצלחה!" : "Saved successfully!");
      } else {
        alert((lang === "he" ? "שגיאה בשמירה: " : "Save error: ") + JSON.stringify(data.error));
      }
    } catch {
      alert(lang === "he" ? "שגיאה בשמירה" : "Save error");
    }
    setSaving(false);
  };

  const handleBodyChange = useCallback((newBody: string) => {
    setBody(newBody);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50" dir={lang === "he" ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-gray-200 p-4 overflow-y-auto flex-shrink-0">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">{lang === "he" ? "עריכת פרוטוקולים" : "Edit Protocols"}</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            {lang === "he" ? "חזרה" : "Back"}
          </Link>
        </div>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setLang("he")}
            className={`px-3 py-1 rounded text-sm ${lang === "he" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            עברית
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded text-sm ${lang === "en" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            English
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500">{lang === "he" ? "טוען..." : "Loading..."}</p>
        ) : (
          <ul className="space-y-1">
            {protocols.map((p) => {
              const { frontmatter: fm } = parseFrontmatter(p.content);
              return (
                <li key={p.slug}>
                  <button
                    onClick={() => selectProtocol(p)}
                    className={`w-full text-start px-3 py-2 rounded-lg text-sm ${
                      selected?.slug === p.slug
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {fm.title || p.slug}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <main className="flex-1 p-6 overflow-y-auto">
        {selected ? (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{frontmatter.title || selected.slug}</h2>
              <button
                onClick={saveProtocol}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (lang === "he" ? "שומר..." : "Saving...") : (lang === "he" ? "שמור" : "Save")}
              </button>
            </div>
            <FrontmatterForm data={frontmatter} onChange={setFrontmatter} lang={lang} />
            <ProtocolEditor
              key={selected.slug}
              content={body}
              onChange={handleBodyChange}
              lang={lang}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {lang === "he" ? "בחר פרוטוקול לעריכה" : "Select a protocol to edit"}
          </div>
        )}
      </main>
    </div>
  );
}
