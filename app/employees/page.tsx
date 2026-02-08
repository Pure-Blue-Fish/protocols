// ABOUTME: Manager-only employee management page
// ABOUTME: List, add, edit, deactivate/reactivate workers

"use client";

import { useState, useEffect, useCallback } from "react";
import { UI_STRINGS, type Language } from "@/lib/i18n";
import MobileNav from "@/components/MobileNav";
import { ConfirmDialog, Skeleton, EmptyState, Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  default_shift: string;
  is_manager: boolean;
  active: boolean;
}

interface ShiftDef {
  key: string;
  display_name_he: string;
  display_name_en: string;
  active: boolean;
}

const EMPTY_FORM = { name: "", role: "", phone: "", pin: "", default_shift: "morning", is_manager: false };

export default function EmployeesPage() {
  const [lang] = useState<Language>("he");
  const [isManager, setIsManager] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Employee | null>(null);
  const { toast } = useToast();

  const ui = UI_STRINGS[lang];

  const fetchData = useCallback(async () => {
    try {
      const [empRes, shiftRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/shifts"),
      ]);
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data.employees);
      }
      if (shiftRes.ok) {
        const data = await shiftRes.json();
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

  const shiftLabel = (key: string) => {
    const s = shifts.find((sh) => sh.key === key);
    return s ? (lang === "he" ? s.display_name_he : s.display_name_en) : key;
  };

  const handleAdd = async () => {
    setError("");
    if (!addForm.name || !addForm.role || !addForm.phone || !addForm.pin) {
      setError(lang === "he" ? "יש למלא את כל השדות" : "All fields required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees([data.employee, ...employees]);
        setAddForm(EMPTY_FORM);
        setShowAdd(false);
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

  const handleUpdate = async (id: number) => {
    setError("");
    setSaving(true);
    const payload: Record<string, unknown> = { ...editForm };
    if (!payload.pin) delete payload.pin; // don't send empty PIN
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(employees.map((e) => (e.id === id ? data.employee : e)));
        setEditingId(null);
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

  const handleDeactivateClick = (emp: Employee) => {
    if (emp.active) {
      setConfirmDeactivate(emp);
    } else {
      toggleActive(emp);
    }
  };

  const toggleActive = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !emp.active }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(employees.map((e) => (e.id === emp.id ? data.employee : e)));
        toast("success", ui.saved);
      }
    } catch {
      toast("error", ui.connectionError);
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({
      name: emp.name,
      role: emp.role,
      phone: emp.phone,
      pin: "",
      default_shift: emp.default_shift,
      is_manager: emp.is_manager,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-page" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-8 w-48 mb-4" />
          {[1, 2, 3, 4].map((i) => (
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
      <MobileNav lang={lang} userName={ui.employeeManagement} currentPage="employees" isManager={true} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-text-primary font-heading">{ui.employeeManagement}</h1>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover"
          >
            {showAdd ? ui.cancel : ui.addEmployee}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-danger-light border border-brand-danger/20 rounded-lg text-sm text-brand-danger">
            {error}
          </div>
        )}

        {/* Add form */}
        {showAdd && (
          <div className="mb-6 p-4 bg-surface-card rounded-lg border border-border-default shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <input
                placeholder={ui.name}
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
              />
              <input
                placeholder={ui.role}
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
              />
              <input
                placeholder={ui.phone}
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                dir="ltr"
              />
              <input
                placeholder={ui.pin}
                value={addForm.pin}
                onChange={(e) => setAddForm({ ...addForm, pin: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
                type="password"
                maxLength={4}
                dir="ltr"
              />
              <select
                value={addForm.default_shift}
                onChange={(e) => setAddForm({ ...addForm, default_shift: e.target.value })}
                className="px-3 py-2 border border-border-default rounded-md text-sm"
              >
                {shifts.filter((s) => s.active !== false).map((s) => (
                  <option key={s.key} value={s.key}>
                    {lang === "he" ? s.display_name_he : s.display_name_en}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={addForm.is_manager}
                  onChange={(e) => setAddForm({ ...addForm, is_manager: e.target.checked })}
                />
                {ui.isManager}
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-success text-white rounded-lg hover:bg-brand-success/90 disabled:opacity-50"
              >
                {saving ? "..." : ui.save}
              </button>
            </div>
          </div>
        )}

        {/* Desktop employee table */}
        <div className="hidden md:block">
          <Table>
            <Thead>
              <Tr>
                <Th>{ui.name}</Th>
                <Th>{ui.role}</Th>
                <Th>{ui.phone}</Th>
                <Th>{ui.defaultShift}</Th>
                <Th>{ui.status}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {employees.map((emp) => (
                <Tr key={emp.id} className={!emp.active ? "opacity-50 bg-surface-page" : ""}>
                  {editingId === emp.id ? (
                    <>
                      <Td>
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm w-full"
                        />
                      </Td>
                      <Td>
                        <input
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm w-full"
                        />
                      </Td>
                      <Td>
                        <input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm w-full"
                          dir="ltr"
                        />
                      </Td>
                      <Td>
                        <select
                          value={editForm.default_shift}
                          onChange={(e) => setEditForm({ ...editForm, default_shift: e.target.value })}
                          className="px-2 py-1 border border-border-default rounded text-sm"
                        >
                          {shifts.filter((s) => s.active !== false).map((s) => (
                            <option key={s.key} value={s.key}>
                              {lang === "he" ? s.display_name_he : s.display_name_en}
                            </option>
                          ))}
                        </select>
                      </Td>
                      <Td>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={editForm.is_manager}
                            onChange={(e) => setEditForm({ ...editForm, is_manager: e.target.checked })}
                          />
                          {ui.isManager}
                        </label>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleUpdate(emp.id)}
                            disabled={saving}
                            className="px-2 py-1 text-xs bg-brand-success text-white rounded hover:bg-brand-success/90 disabled:opacity-50"
                          >
                            {ui.save}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs bg-surface-subtle text-text-secondary rounded hover:bg-surface-subtle/80"
                          >
                            {ui.cancel}
                          </button>
                        </div>
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td className="font-medium">
                        {emp.name}
                        {emp.is_manager && (
                          <span className="mr-2 px-1.5 py-0.5 text-[10px] bg-brand-primary-light text-brand-primary rounded">
                            {ui.isManager}
                          </span>
                        )}
                      </Td>
                      <Td className="text-text-secondary">{emp.role}</Td>
                      <Td className="text-text-secondary" dir="ltr">{emp.phone}</Td>
                      <Td>{shiftLabel(emp.default_shift)}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          emp.active
                            ? "bg-brand-success-light text-brand-success"
                            : "bg-surface-subtle text-text-muted"
                        }`}>
                          {emp.active ? ui.active : ui.inactive}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(emp)}
                            className="px-2 py-1 text-xs text-brand-primary bg-brand-primary-light rounded hover:bg-brand-primary-light/70"
                          >
                            {ui.editEmployee}
                          </button>
                          <button
                            onClick={() => handleDeactivateClick(emp)}
                            className={`px-2 py-1 text-xs rounded ${
                              emp.active
                                ? "text-brand-danger bg-brand-danger-light hover:bg-red-100"
                                : "text-brand-success bg-brand-success-light hover:bg-green-100"
                            }`}
                          >
                            {emp.active ? ui.deactivate : ui.activate}
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

        {/* Mobile employee cards */}
        <div className="md:hidden space-y-2">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`bg-surface-card rounded-lg border border-border-default shadow-card p-3 ${
                !emp.active ? "opacity-50" : ""
              }`}
            >
              {editingId === emp.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder={ui.name}
                      className="px-2 py-1.5 border border-border-default rounded text-sm w-full"
                    />
                    <input
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      placeholder={ui.role}
                      className="px-2 py-1.5 border border-border-default rounded text-sm w-full"
                    />
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder={ui.phone}
                      className="px-2 py-1.5 border border-border-default rounded text-sm w-full"
                      dir="ltr"
                    />
                    <select
                      value={editForm.default_shift}
                      onChange={(e) => setEditForm({ ...editForm, default_shift: e.target.value })}
                      className="px-2 py-1.5 border border-border-default rounded text-sm"
                    >
                      {shifts.filter((s) => s.active !== false).map((s) => (
                        <option key={s.key} value={s.key}>
                          {lang === "he" ? s.display_name_he : s.display_name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={editForm.is_manager}
                        onChange={(e) => setEditForm({ ...editForm, is_manager: e.target.checked })}
                      />
                      {ui.isManager}
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdate(emp.id)}
                        disabled={saving}
                        className="px-3 py-1.5 text-xs bg-brand-success text-white rounded hover:bg-brand-success/90 disabled:opacity-50"
                      >
                        {ui.save}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs bg-surface-subtle text-text-secondary rounded hover:bg-surface-subtle/80"
                      >
                        {ui.cancel}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{emp.name}</span>
                      {emp.is_manager && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-brand-primary-light text-brand-primary rounded">
                          {ui.isManager}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      emp.active ? "bg-brand-success-light text-brand-success" : "bg-surface-subtle text-text-muted"
                    }`}>
                      {emp.active ? ui.active : ui.inactive}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted space-y-0.5 mb-2">
                    <div>{emp.role} &middot; {shiftLabel(emp.default_shift)}</div>
                    <div dir="ltr" className="text-start">{emp.phone}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(emp)}
                      className="px-2.5 py-1.5 text-xs text-brand-primary bg-brand-primary-light rounded hover:bg-brand-primary-light/70"
                    >
                      {ui.editEmployee}
                    </button>
                    <button
                      onClick={() => handleDeactivateClick(emp)}
                      className={`px-2.5 py-1.5 text-xs rounded ${
                        emp.active
                          ? "text-brand-danger bg-brand-danger-light hover:bg-red-100"
                          : "text-brand-success bg-brand-success-light hover:bg-green-100"
                      }`}
                    >
                      {emp.active ? ui.deactivate : ui.activate}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {employees.length === 0 && !showAdd && (
          <EmptyState
            icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            title={ui.noEmployees}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => {
          if (confirmDeactivate) {
            toggleActive(confirmDeactivate);
            setConfirmDeactivate(null);
          }
        }}
        title={ui.confirmDeactivate}
        message={`${confirmDeactivate?.name}: ${ui.confirmDeactivateDesc}`}
        confirmLabel={ui.confirm}
        cancelLabel={ui.cancel}
        variant="danger"
      />
    </div>
  );
}
