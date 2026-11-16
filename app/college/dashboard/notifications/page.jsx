"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  RefreshCw,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ShieldAlert,
  User,
  Filter,
  Search,
  X,
  Sparkles
} from "lucide-react";
import { useDashboard } from "../DashboardContext";

export default function NotificationsPage() {
  const {
    notifications,
    notifLoading,
    loadNotifications,
    students,
    openDetail
  } = useDashboard();

  const [filterTab, setFilterTab] = useState("all"); // "all", "open", "resolved"
  const [search, setSearch]       = useState("");

  const openCount     = useMemo(() => notifications.filter((n) => n.status === "open").length, [notifications]);
  const resolvedCount = useMemo(() => notifications.filter((n) => n.status !== "open").length, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (filterTab === "open" && n.status !== "open") return false;
      if (filterTab === "resolved" && n.status === "open") return false;

      // Search query
      if (search) {
        const q = search.toLowerCase();
        const matchesQuery =
          n.message?.toLowerCase().includes(q) ||
          n.field_name?.toLowerCase().includes(q) ||
          n.student_registrations?.candidate_name?.toLowerCase().includes(q) ||
          n.student_registrations?.enrollment_no?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [notifications, filterTab, search]);

  const handleResolve = (notif) => {
    const studentId = notif.student_registration_id || notif.student_registrations?.id;
    const student = students.find((s) => s.id === studentId);
    if (student) {
      openDetail(student);
    } else if (studentId) {
      openDetail({ id: studentId, candidate_name: notif.student_registrations?.candidate_name, status: "query_raised" });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold uppercase tracking-wider bg-[#082a63] text-[#5db0f4]">
              <MessageSquare className="w-3.5 h-3.5 text-[#1b57d8]" />
              Board Directives &amp; Queries
            </span>
            <span className="text-[13px] sm:text-[15px] text-[#3d5688] font-semibold">
              Total Notices: {notifications.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#082a63] tracking-tight">
            Notifications &amp; Admin Queries
          </h1>
          <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
            Official clarifications and document revision requests dispatched by the Goa Open School Examination Section.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadNotifications}
            disabled={notifLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#d3e1f5] hover:border-[#1b57d8] text-[15px] font-bold text-[#082a63] transition-all shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${notifLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/college/dashboard/pending"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[15px] font-bold transition-all shadow-xs"
          >
            <Clock className="w-4 h-4 text-[#1b57d8]" />
            <span>Pending Desk</span>
          </Link>
        </div>
      </div>

      {/* ── 3 Status Metric Filter Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* All Notices */}
        <button
          onClick={() => setFilterTab("all")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            filterTab === "all"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-[#1b57d8] hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${filterTab === "all" ? "text-[#5db0f4]" : "text-[#3d5688]"}`}>
              All Notifications
            </p>
            <p className="text-2xl font-extrabold tracking-tight">{notifications.length}</p>
            <p className={`text-[13px] ${filterTab === "all" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Board communication log
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${filterTab === "all" ? "bg-white/10 text-[#5db0f4]" : "bg-[#f4f8fe] text-[#082a63]"}`}>
            <Bell className="w-4 h-4" />
          </div>
        </button>

        {/* Action Required */}
        <button
          onClick={() => setFilterTab("open")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            filterTab === "open"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-orange-400 hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className={`text-[13px] font-bold uppercase tracking-wider ${filterTab === "open" ? "text-[#5db0f4]" : "text-orange-700"}`}>
                Action Required
              </p>
              {openCount > 0 && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-orange-600">{openCount}</p>
            <p className={`text-[13px] ${filterTab === "open" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Requires college revision
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${filterTab === "open" ? "bg-white/10 text-[#5db0f4]" : "bg-orange-50 text-orange-700"}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </button>

        {/* Resolved */}
        <button
          onClick={() => setFilterTab("resolved")}
          className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
            filterTab === "resolved"
              ? "bg-[#082a63] text-white border-[#082a63] shadow-sm"
              : "bg-white text-[#082a63] border-[#d3e1f5] hover:border-emerald-400 hover:shadow-xs"
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[13px] font-bold uppercase tracking-wider ${filterTab === "resolved" ? "text-[#5db0f4]" : "text-emerald-700"}`}>
              Resolved &amp; Cleared
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-emerald-600">{resolvedCount}</p>
            <p className={`text-[13px] ${filterTab === "resolved" ? "text-white/70" : "text-[#8a97b3]"}`}>
              Ratified by admin
            </p>
          </div>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${filterTab === "resolved" ? "bg-white/10 text-[#5db0f4]" : "bg-emerald-50 text-emerald-700"}`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d5688]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries by candidate name, field, or directive details…"
            className="w-full pl-10 pr-9 py-2.5 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-[13px] sm:text-[15px] text-[#3d5688] font-semibold shrink-0 hidden sm:inline">
          {filtered.length} {filtered.length === 1 ? "notice" : "notices"}
        </span>
      </div>

      {/* ── Notification List ── */}
      {notifLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[#082a63]/20 border-t-[#082a63] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3d5688]">Checking council directives…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#d3e1f5] shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-[#082a63]">
              {search || filterTab !== "all"
                ? "No matching notifications found"
                : "No active queries or directives"}
            </p>
            <p className="text-[13px] sm:text-[15px] text-[#3d5688] max-w-sm">
              {search || filterTab !== "all"
                ? "Try clearing your search query or switching tabs."
                : "All candidate admissions under your college are verified and in full council compliance."}
            </p>
          </div>
          {(search || filterTab !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setFilterTab("all");
              }}
              className="text-[15px] font-bold text-[#082a63] underline hover:text-[#1b57d8] transition-colors"
            >
              Show all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((notif) => {
            const isOpen = notif.status === "open";
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-3xl border transition-all shadow-xs ${
                  isOpen
                    ? "bg-white border-amber-300 hover:border-amber-400 hover:shadow-sm ring-1 ring-amber-400/20"
                    : "bg-white border-[#d3e1f5] hover:border-emerald-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2.5 min-w-0">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border ${
                          isOpen
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                            Action Required
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Resolved &amp; Approved
                          </>
                        )}
                      </span>

                      {notif.field_name && (
                        <span className="text-[13px] font-bold text-[#082a63] bg-[#f4f8fe] border border-[#d3e1f5] px-2.5 py-0.5 rounded-md capitalize">
                          Field: {notif.field_name.replace(/_/g, " ")}
                        </span>
                      )}

                      <span className="text-[13px] text-[#8a97b3] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#8a97b3]" />
                        {new Date(notif.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Query Comment */}
                    <div className="p-4 rounded-2xl bg-[#f4f8fe] border border-[#d3e1f5] text-[15px] text-[#082a63]">
                      <p className="font-semibold leading-relaxed">
                        "{notif.message}"
                      </p>
                    </div>

                    {/* Student Context Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-[13px] sm:text-[15px] text-[#3d5688] pt-0.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#d3e1f5] text-[#082a63] font-bold text-[13px] flex items-center justify-center shrink-0">
                          {notif.student_registrations?.candidate_name?.charAt(0) || "S"}
                        </div>
                        <span className="font-bold text-[#082a63] text-[15px]">
                          {notif.student_registrations?.candidate_name || "Applicant"}
                        </span>
                      </div>

                      {notif.student_registrations?.enrollment_no && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#082a63] font-semibold text-[13px] sm:text-[15px]">
                            Enr: {notif.student_registrations.enrollment_no}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleResolve(notif)}
                      className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-[15px] font-bold transition-all shadow-xs active:scale-95 ${
                        isOpen
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                          : "bg-[#f4f8fe] hover:bg-[#082a63] text-[#082a63] hover:text-white border border-[#d3e1f5]"
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <span>Resolve &amp; Edit Dossier</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>View Application</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
