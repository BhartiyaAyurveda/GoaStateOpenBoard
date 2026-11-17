"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bell, RefreshCw, CheckCircle2, Clock, AlertCircle, Eye, Search, X, ArrowRight, Pencil } from "lucide-react";
import { useDashboard } from "../DashboardContext";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");

export default function NotificationsPage() {
  const { notifications, notifLoading, loadNotifications, students, openDetail } = useDashboard();

  const [filterTab, setFilterTab] = useState("all"); // "all", "open", "resolved"
  const [search, setSearch] = useState("");

  const openCount = useMemo(() => notifications.filter((n) => n.status === "open").length, [notifications]);
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

  const hasFilters = search || filterTab !== "all";

  const cards = [
    { key: "all", label: "All notifications", short: "All", sub: "Board communication log", count: notifications.length, Icon: Bell, bar: "bg-[#082a63]", tone: "bg-[#eaf2fd] text-[#1245b8]" },
    { key: "open", label: "Action required", short: "Action", sub: "Requires college revision", count: openCount, Icon: AlertCircle, bar: "bg-orange-500", tone: "bg-orange-50 text-orange-700", pulse: openCount > 0 },
    { key: "resolved", label: "Resolved & cleared", short: "Resolved", sub: "Ratified by admin", count: resolvedCount, Icon: CheckCircle2, bar: "bg-emerald-500", tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#082a63] sm:text-[28px]">Notifications &amp; Admin Queries</h1>
          <p className="text-[14.5px] text-[#3d5688] sm:text-[15.5px]">
            {notifications.length} {notifications.length === 1 ? "notice" : "notices"} · clarifications and document revision requests from the Goa State Open School Examination Section.
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2.5 sm:flex sm:shrink-0 sm:items-center">
          <button
            onClick={loadNotifications}
            disabled={notifLoading}
            aria-label="Refresh"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14.5px] font-bold text-[#082a63] shadow-sm transition hover:bg-[#f4f8fe] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${notifLoading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/college/dashboard/pending"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8] active:scale-95"
          >
            <Clock className="h-4 w-4" /> Pending desk
          </Link>
        </div>
      </div>

      {/* Status cards (filters) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {cards.map(({ key, label, short, sub, count, Icon, bar, tone, pulse }) => {
          const isActive = filterTab === key;
          return (
            <button
              key={key}
              onClick={() => setFilterTab(key)}
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
      <div className="flex items-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 shadow-sm">
        <div className="relative min-w-0 flex-1" title="Search by candidate name, field or directive text">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d5688]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications…"
            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-10 pr-10 text-[15px] font-medium text-[#082a63] outline-none transition placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-4 focus:ring-[#1b57d8]/15"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <span className="shrink-0 text-[14.5px] font-semibold text-[#082a63]">
          {filtered.length} <span className="hidden sm:inline">{filtered.length === 1 ? "notice" : "notices"}</span>
        </span>
      </div>

      {/* List */}
      {notifLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white py-20 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#082a63]/20 border-t-[#082a63]" />
          <p className="text-[15px] font-semibold text-[#3d5688]">Checking Board directives…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-[#d3e1f5] bg-white px-4 py-14 text-center shadow-sm sm:py-16">
          <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="text-[17px] font-bold text-[#082a63]">{hasFilters ? "No matching notifications" : "No active queries or directives"}</p>
          <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">
            {hasFilters ? "Try a different search or switch the category." : "All candidate admissions under your college are verified and in full compliance."}
          </p>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterTab("all"); }} className="mt-5 h-11 rounded-xl border border-[#d3e1f5] px-6 text-[14.5px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
              Show all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isOpen = notif.status === "open";
            const name = notif.student_registrations?.candidate_name || "Applicant";
            return (
              <div
                key={notif.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition sm:p-5 ${
                  isOpen ? "border-amber-300 hover:border-amber-400" : "border-[#d3e1f5] hover:border-emerald-300"
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-1 ${isOpen ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />

                <div className="flex flex-col gap-3 pl-2 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
                  <div className="min-w-0 flex-1 space-y-3">
                    {/* badges */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-bold ${
                          isOpen ? "border-amber-300 bg-amber-100 text-amber-800" : "border-emerald-300 bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isOpen ? (
                          <>
                            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-600" /> Action required
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                          </>
                        )}
                      </span>
                      {notif.field_name && (
                        <span className="rounded-md border border-[#d3e1f5] bg-[#f4f8fe] px-2.5 py-0.5 text-[13px] font-bold capitalize text-[#082a63]">
                          {notif.field_name.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[13px] text-[#6b7ea3]">
                        <Clock className="h-3.5 w-3.5" /> {fmtDate(notif.created_at)}
                      </span>
                    </div>

                    {/* message */}
                    <blockquote className="rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-3.5 text-[15px] font-medium leading-relaxed text-[#082a63] sm:p-4">
                      <span className="break-words">&ldquo;{notif.message}&rdquo;</span>
                    </blockquote>

                    {/* student */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[14px] text-[#3d5688]">
                      <span className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d3e1f5] text-[13px] font-bold text-[#082a63]">{name.charAt(0)}</span>
                        <span className="break-words text-[15px] font-bold text-[#082a63]">{name}</span>
                      </span>
                      {notif.student_registrations?.enrollment_no && (
                        <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13px] font-semibold text-[#1245b8]">{notif.student_registrations.enrollment_no}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolve(notif)}
                    className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-[14.5px] font-bold transition active:scale-95 ${
                      isOpen
                        ? "bg-amber-600 text-white shadow-sm hover:bg-amber-700"
                        : "border border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#082a63] hover:bg-[#082a63] hover:text-white"
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <Pencil className="h-4 w-4" /> Resolve &amp; edit <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" /> View application
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
