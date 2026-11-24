"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListChecks, Loader2, Save, CheckCircle2, AlertTriangle } from "lucide-react";

// Board-only card: tick the subjects THIS student takes. The admit card, result, marks entry and
// enrollment card then show only the ticked subjects. Nothing ticked = the student takes all subjects.
export default function StudentSubjectsPicker({ registrationId }) {
  const [subjects, setSubjects] = useState([]);
  const [saved, setSaved] = useState([]); // ids currently saved on the server
  const [picked, setPicked] = useState(() => new Set());
  const [state, setState] = useState("loading"); // loading | ready | error
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }
  const [columnMissing, setColumnMissing] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/subjects`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not load subjects.");
      setSubjects(json.subjects || []);
      setSaved(json.selected || []);
      setPicked(new Set(json.selected || []));
      setColumnMissing(Boolean(json.columnMissing));
      setState("ready");
    } catch (e) {
      setMsg({ ok: false, text: e.message });
      setState("error");
    }
  }, [registrationId]);

  useEffect(() => {
    load();
  }, [load]);

  const years = useMemo(() => [...new Set(subjects.map((s) => s.year_number ?? 1))].sort((a, b) => a - b), [subjects]);
  const dirty = useMemo(() => {
    if (picked.size !== saved.length) return true;
    return saved.some((id) => !picked.has(id));
  }, [picked, saved]);

  const toggle = (id) => {
    setMsg(null);
    setPicked((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  async function save() {
    if (saving) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_ids: [...picked] }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not save.");
      setSaved(json.selected || []);
      setMsg({ ok: true, text: picked.size ? `Saved: ${picked.size} subject${picked.size === 1 ? "" : "s"}.` : "Saved: student takes all subjects." });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
        <h3 className="flex min-w-0 items-center gap-2.5 text-[15.5px] font-bold text-[#082a63]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#082a63] text-white">
            <ListChecks size={16} />
          </span>
          <span className="min-w-0">Subjects taken by this student</span>
        </h3>
        {state === "ready" && subjects.length > 0 && (
          <span className="shrink-0 rounded-full bg-[#eaf2fd] px-2.5 py-0.5 text-[12.5px] font-bold text-[#1245b8]">
            {picked.size === 0 ? "All subjects" : `${picked.size} of ${subjects.length}`}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {state === "loading" && (
          <p className="flex items-center gap-2 text-[14.5px] font-medium text-[#4a6090]">
            <Loader2 size={16} className="animate-spin" /> Loading subjects…
          </p>
        )}

        {state === "error" && (
          <p role="alert" className="text-[14.5px] font-semibold text-[#b4161c]">
            {msg?.text || "Could not load subjects."}{" "}
            <button type="button" onClick={load} className="font-bold underline">
              Retry
            </button>
          </p>
        )}

        {state === "ready" && subjects.length === 0 && (
          <p className="text-[14.5px] font-medium text-[#4a6090]">No subjects are defined for this student&apos;s course yet.</p>
        )}

        {state === "ready" && subjects.length > 0 && (
          <>
            {columnMissing && (
              <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-[#f3d28a] bg-[#fff8e6] px-3 py-2 text-[13.5px] font-semibold text-[#5a4300]">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Database update pending: run the <b>selected_subject_ids</b> SQL (end of supabase/schema.sql) before saving.
              </p>
            )}
            <p className="mb-4 text-[14px] font-medium leading-snug text-[#3d5688]">
              Tick only the subjects this student is taking. The admit card, marks entry and result will show just these. Leave everything
              unticked if the student takes all subjects.
            </p>

            <div className="space-y-5">
              {years.map((y) => {
                const rows = subjects.filter((s) => (s.year_number ?? 1) === y);
                return (
                  <div key={y}>
                    {years.length > 1 && <p className="mb-2 text-[13px] font-bold uppercase tracking-wider text-[#4a6090]">Year {y}</p>}
                    <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {rows.map((s) => {
                        const on = picked.has(s.id);
                        return (
                          <li key={s.id}>
                            <label
                              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition ${
                                on ? "border-[#1245b8] bg-[#eaf2fd]" : "border-[#d3e1f5] bg-white hover:bg-[#f4f8fe]"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggle(s.id)}
                                className="h-5 w-5 shrink-0 accent-[#1245b8]"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block break-words text-[15px] font-bold text-[#082a63]">{s.subject_name}</span>
                                <span className="block text-[12.5px] font-medium text-[#4a6090]">
                                  {s.subject_code ? `Code ${s.subject_code}` : "No code"}
                                  {s.is_language_option ? " • Language option" : ""}
                                </span>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-dashed border-[#c9daf2] pt-4">
              <button
                type="button"
                onClick={save}
                disabled={saving || !dirty}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#082a63] px-5 text-[14.5px] font-bold text-white transition-colors hover:bg-[#0b3a85] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save subjects"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMsg(null);
                  setPicked(new Set(subjects.map((s) => s.id)));
                }}
                className="h-10 rounded-lg border border-[#9db7e0] bg-white px-4 text-[14px] font-bold text-[#082a63] hover:bg-[#f2f7fe]"
              >
                Tick all
              </button>
              <button
                type="button"
                onClick={() => {
                  setMsg(null);
                  setPicked(new Set());
                }}
                className="h-10 rounded-lg border border-[#9db7e0] bg-white px-4 text-[14px] font-bold text-[#082a63] hover:bg-[#f2f7fe]"
              >
                Untick all
              </button>
              {msg && (
                <p role="status" className={`flex items-center gap-1.5 text-[14px] font-bold ${msg.ok ? "text-[#15803d]" : "text-[#b4161c]"}`}>
                  {msg.ok && <CheckCircle2 size={16} />}
                  {msg.text}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
