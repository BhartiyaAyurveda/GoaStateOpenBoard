"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  RefreshCw, Save, CheckCircle2, AlertTriangle,
  XCircle, Award, BookOpen,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";

const RESULT_COLORS = { PASS: "bg-emerald-100 text-emerald-700", FAIL: "bg-red-100 text-red-700", INCOMPLETE: "bg-amber-100 text-amber-700" };

export default function ResultEntryPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const yearParam = searchParams.get("year");

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [marks, setMarks]     = useState({});
  const [saving, setSaving]   = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg]         = useState({ text: "", type: "success" });

  const showMsg = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "success" }), 3500); };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const q = yearParam ? `?year=${yearParam}` : "";
      const res = await fetch(`/api/admin/results/${id}${q}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Not found"); }
      else {
        setResult(json.data);
        // Init marks from existing data
        const m = {};
        (json.data.subjects || []).forEach(s => {
          m[s.subject_id] = {
            theory_marks: s.theory_marks ?? "",
            practical_marks: s.practical_max > 0 ? (s.practical_marks ?? "") : (s.practical_marks ?? 0),
            ca_marks: s.ca_max > 0 ? (s.ca_marks ?? "") : (s.ca_marks ?? 0),
          };
        });
        setMarks(m);
      }
    } catch { setError("Network error."); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const updateMark = (subjectId, field, val) => {
    setMarks(m => ({ ...m, [subjectId]: { ...m[subjectId], [field]: val === "" ? "" : Number(val) } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const marksArr = (result?.subjects || []).map(s => {
      const m = marks[s.subject_id] || {};
      return {
        subject_id: s.subject_id,
        theory_marks: m.theory_marks === "" || m.theory_marks === null || m.theory_marks === undefined ? 0 : Number(m.theory_marks),
        practical_marks: m.practical_marks === "" || m.practical_marks === null || m.practical_marks === undefined ? 0 : Number(m.practical_marks),
        ca_marks: m.ca_marks === "" || m.ca_marks === null || m.ca_marks === undefined ? 0 : Number(m.ca_marks),
      };
    });
    const q = yearParam ? `?year=${yearParam}` : "";
    const res = await fetch(`/api/admin/results/${id}${q}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marks: marksArr, year: yearParam }) });
    const json = await res.json();
    if (!res.ok) showMsg(json.error || "Failed to save", "error");
    else {
      showMsg("Marks saved successfully!");
      if (json.data) {
        setResult(json.data);
        const m = {};
        (json.data.subjects || []).forEach(s => {
          m[s.subject_id] = {
            theory_marks: s.theory_marks ?? "",
            practical_marks: s.practical_max > 0 ? (s.practical_marks ?? "") : (s.practical_marks ?? 0),
            ca_marks: s.ca_max > 0 ? (s.ca_marks ?? "") : (s.ca_marks ?? 0),
          };
        });
        setMarks(m);
      }
    }
    setSaving(false);
  };

  const handlePublish = async (publish) => {
    setPublishing(true);
    const q = yearParam ? `?year=${yearParam}` : "";
    const res = await fetch(`/api/admin/results/${id}/publish${q}`, { method: publish ? "POST" : "DELETE" });
    const json = await res.json();
    if (!res.ok) showMsg(json.error || "Failed", "error");
    else { showMsg(publish ? "Result published!" : "Result unpublished"); load(); }
    setPublishing(false);
  };

  const shellProps = {
    backHref: "/super-admin/dashboard/exam-management",
    backLabel: "Exam Hub",
  };

  if (loading)
    return (
      <AdminPageShell title="Enter marks" subtitle="Loading…" {...shellProps}>
        <div className="flex items-center justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>
      </AdminPageShell>
    );
  if (error)
    return (
      <AdminPageShell title="Enter marks" {...shellProps}>
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[15px] font-semibold text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      </AdminPageShell>
    );

  // Live marks check and live summary calculation
  const allSubjectsFilled = (result?.subjects || []).length > 0 && (result?.subjects || []).every(s => {
    const m = marks[s.subject_id];
    if (!m) return false;
    const thFilled = s.theory_max === 0 || (m.theory_marks !== "" && m.theory_marks !== null && m.theory_marks !== undefined);
    const prFilled = s.practical_max === 0 || (m.practical_marks !== "" && m.practical_marks !== null && m.practical_marks !== undefined);
    const caFilled = s.ca_max === 0 || (m.ca_marks !== "" && m.ca_marks !== null && m.ca_marks !== undefined);
    return thFilled && prFilled && caFilled;
  });

  let liveGrandObtained = 0;
  let liveGrandMax = 0;
  let liveAnyFail = false;

  (result?.subjects || []).forEach(s => {
    const m = marks[s.subject_id] || {};
    const th = Number(m.theory_marks) || 0;
    const pr = Number(m.practical_marks) || 0;
    const ca = Number(m.ca_marks) || 0;
    const total = th + pr + ca;
    const totalMax = (s.theory_max ?? 0) + (s.practical_max ?? 0) + (s.ca_max ?? 0);
    liveGrandMax += totalMax;
    liveGrandObtained += total;
    const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
    if (pct < 33) liveAnyFail = true;
  });

  const isDirty = (result?.subjects || []).some(s => {
    const m = marks[s.subject_id] || {};
    const savedTh = s.theory_marks ?? "";
    const currentTh = m.theory_marks ?? "";
    const savedPr = s.practical_max > 0 ? (s.practical_marks ?? "") : (s.practical_marks ?? 0);
    const currentPr = m.practical_marks ?? (s.practical_max > 0 ? "" : 0);
    const savedCa = s.ca_max > 0 ? (s.ca_marks ?? "") : (s.ca_marks ?? 0);
    const currentCa = m.ca_marks ?? (s.ca_max > 0 ? "" : 0);
    return String(currentTh) !== String(savedTh) || String(currentPr) !== String(savedPr) || String(currentCa) !== String(savedCa);
  });

  const currentResult = allSubjectsFilled
    ? (liveAnyFail ? "FAIL" : "PASS")
    : (result?.final_result || "INCOMPLETE");

  const displayTotal = allSubjectsFilled
    ? `${liveGrandObtained}/${liveGrandMax || result?.grand_total_max}`
    : (result?.final_result !== "INCOMPLETE" ? `${result?.grand_total_obtained}/${result?.grand_total_max}` : `—/${liveGrandMax || result?.grand_total_max}`);

  const finalColor = RESULT_COLORS[currentResult] || "bg-gray-100 text-gray-600";

  const inp = "h-10 w-full min-w-0 rounded-lg border border-[#d3e1f5] bg-[#f4f8fe] px-2 text-center text-[15px] font-semibold text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15 disabled:opacity-40";
  const rowCalc = (s) => {
    const m = marks[s.subject_id] || {};
    const total = (Number(m.theory_marks) || 0) + (Number(m.practical_marks) || 0) + (Number(m.ca_marks) || 0);
    const totalMax = s.theory_max + s.practical_max + s.ca_max;
    const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
    const hasMarks = m.theory_marks !== "" || m.practical_marks !== "" || m.ca_marks !== "";
    return { m, total, totalMax, hasMarks, pass: pct >= 33 };
  };
  const ResultPill = ({ hasMarks, pass }) =>
    hasMarks ? (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{pass ? "PASS" : "FAIL"}</span>
    ) : (
      <span className="text-[#8a97b3]">—</span>
    );

  const saveBtn = (
    <button onClick={handleSave} disabled={saving}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[14px] font-bold text-white transition disabled:opacity-60 ${isDirty ? "bg-[#1b57d8] shadow-sm ring-2 ring-[#1b57d8]/30 hover:bg-[#1245b8]" : "bg-[#082a63] hover:bg-[#0b3a85]"}`}>
      <Save className="h-4 w-4" /> {saving ? "Saving…" : isDirty ? "Save marks *" : "Save marks"}
    </button>
  );

  return (
    <AdminPageShell
      title="Enter marks"
      subtitle={`${result.candidate_name || ""}${result.roll_no ? ` · Roll no. ${result.roll_no}` : ""}`}
      {...shellProps}
      actions={saveBtn}
    >
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Student */}
        <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-4">
            {result.photo_url && <img src={result.photo_url} alt="Candidate photo" className="h-20 w-16 shrink-0 rounded-lg border-2 border-[#d3e1f5] object-cover" />}
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {[["Name", result.candidate_name], ["Roll no.", result.roll_no], ["Course", result.course], ["Father", result.father_name], ["Session", result.session_label], ["Center", result.center_name]].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <p className="text-[12.5px] font-bold uppercase tracking-wide text-[#6b7ea3]">{k}</p>
                  <p className="break-words text-[15.5px] font-bold text-[#082a63]">{v || "—"}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-[#c9daf2] pt-3">
            <span className="text-[13.5px] font-semibold text-[#3d5688]">Result:</span>
            <span className={`rounded-full px-3 py-1 text-[13px] font-bold uppercase tracking-wide ${finalColor}`}>{currentResult}</span>
            {result.result_published_at && (
              <span className="inline-flex items-center gap-1 text-[13.5px] font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Published</span>
            )}
          </div>
        </div>

        {msg.text && (
          <div role={msg.type === "success" ? "status" : "alert"} className={`flex items-center gap-2 rounded-xl border p-3.5 text-[15px] font-semibold ${msg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {msg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Marks */}
        <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
            <p className="flex items-center gap-2 text-[16px] font-bold text-[#082a63]"><BookOpen className="h-4 w-4" /> Subject-wise marks</p>
            <span className="text-[13.5px] font-semibold text-[#3d5688]">Pass mark: 33% per subject</span>
          </div>

          {/* table (laptops) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-[#d3e1f5]">
                <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                  <th className="px-5 py-3">Subject</th>
                  <th className="w-28 px-2 py-3 text-center">Theory</th>
                  <th className="w-28 px-2 py-3 text-center">Practical</th>
                  <th className="w-28 px-2 py-3 text-center">CA</th>
                  <th className="px-3 py-3 text-center">Total</th>
                  <th className="px-5 py-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4edf9]">
                {result.subjects.map((s) => {
                  const { m, total, totalMax, hasMarks, pass } = rowCalc(s);
                  return (
                    <tr key={s.subject_id} className="transition-colors hover:bg-[#f4f8fe]">
                      <td className="px-5 py-3">
                        <p className="font-bold text-[#082a63]">{s.subject_name}</p>
                        {s.subject_code && <p className="font-mono text-[12.5px] text-[#4a6090]">{s.subject_code}</p>}
                      </td>
                      {[["theory_marks", s.theory_max], ["practical_marks", s.practical_max], ["ca_marks", s.ca_max]].map(([field, max]) => (
                        <td key={field} className="px-2 py-3 text-center">
                          <input type="number" min="0" max={max} value={m[field] ?? ""} disabled={max === 0} onChange={(e) => updateMark(s.subject_id, field, e.target.value)} className={inp} aria-label={`${s.subject_name} ${field.replace("_marks", "")} marks`} />
                          <p className="mt-0.5 text-[12.5px] text-[#6b7ea3]">out of {max}</p>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center font-extrabold text-[#082a63]">{hasMarks ? `${total}/${totalMax}` : "—"}</td>
                      <td className="px-5 py-3 text-center"><ResultPill hasMarks={hasMarks} pass={pass} /></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-[#d3e1f5] bg-[#f4f8fe]">
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-[13px] font-extrabold uppercase tracking-wide text-[#082a63]">Grand total</td>
                  <td className="px-3 py-3 text-center font-extrabold text-[#082a63]">{displayTotal}</td>
                  <td className="px-5 py-3 text-center"><span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${finalColor}`}>{currentResult}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* cards (phones) */}
          <div className="space-y-3 p-3 md:hidden">
            {result.subjects.map((s) => {
              const { m, total, totalMax, hasMarks, pass } = rowCalc(s);
              return (
                <div key={s.subject_id} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-[16px] font-bold text-[#082a63]">{s.subject_name}</p>
                      {s.subject_code && <p className="font-mono text-[12.5px] text-[#4a6090]">{s.subject_code}</p>}
                    </div>
                    <ResultPill hasMarks={hasMarks} pass={pass} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[["Theory", "theory_marks", s.theory_max], ["Practical", "practical_marks", s.practical_max], ["CA", "ca_marks", s.ca_max]].map(([label, field, max]) => (
                      <label key={field} className="block min-w-0">
                        <span className="mb-1 block text-[12.5px] font-bold text-[#4a6090]">{label} <span className="font-medium">/{max}</span></span>
                        <input type="number" inputMode="numeric" min="0" max={max} value={m[field] ?? ""} disabled={max === 0} onChange={(e) => updateMark(s.subject_id, field, e.target.value)} className={inp} />
                      </label>
                    ))}
                  </div>
                  <p className="mt-2.5 text-right text-[14px] font-bold text-[#082a63]">Total: {hasMarks ? `${total}/${totalMax}` : "—"}</p>
                </div>
              );
            })}
            <div className="flex items-center justify-between rounded-xl bg-[#f4f8fe] px-4 py-3">
              <span className="text-[13px] font-extrabold uppercase tracking-wide text-[#082a63]">Grand total</span>
              <span className="flex items-center gap-2"><b className="text-[#082a63]">{displayTotal}</b><span className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${finalColor}`}>{currentResult}</span></span>
            </div>
          </div>

          {isDirty && (
            <div className="flex flex-col gap-2 border-t border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span className="text-[14.5px] font-semibold text-amber-800">You have unsaved changes. Press <b>Save marks</b> to store them in the database.</span>
              <button onClick={handleSave} disabled={saving} className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1b57d8] px-5 text-[14px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60">
                {saving ? "Saving…" : "Save now"}
              </button>
            </div>
          )}
        </div>

        {/* Publish */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[16.5px] font-bold text-[#082a63]">Publish result</p>
            <p className="mt-0.5 text-[14.5px] text-[#3d5688]">
              {result.result_published_at
                ? `Published on ${new Date(result.result_published_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
                : isDirty
                ? "Save marks before publishing"
                : result.final_result === "INCOMPLETE" ? "Save all marks before publishing" : "Ready to publish"}
            </p>
          </div>
          {result.result_published_at ? (
            <button onClick={() => handlePublish(false)} disabled={publishing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 text-[15px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60">
              <XCircle className="h-4 w-4" /> {publishing ? "…" : "Unpublish"}
            </button>
          ) : (
            <button onClick={() => handlePublish(true)} disabled={publishing || isDirty || result.final_result === "INCOMPLETE"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#082a63] px-6 text-[15px] font-bold text-white transition hover:bg-[#0b3a85] disabled:opacity-60">
              <Award className="h-4 w-4" /> {publishing ? "Publishing…" : "Publish result"}
            </button>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}
