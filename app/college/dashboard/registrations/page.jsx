"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, RefreshCw, Eye, Users, UserPlus, Clock, CheckCircle2, AlertTriangle, X, ChevronRight } from "lucide-react";
import Select from "@/components/ui/Select";
import { useDashboard, STATUS_LABELS } from "../DashboardContext";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function AllRegistrationsPage() {
  const { students, loading, loadStudents, search, setSearch, statusFilter, setStatusFilter, counts, courses } = useDashboard();

  const [selectedCourse, setSelectedCourse] = useState("all");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      // Search query
      if (search) {
        const q = search.toLowerCase();
        const matchesQuery =
          s.candidate_name?.toLowerCase().includes(q) ||
          s.roll_no?.toLowerCase().includes(q) ||
          s.enrollment_no?.toLowerCase().includes(q) ||
          s.phone?.includes(q);
        if (!matchesQuery) return false;
      }
      // Course filter
      if (selectedCourse !== "all") {
        if (s.course_id !== selectedCourse && s.courses?.id !== selectedCourse) return false;
      }
      return true;
    });
  }, [students, search, selectedCourse]);

  const hasFilters = search || selectedCourse !== "all" || statusFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setSelectedCourse("all");
    setStatusFilter("all");
    loadStudents("all", "");
  };

  const cards = [
    { key: "all", label: "All applications", short: "All", Icon: Users, count: counts.all, accent: "text-[#082a63]", bar: "bg-[#082a63]" },
    { key: "pending", label: "Pending review", short: "Pending", Icon: Clock, count: counts.pending, accent: "text-amber-700", bar: "bg-amber-500" },
    { key: "approved", label: "Approved", short: "Approved", Icon: CheckCircle2, count: counts.approved, accent: "text-emerald-700", bar: "bg-emerald-500" },
    { key: "rejected", label: "Rejected / query", short: "Rejected", Icon: AlertTriangle, count: counts.rejected, accent: "text-red-700", bar: "bg-red-500" },
  ];

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#082a63] sm:text-[28px]">All Student Registrations</h1>
          <p className="text-[14.5px] text-[#3d5688] sm:text-[15.5px]">
            {counts.all} {counts.all === 1 ? "record" : "records"} · track admission forms, roll numbers and Board approval status.
          </p>
        </div>
        <Link
          href="/college/dashboard/register"
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8] active:scale-95"
        >
          <UserPlus className="h-4 w-4" /> New registration
        </Link>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ key, label, short, Icon, count, accent, bar }) => {
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                loadStudents(key, search);
              }}
              aria-pressed={isActive}
              className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border p-3.5 text-left transition sm:p-4 ${
                isActive ? "border-[#082a63] bg-[#082a63] text-white shadow-md" : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#1b57d8] hover:shadow-sm"
              }`}
            >
              {!isActive && <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden="true" />}
              <p className={`text-[12px] font-bold uppercase tracking-wide sm:text-[12.5px] sm:tracking-wider ${isActive ? "text-[#bcd8fb]" : "text-[#3d5688]"}`}>
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <div className="flex items-end justify-between gap-2">
                <span className="text-[30px] font-extrabold leading-none tracking-tight">{count}</span>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${isActive ? "bg-white/15 text-white" : `bg-[#f4f8fe] ${accent}`}`}>
                  <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1" title="Search by name, roll no, enrollment no or phone">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5688]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStudents()}
            placeholder="Search students…"
            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-10 pr-10 text-[15px] font-medium text-[#082a63] outline-none transition placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-4 focus:ring-[#1b57d8]/15"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                loadStudents(statusFilter, "");
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] items-center gap-3 lg:flex">
          {courses.length > 0 && (
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
            onClick={() => loadStudents()}
            title="Refresh list"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#082a63]/20 border-t-[#082a63]" />
            <p className="text-[15px] font-semibold text-[#3d5688]">Loading candidate records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2fd] text-[#8fb0e6]"><Users className="h-8 w-8" /></span>
            <p className="text-[17px] font-bold text-[#082a63]">{hasFilters ? "No records match your filters" : "No candidate records yet"}</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">
              {hasFilters ? "Try a different search or clear the active filters." : "Students you register under your college will appear here."}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="mt-5 h-11 rounded-xl border border-[#d3e1f5] px-6 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">Clear all filters</button>
            ) : (
              <Link href="/college/dashboard/register" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8]">
                <UserPlus className="h-4 w-4" /> Register the first student
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
                    <th className="whitespace-nowrap px-5 py-3.5">Candidate</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Course</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Roll no.</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Enrollment no.</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Status</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Applied</th>
                    <th className="whitespace-nowrap px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {filtered.map((s) => {
                    const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                    const Icon = st.icon;
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-[#f4f8fe]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d3e1f5] text-[15px] font-extrabold text-[#082a63]">{s.candidate_name?.charAt(0) || "S"}</span>
                            <div className="min-w-0">
                              <p className="font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                              <p className="text-[13.5px] text-[#3d5688]">
                                {s.father_name && <span>F: {s.father_name}</span>}
                                {s.phone && <span className="ml-2 font-mono">{s.phone}</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold leading-snug text-[#082a63]">{s.courses?.course_name || "—"}</p>
                          {s.courses?.duration_label && <p className="text-[13.5px] text-[#3d5688]">{s.courses.duration_label}</p>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {s.roll_no ? <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13.5px] font-bold text-[#1245b8]">{s.roll_no}</span> : <span className="text-[#a9bde0]">—</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          {s.enrollment_no ? <span className="rounded-md bg-[#f4f8fe] px-2 py-0.5 font-mono text-[13.5px] font-semibold text-[#082a63]">{s.enrollment_no}</span> : <span className="text-[#a9bde0]">—</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-bold ${st.color}`}>
                            <Icon className="h-3.5 w-3.5" /> {st.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#3d5688]">{fmtDate(s.created_at)}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <Link
                            href={`/college/dashboard/registrations/${s.id}`}
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] transition hover:border-[#082a63] hover:bg-[#082a63] hover:text-white active:scale-95"
                          >
                            <Eye className="h-4 w-4" /> View
                          </Link>
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
                return (
                  <Link key={s.id} href={`/college/dashboard/registrations/${s.id}`} className="group min-w-0 rounded-xl border border-[#d3e1f5] bg-white p-4 transition hover:border-[#1b57d8] hover:shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d3e1f5] text-[16px] font-extrabold text-[#082a63]">{s.candidate_name?.charAt(0) || "S"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[16px] font-bold leading-snug text-[#082a63]">{s.candidate_name}</p>
                        <p className="break-words text-[13.5px] text-[#3d5688]">
                          {[s.father_name && `F: ${s.father_name}`, s.phone].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#8fb0e6] transition-transform group-hover:translate-x-0.5" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${st.color}`}>
                        <Icon className="h-3.5 w-3.5" /> {st.label}
                      </span>
                      {s.roll_no && <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{s.roll_no}</span>}
                    </div>

                    <div className="mt-2.5 space-y-0.5 text-[13.5px] text-[#3d5688]">
                      {s.courses?.course_name && <p className="break-words font-semibold text-[#082a63]">{s.courses.course_name}</p>}
                      <p>
                        {s.enrollment_no && <span className="mr-3 font-mono">{s.enrollment_no}</span>}
                        Applied {fmtDate(s.created_at)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[#e4edf9] bg-[#f8fbff] px-5 py-3 text-[13.5px] font-semibold text-[#3d5688]">
              Showing {filtered.length} {filtered.length === 1 ? "record" : "records"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
