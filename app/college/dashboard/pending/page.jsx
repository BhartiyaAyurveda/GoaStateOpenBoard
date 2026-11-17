"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, RefreshCw, Eye, CheckCircle2, MessageSquare, ClipboardList, X, Send, ChevronRight } from "lucide-react";
import { useDashboard, STATUS_LABELS } from "../DashboardContext";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function PendingApprovalsPage() {
  const { students, loading, loadStudents, openDetail } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const pendingStudents = useMemo(() => {
    return students.filter((s) => s.status === "pending" || s.status === "submitted" || s.status === "under_review" || s.status === "query_raised");
  }, [students]);

  const queryCount = pendingStudents.filter((s) => s.status === "query_raised").length;
  const newSubmissionsCount = pendingStudents.filter((s) => s.status === "pending" || s.status === "submitted").length;
  const underReviewCount = pendingStudents.filter((s) => s.status === "under_review").length;

  const filtered = useMemo(() => {
    return pendingStudents.filter((s) => {
      // Type filter
      if (filterType === "query" && s.status !== "query_raised") return false;
      if (filterType === "new" && s.status !== "pending" && s.status !== "submitted") return false;
      if (filterType === "review" && s.status !== "under_review") return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          s.candidate_name?.toLowerCase().includes(q) ||
          s.courses?.course_name?.toLowerCase().includes(q) ||
          s.phone?.includes(q) ||
          s.father_name?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pendingStudents, filterType, searchTerm]);

  const hasFilters = searchTerm || filterType !== "all";
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
  };

  const cards = [
    { key: "new", label: "New submissions", short: "New", sub: "Awaiting nodal review", count: newSubmissionsCount, Icon: Send, tone: "bg-blue-50 text-blue-700", bar: "bg-blue-500" },
    { key: "query", label: "Admin queries", short: "Queries", sub: "Action required from college", count: queryCount, Icon: MessageSquare, tone: "bg-orange-50 text-orange-700", bar: "bg-orange-500", pulse: queryCount > 0 },
    { key: "review", label: "Under Board review", short: "In review", sub: "Board processing", count: underReviewCount, Icon: Eye, tone: "bg-violet-50 text-violet-700", bar: "bg-violet-500" },
  ];

  const actionLabel = (s) => (s.status === "query_raised" ? "Resolve query" : "Review & manage");
  const actionCls = (s) =>
    s.status === "query_raised" ? "bg-orange-600 hover:bg-orange-700" : "bg-[#1b57d8] hover:bg-[#1245b8]";

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#082a63] sm:text-[28px]">Pending Approvals &amp; Queries</h1>
          <p className="text-[14.5px] text-[#3d5688] sm:text-[15.5px]">
            {pendingStudents.length} pending · applications needing document review, roll number allocation or query resolution.
          </p>
        </div>
        <Link
          href="/college/dashboard/registrations"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d3e1f5] bg-white px-5 text-[14.5px] font-bold text-[#082a63] shadow-sm transition hover:border-[#1b57d8] hover:bg-[#f4f8fe]"
        >
          <ClipboardList className="h-4 w-4 text-[#1245b8]" /> All applications
        </Link>
      </div>

      {/* Metric / filter cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {cards.map(({ key, label, short, sub, count, Icon, tone, bar, pulse }) => {
          const isActive = filterType === key;
          return (
            <button
              key={key}
              onClick={() => setFilterType(isActive ? "all" : key)}
              aria-pressed={isActive}
              className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3 text-left transition sm:p-4 ${
                isActive ? "border-[#082a63] bg-[#082a63] text-white shadow-md" : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#1b57d8] hover:shadow-sm"
              }`}
            >
              {!isActive && <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden="true" />}
              <p className={`flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide sm:text-[12.5px] sm:tracking-wider ${isActive ? "text-[#bcd8fb]" : "text-[#3d5688]"}`}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
                {pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />}
              </p>
              <div className="flex items-end justify-between gap-2">
                <span className="text-[28px] font-extrabold leading-none tracking-tight sm:text-[32px]">{count}</span>
                <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${isActive ? "bg-white/15 text-white" : tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className={`hidden text-[13.5px] sm:block ${isActive ? "text-white/75" : "text-[#6b7ea3]"}`}>{sub}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1" title="Search by name, phone or course">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5688]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pending candidates…"
            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-10 pr-10 text-[15px] font-medium text-[#082a63] outline-none transition placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-4 focus:ring-[#1b57d8]/15"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-[14.5px] font-semibold text-[#082a63]">
            {filtered.length} {filtered.length === 1 ? "applicant" : "applicants"}
          </span>
          <button
            onClick={() => loadStudents()}
            title="Refresh"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#082a63]/20 border-t-[#082a63]" />
            <p className="text-[15px] font-semibold text-[#3d5688]">Fetching pending records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <p className="text-[17px] font-bold text-[#082a63]">{hasFilters ? "No matching pending applications" : "All caught up. Nothing is pending"}</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">
              {hasFilters ? "Try a different search or switch the category." : "Every student registration under your college has been verified and processed by the Board."}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-5 h-11 rounded-xl border border-[#d3e1f5] px-6 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* table (laptops) */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                  <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                    <th className="whitespace-nowrap px-5 py-3.5">Candidate</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Course</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Phone</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Status</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Submitted</th>
                    <th className="whitespace-nowrap px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {filtered.map((s) => {
                    const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                    const Icon = st.icon;
                    const isQuery = s.status === "query_raised";
                    return (
                      <tr key={s.id} className={`transition-colors hover:bg-[#f4f8fe] ${isQuery ? "bg-orange-50/40" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold ${isQuery ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"}`}>
                              {s.candidate_name?.charAt(0) || "S"}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                              <p className="text-[13.5px] text-[#3d5688]">{s.father_name ? `F: ${s.father_name}` : "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold leading-snug text-[#082a63]">{s.courses?.course_name || "—"}</p>
                          <p className="text-[13.5px] text-[#3d5688]">{s.session_label || "Session 2026-27"}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[14px] text-[#082a63]">{s.phone || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-bold ${st.color}`}>
                            <Icon className="h-3.5 w-3.5" /> {st.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#3d5688]">{fmtDate(s.created_at)}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <button onClick={() => openDetail(s)} className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-[14.5px] font-bold text-white shadow-xs transition active:scale-95 ${actionCls(s)}`}>
                            <Eye className="h-4 w-4" /> {actionLabel(s)}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* cards (phones / tablets) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
              {filtered.map((s) => {
                const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                const Icon = st.icon;
                const isQuery = s.status === "query_raised";
                return (
                  <div key={s.id} className={`min-w-0 rounded-xl border p-4 ${isQuery ? "border-orange-200 bg-orange-50/40" : "border-[#d3e1f5] bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[16px] font-extrabold ${isQuery ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"}`}>
                        {s.candidate_name?.charAt(0) || "S"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[16px] font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                        <p className="break-words text-[13.5px] text-[#3d5688]">{[s.father_name && `F: ${s.father_name}`, s.phone].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${st.color}`}>
                        <Icon className="h-3.5 w-3.5" /> {st.label}
                      </span>
                      <span className="text-[13px] text-[#3d5688]">Submitted {fmtDate(s.created_at)}</span>
                    </div>
                    {s.courses?.course_name && <p className="mt-2 break-words text-[14px] font-semibold text-[#082a63]">{s.courses.course_name}</p>}
                    <button onClick={() => openDetail(s)} className={`mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[14.5px] font-bold text-white transition active:scale-95 ${actionCls(s)}`}>
                      <Eye className="h-4 w-4" /> {actionLabel(s)} <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
