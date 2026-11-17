"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, RefreshCw, X, CheckCircle2, AlertTriangle, Building2, CalendarDays, Clock, Users } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import Select from "@/components/ui/Select";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const EMPTY_FORM = { course_id: "", exam_center: "", exam_date: "", exam_time: "", session_label: "", max_students: 100 };
const TIMINGS = ["Morning (10:00 AM - 1:00 PM)", "Evening (2:00 PM - 5:00 PM)"];

const inputCls =
  "h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function ExamConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [listErr, setListErr] = useState("");
  const [confirm, confirmDialog] = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cfgRes, crsRes] = await Promise.all([fetch("/api/admin/course-exam-config"), fetch("/api/admin/courses")]);
      const [cfgJson, crsJson] = await Promise.all([cfgRes.json(), crsRes.json()]);
      setConfigs(cfgJson.data || []);
      setCourses(crsJson.data || []);
    } catch {
      setError("Failed to load data.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setSaveMsg("");
    setSaveErr("");
    setShowForm(true);
  };
  const openEdit = (cfg) => {
    setForm({
      course_id: cfg.course_id,
      exam_center: cfg.exam_center,
      exam_date: cfg.exam_date || "",
      exam_time: cfg.exam_time || "",
      session_label: cfg.session_label || "",
      max_students: cfg.max_students ?? 100,
    });
    setEditId(cfg.id);
    setSaveMsg("");
    setSaveErr("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!form.course_id || !form.exam_center.trim()) {
      setSaveErr("Course and exam center are required.");
      return;
    }
    setSaving(true);
    setSaveErr("");
    setSaveMsg("");
    try {
      const url = editId ? `/api/admin/course-exam-config/${editId}` : "/api/admin/course-exam-config";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) {
        setSaveErr(json.error || "Save failed.");
      } else {
        setSaveMsg(editId ? "Updated successfully." : "Created successfully.");
        setShowForm(false);
        load();
      }
    } catch {
      setSaveErr("Network error.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Delete configuration?", message: "The center, date and time set for this course will be removed.", confirmLabel: "Delete", danger: true }))) return;
    setListErr("");
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/course-exam-config/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfigs((c) => c.filter((x) => x.id !== id));
      } else {
        const j = await res.json();
        setListErr(j.error || "Delete failed.");
      }
    } catch {
      setListErr("Network error.");
    }
    setDeleting(null);
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const actions = (
    <div className="flex items-center gap-2">
      <button
        onClick={load}
        disabled={loading}
        aria-label="Refresh"
        title="Refresh"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d3e1f5] bg-white text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </button>
      <button
        onClick={openCreate}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#1b57d8] px-3.5 text-[14px] font-bold text-white transition hover:bg-[#1245b8] sm:px-4"
      >
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Config</span>
        <span className="sm:hidden">Add</span>
      </button>
    </div>
  );

  return (
    <AdminPageShell
      title="Exam Configuration"
      subtitle="Exam centers, dates and sessions per course. Used for bulk admit card generation."
      backHref="/super-admin/dashboard?tab=exam"
      backLabel="Exam Management"
      actions={actions}
    >
      <div className="space-y-5">
        {listErr && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[14.5px] font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {listErr}
          </div>
        )}
        {saveMsg && !showForm && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[14.5px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {saveMsg}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSave} className="rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[17px] font-bold text-[#082a63]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fd] text-[#1b57d8]">
                  {editId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                {editId ? "Edit Configuration" : "New Exam Configuration"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-lg p-2 text-[#4a6090] hover:bg-[#eaf2fd]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {saveErr && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[14.5px] text-red-700">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {saveErr}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Course" required>
                <Select size="lg" ariaLabel="Course" placeholder="Select course" value={form.course_id}
                  onChange={(v) => setForm((f) => ({ ...f, course_id: v }))}
                  options={courses.map((c) => ({ value: c.id, label: c.course_name }))} />
              </Field>
              <Field label="Exam Center" required className="sm:col-span-2">
                <input
                  type="text"
                  value={form.exam_center}
                  onChange={(e) => setForm((f) => ({ ...f, exam_center: e.target.value }))}
                  placeholder="e.g. Government High School, Panaji"
                  className={inputCls}
                />
              </Field>
              <Field label="Exam Date">
                <input type="date" value={form.exam_date} onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Exam Time">
                <Select size="lg" ariaLabel="Exam time" placeholder="Select timing" value={form.exam_time || ""}
                  onChange={(v) => setForm((f) => ({ ...f, exam_time: v }))}
                  options={[
                    { value: "", label: "No timing" },
                    ...TIMINGS.map((t) => ({ value: t, label: t })),
                    ...(form.exam_time && !TIMINGS.includes(form.exam_time) ? [{ value: form.exam_time, label: form.exam_time }] : []),
                  ]} />
              </Field>
              <Field label="Session Label">
                <input
                  type="text"
                  value={form.session_label}
                  onChange={(e) => setForm((f) => ({ ...f, session_label: e.target.value }))}
                  placeholder="e.g. 2025-26"
                  className={inputCls}
                />
              </Field>
              <Field label="Max Students">
                <input
                  type="number"
                  min={1}
                  value={form.max_students}
                  onChange={(e) => setForm((f) => ({ ...f, max_students: parseInt(e.target.value) || 100 }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#d3e1f5] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-11 rounded-xl border border-[#d3e1f5] px-6 text-[15px] font-bold text-[#082a63] hover:bg-[#f4f8fe]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-7 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Save
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[15px] text-red-700">{error}</div>
        ) : configs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white px-4 py-14 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
            <p className="text-[16px] font-bold text-[#082a63]">No exam configurations yet</p>
            <p className="mt-1 text-[14px] text-[#4a6090]">Add a configuration to set the center, date and timing for a course.</p>
            {!showForm && (
              <button onClick={openCreate} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white hover:bg-[#1245b8]">
                <Plus className="h-4 w-4" /> Add Config
              </button>
            )}
          </div>
        ) : (
          <>
            {/* cards (mobile / tablet) */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {configs.map((cfg) => (
                <div key={cfg.id} className="min-w-0 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-[16px] font-bold text-[#082a63]">{cfg.courses?.course_name || "—"}</p>
                      <p className="mt-0.5 break-words text-[14px] text-[#3d5688]">{cfg.exam_center}</p>
                    </div>
                    {cfg.session_label && (
                      <span className="shrink-0 rounded-full bg-[#eaf2fd] px-2.5 py-0.5 text-[12.5px] font-bold text-[#1245b8]">{cfg.session_label}</span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-1.5 text-[14px] text-[#3d5688] sm:grid-cols-2">
                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[#1b57d8]" /> {fmtDate(cfg.exam_date)}</span>
                    <span className="flex items-center gap-2"><Users className="h-4 w-4 shrink-0 text-[#1b57d8]" /> Max {cfg.max_students}</span>
                    <span className="flex items-center gap-2 sm:col-span-2"><Clock className="h-4 w-4 shrink-0 text-[#1b57d8]" /> {cfg.exam_time || "—"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => openEdit(cfg)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cfg.id)}
                      disabled={deleting === cfg.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deleting === cfg.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* table (laptops) */}
            <div className="hidden overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm lg:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                  <tr>
                    {["Course", "Exam Center", "Date", "Time", "Session", "Max"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">{h}</th>
                    ))}
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {configs.map((cfg) => (
                    <tr key={cfg.id} className="transition-colors hover:bg-[#f4f8fe]">
                      <td className="px-5 py-3.5 font-bold text-[#082a63]">{cfg.courses?.course_name || "—"}</td>
                      <td className="px-5 py-3.5 text-[#3d5688]">{cfg.exam_center}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-[#3d5688]">{fmtDate(cfg.exam_date)}</td>
                      <td className="px-5 py-3.5 text-[#3d5688]">{cfg.exam_time || "—"}</td>
                      <td className="px-5 py-3.5">
                        {cfg.session_label ? <span className="rounded-full bg-[#eaf2fd] px-2.5 py-0.5 text-[13px] font-bold text-[#1245b8]">{cfg.session_label}</span> : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[#3d5688]">{cfg.max_students}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(cfg)} title="Edit" aria-label="Edit" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:bg-[#eaf2fd]">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cfg.id)}
                            disabled={deleting === cfg.id}
                            title="Delete"
                            aria-label="Delete"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {deleting === cfg.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {confirmDialog}
    </AdminPageShell>
  );
}
