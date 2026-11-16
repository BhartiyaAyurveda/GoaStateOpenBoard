"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useDashboard, STATUS_LABELS } from "../DashboardContext";

export default function AllRegistrationsPage() {
  const {
    students,
    loading,
    loadStudents,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    counts,
    courses,
    openDetail,
  } = useDashboard();

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
        if (s.course_id !== selectedCourse && s.courses?.id !== selectedCourse) {
          return false;
        }
      }
      return true;
    });
  }, [students, search, selectedCourse]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider bg-[#082a63] text-[#5db0f4]">
              <ClipboardList className="w-3.5 h-3.5 text-[#1b57d8]" />
              Candidates Directory
            </span>
            <span className="text-[13px] sm:text-[15px] text-[#3d5688] font-semibold">
              Total Records: {counts.all}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082a63] tracking-tight">
            All Student Registrations
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
            Track candidate admission forms, assign roll numbers, and review central approval statuses.
          </p>
        </div>

        <Link
          href="/college/dashboard/register"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] active:scale-95 text-white font-bold text-[15px] transition-all shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4 text-[#1b57d8]" />
          <span>New Registration</span>
        </Link>
      </div>

      {/* ── Status Filter Cards / Chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { key: "all",      label: "All Applications", Icon: Users,         count: counts.all,      accent: "text-[#082a63]" },
          { key: "pending",  label: "Pending Review",   Icon: Clock,         count: counts.pending,  accent: "text-amber-700" },
          { key: "approved", label: "Approved Records", Icon: CheckCircle2,  count: counts.approved, accent: "text-emerald-700" },
          { key: "rejected", label: "Rejected / Query", Icon: AlertTriangle, count: counts.rejected, accent: "text-red-700" },
        ].map(({ key, label, Icon, count, accent }) => {
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                loadStudents(key, search);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                isActive
                  ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
                  : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-[#1b57d8] hover:shadow-xs"
              }`}
            >
              <div className="space-y-0.5">
                <p
                  className={`text-[13px] font-bold uppercase tracking-wider ${
                    isActive ? "text-[#5db0f4]" : "text-[#3d5688]"
                  }`}
                >
                  {label}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {count}
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-white/10 text-[#5db0f4]" : `bg-[#f4f8fe] ${accent}`
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d5688]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadStudents()}
              placeholder="Search by candidate name, roll no, enrollment no, phone…"
              className="w-full pl-10 pr-9 py-2.5 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all font-medium"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  loadStudents(statusFilter, "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Course Filter Dropdown */}
          {courses.length > 0 && (
            <div className="relative hidden md:block w-52 shrink-0">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full py-2.5 px-3 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8] font-medium"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Toolbar Right */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto text-[13px] sm:text-[15px] text-[#3d5688]">
          <span className="font-semibold text-[#082a63]">
            {filtered.length} {filtered.length === 1 ? "record" : "records"} found
          </span>
          <button
            onClick={() => loadStudents()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4f8fe] border border-[#d3e1f5] hover:border-[#082a63] text-[#082a63] transition-all shadow-xs"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="font-bold text-[13px] sm:text-[15px]">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="rounded-3xl bg-white border border-[#d3e1f5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#082a63]/20 border-t-[#082a63] rounded-full animate-spin" />
            <p className="text-[15px] font-semibold text-[#3d5688]">Loading candidate records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#3d5688] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f4f8fe] border border-[#d3e1f5] flex items-center justify-center text-[#1245b8]">
              <Users className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#082a63]">No candidate records found</p>
              <p className="text-[13px] sm:text-[15px] text-[#3d5688] max-w-xs">
                {search || selectedCourse !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search criteria or clearing active filters."
                  : "No students have registered under your college yet."}
              </p>
            </div>
            {(search || selectedCourse !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCourse("all");
                  setStatusFilter("all");
                  loadStudents("all", "");
                }}
                className="text-[13px] sm:text-[15px] font-bold text-[#082a63] underline hover:text-[#1b57d8] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-[15px]">
              <colgroup>
                <col className="w-[220px]" />
                <col className="w-[200px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
              </colgroup>
              <thead className="bg-[#f4f8fe] text-[#3d5688] uppercase font-bold tracking-widest border-b border-[#d3e1f5] text-[13px]">
                <tr>
                  <th className="py-3 px-5 whitespace-nowrap">Candidate Details</th>
                  <th className="py-3 px-4 whitespace-nowrap">Course Program</th>
                  <th className="py-3 px-4 whitespace-nowrap">Roll No.</th>
                  <th className="py-3 px-4 whitespace-nowrap">Enrollment No.</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Applied</th>
                  <th className="py-3 px-5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3e1f5]/70">
                {filtered.map((s) => {
                  const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                  const Icon = st.icon;
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#f4f8fe]/60 transition-colors group"
                    >
                      {/* Candidate Column */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#d3e1f5] text-[#082a63] font-extrabold text-[15px] flex items-center justify-center shrink-0 border border-[#d3e1f5] group-hover:border-[#1b57d8] transition-colors">
                            {s.candidate_name?.charAt(0) || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#082a63] text-[15px] leading-snug whitespace-nowrap">
                              {s.candidate_name}
                            </p>
                            <p className="text-[13px] text-[#3d5688] mt-0.5 whitespace-nowrap">
                              {s.father_name && <span>F: {s.father_name}</span>}
                              {s.phone && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span className="font-mono">{s.phone}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <p className="text-[15px] text-[#082a63] font-semibold leading-snug">
                          {s.courses?.course_name || "—"}
                        </p>
                        {s.courses?.duration_label && (
                          <p className="text-[13px] text-[#3d5688] mt-0.5">
                            {s.courses.duration_label}
                          </p>
                        )}
                      </td>

                      {/* Roll No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0b3a85] text-[15px] whitespace-nowrap">
                        {s.roll_no ? (
                          <span className="bg-[#f4f8fe] px-2.5 py-1 rounded-md border border-[#d3e1f5]">
                            {s.roll_no}
                          </span>
                        ) : (
                          <span className="text-[#a9bde0] font-normal">—</span>
                        )}
                      </td>

                      {/* Enrollment No */}
                      <td className="py-3.5 px-4 font-mono text-[#082a63] text-[15px] whitespace-nowrap">
                        {s.enrollment_no ? (
                          <span className="bg-[#f4f8fe] px-2.5 py-1 rounded-md border border-[#d3e1f5] font-semibold">
                            {s.enrollment_no}
                          </span>
                        ) : (
                          <span className="text-[#a9bde0] font-normal">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border ${st.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{st.label}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#3d5688] text-[15px] whitespace-nowrap">
                        {s.created_at ? (
                          new Date(s.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <Link
                          href={`/college/dashboard/registrations/${s.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f4f8fe] hover:bg-[#082a63] text-[#082a63] hover:text-white border border-[#d3e1f5] hover:border-[#082a63] text-[15px] font-bold transition-all shadow-xs active:scale-95"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
