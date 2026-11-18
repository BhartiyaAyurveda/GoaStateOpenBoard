"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen, Calendar, Hash, BarChart2, Plus, Trash2, Pencil,
  RefreshCw, CheckCircle2, AlertTriangle, Save,
  FileText, UserCheck, XCircle, Eye, ChevronDown, Printer, MapPin,
  Clock, Users, Sparkles, CheckSquare, Square, Search, GraduationCap, Building2, CalendarDays,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { getNextSession, getPrevSession, get6DigitSession } from "@/lib/enrollment-roll-utils";

const TABS = [
  { id: "subjects",   label: "Subjects",     icon: BookOpen },
  { id: "datesheet",  label: "Datesheet",    icon: Calendar },
  { id: "rollnos",    label: "Roll Numbers", icon: Hash },
  { id: "results",    label: "Results",      icon: BarChart2 },
  { id: "centers",    label: "Centers",      icon: MapPin },
];

// ── Shared filter bar ──────────────────────────────────────
function FilterBar({ courses, sessions, selectedCourse, selectedSession, onCourseChange, onSessionChange, showSession = true }) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
      <Select size="lg" ariaLabel="Course" className="w-full sm:w-72" value={selectedCourse} onChange={onCourseChange}
        options={[{ value: "", label: "All courses" }, ...courses.map(c => ({ value: c.course_name, label: c.course_name }))]} />
      {showSession && (
        <Select size="lg" ariaLabel="Session" placeholder="Select session" className="w-full sm:w-64" value={selectedSession} onChange={onSessionChange}
          options={sessions.map(s => ({ value: s.id, label: s.session_label || s.session_name || s.id }))} />
      )}
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-[15px] font-semibold sm:bottom-6 sm:left-auto sm:right-6 sm:text-[17px] ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {toast.message}
    </div>
  );
}

const TIMINGS = ["Morning (10:00 AM - 1:00 PM)", "Evening (2:00 PM - 5:00 PM)"];

const YEARS = [
  { yr: "1", label: "1st Year", icon: GraduationCap },
  { yr: "2", label: "2nd Year", icon: Sparkles },
  { yr: "3", label: "3rd Year", icon: Sparkles },
];

