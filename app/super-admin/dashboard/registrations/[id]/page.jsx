"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Pencil, Save, CheckCircle2, XCircle, AlertTriangle, GraduationCap, MessageSquarePlus, Eye, User, Copy, Check, ClipboardCheck, Circle } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const QUERY_FIELD_OPTIONS = [
  { value: "candidate_name", label: "Candidate Name / उमेदवाराचें नांव" },
  { value: "father_name", label: "Father's Name / बापायचें नांव" },
  { value: "mother_name", label: "Mother's Name / आवयचें नांव" },
  { value: "dob", label: "Date of Birth / जल्मतारीख" },
  { value: "category", label: "Category / वर्ग" },
  { value: "gender", label: "Gender / लिंग" },
  { value: "phone", label: "Mobile Number / मोबाइल क्रमांक" },
  { value: "email", label: "Email Address / ईमेल" },
  { value: "session_label", label: "Academic Session / शैक्षणीक सत्र" },
  { value: "address", label: "Address / पत्तो" },
  { value: "course", label: "Course / अभ्यासक्रम" },
  { value: "photo_url", label: "Passport Photo / पासपोर्ट फोटो" },
  { value: "signature_url", label: "Signature / सही" },
  { value: "aadhaar_url", label: "Aadhaar Card / आधार कार्ड" },
  { value: "eighth_marksheet_url", label: "8th Marksheet / 8वी गूणपत्रिका" },
  { value: "tenth_marksheet_url", label: "10th Marksheet / 10वी गूणपत्रिका" },
  { value: "twelfth_marksheet_url", label: "12th Marksheet / 12वी गूणपत्रिका" },
];

