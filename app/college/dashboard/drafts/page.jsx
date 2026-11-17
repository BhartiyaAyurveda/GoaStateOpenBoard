"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FileText, Trash2, RefreshCw, Plus, Search, Clock, CheckCircle2, AlertCircle, X, ArrowRight, Users } from "lucide-react";
import { useConfirm } from "@/components/ui/ConfirmDialog";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

export default function DraftsPage() {
  const [confirm, confirmDialog] = useConfirm();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDrafts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/college/drafts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch drafts");
      setDrafts(data.drafts || []);
    } catch (err) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDiscard = async (id, name) => {
    if (
      !(await confirm({
        title: "Discard this draft?",
        message: `Draft for "${name}" will be deleted permanently.\nहो मसुदो कायमचो काडून उडयतले.`,
        confirmLabel: "Discard",
        danger: true,
      }))
    )
      return;
    setError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/college/drafts/${id}`, { method: "DELETE" });
      if ((await res.json()).ok) setDrafts((prev) => prev.filter((d) => d.id !== id));
      else setError("Failed to discard draft.");
    } catch {
      setError("Network error.");
    }
    setDeletingId(null);
  };

  const stats = useMemo(
    () => ({
      total: drafts.length,
      verified: drafts.filter((d) => d.status === "verified").length,
      inProgress: drafts.filter((d) => d.status === "draft").length,
    }),
    [drafts],
  );

  const filtered = useMemo(
    () =>
      drafts.filter((d) => {
        if (statusFilter !== "all" && d.status !== statusFilter) return false;
        const q = search.toLowerCase().trim();
        return !q || d.candidate_name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q) || d.father_name?.toLowerCase().includes(q);
      }),
    [drafts, search, statusFilter],
  );

  const hasFilters = search || statusFilter !== "all";

  const cards = [
    { key: "all", label: "Total / एकूण", short: "Total", count: stats.total, Icon: Users, bar: "bg-[#082a63]", tone: "bg-[#eaf2fd] text-[#1245b8]" },
    { key: "verified", label: "OTP verified / पडताळणी जाल्लें", short: "OTP verified", count: stats.verified, Icon: CheckCircle2, bar: "bg-amber-500", tone: "bg-amber-50 text-amber-700" },
    { key: "draft", label: "In progress / अपुरें", short: "In progress", count: stats.inProgress, Icon: Clock, bar: "bg-blue-500", tone: "bg-blue-50 text-blue-700" },
  ];

  const StatusBadge = ({ d }) =>
    d.status === "draft" ? (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[13px] font-bold text-blue-800">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> In progress
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[13px] font-bold text-amber-900">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" /> OTP verified
      </span>
    );

  const DiscardBtn = ({ d, full }) => (
    <button
      type="button"
      onClick={() => handleDiscard(d.id, d.candidate_name || "this draft")}
      disabled={deletingId === d.id}
      title="Discard draft"
      aria-label="Discard draft"
      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white text-[14px] font-bold text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 ${full ? "px-4" : "w-10"}`}
    >
      {deletingId === d.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {full && <span>Discard</span>}
    </button>
  );

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#082a63] sm:text-[28px]">Drafts &amp; OTP-verified registrations</h1>
          <p className="max-w-3xl text-[14.5px] leading-relaxed text-[#3d5688] sm:text-[15.5px]">
            Students who completed OTP verification. Resume the form to continue without repeating OTP.
            <span className="mt-0.5 block">ज्या विद्यार्थ्यांचें OTP पडताळणी जाल्लें आसा तांकां &quot;Resume Form&quot; वरवीं चालू दवरात.</span>
          </p>
        </div>
        <Link
          href="/college/dashboard/register"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8] active:scale-95"
        >
          <Plus className="h-4 w-4" /> New registration
        </Link>
      </div>

      {/* Status cards (filters) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {cards.map(({ key, label, short, count, Icon, bar, tone }) => {
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(isActive && key !== "all" ? "all" : key)}
              aria-pressed={isActive}
              className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${
                isActive ? "border-[#082a63] bg-[#082a63] text-white shadow-md" : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#1b57d8] hover:shadow-sm"
              }`}
            >
              {!isActive && <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden="true" />}
              <p className={`text-[12px] font-bold uppercase tracking-wide sm:text-[12.5px] sm:tracking-wider ${isActive ? "text-[#bcd8fb]" : "text-[#3d5688]"}`}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <div className="flex items-end justify-between gap-2">
                <span className="text-[28px] font-extrabold leading-none tracking-tight sm:text-[32px]">{count}</span>
                <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${isActive ? "bg-white/15 text-white" : tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1" title="Search by name, father's name or email">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5688]" />
          <input
            type="text"
            placeholder="Search drafts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-10 pr-10 text-[15px] font-medium text-[#082a63] outline-none transition placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-4 focus:ring-[#1b57d8]/15"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-[14.5px] font-semibold text-[#082a63]">
            {filtered.length} {filtered.length === 1 ? "draft" : "drafts"}
          </span>
          <button
            onClick={fetchDrafts}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[14.5px] font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> <span className="min-w-0 flex-1">{error}</span>
          <button onClick={fetchDrafts} className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 font-bold text-red-800 hover:bg-red-200">Retry</button>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#3d5688]">
            <RefreshCw className="h-7 w-7 animate-spin text-[#1b57d8]" />
            <p className="text-[15px] font-semibold">Loading draft registrations…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-14 text-center sm:py-16">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2fd] text-[#8fb0e6]"><FileText className="h-8 w-8" /></span>
            <p className="text-[17px] font-bold text-[#082a63]">{hasFilters ? "No drafts match your filters" : "No incomplete registrations"}</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">
              {hasFilters ? "Try a different search or show all drafts." : "All verified registrations have been submitted."}
            </p>
            {hasFilters ? (
              <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="mt-5 h-11 rounded-xl border border-[#d3e1f5] px-6 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">Clear filters</button>
            ) : (
              <Link href="/college/dashboard/register" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8]">
                <Plus className="h-4 w-4" /> Start a new registration
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* table (laptops) */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                  <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                    <th className="px-5 py-3.5">Candidate / उमेदवार</th>
                    <th className="px-4 py-3.5">Contact / संपर्क</th>
                    <th className="px-4 py-3.5">Status / स्थिती</th>
                    <th className="px-4 py-3.5">Updated / अद्ययावत</th>
                    <th className="px-5 py-3.5 text-right">Actions / कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {filtered.map((d) => (
                    <tr key={d.id} className="transition-colors hover:bg-[#f4f8fe]">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-[#082a63]">{d.candidate_name || <em className="font-normal text-[#4a6090]">Unnamed</em>}</p>
                        {d.father_name && <p className="text-[13.5px] text-[#3d5688]">Father: {d.father_name}</p>}
                        {d.form_data?.course_id && <p className="text-[13.5px] font-semibold text-[#1245b8]">Step {d.current_step} of 6</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="break-all font-mono text-[13.5px] font-medium text-[#082a63]">{d.email}</p>
                        {d.form_data?.phone && <p className="text-[13.5px] text-[#3d5688]">+91 {d.form_data.phone}</p>}
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge d={d} /></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[#3d5688]">
                        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" /> {fmtDate(d.updated_at || d.created_at)}</p>
                        <p className="pl-5 text-[13px] text-[#8a97b3]">{fmtTime(d.updated_at || d.created_at)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/college/dashboard/register?draftId=${d.id}`}
                            className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1b57d8] px-4 text-[14px] font-bold text-white shadow-xs transition hover:bg-[#1245b8]"
                          >
                            Resume form <ArrowRight className="h-4 w-4" />
                          </Link>
                          <DiscardBtn d={d} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* cards (phones / tablets) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
              {filtered.map((d) => (
                <div key={d.id} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-[16px] font-bold leading-snug text-[#082a63]">{d.candidate_name || <em className="font-normal text-[#4a6090]">Unnamed</em>}</p>
                      {d.father_name && <p className="break-words text-[13.5px] text-[#3d5688]">Father: {d.father_name}</p>}
                    </div>
                    <StatusBadge d={d} />
                  </div>
                  <div className="mt-2.5 space-y-0.5 text-[13.5px] text-[#3d5688]">
                    <p className="break-all font-mono text-[#082a63]">{d.email}</p>
                    {d.form_data?.phone && <p>+91 {d.form_data.phone}</p>}
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {fmtDate(d.updated_at || d.created_at)} {fmtTime(d.updated_at || d.created_at)}
                      {d.form_data?.course_id && <span className="ml-1 font-semibold text-[#1245b8]">· Step {d.current_step}/6</span>}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <Link
                      href={`/college/dashboard/register?draftId=${d.id}`}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] text-[14.5px] font-bold text-white transition hover:bg-[#1245b8]"
                    >
                      Resume form <ArrowRight className="h-4 w-4" />
                    </Link>
                    <DiscardBtn d={d} full />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {confirmDialog}
    </div>
  );
}
