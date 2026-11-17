"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, Search, RefreshCw, UserPlus, CheckCircle2, Hash, ExternalLink, Eye, X, ChevronRight } from "lucide-react";
import Select from "@/components/ui/Select";
import { useDashboard } from "../DashboardContext";

export default function EnrolledStudentsPage() {
  const { enrolled, enrolledLoading, loadEnrolled, enrolledSearch, setEnrolledSearch, courses, openDetail } = useDashboard();

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [rollFilter, setRollFilter] = useState("all");

  const withRollCount = useMemo(() => enrolled.filter((s) => Boolean(s.roll_no)).length, [enrolled]);
  const withoutRollCount = useMemo(() => enrolled.filter((s) => !s.roll_no).length, [enrolled]);

  const filtered = useMemo(() => {
    return enrolled.filter((s) => {
      // Search
      if (enrolledSearch) {
        const q = enrolledSearch.toLowerCase();
        const matchesQuery =
          s.candidate_name?.toLowerCase().includes(q) ||
          s.enrollment_no?.toLowerCase().includes(q) ||
          s.roll_no?.toLowerCase().includes(q) ||
          s.courses?.course_name?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }
      // Course filter
      if (selectedCourse !== "all") {
        if (s.course_id !== selectedCourse && s.courses?.id !== selectedCourse) return false;
      }
      // Roll status filter
      if (rollFilter === "assigned" && !s.roll_no) return false;
      if (rollFilter === "unassigned" && Boolean(s.roll_no)) return false;
      return true;
    });
  }, [enrolled, enrolledSearch, selectedCourse, rollFilter]);

  const hasFilters = enrolledSearch || selectedCourse !== "all" || rollFilter !== "all";
  const clearFilters = () => {
    setEnrolledSearch("");
    setSelectedCourse("all");
    setRollFilter("all");
  };

  const cards = [
    { key: "all", label: "Total enrolled students", short: "Enrolled", sub: "Board-approved admissions", count: enrolled.length, Icon: GraduationCap, tone: "bg-[#eaf2fd] text-[#1245b8]", bar: "bg-[#082a63]", next: () => setRollFilter("all") },
    { key: "assigned", label: "Roll numbers issued", short: "Roll no. issued", sub: "Assigned & exam-ready", count: withRollCount, Icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500", next: () => setRollFilter(rollFilter === "assigned" ? "all" : "assigned") },
    { key: "unassigned", label: "Awaiting roll no.", short: "Awaiting", sub: "Requires college assignment", count: withoutRollCount, Icon: Hash, tone: "bg-amber-50 text-amber-700", bar: "bg-amber-500", next: () => setRollFilter(rollFilter === "unassigned" ? "all" : "unassigned") },
  ];

  const sessionOf = (s) => s.session_label || s.academic_session || "2026-27";

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#082a63] sm:text-[28px]">Enrolled Students Register</h1>
          <p className="text-[14.5px] text-[#3d5688] sm:text-[15.5px]">
            {enrolled.length} enrolled · Board-approved candidates eligible for admit cards and examinations.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:flex sm:shrink-0 sm:items-center">
          <Link
            href="/admit-card"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] shadow-sm transition hover:border-[#1b57d8] hover:bg-[#f4f8fe]"
          >
            Admit Card Portal <ExternalLink className="h-3.5 w-3.5 text-[#1b57d8]" />
          </Link>
          <Link
            href="/college/dashboard/register"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8] active:scale-95"
          >
            <UserPlus className="h-4 w-4" /> New admission
          </Link>
        </div>
      </div>

      {/* Metric / filter cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {cards.map(({ key, label, short, sub, count, Icon, tone, bar, next }) => {
          const isActive = rollFilter === key;
          return (
            <button
              key={key}
              onClick={next}
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
              <p className={`hidden text-[13.5px] sm:block ${isActive ? "text-white/75" : "text-[#6b7ea3]"}`}>{sub}</p>
            </button>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1" title="Search by name, enrollment no, roll no or course">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5688]" />
          <input
            value={enrolledSearch}
            onChange={(e) => setEnrolledSearch(e.target.value)}
            placeholder="Search enrolled students…"
            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-10 pr-10 text-[15px] font-medium text-[#082a63] outline-none transition placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-4 focus:ring-[#1b57d8]/15"
          />
          {enrolledSearch && (
            <button onClick={() => setEnrolledSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-3 lg:flex">
          {courses?.length > 0 && (
            <Select
              size="lg"
              ariaLabel="Filter by course"
              className="min-w-0 lg:w-60"
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={[{ value: "all", label: "All courses" }, ...courses.map((c) => ({ value: c.id, label: c.course_name }))]}
            />
          )}
          <button
            onClick={loadEnrolled}
            disabled={enrolledLoading}
            title="Refresh enrolled list"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${enrolledLoading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        {enrolledLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#082a63]/20 border-t-[#082a63]" />
            <p className="text-[15px] font-semibold text-[#3d5688]">Loading enrolled records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2fd] text-[#8fb0e6]"><GraduationCap className="h-8 w-8" /></span>
            <p className="text-[17px] font-bold text-[#082a63]">{hasFilters ? "No records match your filters" : "No enrolled students yet"}</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">
              {hasFilters ? "Try a different search or clear the filters." : "Students appear here once the Board approves their admission."}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-5 h-11 rounded-xl border border-[#d3e1f5] px-6 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
                Clear all filters
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
                    <th className="px-5 py-3.5">#</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Candidate</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Course</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Enrollment no.</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Roll no.</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Session</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Status</th>
                    <th className="whitespace-nowrap px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {filtered.map((s, i) => (
                    <tr key={s.id} className="transition-colors hover:bg-[#f4f8fe]">
                      <td className="px-5 py-3.5 font-mono font-bold text-[#6b7ea3]">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[15px] font-extrabold text-emerald-800">{s.candidate_name?.charAt(0) || "S"}</span>
                          <div className="min-w-0">
                            <p className="font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                            {s.father_name && <p className="text-[13.5px] text-[#3d5688]">F: {s.father_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold leading-snug text-[#082a63]">{s.courses?.course_name || "—"}</p>
                        {s.courses?.duration_label && <p className="text-[13.5px] text-[#3d5688]">{s.courses.duration_label}</p>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {s.enrollment_no ? <span className="rounded-md bg-[#f4f8fe] px-2.5 py-1 font-mono text-[13.5px] font-bold text-[#082a63]">{s.enrollment_no}</span> : <span className="text-[#a9bde0]">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {s.roll_no ? (
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-mono text-[13.5px] font-bold text-emerald-800">{s.roll_no}</span>
                        ) : (
                          <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[12.5px] font-bold text-amber-700">Pending</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#3d5688]">{sessionOf(s)}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-[13px] font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right">
                        <button
                          onClick={() => openDetail(s)}
                          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:border-[#082a63] hover:bg-[#082a63] hover:text-white active:scale-95"
                        >
                          <Eye className="h-4 w-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* cards (phones / tablets) */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
              {filtered.map((s) => (
                <button key={s.id} onClick={() => openDetail(s)} className="group min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4 text-left transition hover:border-[#1b57d8] hover:shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[16px] font-extrabold text-emerald-800">{s.candidate_name?.charAt(0) || "S"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-[16px] font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                      {s.father_name && <p className="break-words text-[13.5px] text-[#3d5688]">F: {s.father_name}</p>}
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#8fb0e6] transition-transform group-hover:translate-x-0.5" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-[12.5px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
                    </span>
                    {s.roll_no ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[12.5px] font-bold text-emerald-800">Roll {s.roll_no}</span>
                    ) : (
                      <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12.5px] font-bold text-amber-700">Roll no. pending</span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-0.5 text-[13.5px] text-[#3d5688]">
                    {s.courses?.course_name && <p className="break-words font-semibold text-[#082a63]">{s.courses.course_name}</p>}
                    <p>
                      {s.enrollment_no && <span className="mr-3 font-mono">{s.enrollment_no}</span>}
                      Session {sessionOf(s)}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-[#e4edf9] bg-[#f8fbff] px-5 py-3 text-[13.5px] font-semibold text-[#3d5688]">
              Showing {filtered.length} {filtered.length === 1 ? "student" : "students"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