const STATUS_COLORS = {
  pending:      "bg-yellow-100 text-yellow-800 border-yellow-300",
  submitted:    "bg-blue-100 text-blue-800 border-blue-300",
  under_review: "bg-purple-100 text-purple-800 border-purple-300",
  query_raised: "bg-orange-100 text-orange-800 border-orange-300",
  approved:     "bg-emerald-100 text-emerald-800 border-emerald-300",
  rejected:     "bg-red-100 text-red-800 border-red-300",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-[13px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function DocLink({ url, label }) {
  if (!url) return <span className="text-[14px] italic text-red-500">Not uploaded</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#082a63] px-4 text-[14px] font-bold text-white transition-colors hover:bg-[#0b3a85]">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}

function CopyChip({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch {}
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-bold text-[#8ec9fa] hover:bg-white/10"
      aria-label={label}
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function RegistrationDetailPage({ params }) {
  const { id } = use(params);
  const [confirm, confirmDialog] = useConfirm();
  const [reg, setReg] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedField, setSelectedField] = useState(QUERY_FIELD_OPTIONS[0].value);
  const [queryMessage, setQueryMessage] = useState("");
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [querySuccess, setQuerySuccess] = useState(null);
  const [queryError, setQueryError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionErr, setActionErr] = useState(null);

  const [previewImg, setPreviewImg] = useState(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/registrations/${id}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Not found"); return; }
      setReg(data.data);
      setQueries(data.queries || []);
    } catch { setError("Failed to load registration details."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRaiseQuery = async (e) => {
    e.preventDefault();
    if (!queryMessage.trim()) { setQueryError("Please write a query message."); return; }
    setSubmittingQuery(true);
    setQueryError(null);
    setQuerySuccess(null);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_name: selectedField, message: queryMessage.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setQueryError(data.error || "Failed to raise query."); return; }
      setQuerySuccess("Query raised and notified to college.");
      setQueryMessage("");
      fetchData();
    } catch { setQueryError("Network error."); }
    finally { setSubmittingQuery(false); }
  };

  const openEdit = () => {
    setEditForm({
      candidate_name: reg.candidate_name || "",
      father_name: reg.father_name || "",
      mother_name: reg.mother_name || "",
      dob: reg.dob || "",
      gender: reg.gender || "",
      category: reg.category || "",
      phone: reg.phone || "",
      email: reg.email || "",
      address: reg.address || "",
      session_label: reg.session_label || reg.academic_session || "",
      enrollment_no: reg.enrollment_no || "",
      roll_no: reg.roll_no || "",
    });
    setEditOpen(true);
    setEditMsg(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg(null);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          academic_session: editForm.session_label,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setEditMsg({ type: "error", text: data.error || "Failed to save." }); return; }
      setEditMsg({ type: "success", text: "Changes saved successfully!" });
      fetchData();
      setTimeout(() => { setEditOpen(false); setEditMsg(null); }, 1500);
    } catch { setEditMsg({ type: "error", text: "Network error." }); }
    finally { setEditSaving(false); }
  };

  const handleAction = async (action) => {
    const approve = action === "approve";
    if (!(await confirm({
      title: approve ? "Approve this registration?" : "Reject this registration?",
      message: approve
        ? "The student's enrollment becomes valid and the enrollment card and admit card become available."
        : "The college is told the application was rejected. This cannot be undone.",
      confirmLabel: approve ? "Approve" : "Reject",
      danger: !approve,
    }))) return;
    setActionLoading(true);
    setActionErr(null);
    setActionMsg(null);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) { setActionErr(data.error || `Failed to ${action}.`); return; }
      setActionMsg(`Registration ${action}d successfully!`);
      fetchData();
    } catch { setActionErr("Network error."); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fe]">
      <div className="text-center text-[#082a63]">
        <div className="w-10 h-10 border-3 border-[#082a63] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[17px] font-semibold">Loading registration details...</p>
      </div>
    </div>
  );

  if (error || !reg) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f8fe] p-4">
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center max-w-md">
        <p className="text-red-700 font-bold mb-3">{error || "Registration not found"}</p>
        <Link href="/super-admin/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082a63] text-white text-[15px] font-bold rounded">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  const isTerminal = reg.status === "approved" || reg.status === "rejected";
  const edu = reg.education || {};
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const fieldCls = "h-11 w-full min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";
  const labelCls = "mb-1.5 block text-[13.5px] font-bold text-[#082a63]";
  const setEdit = (key) => (e) => setEditForm((p) => ({ ...p, [key]: e.target.value }));

  const actions = (
    <div className="flex items-center gap-2">
      <button onClick={openEdit} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-3 text-[14px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
        <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Edit data</span>
      </button>
      <button onClick={() => handleAction("approve")} disabled={actionLoading || isTerminal}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 text-[14px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-40">
        <CheckCircle2 className="h-4 w-4" /> Approve
      </button>
      <button onClick={() => handleAction("reject")} disabled={actionLoading || isTerminal}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-600 px-3.5 text-[14px] font-bold text-white transition hover:bg-red-700 disabled:opacity-40">
        <XCircle className="h-4 w-4" /> Reject
      </button>
    </div>
  );

  const Info = ({ label, value, mono }) => (
    <div className="min-w-0">
      <span className="block text-[13px] font-semibold text-[#6b7ea3]">{label}</span>
      <span className={`block break-words text-[16px] font-bold text-[#082a63] ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );

  const Section = ({ n, title, right, children, flush }) => (
    <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
        <h3 className="flex min-w-0 items-center gap-2.5 text-[15.5px] font-bold text-[#082a63]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#082a63] text-[13px] font-extrabold text-white">{n}</span>
          <span className="min-w-0">{title}</span>
        </h3>
        {right}
      </div>
      <div className={flush ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );

  // Class XII needs the 10th marksheet, Class X the 8th. A document that does not apply and was not uploaded is not listed.
  const isXII = /\bXII\b|senior\s*secondary/i.test(reg.courses?.course_name || reg.course_name || "");
  const eduRows = [["8th / Middle School", edu.middle], ["10th / High School", edu.high_school], ["12th / Intermediate", edu.intermediate], ["Graduation", edu.graduation], ["Other", edu.other]].filter(([, d]) => d?.board);
  const docs = [
    { label: "Aadhaar Card", url: reg.aadhaar_url, required: true },
    { label: "8th Marksheet", url: reg.eighth_marksheet_url, required: !isXII },
    { label: "10th Marksheet", url: reg.tenth_marksheet_url || reg.marksheet_10th_url, required: isXII },
    { label: "12th Marksheet", url: reg.twelfth_marksheet_url || reg.marksheet_12th_url, required: false },
    { label: "Other Document", url: reg.affidavit_url || reg.other_doc_url, required: false },
  ].filter((d) => d.required || d.url);

  // what the Board should be able to see before approving
  const checks = [
    { label: "Passport photo", ok: !!reg.photo_url },
    { label: "Signature", ok: !!reg.signature_url },
    { label: "Aadhaar card", ok: !!reg.aadhaar_url },
    isXII
      ? { label: "10th marksheet", ok: !!(reg.tenth_marksheet_url || reg.marksheet_10th_url) }
      : { label: "8th marksheet", ok: !!reg.eighth_marksheet_url },
    { label: "Name, father's name and date of birth", ok: !!(reg.candidate_name && reg.father_name && reg.dob) },
    { label: isXII ? "10th class details" : "8th class details", ok: isXII ? !!edu.high_school?.board : !!edu.middle?.board },
  ];
  const missing = checks.filter((c) => !c.ok);

  return (
    <AdminPageShell
      title={reg.candidate_name || "Registration"}
      subtitle={`${reg.enrollment_no || reg.roll_no || id.slice(0, 8)} · ${reg.colleges?.college_name || "—"}`}
      backHref="/super-admin/dashboard?tab=applications"
      backLabel="Applications"
      actions={actions}
    >
      <div className="space-y-5">
        {/* summary */}
        <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
          <div className="flex items-start gap-4 bg-gradient-to-br from-[#082a63] via-[#0b3a85] to-[#082a63] p-4 sm:gap-5 sm:p-6">
            {reg.photo_url ? (
              <button type="button" onClick={() => setPreviewImg({ src: reg.photo_url, title: "Passport Photo" })} aria-label="View passport photo"
                className="h-24 w-[76px] shrink-0 overflow-hidden rounded-xl border-2 border-white/40 bg-white/10 shadow-lg sm:h-28 sm:w-[88px]">
                <img src={reg.photo_url} alt="Passport photo" className="h-full w-full object-cover" />
              </button>
            ) : (
              <div className="flex h-24 w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/30 bg-white/5 sm:h-28 sm:w-[88px]">
                <User className="h-7 w-7 text-white/50" />
                <span className="text-[11px] font-bold uppercase text-white/50">No photo</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-black uppercase tracking-[2.5px] text-[#8ec9fa]">Candidate application</span>
                <StatusBadge status={reg.status} />
              </div>
              <h2 className="mt-1 break-words text-[22px] font-extrabold leading-tight text-white sm:text-[28px]">{reg.candidate_name}</h2>
              <p className="mt-0.5 text-[14px] text-[#c9d9f1]">{reg.gender ? `${reg.gender} · ` : ""}Son / Daughter of {reg.father_name || "—"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {reg.enrollment_no && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-[#5db0f4]/40 bg-[#1b57d8]/20 px-2.5 py-1 font-mono text-[12.5px] font-bold text-[#bfe0ff]">
                    {reg.enrollment_no} <CopyChip text={reg.enrollment_no} label="Copy enrollment number" />
                  </span>
                )}
                {reg.roll_no && <span className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 font-mono text-[12.5px] font-bold text-[#e3edfa]">Roll: {reg.roll_no}</span>}
                <span className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[12.5px] font-semibold text-[#c9d9f1]">Applied {fmtDate(reg.created_at)}</span>
                {reg.status === "approved" && (
                  <Link href={`/super-admin/dashboard/admit-cards/${reg.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[13px] font-bold text-[#082a63] transition hover:bg-[#eaf2fd]">
                    <GraduationCap className="h-4 w-4" /> Admit card
                  </Link>
                )}
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-2 divide-x divide-y divide-[#eaf2fd] border-t border-[#d3e1f5] bg-[#f8fafc] sm:grid-cols-4 sm:divide-y-0">
            {[
              ["Course", reg.courses?.course_name || reg.course_name],
              ["Session", reg.session_label || reg.academic_session],
              ["College", reg.colleges?.college_name],
              ["Category", reg.category?.toUpperCase()],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0 px-4 py-3">
                <dt className="text-[11.5px] font-bold uppercase tracking-wider text-[#8a97b3]">{k}</dt>
                <dd className="mt-0.5 break-words text-[14px] font-bold leading-snug text-[#082a63]">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>

        {actionMsg && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-[15px] font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" /> {actionMsg}</div>}
        {actionErr && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[15px] font-semibold text-red-800"><AlertTriangle className="h-4 w-4 shrink-0" /> {actionErr}</div>}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left: details */}
          <div className="min-w-0 space-y-5 lg:col-span-2">
            <Section n="1" title="Personal & contact information" right={<span className="shrink-0 rounded-full bg-[#eaf2fd] px-2.5 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{reg.session_label || reg.academic_session || "—"}</span>}>
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
                <Info label="Candidate name / नांव" value={reg.candidate_name} />
                <Info label="Father's name / बापायचें नांव" value={reg.father_name} />
                <Info label="Mother's name / आवयचें नांव" value={reg.mother_name} />
                <Info label="Date of birth / जल्मतारीख" value={fmtDate(reg.dob)} />
                <Info label="Gender / लिंग" value={reg.gender?.toUpperCase()} />
                <Info label="Category / वर्ग" value={reg.category?.toUpperCase()} />
                <Info label="Mobile / मोबाइल" value={reg.phone} />
                <Info label="Email / ईमेल" value={reg.email} />
              </div>
              {reg.address && (
                <div className="mt-4 border-t border-dashed border-[#c9daf2] pt-4">
                  <Info label="Full address / कायमचो पत्तो" value={reg.address} />
                </div>
              )}
            </Section>

            <Section n="2" title="Enrolled course / अभ्यासक्रम">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Info label="Course name" value={reg.courses?.course_name || reg.course_name} />
                {reg.language_name && <Info label="Language option" value={reg.language_name} />}
                <div className="rounded-xl border border-[#d3e1f5] bg-[#eaf2fd] px-4 py-2.5">
                  <span className="block text-[13px] font-semibold text-[#6b7ea3]">Academic session</span>
                  <span className="text-[16px] font-bold text-[#1245b8]">{reg.session_label || reg.academic_session || "—"}</span>
                </div>
              </div>
            </Section>

            <Section n="3" title="Educational qualifications / शैक्षणीक पात्रता" flush>
              {eduRows.length === 0 ? (
                <p className="px-5 py-8 text-center text-[14.5px] text-[#6b7ea3]">No qualifications entered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-[15px]">
                    <thead className="border-b border-[#d3e1f5]">
                      <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                        {["Examination", "Board / University", "Year", "Max", "Obtained", "%"].map((h) => (
                          <th key={h} className="px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4edf9] text-[#082a63]">
                      {eduRows
                        .map(([label, d]) => (
                          <tr key={label}>
                            <td className="px-4 py-3 font-bold">{label}</td>
                            <td className="px-4 py-3">{d.board || "—"}</td>
                            <td className="px-4 py-3">{d.year || "—"}</td>
                            <td className="px-4 py-3">{d.total || "—"}</td>
                            <td className="px-4 py-3">{d.obtained || "—"}</td>
                            <td className="px-4 py-3 font-bold">{d.percentage ? `${d.percentage}%` : "—"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section n="4" title="Uploaded documents / दस्तावेज">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-3 text-center">
                  <span className="text-[14px] font-bold text-[#082a63]">Passport photo</span>
                  {reg.photo_url ? (
                    <button type="button" onClick={() => setPreviewImg({ src: reg.photo_url, title: "Passport Photo" })} className="h-28 w-24 overflow-hidden rounded-lg border border-[#bccbe6] bg-[#d3e1f5] shadow-sm transition hover:opacity-90" aria-label="Preview passport photo">
                      <img src={reg.photo_url} alt="Passport photo" className="h-full w-full object-cover" />
                    </button>
                  ) : <span className="text-[14px] italic text-red-500">Not uploaded</span>}
                </div>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-3 text-center">
                  <span className="text-[14px] font-bold text-[#082a63]">Signature</span>
                  {reg.signature_url ? (
                    <button type="button" onClick={() => setPreviewImg({ src: reg.signature_url, title: "Signature" })} className="h-14 w-28 overflow-hidden rounded-lg border border-[#bccbe6] bg-white shadow-sm transition hover:opacity-90" aria-label="Preview signature">
                      <img src={reg.signature_url} alt="Signature" className="h-full w-full object-contain p-1" />
                    </button>
                  ) : <span className="text-[14px] italic text-red-500">Not uploaded</span>}
                </div>
                {docs.map(({ label, url }) => (
                  <div key={label} className={`flex flex-col items-center justify-between gap-2 rounded-xl border p-3 text-center ${url ? "border-[#d3e1f5] bg-[#f4f8fe]" : "border-red-200 bg-red-50/50"}`}>
                    <span className="text-[14px] font-bold text-[#082a63]">{label}</span>
                    <DocLink url={url} label="View" />
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* Right: checklist + queries */}
          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
                <h3 className="flex items-center gap-2 text-[15.5px] font-bold text-[#082a63]"><ClipboardCheck className="h-5 w-5 text-[#1245b8]" /> Review checklist</h3>
                <span className={`rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${missing.length === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  {checks.length - missing.length}/{checks.length}
                </span>
              </div>
              <ul className="divide-y divide-[#eaf2fd] px-4 sm:px-5">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2.5 py-2.5 text-[14.5px]">
                    {c.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="h-5 w-5 shrink-0 text-red-400" />}
                    <span className={c.ok ? "text-[#082a63]" : "font-semibold text-red-700"}>{c.label}</span>
                    {!c.ok && <span className="ml-auto text-[12.5px] font-bold text-red-600">Missing</span>}
                  </li>
                ))}
              </ul>
              <p className={`border-t px-4 py-3 text-[13.5px] font-medium sm:px-5 ${missing.length === 0 ? "border-emerald-100 bg-emerald-50/60 text-emerald-800" : "border-amber-100 bg-amber-50/60 text-amber-900"}`}>
                {missing.length === 0 ? "Everything required is present. This application is ready to approve." : `${missing.length} item${missing.length === 1 ? " is" : "s are"} missing. You can raise a query to the college below.`}
              </p>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-amber-200 bg-amber-50 px-4 py-3.5 sm:px-5">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <h3 className="text-[15.5px] font-bold text-amber-900">Raise query / आक्षेप नोंद करात</h3>
              </div>
              <form onSubmit={handleRaiseQuery} className="space-y-4 p-4 sm:p-5">
                {querySuccess && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[14px] font-semibold text-emerald-800">{querySuccess}</div>}
                {queryError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[14px] font-semibold text-red-800">{queryError}</div>}
                <div>
                  <span className={labelCls}>Target field <span className="text-red-500">*</span></span>
                  <Select size="lg" ariaLabel="Target field" value={selectedField} onChange={setSelectedField} disabled={isTerminal}
                    options={QUERY_FIELD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
                </div>
                <label className="block">
                  <span className={labelCls}>Query message <span className="text-red-500">*</span></span>
                  <textarea rows={4} value={queryMessage} onChange={(e) => setQueryMessage(e.target.value)} disabled={isTerminal}
                    placeholder="Explain clearly what needs to be corrected…"
                    className="w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15 disabled:opacity-50" />
                </label>
                <button type="submit" disabled={submittingQuery || isTerminal}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 text-[15px] font-bold text-white transition hover:bg-amber-600 disabled:opacity-50">
                  <MessageSquarePlus className="h-4 w-4" /> {submittingQuery ? "Submitting…" : "Send query to college"}
                </button>
                {isTerminal && <p className="text-center text-[13.5px] italic text-[#6b7ea3]">Queries cannot be raised on approved or rejected applications.</p>}
              </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
                <h3 className="text-[15.5px] font-bold text-[#082a63]">Query history</h3>
                <span className="rounded-full bg-[#082a63] px-2.5 py-0.5 text-[12.5px] font-bold text-white">{queries.length}</span>
              </div>
              <div className="max-h-96 divide-y divide-[#e4edf9] overflow-y-auto p-4 sm:px-5">
                {queries.length === 0 ? (
                  <p className="py-4 text-center text-[14.5px] italic text-[#6b7ea3]">No queries raised yet.</p>
                ) : queries.map((q) => (
                  <div key={q.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="min-w-0 break-all rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[12.5px] font-bold text-amber-800">{q.field_name}</span>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-bold uppercase ${q.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{q.status}</span>
                    </div>
                    <p className="my-1 break-words text-[14.5px] font-medium text-[#082a63]">{q.message}</p>
                    <span className="block text-[13px] text-[#6b7ea3]">{q.created_at ? new Date(q.created_at).toLocaleString("en-IN") : "—"}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Edit data */}
      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditMsg(null); }}
        busy={editSaving}
        icon={Pencil}
        title="Edit registration data"
        subtitle="Changes are saved directly to the database. Use carefully."
        size="sm:max-w-2xl"
        onSubmit={handleSaveEdit}
        footer={
          <>
            <button type="button" onClick={() => { setEditOpen(false); setEditMsg(null); }} disabled={editSaving}
              className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={editSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-7 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60">
              <Save className="h-4 w-4" /> {editSaving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {editMsg && (
            <div role={editMsg.type === "error" ? "alert" : "status"} className={`rounded-xl border px-3.5 py-2.5 text-[14.5px] font-semibold ${editMsg.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {editMsg.text}
            </div>
          )}

          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Personal information</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { key: "candidate_name", label: "Candidate name", type: "text" },
                { key: "father_name", label: "Father's name", type: "text" },
                { key: "mother_name", label: "Mother's name", type: "text" },
                { key: "dob", label: "Date of birth", type: "date" },
              ].map(({ key, label, type }) => (
                <label key={key} className="block min-w-0">
                  <span className={labelCls}>{label}</span>
                  {type === "date" ? (
                    <DatePicker size="lg" ariaLabel={label} value={editForm[key] || ""} onChange={(v) => setEditForm((p) => ({ ...p, [key]: v }))} min="1940-01-01" max={new Date().toISOString().slice(0, 10)} />
                  ) : (
                    <input type={type} value={editForm[key] || ""} onChange={setEdit(key)} className={fieldCls} />
                  )}
                </label>
              ))}
              <div>
                <span className={labelCls}>Gender</span>
                <Select size="lg" ariaLabel="Gender" placeholder="Select" value={editForm.gender || ""} onChange={(v) => setEditForm((p) => ({ ...p, gender: v }))}
                  options={[{ value: "", label: "Not set" }, ...["Male", "Female", "Other"].map((o) => ({ value: o.toLowerCase(), label: o }))]} />
              </div>
              <div>
                <span className={labelCls}>Category</span>
                <Select size="lg" ariaLabel="Category" placeholder="Select" value={editForm.category || ""} onChange={(v) => setEditForm((p) => ({ ...p, category: v }))}
                  options={[{ value: "", label: "Not set" }, ...["General", "OBC", "SC", "ST"].map((o) => ({ value: o, label: o }))]} />
              </div>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Contact details</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block min-w-0"><span className={labelCls}>Mobile number</span><input type="text" inputMode="tel" value={editForm.phone || ""} onChange={setEdit("phone")} className={fieldCls} /></label>
              <label className="block min-w-0"><span className={labelCls}>Email address</span><input type="email" value={editForm.email || ""} onChange={setEdit("email")} className={fieldCls} /></label>
              <label className="block min-w-0 sm:col-span-2">
                <span className={labelCls}>Address</span>
                <textarea rows={2} value={editForm.address || ""} onChange={setEdit("address")}
                  className="w-full resize-none rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 text-[15px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
              </label>
            </div>
          </section>

          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Enrollment &amp; roll</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[{ key: "enrollment_no", label: "Enrollment no." }, { key: "roll_no", label: "Roll number" }, { key: "session_label", label: "Academic session" }].map(({ key, label }) => (
                <label key={key} className="block min-w-0"><span className={labelCls}>{label}</span><input type="text" value={editForm[key] || ""} onChange={setEdit(key)} className={fieldCls} /></label>
              ))}
            </div>
          </section>
        </div>
      </Modal>

      {/* Image preview */}
      <Modal open={!!previewImg} onClose={() => setPreviewImg(null)} icon={Eye} title={previewImg?.title || "Preview"} size="sm:max-w-lg">
        {previewImg && (
          <div className="flex h-80 w-full items-center justify-center overflow-hidden rounded-xl bg-[#eaf2fd]">
            <img src={previewImg.src} alt={previewImg.title} className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </Modal>

      {confirmDialog}
    </AdminPageShell>
  );
}
