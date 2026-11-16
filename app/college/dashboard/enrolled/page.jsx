"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  RefreshCw,
  UserPlus,
  Award,
  CheckCircle2,
  Hash,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

export default function EnrolledStudentsPage() {
  const {
    enrolled,
    enrolledLoading,
    loadEnrolled,
    enrolledSearch,
    setEnrolledSearch,
    courses,
    openDetail
  } = useDashboard();

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [rollFilter, setRollFilter]         = useState("all");

  const withRollCount    = useMemo(() => enrolled.filter((s) => Boolean(s.roll_no)).length, [enrolled]);
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
        if (s.course_id !== selectedCourse && s.courses?.id !== selectedCourse) {
          return false;
        }
      }
      // Roll status filter
      if (rollFilter === "assigned" && !s.roll_no) return false;
      if (rollFilter === "unassigned" && Boolean(s.roll_no)) return false;

      return true;
    });
  }, [enrolled, enrolledSearch, selectedCourse, rollFilter]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 border border-emerald-300">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Verified Academic Records
            </span>
            <span className="text-[13px] sm:text-[15px] text-[#3d5688] font-semibold">
              Enrolled: {enrolled.length}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#082a63] tracking-tight">
            Enrolled Students Register
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
            Official council-ratified candidates eligible for examination hall tickets, admit cards, and certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admit-card"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] sm:text-[15px] text-[#082a63] hover:text-[#1b57d8] font-semibold bg-white px-3.5 py-2 rounded-xl border border-[#d3e1f5] hover:border-[#1b57d8] shadow-xs transition-all"
          >
            <span>Admit Card Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#1b57d8]" />
          </Link>

          <Link
            href="/college/dashboard/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] active:scale-95 text-white font-bold text-[15px] transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-[#1b57d8]" />
            <span>New Admission</span>
          </Link>
        </div>
      </div>

      {/* ── 3 Metric Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Enrolled */}
        <button
          onClick={() => setRollFilter("all")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            rollFilter === "all"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-[#1b57d8] hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${rollFilter === "all" ? "text-[#5db0f4]" : "text-[#3d5688]"}`}>
              Total Enrolled Students
            </p>
            <p className="text-2xl font-extrabold tracking-tight">{enrolled.length}</p>
            <p className={`text-[13px] ${rollFilter === "all" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Board-approved admissions
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${rollFilter === "all" ? "bg-white/10 text-[#5db0f4]" : "bg-emerald-50 text-emerald-700"}`}>
            <GraduationCap className="w-4 h-4" />
          </div>
        </button>

        {/* Roll Numbers Issued */}
        <button
          onClick={() => setRollFilter(rollFilter === "assigned" ? "all" : "assigned")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            rollFilter === "assigned"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-emerald-400 hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${rollFilter === "assigned" ? "text-[#5db0f4]" : "text-emerald-700"}`}>
              Roll Numbers Issued
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-emerald-600">{withRollCount}</p>
            <p className={`text-[13px] ${rollFilter === "assigned" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Assigned &amp; exam-ready
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${rollFilter === "assigned" ? "bg-white/10 text-[#5db0f4]" : "bg-emerald-50 text-emerald-700"}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </button>

        {/* Roll No Pending */}
        <button
          onClick={() => setRollFilter(rollFilter === "unassigned" ? "all" : "unassigned")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            rollFilter === "unassigned"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-amber-400 hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${rollFilter === "unassigned" ? "text-[#5db0f4]" : "text-amber-700"}`}>
              Awaiting Roll No
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-amber-600">{withoutRollCount}</p>
            <p className={`text-[13px] ${rollFilter === "unassigned" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Requires college assignment
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${rollFilter === "unassigned" ? "bg-white/10 text-[#5db0f4]" : "bg-amber-50 text-amber-700"}`}>
            <Hash className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 w-full">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d5688]" />
            <input
              value={enrolledSearch}
              onChange={(e) => setEnrolledSearch(e.target.value)}
              placeholder="Search by candidate name, enrollment no, roll no…"
              className="w-full pl-10 pr-9 py-2.5 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all font-medium"
            />
            {enrolledSearch && (
              <button
                onClick={() => setEnrolledSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Course Filter Dropdown */}
          {courses?.length > 0 && (
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
            {filtered.length} {filtered.length === 1 ? "student" : "students"} listed
          </span>
          <button
            onClick={loadEnrolled}
            disabled={enrolledLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f4f8fe] border border-[#d3e1f5] hover:border-[#082a63] text-[#082a63] transition-all shadow-xs"
            title="Refresh Enrolled List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${enrolledLoading ? "animate-spin" : ""}`} />
            <span className="font-bold text-[13px] sm:text-[15px]">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Enrolled Table Card ── */}
      <div className="rounded-3xl bg-white border border-[#d3e1f5] shadow-xs overflow-hidden">
        {enrolledLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#082a63]/20 border-t-[#082a63] rounded-full animate-spin" />
            <p className="text-[15px] font-semibold text-[#3d5688]">Loading verified enrolled records…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#3d5688] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f4f8fe] border border-[#d3e1f5] flex items-center justify-center text-[#1245b8]">
              <GraduationCap className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-[#082a63]">No enrolled students found</p>
              <p className="text-[13px] sm:text-[15px] text-[#3d5688] max-w-sm">
                {enrolledSearch || selectedCourse !== "all" || rollFilter !== "all"
                  ? "No matching records found. Try clearing your search or filter options."
                  : "Students will appear here once their admission applications have been approved by the council."}
              </p>
            </div>
            {(enrolledSearch || selectedCourse !== "all" || rollFilter !== "all") && (
              <button
                onClick={() => {
                  setEnrolledSearch("");
                  setSelectedCourse("all");
                  setRollFilter("all");
                }}
                className="text-[13px] sm:text-[15px] font-bold text-[#082a63] underline hover:text-[#1b57d8] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px] sm:text-[15px]">
              <thead className="bg-[#f4f8fe] text-[#082a63] uppercase font-bold tracking-wider border-b border-[#d3e1f5] text-[13px]">
                <tr>
                  <th className="py-3.5 px-5">#</th>
                  <th className="py-3.5 px-6">Candidate Details</th>
                  <th className="py-3.5 px-4">Program Course</th>
                  <th className="py-3.5 px-4">Enrollment Number</th>
                  <th className="py-3.5 px-4">College Roll No</th>
                  <th className="py-3.5 px-4">Academic Session</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d3e1f5]/70">
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#f4f8fe]/60 transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono text-[#3d5688] font-bold">
                      {i + 1}
                    </td>

                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[15px] flex items-center justify-center shrink-0 border border-emerald-300">
                          {s.candidate_name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-[#082a63] text-[15px] leading-snug">
                            {s.candidate_name}
                          </p>
                          <p className="text-[13px] text-[#3d5688] mt-0.5">
                            {s.father_name ? `F: ${s.father_name}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="py-4 px-4 text-[#3d5688] font-semibold">
                      <p className="text-[15px] text-[#082a63] font-semibold">
                        {s.courses?.course_name || "—"}
                      </p>
                      {s.courses?.duration_label && (
                        <p className="text-[13px] text-[#3d5688] mt-0.5">
                          {s.courses.duration_label}
                        </p>
                      )}
                    </td>

                    {/* Enrollment No */}
                    <td className="py-4 px-4 font-mono text-[15px]">
                      {s.enrollment_no ? (
                        <span className="bg-[#f4f8fe] text-[#082a63] px-3 py-1 rounded-md border border-[#d3e1f5] font-bold tracking-wide">
                          {s.enrollment_no}
                        </span>
                      ) : (
                        <span className="text-[#a9bde0] font-normal text-[13px]">—</span>
                      )}
                    </td>

                    {/* Roll No */}
                    <td className="py-4 px-4 font-mono text-[15px]">
                      {s.roll_no ? (
                        <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md border border-emerald-200 font-bold">
                          {s.roll_no}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                          Pending Assignment
                        </span>
                      )}
                    </td>

                    {/* Session */}
                    <td className="py-4 px-4 text-[#3d5688] font-semibold text-[13px] sm:text-[15px]">
                      {s.session_label || s.academic_session || "2026-27"}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enrolled &amp; Verified</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openDetail(s)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f4f8fe] hover:bg-[#082a63] text-[#082a63] hover:text-white border border-[#d3e1f5] hover:border-[#082a63] text-[13px] sm:text-[15px] font-bold transition-all shadow-2xs active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
