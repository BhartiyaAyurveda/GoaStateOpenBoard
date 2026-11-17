"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  RefreshCw, Save, CheckCircle2, AlertTriangle,
  XCircle, Award, BookOpen,
} from "lucide-react";

const RESULT_COLORS = { PASS: "bg-emerald-100 text-emerald-700", FAIL: "bg-red-100 text-red-700", INCOMPLETE: "bg-amber-100 text-amber-700" };

export default function ResultEntryPage() {
  const { id } = useParams();
  const router = useRouter();
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

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-[#1b57d8]" /></div>;
  if (error) return (
    <div className="space-y-4 max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[15px] font-semibold text-[#3d5688] hover:text-[#082a63]">Back</button>
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[17px]">{error}</div>
    </div>
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
    if (pct < 40) liveAnyFail = true;
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

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => router.push("/super-admin/dashboard/exam-management?tab=results")}
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#3d5688] hover:text-[#082a63]">
          Back to Results
        </button>
        <div className="flex-1" />
        <span className={`px-3 py-1 rounded-full text-[15px] font-bold uppercase tracking-wide ${finalColor}`}>
          {currentResult}
        </span>
        {result.result_published_at && (
          <span className="flex items-center gap-1 text-[15px] font-bold text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" />Published</span>
        )}
      </div>

      {/* Student info */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] p-5">
        <div className="flex items-start gap-4">
          {result.photo_url && <img src={result.photo_url} alt="Photo" className="w-14 h-16 object-cover rounded-lg border-2 border-[#d3e1f5] shrink-0" />}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 text-[15px]">
            {[["Name", result.candidate_name], ["Roll No.", result.roll_no], ["Course", result.course], ["Father", result.father_name], ["Session", result.session_label], ["Center", result.center_name]].map(([k, v]) => (
              <div key={k}><p className="text-[14px] font-bold uppercase text-[#3d5688]">{k}</p><p className="font-semibold text-[#082a63]">{v || "—"}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Inline msg */}
      {msg.text && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border text-[15px] font-medium ${msg.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Marks entry table */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] overflow-hidden">
        <div className="bg-[#eaf2fd] px-5 py-3 border-b border-[#d3e1f5] flex items-center justify-between">
          <p className="text-[15px] font-bold text-[#082a63] uppercase flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Subject-wise Marks</p>
          <button onClick={handleSave} disabled={saving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[15px] font-bold disabled:opacity-60 transition-all ${isDirty ? "bg-[#1b57d8] hover:bg-[#1245b8] ring-2 ring-[#1b57d8]/40 shadow-sm" : "bg-[#082a63] hover:bg-[#0b3a85]"}`}>
            <Save className="w-3.5 h-3.5" />{saving ? "Saving..." : isDirty ? "Save Marks *" : "Save Marks"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
              <tr>
                <th className="px-4 py-2.5 text-left font-bold text-[#082a63] uppercase">Subject</th>
                <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">Theory<br/><span className="font-normal text-[#4a6090]">Max</span></th>
                <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">Practical<br/><span className="font-normal text-[#4a6090]">Max</span></th>
                <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">CA<br/><span className="font-normal text-[#4a6090]">Max</span></th>
                <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">Total</th>
                <th className="px-4 py-2.5 text-center font-bold text-[#082a63] uppercase">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaf2fd]">
              {result.subjects.map(s => {
                const m = marks[s.subject_id] || {};
                const theory = Number(m.theory_marks) || 0;
                const practical = Number(m.practical_marks) || 0;
                const ca = Number(m.ca_marks) || 0;
                const total = theory + practical + ca;
                const totalMax = s.theory_max + s.practical_max + s.ca_max;
                const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
                const hasMarks = m.theory_marks !== "" || m.practical_marks !== "" || m.ca_marks !== "";
                const pass = pct >= 40;

                const inp = "w-14 text-center px-1.5 py-1 rounded-lg border border-[#d3e1f5] bg-[#f4f8fe] text-[15px] text-[#082a63] focus:outline-none focus:ring-1 focus:ring-[#1b57d8]";
                return (
                  <tr key={s.subject_id} className="hover:bg-[#f4f8fe]">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-[#082a63]">{s.subject_name}</p>
                      <p className="text-[14px] text-[#4a6090]">{s.subject_code}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="number" min="0" max={s.theory_max} value={m.theory_marks ?? ""} onChange={e => updateMark(s.subject_id, "theory_marks", e.target.value)} className={inp} />
                      <p className="text-[14px] text-[#4a6090] mt-0.5">/{s.theory_max}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="number" min="0" max={s.practical_max} value={m.practical_marks ?? ""} onChange={e => updateMark(s.subject_id, "practical_marks", e.target.value)} className={inp} />
                      <p className="text-[14px] text-[#4a6090] mt-0.5">/{s.practical_max}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="number" min="0" max={s.ca_max} value={m.ca_marks ?? ""} onChange={e => updateMark(s.subject_id, "ca_marks", e.target.value)} className={inp} />
                      <p className="text-[14px] text-[#4a6090] mt-0.5">/{s.ca_max}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold text-[#082a63]">
                      {hasMarks ? `${total}/${totalMax}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {hasMarks
                        ? <span className={`text-[14px] font-bold px-2 py-0.5 rounded-full ${pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{pass ? "PASS" : "FAIL"}</span>
                        : <span className="text-[#4a6090]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#eaf2fd] border-t-2 border-[#d3e1f5]">
              <tr>
                <td colSpan={4} className="px-4 py-2.5 font-bold text-[#082a63] text-[15px] uppercase">Grand Total</td>
                <td className="px-4 py-2.5 text-center font-bold text-[#082a63]">
                  {displayTotal}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`text-[14px] font-bold px-2 py-0.5 rounded-full ${finalColor}`}>{currentResult}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {isDirty && (
          <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-200 text-amber-800 text-[15px] font-semibold flex items-center justify-between">
            <span>Marks change hue hain. Database me save karne ke liye <strong>&quot;Save Marks&quot;</strong> button click karein.</span>
            <button onClick={handleSave} disabled={saving} className="px-3 py-1 rounded-md bg-[#1b57d8] text-white text-[15px] font-bold hover:bg-[#1245b8]">
              Save Now
            </button>
          </div>
        )}
      </div>

      {/* Publish / Unpublish */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[17px] font-bold text-[#082a63]">Publish Result</p>
          <p className="text-[15px] text-[#3d5688] mt-0.5">
            {result.result_published_at
              ? `Published on ${new Date(result.result_published_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`
              : isDirty
              ? "Save marks before publishing"
              : result.final_result === "INCOMPLETE" ? "Save all marks before publishing" : "Ready to publish"}
          </p>
        </div>
        {result.result_published_at ? (
          <button onClick={() => handlePublish(false)} disabled={publishing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[17px] font-bold disabled:opacity-60">
            <XCircle className="w-4 h-4" />{publishing ? "..." : "Unpublish"}
          </button>
        ) : (
          <button onClick={() => handlePublish(true)} disabled={publishing || isDirty || result.final_result === "INCOMPLETE"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[17px] font-bold disabled:opacity-60">
            <Award className="w-4 h-4" />{publishing ? "Publishing..." : "Publish Result"}
          </button>
        )}
      </div>
    </div>
  );
}