// 1st / 2nd / 3rd year switch shared by the tabs
function YearToggle({ value, onChange, label = "Year" }) {
  // Goa State Open School programmes (Class X / XII) are single-year, so there is nothing to choose: always year 1.
  return null;
  // eslint-disable-next-line no-unreachable
  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">{label}</span>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-1">
        {YEARS.map(({ yr, label: l, icon: Icon }) => (
          <button key={yr} type="button" onClick={() => onChange(yr)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[14.5px] font-bold transition ${value === yr ? "bg-[#082a63] text-white shadow-sm" : "text-[#3d5688] hover:bg-white"}`}>
            <Icon className="hidden h-3.5 w-3.5 sm:block" /> {l}
          </button>
        ))}
      </div>
    </div>
  );
}

const fieldCls = "h-11 w-full min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";
const labelCls = "mb-1.5 block text-[13.5px] font-bold text-[#082a63]";

// ── Shared Year-to-Session Transition Helper ───────────────
async function advanceOrRecedeSession({
  currentYear,
  newYear,
  currentSessionId,
  sessions = [],
  setSessions,
  setSelectedSession,
  showToast,
}) {
  if (!setSelectedSession || newYear === currentYear) return;

  const currSess =
    sessions.find((s) => s.id === currentSessionId) ||
    sessions.find((s) => s.is_active) ||
    sessions[0];
  const currName = currSess?.session_name || currSess?.academic_session || currSess?.session_label || "";

  const oldY = parseInt(currentYear, 10) || 1;
  const newY = parseInt(newYear, 10) || 1;
  const diff = newY - oldY;

  if (diff > 0 && currName) {
    let targetName = currName;
    for (let i = 0; i < diff; i++) {
      targetName = getNextSession(targetName);
    }

    if (targetName) {
      const existing = sessions.find((s) => {
        const sName = s.session_name || s.academic_session || s.session_label || "";
        return sName === targetName || get6DigitSession(sName) === get6DigitSession(targetName);
      });

      if (existing) {
        setSelectedSession(existing.id);
        if (showToast) {
          showToast(`Switched session to ${existing.session_name || targetName} for ${newYear === "3" ? "3rd" : "2nd"} Year`);
        }
        return;
      }

      try {
        const res = await fetch("/api/admin/exam-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_name: targetName }),
        });
        const json = await res.json();
        if (res.ok && json.data) {
          const newSess = json.data;
          if (typeof setSessions === "function") {
            setSessions((prev) => [newSess, ...prev]);
          }
          setSelectedSession(newSess.id);
          if (showToast) {
            showToast(`Created & switched session to ${targetName} for ${newYear === "3" ? "3rd" : "2nd"} Year`);
          }
          return;
        }
      } catch (err) {
        console.error("Failed to auto-create next session:", err);
      }
    }
  } else if (diff < 0 && currName) {
    const steps = Math.abs(diff);
    let targetName = currName;
    for (let i = 0; i < steps; i++) {
      targetName = getPrevSession(targetName);
    }

    if (targetName) {
      const existing = sessions.find((s) => {
        const sName = s.session_name || s.academic_session || s.session_label || "";
        return sName === targetName || get6DigitSession(sName) === get6DigitSession(targetName);
      });

      if (existing) {
        setSelectedSession(existing.id);
        if (showToast) {
          showToast(`Switched back to session ${existing.session_name || targetName} for ${newYear === "1" ? "1st" : "2nd"} Year`);
        }
        return;
      }
    }
  }
}

// ══════════════════════════════════════════════════════════
// TAB 1 — SUBJECTS
// ══════════════════════════════════════════════════════════
function SubjectsTab({
  confirm,
  courses = [],
  sessions = [],
  setSessions,
  selectedCourse: propCourse,
  setSelectedCourse: propSetCourse,
  selectedSession: propSession,
  setSelectedSession: propSetSession,
  selectedYear: propYear,
  setSelectedYear: propSetYear,
  showToast,
}) {
  const [localCourse, setLocalCourse] = useState("");
  const [localSession, setLocalSession] = useState("");
  const [localYear, setLocalYear] = useState("1");

  const selectedCourse = propCourse !== undefined ? propCourse : localCourse;
  const setSelectedCourse = propSetCourse || setLocalCourse;
  const selectedSession = propSession !== undefined ? propSession : localSession;
  const setSelectedSession = propSetSession || setLocalSession;
  const selectedYear = propYear !== undefined ? propYear : localYear;
  const setSelectedYear = propSetYear || setLocalYear;

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addForm, setAddForm] = useState({ subject_name: "", subject_code: "", theory_max: 100, practical_max: 0, ca_max: 0, is_language_option: false });
  const [saving, setSaving] = useState(false);

  const handleYearChange = async (newYear) => {
    if (newYear === selectedYear) return;
    await advanceOrRecedeSession({
      currentYear: selectedYear,
      newYear,
      currentSessionId: selectedSession,
      sessions,
      setSessions,
      setSelectedSession,
      showToast,
    });
    setSelectedYear(newYear);
  };

  const load = useCallback(async (course, year) => {
    if (!course) return;
    setLoading(true);
    const yrParam = year ? `&year_number=${year}` : "";
    const res = await fetch(`/api/admin/subjects?course_name=${encodeURIComponent(course)}${yrParam}`);
    const json = await res.json();
    setSubjects(json.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(selectedCourse, selectedYear); }, [selectedCourse, selectedYear, load]);

  const handleAdd = async () => {
    if (!selectedCourse || !addForm.subject_name) return showToast("Select a course and enter subject name", "error");
    setSaving(true);
    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, course_name: selectedCourse, year_number: Number(selectedYear) || 1 })
    });
    const json = await res.json();
    if (!res.ok) { showToast(json.error || "Failed", "error"); }
    else {
      showToast(`Subject added to Year ${selectedYear}!`);
      setAddForm({ subject_name: "", subject_code: "", theory_max: 100, practical_max: 0, ca_max: 0, is_language_option: false });
      load(selectedCourse, selectedYear);
    }
    setSaving(false);
  };

  const handleEdit = async (id) => {
    setSaving(true);
    const res = await fetch(`/api/admin/subjects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const json = await res.json();
    if (!res.ok) { showToast(json.error || "Failed", "error"); }
    else { showToast("Subject updated!"); setEditingId(null); load(selectedCourse, selectedYear); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: "Delete subject?", message: "Marks and datesheet entries for this subject may be affected. This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) showToast(json.error || "Failed to delete", "error");
    else { showToast("Subject deleted!"); load(selectedCourse, selectedYear); }
  };

  const yearLabel = selectedYear === "1" ? "1st Year" : selectedYear === "2" ? "2nd Year" : "3rd Year";
  const fieldCls = "h-11 w-full min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";
  const cellCls = "h-10 w-full min-w-0 rounded-lg border border-[#b9cbe6] bg-white px-2.5 text-[14.5px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15";
  const labelCls = "mb-1.5 block text-[13.5px] font-bold text-[#082a63]";
  const num = (v) => (v === "" || v === null || v === undefined ? "" : v);
  const total = (s) => (Number(s.theory_max) || 0) + (Number(s.practical_max) || 0) + (Number(s.ca_max) || 0);
  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm({ subject_name: s.subject_name, subject_code: s.subject_code, theory_max: s.theory_max, practical_max: s.practical_max, ca_max: s.ca_max, is_language_option: !!s.is_language_option });
  };
  const patchEdit = (key, isNum) => (e) => setEditForm((f) => ({ ...f, [key]: isNum ? (e.target.value === "" ? "" : +e.target.value) : e.target.value }));
  const patchAdd = (key, isNum) => (e) => setAddForm((f) => ({ ...f, [key]: isNum ? (e.target.value === "" ? "" : +e.target.value) : e.target.value }));
  const Marks = ({ v }) => <span className="inline-flex min-w-[2.5rem] justify-center rounded-md bg-[#eaf2fd] px-2 py-0.5 text-[14px] font-bold text-[#082a63]">{v ?? 0}</span>;

  return (
    <div className="min-w-0 space-y-5">
      {/* Course + year */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <label className="block min-w-0 lg:w-[26rem]">
          <span className={labelCls}>Programme</span>
          <Select size="lg" ariaLabel="Programme" placeholder="Select programme" value={selectedCourse} onChange={setSelectedCourse}
            options={courses.map((c) => ({ value: c.course_name, label: c.course_name }))} />
        </label>

        {false && selectedCourse && (
          <div className="min-w-0">
            <span className={labelCls}>Year</span>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-1">
              {[
                { yr: "1", label: "1st Year", icon: GraduationCap },
                { yr: "2", label: "2nd Year", icon: Sparkles },
                { yr: "3", label: "3rd Year", icon: Sparkles },
              ].map(({ yr, label, icon: Icon }) => (
                <button key={yr} type="button" onClick={() => handleYearChange(yr)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[14.5px] font-bold transition ${selectedYear === yr ? "bg-[#082a63] text-white shadow-sm" : "text-[#3d5688] hover:bg-white"}`}>
                  <Icon className="hidden h-3.5 w-3.5 sm:block" /> {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCourse && (
        <>
          {/* Add subject */}
          <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:p-5">
            <h3 className="mb-4 flex items-center gap-2 text-[17px] font-bold text-[#082a63]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fd] text-[#1b57d8]"><Plus className="h-4 w-4" /></span>
              Add New Subject
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
              className="grid grid-cols-2 gap-4 lg:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] lg:items-end">
              <label className="col-span-2 block min-w-0 lg:col-span-1">
                <span className={labelCls}>Subject name <span className="text-red-500">*</span></span>
                <input value={addForm.subject_name} onChange={patchAdd("subject_name")} className={fieldCls} placeholder="e.g. Mathematics" />
              </label>
              <label className="col-span-2 block min-w-0 sm:col-span-1">
                <span className={labelCls}>Code</span>
                <input value={addForm.subject_code} onChange={patchAdd("subject_code")} className={fieldCls} placeholder="e.g. 211" />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>Theory max</span>
                <input type="number" min={0} value={num(addForm.theory_max)} onChange={patchAdd("theory_max", true)} className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>Practical max</span>
                <input type="number" min={0} value={num(addForm.practical_max)} onChange={patchAdd("practical_max", true)} className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>CA max</span>
                <input type="number" min={0} value={num(addForm.ca_max)} onChange={patchAdd("ca_max", true)} className={fieldCls} />
              </label>
              <button type="submit" disabled={saving}
                className="col-span-2 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 lg:col-span-1">
                <Plus className="h-4 w-4" /> {saving ? "Saving..." : "Add Subject"}
              </button>
              <label className="col-span-2 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 lg:col-span-6">
                <input type="checkbox" checked={!!addForm.is_language_option} onChange={(e) => setAddForm((f) => ({ ...f, is_language_option: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[#1b57d8]" />
                <span className="text-[13.5px] font-medium leading-snug text-[#3d5688]"><b className="text-[#082a63]">Language option.</b> Each student takes only ONE of the language options (chosen at registration). Leave unticked for compulsory subjects such as English.</span>
              </label>
            </form>
          </div>

          {/* Subjects list */}
          <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold text-[#082a63]">{selectedCourse}</p>
                <p className="text-[13.5px] text-[#3d5688]">Subjects</p>
              </div>
              <span className="rounded-full bg-[#082a63] px-3 py-1 text-[13px] font-bold text-white">{subjects.length} {subjects.length === 1 ? "subject" : "subjects"}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>
            ) : subjects.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                <p className="text-[16px] font-bold text-[#082a63]">No subjects yet</p>
                <p className="mt-1 text-[14px] text-[#4a6090]">Add the first subject using the form above.</p>
              </div>
            ) : (
              <>
                {/* table (laptops) */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left text-[15px]">
                    <thead className="border-b border-[#d3e1f5]">
                      <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                        <th className="px-5 py-3">Subject</th>
                        <th className="px-3 py-3">Code</th>
                        <th className="px-3 py-3 text-center">Theory</th>
                        <th className="px-3 py-3 text-center">Practical</th>
                        <th className="px-3 py-3 text-center">CA</th>
                        <th className="px-3 py-3 text-center">Total</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4edf9]">
                      {subjects.map((s) => (
                        <tr key={s.id} className={editingId === s.id ? "bg-[#f4f8fe]" : "transition-colors hover:bg-[#f4f8fe]"}>
                          {editingId === s.id ? (
                            <>
                              <td className="px-5 py-2.5">
                                <input value={editForm.subject_name || ""} onChange={patchEdit("subject_name")} className={cellCls} />
                                <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-[#3d5688]"><input type="checkbox" checked={!!editForm.is_language_option} onChange={(e) => setEditForm((f) => ({ ...f, is_language_option: e.target.checked }))} className="h-4 w-4 accent-[#1b57d8]" /> Language option</label>
                              </td>
                              <td className="w-32 px-3 py-2.5"><input value={editForm.subject_code || ""} onChange={patchEdit("subject_code")} className={cellCls} /></td>
                              <td className="w-24 px-3 py-2.5"><input type="number" min={0} value={num(editForm.theory_max)} onChange={patchEdit("theory_max", true)} className={`${cellCls} text-center`} /></td>
                              <td className="w-24 px-3 py-2.5"><input type="number" min={0} value={num(editForm.practical_max)} onChange={patchEdit("practical_max", true)} className={`${cellCls} text-center`} /></td>
                              <td className="w-24 px-3 py-2.5"><input type="number" min={0} value={num(editForm.ca_max)} onChange={patchEdit("ca_max", true)} className={`${cellCls} text-center`} /></td>
                              <td className="px-3 py-2.5 text-center text-[#8a97b3]">—</td>
                              <td className="px-5 py-2.5">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => handleEdit(s.id)} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1b57d8] px-3 text-[14px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60"><Save className="h-4 w-4" /> Save</button>
                                  <button onClick={() => setEditingId(null)} className="inline-flex h-9 items-center rounded-lg border border-[#d3e1f5] bg-white px-3 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">Cancel</button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3 font-bold text-[#082a63]">{s.subject_name}{s.is_language_option && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[11.5px] font-bold text-violet-800">Language option</span>}</td>
                              <td className="px-3 py-3">{s.subject_code ? <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13px] font-bold text-[#1245b8]">{s.subject_code}</span> : <span className="text-[#8a97b3]">—</span>}</td>
                              <td className="px-3 py-3 text-center"><Marks v={s.theory_max} /></td>
                              <td className="px-3 py-3 text-center"><Marks v={s.practical_max} /></td>
                              <td className="px-3 py-3 text-center"><Marks v={s.ca_max} /></td>
                              <td className="px-3 py-3 text-center font-extrabold text-[#082a63]">{total(s)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => startEdit(s)} title="Edit" aria-label="Edit subject" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:bg-[#eaf2fd]"><Pencil className="h-4 w-4" /></button>
                                  <button onClick={() => handleDelete(s.id)} title="Delete" aria-label="Delete subject" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* cards (mobile / tablet) */}
                <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                  {subjects.map((s) => (
                    <div key={s.id} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                      {editingId === s.id ? (
                        <div className="space-y-3">
                          <label className="block"><span className={labelCls}>Subject name</span><input value={editForm.subject_name || ""} onChange={patchEdit("subject_name")} className={fieldCls} /></label>
                          <label className="flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-[#3d5688]"><input type="checkbox" checked={!!editForm.is_language_option} onChange={(e) => setEditForm((f) => ({ ...f, is_language_option: e.target.checked }))} className="h-4 w-4 accent-[#1b57d8]" /> Language option (student picks one)</label>
                          <label className="block"><span className={labelCls}>Code</span><input value={editForm.subject_code || ""} onChange={patchEdit("subject_code")} className={fieldCls} /></label>
                          <div className="grid grid-cols-3 gap-2">
                            <label className="block"><span className={labelCls}>Theory</span><input type="number" min={0} value={num(editForm.theory_max)} onChange={patchEdit("theory_max", true)} className={fieldCls} /></label>
                            <label className="block"><span className={labelCls}>Practical</span><input type="number" min={0} value={num(editForm.practical_max)} onChange={patchEdit("practical_max", true)} className={fieldCls} /></label>
                            <label className="block"><span className={labelCls}>CA</span><input type="number" min={0} value={num(editForm.ca_max)} onChange={patchEdit("ca_max", true)} className={fieldCls} /></label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => handleEdit(s.id)} disabled={saving} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] text-[14.5px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60"><Save className="h-4 w-4" /> Save</button>
                            <button onClick={() => setEditingId(null)} className="h-11 rounded-xl border border-[#d3e1f5] text-[14.5px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <p className="min-w-0 break-words text-[16px] font-bold text-[#082a63]">{s.subject_name}{s.is_language_option && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[11.5px] font-bold text-violet-800">Language option</span>}</p>
                            {s.subject_code && <span className="shrink-0 rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13px] font-bold text-[#1245b8]">{s.subject_code}</span>}
                          </div>
                          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                            {[["Theory", s.theory_max], ["Practical", s.practical_max], ["CA", s.ca_max], ["Total", total(s)]].map(([k, v]) => (
                              <div key={k} className={`rounded-lg px-1 py-2 ${k === "Total" ? "bg-[#082a63] text-white" : "bg-[#f4f8fe] text-[#082a63]"}`}>
                                <p className={`text-[11.5px] font-bold uppercase tracking-wide ${k === "Total" ? "text-blue-100" : "text-[#4a6090]"}`}>{k}</p>
                                <p className="text-[16px] font-extrabold">{v ?? 0}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button onClick={() => startEdit(s)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]"><Pencil className="h-4 w-4" /> Edit</button>
                            <button onClick={() => handleDelete(s.id)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TAB 2 — DATESHEET
// ══════════════════════════════════════════════════════════
function DatesheetTab({
  courses = [],
  sessions = [],
  setSessions,
  selectedCourse: propCourse,
  setSelectedCourse: propSetCourse,
  selectedSession: propSession,
  setSelectedSession: propSetSession,
  selectedYear: propYear,
  setSelectedYear: propSetYear,
  showToast,
}) {
  const [localCourse, setLocalCourse] = useState("");
  const [localSession, setLocalSession] = useState("");
  const [localYear, setLocalYear] = useState("1");

  const selectedCourse = propCourse !== undefined ? propCourse : localCourse;
  const setSelectedCourse = propSetCourse || setLocalCourse;
  const selectedSession = propSession !== undefined ? propSession : localSession;
  const setSelectedSession = propSetSession || setLocalSession;
  const selectedYear = propYear !== undefined ? propYear : localYear;
  const setSelectedYear = propSetYear || setLocalYear;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-select session on first load if none selected
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      const active = sessions.find((s) => s.is_active) || sessions[0];
      if (active) setSelectedSession(active.id);
    }
  }, [sessions, selectedSession, setSelectedSession]);

  const handleYearChange = async (newYear) => {
    if (newYear === selectedYear) return;
    await advanceOrRecedeSession({
      currentYear: selectedYear,
      newYear,
      currentSessionId: selectedSession,
      sessions,
      setSessions,
      setSelectedSession,
      showToast,
    });
    setSelectedYear(newYear);
  };

  const load = useCallback(async () => {
    if (!selectedCourse || !selectedSession) return;
    setLoading(true);
    const yrParam = selectedYear ? `&year_number=${selectedYear}` : "";
    const res = await fetch(`/api/admin/datesheets?exam_session_id=${selectedSession}&course_name=${encodeURIComponent(selectedCourse)}${yrParam}`);
    const json = await res.json();
    setRows(json.data || []);
    setLoading(false);
  }, [selectedCourse, selectedSession, selectedYear]);

  useEffect(() => { load(); }, [load]);

  const update = (idx, field, val) => setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: val } : row));

  const handleSave = async () => {
    if (!selectedSession) return;
    setSaving(true);
    const entries = rows.map(r => ({ subject_id: r.id, exam_date: r.exam_date || null, exam_time: r.exam_time || null }));
    const res = await fetch("/api/admin/datesheets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exam_session_id: selectedSession, entries }) });
    const json = await res.json();
    if (!res.ok) showToast(json.error || "Failed to save", "error");
    else { showToast("Datesheet saved!"); load(); }
    setSaving(false);
  };

  const scheduled = rows.filter((r) => r.exam_date && r.exam_time).length;
  const yearLabel = selectedYear === "1" ? "1st Year" : selectedYear === "2" ? "2nd Year" : "3rd Year";
  const dateCls = "h-10 w-full min-w-0 rounded-lg border border-[#d3e1f5] bg-white px-2.5 text-[14.5px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15";
  const timeOptions = (row) => [
    { value: "", label: "No timing" },
    ...TIMINGS.map((t) => ({ value: t, label: t })),
    ...(row.exam_time && !TIMINGS.includes(row.exam_time) ? [{ value: row.exam_time, label: row.exam_time }] : []),
  ];
  const StatusPill = ({ row }) =>
    row.exam_date && row.exam_time ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[13px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Set</span>
    ) : (
      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[13px] font-bold text-amber-800">Pending</span>
    );

  return (
    <div className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <FilterBar courses={courses} sessions={sessions} selectedCourse={selectedCourse} selectedSession={selectedSession} onCourseChange={setSelectedCourse} onSessionChange={setSelectedSession} />
        {selectedCourse && selectedSession && <YearToggle value={selectedYear} onChange={handleYearChange} />}
      </div>

      {selectedCourse && selectedSession && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white px-4 py-12 text-center">
              <Calendar className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
              <p className="text-[16px] font-bold text-[#082a63]">No subjects for this programme</p>
              <p className="mt-1 text-[14px] text-[#4a6090]">Add subjects in the Subjects tab first, then set their dates here.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[16px] font-bold text-[#082a63]">Exam schedule</p>
                  <p className="text-[13.5px] text-[#3d5688]">{scheduled} of {rows.length} subjects scheduled</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
                  <Select size="lg" ariaLabel="Set time for all subjects" placeholder="Set time for all…" className="sm:w-64" align="right" value=""
                    onChange={(v) => v && setRows((r) => r.map((row) => ({ ...row, exam_time: v })))}
                    options={TIMINGS.map((t) => ({ value: t, label: `All ${t}` }))} />
                  <button onClick={handleSave} disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60">
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Datesheet"}
                  </button>
                </div>
              </div>

              {/* table (laptops) */}
              <div className="hidden lg:block">
                <table className="w-full text-left text-[15px]">
                  <thead className="border-b border-[#d3e1f5]">
                    <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-3 py-3">Code</th>
                      <th className="w-56 px-3 py-3">Exam date</th>
                      <th className="w-72 px-3 py-3">Exam time</th>
                      <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4edf9]">
                    {rows.map((row, i) => (
                      <tr key={row.id} className="transition-colors hover:bg-[#f4f8fe]">
                        <td className="px-5 py-3 font-bold text-[#082a63]">{row.subject_name}</td>
                        <td className="px-3 py-3">{row.subject_code ? <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13px] font-bold text-[#1245b8]">{row.subject_code}</span> : <span className="text-[#8a97b3]">—</span>}</td>
                        <td className="px-3 py-3"><DatePicker size="md" ariaLabel="Exam date" value={row.exam_date || ""} onChange={(v) => update(i, "exam_date", v)} min="2000-01-01" max="2100-12-31" /></td>
                        <td className="px-3 py-3"><Select ariaLabel={`Exam time for ${row.subject_name}`} placeholder="Select timing" value={row.exam_time || ""} onChange={(v) => update(i, "exam_time", v)} options={timeOptions(row)} /></td>
                        <td className="px-5 py-3 text-center"><StatusPill row={row} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* cards (mobile / tablet) */}
              <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                {rows.map((row, i) => (
                  <div key={row.id} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-[16px] font-bold text-[#082a63]">{row.subject_name}</p>
                        {row.subject_code && <span className="mt-1 inline-block rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{row.subject_code}</span>}
                      </div>
                      <StatusPill row={row} />
                    </div>
                    <div className="mt-3 space-y-3">
                      <label className="block"><span className={labelCls}>Exam date</span><DatePicker ariaLabel="Exam date" value={row.exam_date || ""} onChange={(v) => update(i, "exam_date", v)} min="2000-01-01" max="2100-12-31" /></label>
                      <div><span className={labelCls}>Exam time</span><Select size="lg" ariaLabel={`Exam time for ${row.subject_name}`} placeholder="Select timing" value={row.exam_time || ""} onChange={(v) => update(i, "exam_time", v)} options={timeOptions(row)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TAB 3 — ROLL NUMBERS (PROCESS-DRIVEN WORKFLOW)
// ══════════════════════════════════════════════════════════
function RollNumbersTab({
  confirm,
  courses = [],
  sessions = [],
  setSessions,
  selectedCourse: propCourse,
  setSelectedCourse: propSetCourse,
  selectedSession: propSession,
  setSelectedSession: propSetSession,
  targetYear: propYear,
  setTargetYear: propSetYear,
  showToast,
}) {
  const [localCourse, setLocalCourse] = useState("");
  const [localSession, setLocalSession] = useState("");
  const [localTargetYear, setLocalTargetYear] = useState("1");

  const selectedCourse = propCourse !== undefined ? propCourse : localCourse;
  const setSelectedCourse = propSetCourse || setLocalCourse;
  const selectedSession = propSession !== undefined ? propSession : localSession;
  const setSelectedSession = propSetSession || setLocalSession;
  const targetYear = propYear !== undefined ? propYear : localTargetYear;
  const setTargetYear = propSetYear || setLocalTargetYear;

  const [allottedStudents, setAllottedStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [stats, setStats] = useState({ totalApproved: 0, allottedCount: 0, pendingCount: 0 });
  const [patternInfo, setPatternInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [allotting, setAllotting] = useState(false);
  const [prefix, setPrefix] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("pending"); // "pending" | "allotted"
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-select session on first load if none selected
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      const active = sessions.find((s) => s.is_active) || sessions[0];
      if (active) setSelectedSession(active.id);
    }
  }, [sessions, selectedSession, setSelectedSession]);

  const handleTargetYearChange = async (newYear) => {
    if (newYear === targetYear) return;
    await advanceOrRecedeSession({
      currentYear: targetYear,
      newYear,
      currentSessionId: selectedSession,
      sessions,
      setSessions,
      setSelectedSession,
      showToast,
    });
    setTargetYear(newYear);
  };

  const load = useCallback(async () => {
    if (!selectedSession) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/roll-numbers?exam_session_id=${selectedSession}&target_year=${targetYear}`);
      const json = await res.json();
      if (res.ok) {
        const allotted = json.allotted || json.data || [];
        const pending = json.pending || [];
        setAllottedStudents(allotted);
        setPendingStudents(pending);
        setStats(
          json.stats || {
            totalApproved: allotted.length + pending.length,
            allottedCount: allotted.length,
            pendingCount: pending.length,
          }
        );
        setPatternInfo(json.pattern_info || {});

        // Auto switch tab if pending is 0 and allotted has students
        if (pending.length === 0 && allotted.length > 0) {
          setActiveSubTab("allotted");
        } else if (pending.length > 0) {
          setActiveSubTab("pending");
        }
      }
    } catch (err) {
      console.error("Failed to load roll numbers:", err);
    } finally {
      setLoading(false);
      setSelectedStudentIds(new Set());
    }
  }, [selectedSession, targetYear]);

  useEffect(() => {
    load();
  }, [selectedSession, targetYear]);

  // Bulk / Selective / Single Allotment
  const handleAllot = async (specificIds = null) => {
    if (!selectedSession) return showToast("Select a session first", "error");
    setAllotting(true);
    try {
      const payload = {
        exam_session_id: selectedSession,
        prefix: prefix.trim() || undefined,
        target_year: parseInt(targetYear, 10),
      };
      if (Array.isArray(specificIds) && specificIds.length > 0) {
        payload.student_ids = specificIds;
      } else if (selectedStudentIds.size > 0 && specificIds === "selected") {
        payload.student_ids = Array.from(selectedStudentIds);
      }

      const res = await fetch("/api/admin/roll-numbers/allot-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        showToast(json.error || "Failed to allot roll numbers", "error");
      } else {
        const yearLabel = targetYear === "3" ? "3rd Year" : targetYear === "2" ? "2nd Year" : "1st Year";
        showToast(`Allotted ${json.allotted} roll numbers!`);
        setSelectedStudentIds(new Set());
        load();
      }
    } catch (err) {
      showToast("Error occurred during allotment", "error");
    } finally {
      setAllotting(false);
    }
  };

  const handleUnallot = async (id) => {
    const yrLabel = targetYear === "3" ? "3rd Year " : targetYear === "2" ? "2nd Year " : "";
    if (!(await confirm({ title: "Remove roll number?", message: `Remove the ${yrLabel}roll number of this student? Their marks and admit card may also be cleared.`, confirmLabel: "Remove", danger: true }))) return;
    try {
      const res = await fetch("/api/admin/roll-numbers/unallot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_id: id, target_year: parseInt(targetYear, 10) }),
      });
      const json = await res.json();
      if (!res.ok) showToast(json.error || "Failed", "error");
      else {
        showToast("Roll number removed");
        load();
      }
    } catch (err) {
      showToast("Error unalloting student", "error");
    }
  };

  // Toggle selection
  const toggleSelectStudent = (id) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (filteredPending) => {
    if (selectedStudentIds.size === filteredPending.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredPending.map((s) => s.id)));
    }
  };

  // Filter by selectedCourse if specified, otherwise show all
  const coursePending = selectedCourse
    ? pendingStudents.filter((s) => s.courses?.course_name === selectedCourse)
    : pendingStudents;

  const courseAllotted = selectedCourse
    ? allottedStudents.filter((s) => s.courses?.course_name === selectedCourse)
    : allottedStudents;

  const currentTotalApproved = coursePending.length + courseAllotted.length;
  const currentPendingCount = coursePending.length;
  const currentAllottedCount = courseAllotted.length;

  // Filtered lists based on search
  const filteredPending = coursePending.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.candidate_name?.toLowerCase().includes(q) ||
      s.enrollment_no?.toLowerCase().includes(q) ||
      s.colleges?.college_name?.toLowerCase().includes(q) ||
      s.courses?.course_name?.toLowerCase().includes(q) ||
      s.projected_roll_no?.toLowerCase().includes(q)
    );
  });

  const filteredAllotted = courseAllotted.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const roll = targetYear === "3" ? (s.roll_no_3rd_year || s.roll_no_2nd_year || s.roll_no) : targetYear === "2" ? (s.roll_no_2nd_year || s.roll_no) : s.roll_no;
    return (
      roll?.toLowerCase().includes(q) ||
      s.candidate_name?.toLowerCase().includes(q) ||
      s.enrollment_no?.toLowerCase().includes(q) ||
      s.courses?.course_name?.toLowerCase().includes(q) ||
      s.colleges?.college_name?.toLowerCase().includes(q)
    );
  });

  // Calculate live preview example
  const sampleInitials = pendingStudents[0]?.college_initials || "NPC";
  const sessionDigits = patternInfo?.session_digits || "202324";
  const previewRollNo = prefix.trim() ? `${prefix.trim()}01` : `${sampleInitials}${sessionDigits}01`;

  // List of other courses that have students in this session
  const otherCourseNames = Array.from(
    new Set([...pendingStudents, ...allottedStudents].map((s) => s.courses?.course_name).filter(Boolean))
  );

  return (
    <div className="space-y-6">
      {/* ── 1. Filter Bar ── */}
      <FilterBar
        courses={courses}
        sessions={sessions}
        selectedCourse={selectedCourse}
        selectedSession={selectedSession}
        onCourseChange={setSelectedCourse}
        onSessionChange={setSelectedSession}
      />

      {selectedSession ? (
        <div className="space-y-5">
          {/* Mismatch Course Hint Banner */}
          {selectedCourse && currentTotalApproved === 0 && (pendingStudents.length > 0 || allottedStudents.length > 0) && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-[15px] shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  No students registered under <strong>&quot;{selectedCourse}&quot;</strong> for this session, but{" "}
                  <strong>{pendingStudents.length + allottedStudents.length} student(s)</strong> exist under other course(s) ({otherCourseNames.join(", ")}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse("")}
                className="px-3 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 font-bold text-amber-950 text-[15px] transition-colors shrink-0"
              >
                Clear Course Filter (Show All)
              </button>
            </div>
          )}

          {/* ── 2. Target Year Toggle & Top Actions ── */}
          <div className="bg-white rounded-2xl border border-[#d3e1f5] p-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between shadow-sm">
            <YearToggle label="Target year" value={targetYear} onChange={handleTargetYearChange} />

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/super-admin/dashboard/admit-cards/bulk?exam_session_id=${selectedSession}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[15px] font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Generate Admit Cards
              </a>
              <a
                href="/super-admin/dashboard/roll-numbers/audit"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[15px] font-bold transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Audit Mismatches
              </a>
              <button
                type="button"
                onClick={load}
                title="Refresh Data"
                className="p-2 rounded-xl border border-[#d3e1f5] bg-white hover:bg-[#f4f8fe] text-[#3d5688] transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#1b57d8]" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── 3. KPI Stats Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Approved */}
            <div className="bg-white rounded-2xl border border-[#d3e1f5] p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#eaf2fd] text-[#082a63] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#3d5688] uppercase tracking-wide">Total Approved</p>
                <p className="text-3xl font-black text-[#082a63]">{currentTotalApproved}</p>
                <p className="text-[15px] text-[#4a6090]">Eligible students in session</p>
              </div>
            </div>

            {/* Pending Allotment */}
            <div
              onClick={() => setActiveSubTab("pending")}
              className={`rounded-2xl border p-4 flex items-center gap-3.5 shadow-sm cursor-pointer transition-all ${
                activeSubTab === "pending"
                  ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40"
                  : "bg-white border-[#d3e1f5] hover:border-amber-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-amber-700 uppercase tracking-wide">Pending Allotment</p>
                <p className="text-3xl font-black text-amber-900">{currentPendingCount}</p>
                <p className="text-[15px] text-amber-700">Needs roll number assigned</p>
              </div>
            </div>

            {/* Allotted */}
            <div
              onClick={() => setActiveSubTab("allotted")}
              className={`rounded-2xl border p-4 flex items-center gap-3.5 shadow-sm cursor-pointer transition-all ${
                activeSubTab === "allotted"
                  ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40"
                  : "bg-white border-[#d3e1f5] hover:border-emerald-300"
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-emerald-700 uppercase tracking-wide">Allotted Students</p>
                <p className="text-3xl font-black text-emerald-900">{currentAllottedCount}</p>
                <p className="text-[15px] text-emerald-700">Active roll numbers allotted</p>
              </div>
            </div>
          </div>

          {/* ── 4. Main Two-Tab Workspace ── */}
          <div className="bg-white rounded-2xl border border-[#d3e1f5] overflow-hidden shadow-sm">
            {/* Sub-Tabs Header */}
            <div className="bg-[#f4f8fe] px-3 sm:px-5 py-3 border-b border-[#d3e1f5] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab("pending");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                    activeSubTab === "pending"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white border border-[#d3e1f5] text-[#3d5688] hover:text-[#082a63]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Pending Allotment ({currentPendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubTab("allotted");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-bold transition-all ${
                    activeSubTab === "allotted"
                      ? "bg-[#082a63] text-white shadow-sm"
                      : "bg-white border border-[#d3e1f5] text-[#3d5688] hover:text-[#082a63]"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Allotted Students ({currentAllottedCount})
                </button>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#4a6090] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeSubTab === "pending" ? "pending..." : "allotted..."}`}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#d3e1f5] bg-white text-[15px] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8]"
                />
              </div>
            </div>

            {/* Sub-Tab 1: PENDING ALLOTMENT */}
            {activeSubTab === "pending" && (
              <div className="p-3 sm:p-5 space-y-5">
                {stats.pendingCount > 0 && (
                  <div className="overflow-hidden rounded-xl border border-[#d3e1f5] bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eaf2fd] bg-[#f4f8fe] px-4 py-3">
                      <div className="min-w-0">
                        <h4 className="text-[15.5px] font-bold text-[#082a63]">Roll number format</h4>
                        <p className="text-[14px] text-[#3d5688]">College initials + 6-digit session + sequence number</p>
                      </div>
                      <div className="inline-flex items-center gap-2.5 rounded-xl border border-[#d3e1f5] bg-white px-3.5 py-2">
                        <span className="text-[14px] font-medium text-[#3d5688]">Next roll number</span>
                        <span className="rounded-md bg-[#082a63] px-2.5 py-0.5 font-mono text-[16px] font-bold tracking-wide text-white">{previewRollNo}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="flex flex-wrap items-center gap-2 text-[14px]">
                        {[
                          { icon: Building2, label: "College initials", value: sampleInitials },
                          { icon: CalendarDays, label: "Session", value: sessionDigits },
                          { icon: Hash, label: "Sequence", value: "01, 02 …" },
                        ].map(({ icon: Icon, label, value }, i) => (
                          <span key={label} className="inline-flex items-center gap-2">
                            {i > 0 && <span className="font-bold text-[#9db7e0]">+</span>}
                            <span className="inline-flex items-center gap-2 rounded-lg border border-[#d3e1f5] bg-[#f4f8fe] px-2.5 py-1.5">
                              <Icon className="h-4 w-4 shrink-0 text-[#1245b8]" />
                              <span className="text-[#4a6090]">{label}</span>
                              <span className="font-mono font-bold text-[#082a63]">{value}</span>
                            </span>
                          </span>
                        ))}
                      </div>

                      <label className="block min-w-0 sm:w-64">
                        <span className="mb-1 block text-[13.5px] font-bold text-[#082a63]">Custom prefix <span className="font-medium text-[#6b7ea3]">(optional)</span></span>
                        <input
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          placeholder={`Auto (${sampleInitials}${sessionDigits})`}
                          className="h-10 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3 font-mono text-[14.5px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Batch Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f4f8fe] p-3 rounded-xl border border-[#d3e1f5]">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(filteredPending)}
                      className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#082a63] hover:text-[#1b57d8]"
                    >
                      {selectedStudentIds.size > 0 && selectedStudentIds.size === filteredPending.length ? (
                        <CheckSquare className="w-4 h-4 text-[#1b57d8]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#4a6090]" />
                      )}
                      <span>
                        {selectedStudentIds.size > 0
                          ? `Selected (${selectedStudentIds.size}/${filteredPending.length})`
                          : "Select All"}
                      </span>
                    </button>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    {selectedStudentIds.size > 0 && (
                      <button
                        type="button"
                        onClick={() => handleAllot("selected")}
                        disabled={allotting}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[15px] font-bold disabled:opacity-60 transition-colors shadow-xs"
                      >
                        <Hash className="w-3.5 h-3.5" />
                        {allotting ? "Allotting..." : `Allot Selected (${selectedStudentIds.size})`}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAllot(null)}
                      disabled={allotting || stats.pendingCount === 0}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[15px] font-bold disabled:opacity-50 transition-colors shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {allotting
                        ? "Allotting..."
                        : `Allot All ${stats.pendingCount} Pending Students`}
                    </button>
                  </div>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1b57d8]" />
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="text-center py-12 bg-[#f4f8fe] rounded-xl border border-dashed border-[#d3e1f5]">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="text-[17px] font-bold text-[#082a63]">
                      {searchQuery ? "No matching pending students found" : "All Approved Students Have Roll Numbers!"}
                    </p>
                    <p className="text-[15px] text-[#3d5688] mt-1 max-w-md mx-auto">
                      {searchQuery
                        ? "Try adjusting your search query."
                        : "All eligible students in this session have already been allotted roll numbers."}
                    </p>
                    {stats.allottedCount > 0 && !searchQuery && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("allotted")}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#082a63] text-white text-[15px] font-bold hover:bg-[#0b3a85]"
                      >
                        View Allotted Students ({stats.allottedCount})
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                  <div className="hidden overflow-x-auto border border-[#d3e1f5] rounded-xl md:block">
                    <table className="w-full text-[15px]">
                      <thead className="bg-[#f4f8fe] border-b border-[#d3e1f5]">
                        <tr>
                          <th className="w-10 px-3 py-2.5 text-center">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">Candidate</th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">College</th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">Enrollment No.</th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">
                            Projected Roll No.
                          </th>
                          <th className="px-4 py-2.5 text-right font-bold text-[#082a63] uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaf2fd]">
                        {filteredPending.map((s) => {
                          const isSelected = selectedStudentIds.has(s.id);
                          return (
                            <tr key={s.id} className={isSelected ? "bg-amber-50/50" : "hover:bg-[#f4f8fe]"}>
                              <td className="px-3 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectStudent(s.id)}
                                  className="w-4 h-4 rounded text-[#1b57d8] focus:ring-[#1b57d8] border-[#d3e1f5]"
                                />
                              </td>
                              <td className="px-4 py-2.5">
                                <p className="font-bold text-[#082a63]">{s.candidate_name}</p>
                                {s.courses?.course_name && (
                                  <p className="text-[14px] font-semibold text-[#1245b8]">{s.courses.course_name}</p>
                                )}
                                {s.father_name && (
                                  <p className="text-[14px] text-[#4a6090]">S/D/W of {s.father_name}</p>
                                )}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[14px] font-bold">
                                    {s.college_initials || "COL"}
                                  </span>
                                  <span className="text-[#3d5688] truncate max-w-[220px]">
                                    {s.colleges?.college_name || "—"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-[#3d5688]">{s.enrollment_no || "—"}</td>
                              <td className="px-4 py-2.5">
                                <span className="font-mono font-bold text-[#1b57d8] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                  {prefix.trim() ? `${prefix.trim()}..` : s.projected_roll_no}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleAllot([s.id])}
                                  disabled={allotting}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100/70 border border-amber-300 text-amber-800 text-[15px] font-bold transition-colors"
                                >
                                  Allot Now
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2.5 md:hidden">
                    {filteredPending.map((s) => {
                      const isSelected = selectedStudentIds.has(s.id);
                      return (
                        <div key={s.id} className={`rounded-xl border p-3.5 ${isSelected ? "border-amber-300 bg-amber-50/60" : "border-[#d3e1f5] bg-white"}`}>
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelectStudent(s.id)} aria-label={`Select ${s.candidate_name}`}
                              className="mt-1 h-5 w-5 shrink-0 rounded text-[#1b57d8] focus:ring-[#1b57d8] border-[#d3e1f5]" />
                            <div className="min-w-0 flex-1">
                              <p className="break-words font-bold text-[#082a63]">{s.candidate_name}</p>
                              {s.courses?.course_name && <p className="text-[14px] font-semibold text-[#1245b8]">{s.courses.course_name}</p>}
                              {s.father_name && <p className="text-[14px] text-[#4a6090]">S/D/W of {s.father_name}</p>}
                            </div>
                          </div>
                          <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[14px]">
                            <div className="min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">College</dt>
                              <dd className="break-words text-[#3d5688]">
                                <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[13px] font-bold text-amber-800">{s.college_initials || "COL"}</span>
                                {s.colleges?.college_name || "—"}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">Enrollment No.</dt>
                              <dd className="break-all font-mono text-[#3d5688]">{s.enrollment_no || "—"}</dd>
                            </div>
                            <div className="col-span-2 min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">Projected Roll No.</dt>
                              <dd>
                                <span className="inline-block break-all rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono font-bold text-[#1b57d8]">
                                  {prefix.trim() ? `${prefix.trim()}..` : s.projected_roll_no}
                                </span>
                              </dd>
                            </div>
                          </dl>
                          <button type="button" onClick={() => handleAllot([s.id])} disabled={allotting}
                            className="mt-3 w-full rounded-lg border border-amber-300 bg-white py-2.5 text-[15px] font-bold text-amber-800 transition-colors hover:bg-amber-100/70 disabled:opacity-60">
                            Allot Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  </>
                )}
              </div>
            )}

            {/* Sub-Tab 2: ALLOTTED STUDENTS */}
            {activeSubTab === "allotted" && (
              <div className="p-3 sm:p-5 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#1b57d8]" />
                  </div>
                ) : filteredAllotted.length === 0 ? (
                  <div className="text-center py-12 bg-[#f4f8fe] rounded-xl border border-dashed border-[#d3e1f5]">
                    <p className="text-[17px] font-bold text-[#082a63]">
                      {searchQuery ? "No matching students found" : "No Roll Numbers Allotted Yet"}
                    </p>
                    <p className="text-[15px] text-[#3d5688] mt-1">
                      {searchQuery
                        ? "Try searching with a different keyword."
                        : "There are currently no students with roll numbers in this session."}
                    </p>
                    {stats.pendingCount > 0 && !searchQuery && (
                      <button
                        type="button"
                        onClick={() => setActiveSubTab("pending")}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b57d8] text-white text-[15px] font-bold hover:bg-[#1245b8]"
                      >
                        Go to Pending Allotment ({stats.pendingCount})
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                  <div className="hidden overflow-x-auto border border-[#d3e1f5] rounded-xl md:block">
                    <table className="w-full text-[15px]">
                      <thead className="bg-[#f4f8fe] border-b border-[#d3e1f5]">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">
                            {targetYear === "3" ? "3rd Year Roll No." : targetYear === "2" ? "2nd Year Roll No." : "Roll No."}
                          </th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">Candidate</th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">Enrollment No.</th>
                          <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">College</th>
                          <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">Admit Card</th>
                          <th className="px-4 py-2.5 text-right font-bold text-[#082a63] uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaf2fd]">
                        {filteredAllotted.map((s) => {
                          const displayRollNo = targetYear === "3" ? (s.roll_no_3rd_year || s.roll_no_2nd_year || s.roll_no) : targetYear === "2" ? (s.roll_no_2nd_year || s.roll_no) : s.roll_no;
                          return (
                            <tr key={s.id} className="hover:bg-[#f4f8fe]">
                              <td className="px-4 py-2.5 font-mono font-bold text-[#082a63]">
                                <span className="bg-[#eaf2fd] px-2 py-0.5 rounded text-[#082a63]">
                                  {displayRollNo}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <p className="font-semibold text-[#082a63]">{s.candidate_name}</p>
                                {s.courses?.course_name && (
                                  <p className="text-[14px] font-semibold text-[#1245b8]">{s.courses.course_name}</p>
                                )}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-[#3d5688]">{s.enrollment_no || "—"}</td>
                              <td className="px-4 py-2.5 text-[#3d5688]">{s.colleges?.college_name || "—"}</td>
                              <td className="px-4 py-2.5 text-center">
                                {s.admit_card_generated_at ? (
                                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[14px] font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Generated
                                  </span>
                                ) : (
                                  <span className="text-[#4a6090] bg-[#f4f8fe] px-2 py-0.5 rounded text-[14px]">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleUnallot(s.id)}
                                  title="Remove Roll Number"
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-[#4a6090] hover:text-red-600 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-2.5 md:hidden">
                    {filteredAllotted.map((s) => {
                      const displayRollNo = targetYear === "3" ? (s.roll_no_3rd_year || s.roll_no_2nd_year || s.roll_no) : targetYear === "2" ? (s.roll_no_2nd_year || s.roll_no) : s.roll_no;
                      return (
                        <div key={s.id} className="rounded-xl border border-[#d3e1f5] bg-white p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-block break-all rounded bg-[#eaf2fd] px-2 py-0.5 font-mono font-bold text-[#082a63]">{displayRollNo}</span>
                              <p className="mt-1.5 break-words font-semibold text-[#082a63]">{s.candidate_name}</p>
                              {s.courses?.course_name && <p className="text-[14px] font-semibold text-[#1245b8]">{s.courses.course_name}</p>}
                            </div>
                            <button type="button" onClick={() => handleUnallot(s.id)} aria-label="Remove roll number" title="Remove Roll Number"
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#4a6090] transition-colors hover:bg-red-50 hover:text-red-600">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                          <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2 text-[14px]">
                            <div className="min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">Enrollment No.</dt>
                              <dd className="break-all font-mono text-[#3d5688]">{s.enrollment_no || "—"}</dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">Admit Card</dt>
                              <dd>
                                {s.admit_card_generated_at ? (
                                  <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[13.5px] font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Generated</span>
                                ) : (
                                  <span className="rounded bg-[#f4f8fe] px-2 py-0.5 text-[13.5px] text-[#4a6090]">Pending</span>
                                )}
                              </dd>
                            </div>
                            <div className="col-span-2 min-w-0">
                              <dt className="text-[12.5px] font-bold uppercase tracking-wide text-[#4a6090]">College</dt>
                              <dd className="break-words text-[#3d5688]">{s.colleges?.college_name || "—"}</dd>
                            </div>
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#d3e1f5] p-10 text-center text-[#3d5688]">
          <Hash className="w-8 h-8 text-[#d3e1f5] mx-auto mb-2" />
          <p className="text-[17px] font-semibold">Please select a Course and Exam Session to manage roll numbers.</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// TAB 4 — RESULTS
// ══════════════════════════════════════════════════════════
function ResultsTab({
  courses = [],
  sessions = [],
  selectedCourse: propCourse,
  setSelectedCourse: propSetCourse,
  selectedSession: propSession,
  setSelectedSession: propSetSession,
  showToast,
}) {
  const router = useRouter();
  const [localCourse, setLocalCourse] = useState("");
  const [localSession, setLocalSession] = useState("");

  const selectedCourse = propCourse !== undefined ? propCourse : localCourse;
  const setSelectedCourse = propSetCourse || setLocalCourse;
  const selectedSession = propSession !== undefined ? propSession : localSession;
  const setSelectedSession = propSetSession || setLocalSession;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(null);

  // Auto-select session on first load if none selected
  useEffect(() => {
    if (!selectedSession && sessions.length > 0) {
      const active = sessions.find((s) => s.is_active) || sessions[0];
      if (active) setSelectedSession(active.id);
    }
  }, [sessions, selectedSession, setSelectedSession]);

  const load = useCallback(async () => {
    if (!selectedSession) return;
    setLoading(true);
    const res = await fetch(`/api/admin/results?exam_session_id=${selectedSession}`);
    const json = await res.json();
    setStudents(json.data || []);
    setLoading(false);
  }, [selectedSession]);

  useEffect(() => { load(); }, [selectedSession]);

  const handlePublish = async (s, publish) => {
    setPublishing(s.id);
    const yrParam = s.target_year ? `?target_year=${s.target_year}` : "";
    const res = await fetch(`/api/admin/results/${s.id}/publish${yrParam}`, { method: publish ? "POST" : "DELETE" });
    const json = await res.json();
    if (!res.ok) showToast(json.error || "Failed", "error");
    else { showToast(publish ? "Result published!" : "Result unpublished"); load(); }
    setPublishing(null);
  };

  const statusBadge = (s) => {
    if (s.result_published_at) return <span className="inline-flex items-center gap-1 text-[14px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" />Published</span>;
    return <span className="text-[14px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Draft</span>;
  };

  const filteredStudents = selectedCourse
    ? students.filter(s => s.course === selectedCourse)
    : students;

  const markCls = "inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-3.5 py-2 text-[14px] font-bold text-white transition hover:bg-[#1245b8]";
  const openMarks = (s) => router.push(`/super-admin/dashboard/exam-management/results/${s.id}${s.target_year ? `?year=${s.target_year}` : ""}`);
  const PublishBtn = ({ s }) =>
    s.result_published_at ? (
      <button onClick={() => handlePublish(s, false)} disabled={publishing === s.id}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-[14px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60">
        Unpublish
      </button>
    ) : (
      <button onClick={() => handlePublish(s, true)} disabled={publishing === s.id}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[14px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60">
        <CheckCircle2 className="h-4 w-4" /> Publish
      </button>
    );

  return (
    <div className="min-w-0 space-y-5">
      <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm">
        <FilterBar courses={courses} sessions={sessions} selectedCourse={selectedCourse} selectedSession={selectedSession} onCourseChange={setSelectedCourse} onSessionChange={setSelectedSession} />
      </div>

      {selectedSession && (
        <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-[#082a63]">Students with admit cards</p>
              <p className="text-[13.5px] text-[#3d5688]">{filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} · {filteredStudents.filter((s) => s.result_published_at).length} published</p>
            </div>
            <button onClick={load} aria-label="Refresh" title="Refresh"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d3e1f5] bg-white text-[#082a63] transition hover:bg-[#f4f8fe]">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <BarChart2 className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
              <p className="text-[16px] font-bold text-[#082a63]">No students found</p>
              <p className="mt-1 text-[14px] text-[#4a6090]">Students appear here once their roll numbers are allotted.</p>
            </div>
          ) : (
            <>
              {/* table (laptops) */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-[15px]">
                  <thead className="border-b border-[#d3e1f5]">
                    <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                      <th className="px-5 py-3">Roll no.</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Course</th>
                      <th className="px-3 py-3 text-center">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4edf9]">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="transition-colors hover:bg-[#f4f8fe]">
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-[#1245b8]">
                          {s.roll_no}
                          
                        </td>
                        <td className="px-3 py-3 font-bold text-[#082a63]">{s.candidate_name}</td>
                        <td className="px-3 py-3 text-[#3d5688]">{s.course}</td>
                        <td className="px-3 py-3 text-center">{statusBadge(s)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openMarks(s)} className={markCls}><Pencil className="h-4 w-4" /> Enter Marks</button>
                            <PublishBtn s={s} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* cards (mobile / tablet) */}
              <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-[16px] font-bold text-[#082a63]">{s.candidate_name}</p>
                        <p className="mt-0.5 text-[14px] font-bold text-[#1245b8]">
                          {s.roll_no}
                          
                        </p>
                        <p className="mt-0.5 break-words text-[14px] text-[#3d5688]">{s.course}</p>
                      </div>
                      {statusBadge(s)}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => openMarks(s)} className={markCls}><Pencil className="h-4 w-4" /> Enter Marks</button>
                      <PublishBtn s={s} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════
// CENTERS TAB
// ══════════════════════════════════════════════════════════
function CentersTab({ showToast, confirm }) {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({ center_name: "", center_code: "", address: "", city: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/exam-centers");
    const d = await res.json();
    if (d.ok) setCenters(d.centers || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (c) => { setEditingId(c.id); setEditForm({ center_name: c.center_name, center_code: c.center_code, address: c.address || "", city: c.city || "" }); };

  const saveEdit = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/exam-centers/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
    const d = await res.json();
    if (d.ok) { showToast("Center updated!"); setEditingId(null); load(); }
    else showToast(d.error || "Failed", "error");
    setSaving(false);
  };

  const deleteCenter = async (id) => {
    if (!(await confirm({ title: "Delete exam center?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    const res = await fetch(`/api/admin/exam-centers/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.ok) { showToast("Center deleted."); load(); }
    else showToast(d.error || "Failed", "error");
  };

  const addCenter = async (e) => {
    e.preventDefault();
    if (!newForm.center_name.trim() || !newForm.center_code.trim()) { showToast("Name and code required.", "error"); return; }
    setAdding(true);
    const res = await fetch("/api/admin/exam-centers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newForm) });
    const d = await res.json();
    if (d.ok) { showToast("Center added!"); setNewForm({ center_name: "", center_code: "", address: "", city: "" }); load(); }
    else showToast(d.error || "Failed", "error");
    setAdding(false);
  };

  if (loading) return <div className="flex justify-center py-16"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>;

  const addFields = [
    { key: "center_name", label: "Center name", placeholder: "e.g. Panaji Exam Hall", required: true },
    { key: "center_code", label: "Center code", placeholder: "e.g. GOA01", required: true },
    { key: "city", label: "City", placeholder: "e.g. Panaji" },
    { key: "address", label: "Address", placeholder: "Street, locality, pin code" },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <form onSubmit={addCenter} className="rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:p-5">
        <h3 className="mb-4 flex items-center gap-2 text-[17px] font-bold text-[#082a63]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fd] text-[#1b57d8]"><Plus className="h-4 w-4" /></span>
          Add Exam Center
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {addFields.map((f) => (
            <label key={f.key} className="block min-w-0">
              <span className={labelCls}>{f.label} {f.required && <span className="text-red-500">*</span>}</span>
              <input value={newForm[f.key]} onChange={(e) => setNewForm((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className={fieldCls} />
            </label>
          ))}
        </div>
        <button type="submit" disabled={adding}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 sm:w-auto">
          <Plus className="h-4 w-4" /> {adding ? "Adding…" : "Add Center"}
        </button>
      </form>

      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold text-[#082a63]">Exam centers <span className="ml-1 rounded-full bg-[#eaf2fd] px-2.5 py-0.5 text-[13px] text-[#1245b8]">{centers.length}</span></p>
      </div>

      {centers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white px-4 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
          <p className="text-[16px] font-bold text-[#082a63]">No exam centers yet</p>
          <p className="mt-1 text-[14px] text-[#4a6090]">Add your first center using the form above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {centers.map((c) => (
            <div key={c.id} className="min-w-0 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm">
              {editingId === c.id ? (
                <div className="space-y-3">
                  {[{ key: "center_name", label: "Name" }, { key: "center_code", label: "Code" }, { key: "city", label: "City" }, { key: "address", label: "Address" }].map((f) => (
                    <label key={f.key} className="block">
                      <span className={labelCls}>{f.label}</span>
                      <input value={editForm[f.key]} onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))} className={fieldCls} />
                    </label>
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={saveEdit} disabled={saving} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] text-[14.5px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingId(null)} className="h-11 rounded-xl border border-[#d3e1f5] text-[14.5px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2fd] text-[#1b57d8]"><MapPin className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="break-words text-[16px] font-bold text-[#082a63]">{c.center_name}</p>
                      {c.center_code && <span className="mt-0.5 inline-block rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{c.center_code}</span>}
                      {c.city && <p className="mt-1 text-[14px] text-[#3d5688]">{c.city}</p>}
                      {c.address && <p className="break-words text-[13.5px] text-[#4a6090]">{c.address}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => startEdit(c)} aria-label="Edit center" title="Edit" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d3e1f5] text-[#3d5688] transition hover:bg-[#eaf2fd]"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteCenter(c.id)} aria-label="Delete center" title="Delete" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d3e1f5] text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// MAIN PAGE
// ══════════════════════════════════════════════════════════
export default function ExamManagementPage() {
  const [confirm, confirmDialog] = useConfirm();
  const [activeTab, setActiveTab] = useState("subjects");
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedYear, setSelectedYear] = useState("1");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse((prev) => prev || list[0].course_name);
        }
      });
    fetch("/api/admin/exam-sessions")
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        setSessions(list);
        if (list.length > 0) {
          const active = list.find((s) => s.is_active) || list[0];
          if (active) setSelectedSession((prev) => prev || active.id);
        }
      });
  }, []);

  return (
    <AdminPageShell
      title="Exam Hub"
      subtitle="Subjects, datesheet, roll numbers, results and centers"
      backHref="/super-admin/dashboard?tab=exam"
      backLabel="Exam Management"
    >
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto bg-[#eaf2fd] rounded-xl p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 rounded-lg text-[14px] font-bold transition-all sm:px-3 sm:text-[15px] ${
              activeTab === t.id ? "bg-white text-[#082a63] shadow-sm" : "text-[#3d5688] hover:text-[#082a63]"
            }`}
          >
            <t.icon className="w-3.5 h-3.5 hidden sm:block" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "subjects" && (
        <SubjectsTab
          confirm={confirm}
          courses={courses}
          sessions={sessions}
          setSessions={setSessions}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          showToast={showToast}
        />
      )}
      {activeTab === "datesheet" && (
        <DatesheetTab
          courses={courses}
          sessions={sessions}
          setSessions={setSessions}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          showToast={showToast}
        />
      )}
      {activeTab === "rollnos" && (
        <RollNumbersTab
          confirm={confirm}
          courses={courses}
          sessions={sessions}
          setSessions={setSessions}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          targetYear={selectedYear}
          setTargetYear={setSelectedYear}
          showToast={showToast}
        />
      )}
      {activeTab === "results" && (
        <ResultsTab
          courses={courses}
          sessions={sessions}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          selectedSession={selectedSession}
          setSelectedSession={setSelectedSession}
          showToast={showToast}
        />
      )}
      {activeTab === "centers" && <CentersTab showToast={showToast} confirm={confirm} />}

      <Toast toast={toast} />
      {confirmDialog}
    </div>
    </AdminPageShell>
  );
}
