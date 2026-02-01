// ABOUTME: Admin page for protocol editing
// ABOUTME: Simple markdown editor (auth handled by middleware)

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Protocol {
  slug: string;
  sha: string;
  content: string;
}

export default function AdminPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProtocols();
  }, []);

  const loadProtocols = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/protocols");
      const data = await res.json();
      setProtocols(data);
    } catch {
      console.error("Failed to load protocols");
    }
    setLoading(false);
  };

  const selectProtocol = (p: Protocol) => {
    setSelected(p);
    setEditContent(p.content);
  };

  const saveProtocol = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/protocols/${selected.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          sha: selected.sha,
          message: `עדכון ${selected.slug}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected({ ...selected, sha: data.sha, content: editContent });
        setProtocols(
          protocols.map((p) =>
            p.slug === selected.slug ? { ...p, sha: data.sha, content: editContent } : p
          )
        );
        alert("נשמר בהצלחה!");
      } else {
        alert("שגיאה בשמירה: " + JSON.stringify(data.error));
      }
    } catch {
      alert("שגיאה בשמירה");
    }
    setSaving(false);
  };

  const extractTitle = (content: string) => {
    const match = content.match(/title:\s*["']?([^"'\n]+)["']?/);
    return match ? match[1] : "ללא כותרת";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-s border-gray-200 p-4 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">עריכת פרוטוקולים</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            חזרה
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500">טוען...</p>
        ) : (
          <ul className="space-y-1">
            {protocols.map((p) => (
              <li key={p.slug}>
                <button
                  onClick={() => selectProtocol(p)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm ${
                    selected?.slug === p.slug
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {extractTitle(p.content)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Editor */}
      <main className="flex-1 p-6">
        {selected ? (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{extractTitle(selected.content)}</h2>
              <button
                onClick={saveProtocol}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[calc(100vh-200px)] p-4 border border-gray-300 rounded-lg font-mono text-sm"
              dir="auto"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            בחר פרוטוקול לעריכה
          </div>
        )}
      </main>
    </div>
  );
}
