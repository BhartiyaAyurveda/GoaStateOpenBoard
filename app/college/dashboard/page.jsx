"use client";

import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Eye,
  GraduationCap,
  UserPlus,
  ShieldCheck,
  FileText,
  Bell,
} from "lucide-react";
import { useDashboard, STATUS_LABELS } from "./DashboardContext";

export default function CollegeDashboardOverviewPage() {
  const { college, students, loading, counts, openDetail } = useDashboard();

  const stats = [
    { key: "all", label: "Total students", desc: "Total registered", Icon: Users, tone: "bg-[#082a63]/10 text-[#082a63]", bar: "bg-[#082a63]", href: "/college/dashboard/registrations" },
    { key: "pending", label: "Pending review", desc: "Awaiting review", Icon: Clock, tone: "bg-amber-100 text-amber-700", bar: "bg-amber-500", href: "/college/dashboard/pending" },
    { key: "approved", label: "Approved", desc: "Verified & active", Icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700", bar: "bg-emerald-500", href: "/college/dashboard/enrolled" },
    { key: "rejected", label: "Rejected", desc: "Needs revision", Icon: AlertTriangle, tone: "bg-red-100 text-red-700", bar: "bg-red-500", href: "/college/dashboard/registrations" },
  ];

  const actions = [
    { href: "/college/dashboard/register", Icon: UserPlus, title: "Register student", sub: "Start a new admission" },
    { href: "/college/dashboard/drafts", Icon: FileText, title: "Drafts", sub: "Resume unfinished forms" },
    { href: "/college/dashboard/enrolled", Icon: GraduationCap, title: "Enrolled students", sub: "Approved candidates" },
    { href: "/college/dashboard/notifications", Icon: Bell, title: "Notifications", sub: "Queries from the Board" },
  ];

  const recent = students.slice(0, 5);

  return (
    <div className="min-w-0 space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1b57d8]/35 bg-gradient-to-br from-[#06204f] via-[#082a63] to-[#0b3a85] p-5 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#1b57d8]/15 blur-3xl" />
        <GraduationCap className="pointer-events-none absolute -bottom-6 right-6 hidden h-44 w-44 text-white/[0.05] md:block" aria-hidden="true" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[13.5px] font-semibold text-emerald-300 sm:text-[14.5px]">
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
            <span>Portal active · <span className="hidden sm:inline">Academic session </span>2026–27</span>
          </div>

          <h1 className="break-words text-[26px] font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
            Welcome, <span className="text-[#7fc0f7]">{college?.college_name}</span>
          </h1>
          <p className="max-w-xl text-[14.5px] leading-relaxed text-[#d3e1f5] sm:text-[16px]">
            Manage student admissions, verify candidates, assign roll numbers, and coordinate with the Goa State Open School Board.
          </p>

          <div className="grid grid-cols-1 gap-2.5 pt-2 sm:flex sm:flex-wrap sm:items-center">
            <Link
              href="/college/dashboard/register"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 sm:h-12 text-[15px] font-bold text-[#06204f] shadow-md transition hover:bg-[#e3edfa] active:scale-95"
            >
              <UserPlus className="h-4 w-4" /> New admission
            </Link>
            <Link
              href="/college/dashboard/registrations"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 sm:h-12 bg-white/10 px-5 text-[15px] font-semibold text-white transition hover:bg-white/15 active:scale-95"
            >
              <ClipboardList className="h-4 w-4 text-[#7fc0f7]" /> Manage registrations
            </Link>
            <Link
              href="/college/dashboard/pending"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/30 sm:h-12 bg-amber-400/15 px-5 text-[15px] font-semibold text-amber-100 transition hover:bg-amber-400/25 active:scale-95"
            >
              <Clock className="h-4 w-4" /> Pending review
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[12.5px] font-extrabold text-[#06204f]">{counts.pending}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map(({ key, label, desc, Icon, tone, bar, href }) => (
          <Link
            key={key}
            href={href}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1b57d8] hover:shadow-md sm:p-5"
          >
            <span className={`absolute inset-x-0 top-0 h-1 ${bar}`} aria-hidden="true" />
            <span className="mb-2 block text-[12px] font-bold uppercase tracking-wide text-[#3d5688] sm:text-[13.5px] sm:tracking-wider">{label}</span>
            <div className="flex items-end justify-between gap-2">
              <span className="text-[32px] font-extrabold leading-none tracking-tight text-[#082a63] sm:text-4xl">{counts[key]}</span>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${tone}`}>
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-1 border-t border-[#eaf2fd] pt-2.5 text-[13px] text-[#3d5688] sm:text-[14.5px]">
              <span className="min-w-0 truncate">{desc}</span>
              <ChevronRight className="h-4 w-4 text-[#1b57d8] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-[16px] font-bold text-[#082a63]">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {actions.map(({ href, Icon, title, sub }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-2.5 rounded-2xl border border-[#d3e1f5] bg-white p-3.5 shadow-sm transition hover:border-[#1b57d8]/60 hover:shadow-md sm:flex-row sm:items-start sm:gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3edfa] text-[#1245b8] transition-colors group-hover:bg-[#082a63] group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-bold leading-snug text-[#082a63]">{title}</span>
                <span className="block text-[13.5px] leading-snug text-[#3d5688]">{sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent registrations */}
      <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5 border-b border-[#d3e1f5] bg-[#f8fafc] px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf2fd] text-[#1b57d8]"><GraduationCap className="h-5 w-5" /></span>
            <h2 className="text-[16.5px] font-bold leading-snug text-[#082a63]">Recent registrations</h2>
          </div>
          <Link href="/college/dashboard/registrations" className="shrink-0 rounded-lg border border-[#d3e1f5] px-3.5 py-2 text-[14px] font-bold text-[#1245b8] transition hover:bg-[#f4f8fe]">
            View all ({counts.all})
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#082a63]/20 border-t-[#082a63]" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center sm:py-14">
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2fd] text-[#8fb0e6]"><Users className="h-8 w-8" /></span>
            <p className="text-[16.5px] font-bold text-[#082a63]">No candidate registrations yet</p>
            <p className="mt-1 max-w-sm text-[14.5px] text-[#3d5688]">Students you register will appear here with their review status.</p>
            <Link href="/college/dashboard/register" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8]">
              <UserPlus className="h-4 w-4" /> Register the first student
            </Link>
          </div>
        ) : (
          <>
            {/* table (laptops) */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                  <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Course</th>
                    <th className="px-4 py-3.5">Roll no.</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {recent.map((s) => {
                    const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                    const Icon = st.icon;
                    return (
                      <tr key={s.id} className="transition-colors hover:bg-[#f4f8fe]">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d3e1f5] text-[14px] font-bold text-[#082a63]">{s.candidate_name?.charAt(0) || "S"}</span>
                            <span className="font-bold text-[#082a63]">{s.candidate_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#3d5688]">{s.courses?.course_name || "—"}</td>
                        <td className="px-4 py-3.5">
                          {s.roll_no ? <span className="rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13.5px] font-bold text-[#1245b8]">{s.roll_no}</span> : <span className="text-[#a9bde0]">—</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[13px] font-bold ${st.color}`}>
                            <Icon className="h-3.5 w-3.5" /> {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => openDetail(s)} title="View & manage" aria-label={`View ${s.candidate_name}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:bg-[#eaf2fd] hover:text-[#082a63]">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* cards (phones) */}
            <div className="divide-y divide-[#e4edf9] md:hidden">
              {recent.map((s) => {
                const st = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
                const Icon = st.icon;
                return (
                  <button key={s.id} onClick={() => openDetail(s)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#f4f8fe]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d3e1f5] text-[15px] font-bold text-[#082a63]">{s.candidate_name?.charAt(0) || "S"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-[16px] font-bold text-[#082a63]">{s.candidate_name}</span>
                      <span className="block break-words text-[13.5px] text-[#3d5688]">{[s.courses?.course_name, s.roll_no].filter(Boolean).join(" · ") || "—"}</span>
                      <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12.5px] font-bold ${st.color}`}>
                        <Icon className="h-3.5 w-3.5" /> {st.label}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#8fb0e6]" />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#1b57d8]/20 bg-[#eaf2fd] p-4 text-[14px] text-[#1245b8] sm:text-[14.5px]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1b57d8]" />
        <span className="leading-relaxed">
          Student roll numbers and marksheet records are issued under institutional authority and ratified by the Goa State Open School Board. For compliance and verification updates, contact the council IT cell.
        </span>
      </div>
    </div>
  );
}
