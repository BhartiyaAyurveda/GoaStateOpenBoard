"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, RefreshCw, AlertTriangle, CheckCircle2, Hash, Users, XCircle, Eye } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import Select from "@/components/ui/Select";
import AdmitCardTemplate from "@/components/admin/AdmitCardTemplate";

function BulkAdmitCardContent() {
  const searchParams = useSearchParams();
  const exam_session_id = searchParams.get("exam_session_id");

  const [sessions, setSessions] = useState([]);
  const [selSession, setSelSession] = useState(exam_session_id || "");
  const [loading, setLoading] = useState(false);
  const [admitCards, setAdmitCards] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [error, setError] = useState("");
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    fetch("/api/admin/exam-sessions")
      .then((r) => r.json())
      .then((j) => setSessions(j.data || []));
  }, []);

  useEffect(() => {
    if (exam_session_id && exam_session_id !== selSession) setSelSession(exam_session_id);
  }, [exam_session_id]);

  const load = async (sessionId) => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    setAdmitCards([]);
    setSkipped([]);
    try {
      const res = await fetch(`/api/admin/admit-cards/bulk?exam_session_id=${sessionId}`);
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to load");
      else {
        setAdmitCards(json.admitCards || []);
        setSkipped(json.skipped || []);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selSession) load(selSession);
  }, [selSession]);

  // print view: only the cards (no page frame)
  if (printMode)
    return (
      <>
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 0; }
            html, body {
              background: #fff !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
          }
        `}</style>
        <div className="no-print flex flex-wrap items-center gap-3 p-4">
          <button onClick={() => setPrintMode(false)} className="inline-flex h-10 items-center rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
            Back to preview
          </button>
          <div className="flex-1" />
          <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b57d8] px-5 text-[14px] font-bold text-white hover:bg-[#1245b8]">
            <Printer className="h-4 w-4" /> Print all ({admitCards.length})
          </button>
        </div>
        <div className="mx-auto max-w-[900px] space-y-6 px-4 print:m-0 print:w-full print:max-w-none print:space-y-0 print:p-0">
          {admitCards.map((card, i) => (
            <AdmitCardTemplate key={card.id || i} data={card} showPageBreak={i < admitCards.length - 1} />
          ))}
        </div>
      </>
    );

  const sessionOptions = sessions.map((s) => ({ value: s.id, label: s.session_label || s.session_name }));

  const actions =
    admitCards.length > 0 ? (
      <button onClick={() => setPrintMode(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1b57d8] px-3.5 text-[14px] font-bold text-white transition hover:bg-[#1245b8] sm:px-4">
        <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print all ({admitCards.length})</span>
        <span className="sm:hidden">Print</span>
      </button>
    ) : null;

  const stats = [
    { label: "Ready", value: admitCards.length, Icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
    { label: "Skipped", value: skipped.length, Icon: XCircle, tone: "bg-red-100 text-red-600" },
    { label: "Total", value: admitCards.length + skipped.length, Icon: Users, tone: "bg-[#eaf2fd] text-[#1b57d8]" },
  ];

  return (
    <AdminPageShell
      title="Bulk Admit Cards"
      subtitle="Generate and print admit cards for all eligible students in a session"
      backHref="/super-admin/dashboard/exam-management"
      backLabel="Exam Hub"
      actions={actions}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm sm:flex-row sm:items-end">
          <div className="min-w-0 sm:w-80">
            <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">Exam session</span>
            <Select size="lg" ariaLabel="Exam session" placeholder="Select session" value={selSession} onChange={setSelSession} options={sessionOptions} />
          </div>
          <button
            onClick={() => load(selSession)}
            disabled={!selSession || loading}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-5 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[15px] font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" />
          </div>
        )}

        {!selSession && !loading && (
          <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white px-4 py-14 text-center">
            <Hash className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
            <p className="text-[16px] font-bold text-[#082a63]">Select an exam session</p>
            <p className="mt-1 text-[14px] text-[#4a6090]">The admit cards of all eligible students in it will be listed here.</p>
          </div>
        )}

        {!loading && selSession && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ label, value, Icon, tone }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3.5 shadow-sm sm:p-4">
                  <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${tone}`}><Icon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#3d5688]">{label}</p>
                    <p className="text-[24px] font-extrabold leading-none text-[#082a63]">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {admitCards.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
                  <p className="text-[16px] font-bold text-[#082a63]">Ready to print · {admitCards.length} students</p>
                  <button onClick={() => setPrintMode(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#082a63] px-4 text-[14px] font-bold text-white transition hover:bg-[#0b3a85]">
                    <Printer className="h-4 w-4" /> Print all
                  </button>
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left text-[15px]">
                    <thead className="border-b border-[#d3e1f5]">
                      <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                        <th className="px-5 py-3">Roll no.</th>
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Course</th>
                        <th className="px-3 py-3">Centre</th>
                        <th className="px-3 py-3 text-center">Subjects</th>
                        <th className="px-5 py-3 text-right">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4edf9]">
                      {admitCards.map((card, i) => (
                        <tr key={card.id || i} className="transition-colors hover:bg-[#f4f8fe]">
                          <td className="whitespace-nowrap px-5 py-3 font-bold text-[#1245b8]">{card.roll_no}</td>
                          <td className="px-3 py-3 font-bold text-[#082a63]">{card.candidate_name}</td>
                          <td className="px-3 py-3 text-[#3d5688]">{card.course}</td>
                          <td className="px-3 py-3 text-[#3d5688]">{card.center_name}</td>
                          <td className="px-3 py-3 text-center text-[#082a63]">{card.subjects?.length || 0}</td>
                          <td className="px-5 py-3 text-right">
                            <a href={`/super-admin/dashboard/admit-cards/${card.id}`} target="_blank" rel="noreferrer"
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d3e1f5] px-3.5 text-[14px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]">
                              <Eye className="h-4 w-4" /> View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                  {admitCards.map((card, i) => (
                    <div key={card.id || i} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                      <p className="text-[14px] font-bold text-[#1245b8]">{card.roll_no}</p>
                      <p className="break-words text-[16px] font-bold text-[#082a63]">{card.candidate_name}</p>
                      <p className="break-words text-[14px] text-[#3d5688]">{card.course}</p>
                      <p className="break-words text-[13.5px] text-[#4a6090]">{card.center_name} · {card.subjects?.length || 0} subjects</p>
                      <a href={`/super-admin/dashboard/admit-cards/${card.id}`} target="_blank" rel="noreferrer"
                        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]">
                        <Eye className="h-4 w-4" /> View admit card
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skipped.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
                <div className="border-b border-red-200 bg-red-50 px-4 py-3.5 sm:px-5">
                  <p className="text-[16px] font-bold text-red-700">Skipped · {skipped.length} students (incomplete setup)</p>
                </div>
                <ul className="divide-y divide-red-100">
                  {skipped.map((s, i) => (
                    <li key={s.id || i} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                      <span className="w-32 shrink-0 font-bold text-[#6a7fa6]">{s.roll_no || "—"}</span>
                      <span className="min-w-0 flex-1 font-semibold text-[#082a63]">{s.candidate_name}</span>
                      <span className="min-w-0 break-words text-[14px] text-red-600 sm:max-w-sm">{s.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {admitCards.length === 0 && skipped.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white px-4 py-14 text-center">
                <Hash className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                <p className="text-[16px] font-bold text-[#082a63]">No eligible students found</p>
                <p className="mt-1 text-[14px] text-[#4a6090]">Approve students and allot roll numbers first.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminPageShell>
  );
}

export default function BulkAdmitCardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><RefreshCw className="h-6 w-6 animate-spin text-[#1b57d8]" /></div>}>
      <BulkAdmitCardContent />
    </Suspense>
  );
}
