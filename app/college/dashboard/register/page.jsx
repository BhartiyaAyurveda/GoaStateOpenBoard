"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ClipboardList, GraduationCap, UserPlus, Sparkles, RefreshCw, Copy, Check, Building2, CalendarDays, Hourglass, ShieldCheck, Ticket, ArrowRight } from "lucide-react";
import StudentRegistrationForm from "@/components/college/StudentRegistrationForm";
import { useDashboard } from "../DashboardContext";

export default function RegisterStudentPage() {
  const { college, courses, loadStudents, showToast } = useDashboard();
  const [regSuccess, setRegSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyEnrollment = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Could not copy. Please select and copy the number.", "error");
    }
  };
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");

  const [draftData, setDraftData] = useState(null);   // { form_data, current_step }
  const [draftLoading, setDraftLoading] = useState(!!draftId);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    if (!draftId) return;
    setDraftLoading(true);
    fetch(`/api/college/drafts/${draftId}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok && data.draft) setDraftData(data.draft);
        else setDraftError(data.error || "Draft not found");
      })
      .catch(() => setDraftError("Failed to load draft"))
      .finally(() => setDraftLoading(false));
  }, [draftId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider bg-[#082a63] text-[#5db0f4] whitespace-nowrap">
              <Sparkles className="w-3 h-3 text-[#1b57d8] shrink-0" />
              <span className="hidden sm:inline">Institutional Admission Form</span>
              <span className="sm:hidden">Admission Form</span>
            </span>
            <span className="text-[13px] sm:text-[15px] text-[#3d5688] font-semibold whitespace-nowrap">
              Session 2026–27
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#082a63] tracking-tight">
            {draftId ? "Resume Registration" : "Register New Candidate"}
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
            Lodge student admission application under <strong>{college?.college_name || "your institution"}</strong> for Board approval.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/college/dashboard/drafts"
            className="inline-flex items-center gap-2 text-[13px] text-[#082a63] hover:text-[#1b57d8] font-bold bg-white px-3.5 py-2 rounded-xl border border-[#d3e1f5] hover:border-[#1b57d8] shadow-xs transition-all">
            <GraduationCap className="w-3.5 h-3.5 text-[#1245b8]" />
            <span>Saved Drafts</span>
          </Link>
          <Link href="/college/dashboard/registrations"
            className="inline-flex items-center gap-2 text-[13px] text-[#082a63] hover:text-[#1b57d8] font-bold bg-white px-3.5 py-2 rounded-xl border border-[#d3e1f5] hover:border-[#1b57d8] shadow-xs transition-all">
            <ClipboardList className="w-3.5 h-3.5 text-[#1245b8]" />
            <span>All Registrations</span>
          </Link>
        </div>
      </div>

      {/* Draft loading / error state */}
      {draftId && draftLoading && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#3d5688]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#1b57d8]" />
          <span className="text-[15px] font-semibold">Loading saved draft…</span>
        </div>
      )}

      {draftId && draftError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[15px] font-semibold">
          {draftError} — <Link href="/college/dashboard/register" className="underline font-bold">Start a new registration instead</Link>
        </div>
      )}

      {/* Success Confirmation Card or Multi-step Form */}
      {!draftLoading && !draftError && (
        regSuccess ? (() => {
          const enrollment = regSuccess.enrollment_no || `#${regSuccess.id?.slice(0, 10).toUpperCase()}`;
          const submittedOn = regSuccess.created_at
            ? new Date(regSuccess.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
          const steps = [
            { icon: Hourglass, title: "Board review", text: "The Board checks the details and documents and approves the admission." },
            { icon: Ticket, title: "Roll number & admit card", text: "After approval, a roll number is allotted and the admit card is generated." },
            { icon: ShieldCheck, title: "Result", text: "Marks are entered and the result is published online." },
          ];
          return (
            <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
              {/* top band */}
              <div className="relative bg-gradient-to-b from-emerald-50 to-white px-5 pb-6 pt-9 text-center sm:px-10 sm:pt-11">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-200/50 animate-ping [animation-duration:2.4s]" aria-hidden="true" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-100">
                    <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
                  </span>
                </div>
                <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.14em] text-emerald-700">Registration submitted</p>
                <h2 className="mt-1.5 break-words text-[26px] font-extrabold leading-tight tracking-tight text-[#082a63] sm:text-[34px]">
                  {regSuccess.candidate_name}
                </h2>
                <p className="mx-auto mt-1.5 max-w-md text-[15px] text-[#3d5688]">
                  The registration has been sent to the Board for review. You can track it under <b>All Registrations</b>.
                </p>
              </div>

              <div className="space-y-6 px-5 pb-8 sm:px-10">
                {/* enrollment number */}
                <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-[#9db7e0] bg-[#f4f8fe] p-4 text-center sm:p-5">
                  <p className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Enrollment number</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                    <span className="break-all font-mono text-[26px] font-extrabold tracking-wider text-[#082a63] sm:text-[32px]">{enrollment}</span>
                    <button
                      type="button"
                      onClick={() => copyEnrollment(enrollment)}
                      className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-[14px] font-bold transition ${copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#1b57d8]"}`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-2 text-[13.5px] text-[#3d5688]">Keep this number safe. The student needs it, with the date of birth, for the enrollment card, admit card and result.</p>
                </div>

                {/* details */}
                <dl className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4">
                    <dt className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]"><Hourglass className="h-3.5 w-3.5" /> Status</dt>
                    <dd className="mt-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[14px] font-bold text-amber-800"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Under review</span></dd>
                  </div>
                  <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4">
                    <dt className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]"><Building2 className="h-3.5 w-3.5" /> College</dt>
                    <dd className="mt-2 break-words text-[15px] font-bold text-[#082a63]">{college?.college_name || "—"}</dd>
                  </div>
                  <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4">
                    <dt className="flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]"><CalendarDays className="h-3.5 w-3.5" /> Submitted</dt>
                    <dd className="mt-2 text-[15px] font-bold text-[#082a63]">{submittedOn}</dd>
                  </div>
                </dl>

                {/* what happens next */}
                <div className="mx-auto max-w-3xl">
                  <h3 className="mb-3 text-[15px] font-bold text-[#082a63]">What happens next</h3>
                  <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {steps.map(({ icon: Icon, title, text }, i) => (
                      <li key={title} className="relative rounded-2xl border border-[#d3e1f5] bg-[#f9fbff] p-4">
                        <span className="absolute right-3 top-2.5 text-[26px] font-extrabold leading-none text-[#dbe6f6]" aria-hidden="true">{i + 1}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#082a63] text-white"><Icon className="h-4.5 w-4.5" /></span>
                        <p className="mt-2.5 text-[15px] font-bold text-[#082a63]">{title}</p>
                        <p className="mt-1 text-[13.5px] leading-snug text-[#3d5688]">{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* actions */}
                <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => { setRegSuccess(null); loadStudents(); }}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8] active:scale-95 sm:flex-none"
                  >
                    <UserPlus className="h-4 w-4" /> Register another student
                  </button>
                  <Link href="/college/dashboard/registrations"
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:border-[#082a63] active:scale-95 sm:flex-none">
                    View in all registrations <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })() : (
          <StudentRegistrationForm
            courses={courses}
            college={college}
            draftId={draftId || null}
            initialData={draftData ? { form: draftData.form_data, step: draftData.current_step } : null}
            onSuccess={(data) => {
              setRegSuccess(data);
              showToast(`${data.candidate_name} registered successfully!`, "success");
              loadStudents();
            }}
          />
        )
      )}
    </div>
  );
}
