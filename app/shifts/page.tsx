// ABOUTME: Manager-only shifts management page
// ABOUTME: Define and edit shift types (name, times, active status)

"use client";

import { useState, useEffect, useCallback } from "react";
import { UI_STRINGS, type Language } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import { Skeleton, EmptyState, Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface ShiftDef {
  id: number;
  key: string;
  display_name_he: string;
  display_name_en: string;
  start_time: string;
  end_time: string;
  sort_order: number;
  active: boolean;
}

const EMPTY_SHIFT_FORM = {
  key: "",
  display_name_he: "",
  display_name_en: "",
  start_time: "",
  end_time: "",
  sort_order: 0,
};

export default function ShiftsPage() {
  const [lang] = useState<Language>("he");
  const [isManager, setIsManager] = useState(false);
  const [shifts, setShifts] = useState<ShiftDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddShift, setShowAddShift] = useState(false);
  const [shiftForm, setShiftForm] = useState(EMPTY_SHIFT_FORM);
  const [editingShiftKey, setEditingShiftKey] = useState<string | null>(null);
  const [editShiftForm, setEditShiftForm] = useState(EMPTY_SHIFT_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const ui = UI_STRINGS[lang];

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/shifts");
      if (res.ok) {
        const data = await res.json();
        setShifts(data.shifts);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setIsManager(d.isManager);
        if (d.isManager) fetchData();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fetchData]);

  const handleAddShift = async () => {
    setError("");
    if (!shiftForm.key || !shiftForm.display_name_he || !shiftForm.display_name_en || !shiftForm.start_time || !shiftForm.end_time) {
      setError(lang === "he" ? "יש למלא את כל השדות" : "All fields required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiftForm),
      });
      if (res.ok) {
        const data = await res.json();
        setShifts([...shifts, data.shift]);
        setShiftForm(EMPTY_SHIFT_FORM);
        setShowAddShift(false);
        toast("success", ui.saved);
      } else {
        const data = await res.json();
        setError(data.error || "Error");
      }
    } catch {
      toast("error", ui.connectionError);
    }
    setSaving(false);
  };

  const handleUpdateShift = async (key: string) => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/shifts/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editShiftForm),
      });
      if (res.ok) {
        const data = await res.json();
        setShifts(shifts.map((s) => (s.key === key ? data.shift : s)));
        setEditingShiftKey(null);
        toast("success", ui.saved);
      } else {
        const data = await res.json();
        setError(data.error || "Error");
      }
    } catch {
      toast("error", ui.connectionError);
    }
    setSaving(false);
  };

  const toggleShiftActive = async (shift: ShiftDef) => {
    const res = await fetch(`/api/shifts/${shift.key}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !shift.active }),
    });
    if (res.ok) {
      const data = await res.json();
      setShifts(shifts.map((s) => (s.key === shift.key ? data.shift : s)));
    }
  };

  const startEditShift = (shift: ShiftDef) => {
    setEditingShiftKey(shift.key);
    setEditShiftForm({
      key: shift.key,
      display_name_he: shift.display_name_he,
      display_name_en: shift.display_name_en,
      start_time: shift.start_time,
      end_time: shift.end_time,
      sort_order: shift.sort_order,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-page" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-8 w-48 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-card rounded-lg border border-border-default p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-page" dir="rtl">
        <p className="text-text-secondary">גישה למנהלים בלבד</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page" dir={lang === "he" ? "rtl" : "ltr"}>
      <MobileNav lang={lang} userName={ui.shiftManagement} currentPage="shifts" isManager={true} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-brand-danger-light border border-brand-danger/20 rounded-lg text-sm text-brand-danger">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-text-primary font-heading">{ui.shiftDefinitions}</h1>
          <button
            onClick={() => setShowAddShift(!showAddShift)}
            className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover"
          >
            {showAddShift ? ui.cancel : ui.addShift}
          </button>
        </div>

        {showAddShift && (
          <div className="mb-4 p-4 bg-surface-card rounded-lg border border-border-default shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <input
                placeholder={lang === "he" ? "מפתח (אנגלית)" : "Key (english)"}
                value={shiftForm.key}
                onChange={(e) => setShiftForm({ ...shiftForm, key: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                dir="ltr"
              />
              <input
                placeholder={lang === "he" ? "שם בעברית" : "Hebrew name"}
                value={shiftForm.display_name_he}
                onChange={(e) => setShiftForm({ ...shiftForm, display_name_he: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
              />
              <input
                placeholder={lang === "he" ? "שם באנגלית" : "English name"}
                value={shiftForm.display_name_en}
                onChange={(e) => setShiftForm({ ...shiftForm, display_name_en: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                dir="ltr"
              />
              <input
                placeholder={ui.startTime}
                value={shiftForm.start_time}
                onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                type="time"
                dir="ltr"
              />
              <input
                placeholder={ui.endTime}
                value={shiftForm.end_time}
                onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                type="time"
                dir="ltr"
              />
              <input
                placeholder={lang === "he" ? "סדר" : "Order"}
                value={shiftForm.sort_order}
                onChange={(e) => setShiftForm({ ...shiftForm, sort_order: parseInt(e.target.value) || 0 })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                type="number"
                dir="ltr"
              />
            </div>
            <div className="mt-3">
              <button
                onClick={handleAddShift}
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-success text-white rounded-lg hover:bg-brand-success/90 disabled:opacity-50"
              >
                {saving ? "..." : ui.save}
              </button>
            </div>
          </div>
        )}

        {/* Desktop shift table */}
        <div className="hidden md:block">
          <Table>
            <Thead>
              <Tr>
                <Th>{lang === "he" ? "מפתח" : "Key"}</Th>
                <Th>{lang === "he" ? "שם עברית" : "Hebrew"}</Th>
                <Th>{lang === "he" ? "שם אנגלית" : "English"}</Th>
                <Th>{ui.startTime}</Th>
                <Th>{ui.endTime}</Th>
                <Th>{ui.status}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {shifts.map((shift) => (
                <Tr key={shift.key} className={!shift.active ? "opacity-50 bg-surface-page" : ""}>
                  {editingShiftKey === shift.key ? (
                    <>
                      <Td className="text-text-secondary font-mono text-xs">{shift.key}</Td>
                      <Td>
                        <input
                          value={editShiftForm.display_name_he}
                          onChange={(e) => setEditShiftForm({ ...editShiftForm, display_name_he: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm w-full"
                        />
                      </Td>
                      <Td>
                        <input
                          value={editShiftForm.display_name_en}
                          onChange={(e) => setEditShiftForm({ ...editShiftForm, display_name_en: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm w-full"
                          dir="ltr"
                        />
                      </Td>
                      <Td>
                        <input
                          value={editShiftForm.start_time}
                          onChange={(e) => setEditShiftForm({ ...editShiftForm, start_time: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm"
                          type="time"
                          dir="ltr"
                        />
                      </Td>
                      <Td>
                        <input
                          value={editShiftForm.end_time}
                          onChange={(e) => setEditShiftForm({ ...editShiftForm, end_time: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm"
                          type="time"
                          dir="ltr"
                        />
                      </Td>
                      <Td />
                      <Td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdateShift(shift.key)}
                            disabled={saving}
                            className="px-2 py-1 text-xs bg-brand-success text-white rounded hover:bg-brand-success/90 disabled:opacity-50"
                          >
                            {ui.save}
                          </button>
                          <button
                            onClick={() => setEditingShiftKey(null)}
                            className="px-2 py-1 text-xs bg-surface-subtle text-text-secondary rounded hover:bg-surface-subtle/80"
                          >
                            {ui.cancel}
                          </button>
                        </div>
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td className="font-mono text-xs text-text-secondary">{shift.key}</Td>
                      <Td>{shift.display_name_he}</Td>
                      <Td>{shift.display_name_en}</Td>
                      <Td className="font-mono text-xs" dir="ltr">{shift.start_time}</Td>
                      <Td className="font-mono text-xs" dir="ltr">{shift.end_time}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          shift.active ? "bg-brand-success-light text-brand-success" : "bg-surface-subtle text-text-muted"
                        }`}>
                          {shift.active ? ui.active : ui.inactive}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditShift(shift)}
                            className="px-2 py-1 text-xs text-brand-primary bg-brand-primary-light rounded hover:bg-brand-primary-light/70"
                          >
                            {ui.edit}
                          </button>
                          <button
                            onClick={() => toggleShiftActive(shift)}
                            className={`px-2 py-1 text-xs rounded ${
                              shift.active
                                ? "text-brand-danger bg-brand-danger-light hover:bg-red-100"
                                : "text-brand-success bg-brand-success-light hover:bg-green-100"
                            }`}
                          >
                            {shift.active ? ui.deactivate : ui.activate}
                          </button>
                        </div>
                      </Td>
                    </>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>

        {/* Mobile shift cards */}
        <div className="md:hidden space-y-2">
          {shifts.map((shift) => (
            <div
              key={shift.key}
              className={`bg-surface-card rounded-lg border border-border-default shadow-card p-3 ${
                !shift.active ? "opacity-50" : ""
              }`}
            >
              {editingShiftKey === shift.key ? (
                <div className="space-y-2">
                  <div className="text-xs text-text-muted font-mono mb-1">{shift.key}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editShiftForm.display_name_he}
                      onChange={(e) => setEditShiftForm({ ...editShiftForm, display_name_he: e.target.value })}
                      placeholder={lang === "he" ? "שם בעברית" : "Hebrew name"}
                      className="px-2 py-1.5 border border-border-default rounded text-sm w-full"
                    />
                    <input
                      value={editShiftForm.display_name_en}
                      onChange={(e) => setEditShiftForm({ ...editShiftForm, display_name_en: e.target.value })}
                      placeholder={lang === "he" ? "שם באנגלית" : "English name"}
                      className="px-2 py-1.5 border border-border-default rounded text-sm w-full"
                      dir="ltr"
                    />
                    <input
                      value={editShiftForm.start_time}
                      onChange={(e) => setEditShiftForm({ ...editShiftForm, start_time: e.target.value })}
                      className="px-2 py-1.5 border border-border-default rounded text-sm"
                      type="time"
                      dir="ltr"
                    />
                    <input
                      value={editShiftForm.end_time}
                      onChange={(e) => setEditShiftForm({ ...editShiftForm, end_time: e.target.value })}
                      className="px-2 py-1.5 border border-border-default rounded text-sm"
                      type="time"
                      dir="ltr"
                    />
                  </div>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleUpdateShift(shift.key)}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs bg-brand-success text-white rounded hover:bg-brand-success/90 disabled:opacity-50"
                    >
                      {ui.save}
                    </button>
                    <button
                      onClick={() => setEditingShiftKey(null)}
                      className="px-3 py-1.5 text-xs bg-surface-subtle text-text-secondary rounded hover:bg-surface-subtle/80"
                    >
                      {ui.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="font-medium text-sm">
                        {lang === "he" ? shift.display_name_he : shift.display_name_en}
                      </span>
                      <span className="text-xs text-text-muted font-mono mr-2">({shift.key})</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      shift.active ? "bg-brand-success-light text-brand-success" : "bg-surface-subtle text-text-muted"
                    }`}>
                      {shift.active ? ui.active : ui.inactive}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mb-2" dir="ltr">
                    {shift.start_time} - {shift.end_time}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEditShift(shift)}
                      className="px-2.5 py-1.5 text-xs text-brand-primary bg-brand-primary-light rounded hover:bg-brand-primary-light/70"
                    >
                      {ui.edit}
                    </button>
                    <button
                      onClick={() => toggleShiftActive(shift)}
                      className={`px-2.5 py-1.5 text-xs rounded ${
                        shift.active
                          ? "text-brand-danger bg-brand-danger-light hover:bg-red-100"
                          : "text-brand-success bg-brand-success-light hover:bg-green-100"
                      }`}
                    >
                      {shift.active ? ui.deactivate : ui.activate}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {shifts.length === 0 && !showAddShift && (
            <EmptyState
              icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title={ui.noShifts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
