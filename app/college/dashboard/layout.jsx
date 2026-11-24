"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  ClipboardList,
  Clock,
  GraduationCap,
  Bell,
  ExternalLink,
  LogOut,
  Building2,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  Hash,
  FileCheck,
  RefreshCw,
  MessageSquare,
  Pencil,
  FileText
} from "lucide-react";
import { DashboardProvider, useDashboard, STATUS_LABELS } from "./DashboardContext";
import ResetPageZoom from "@/components/ResetPageZoom";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { displaySession } from "@/lib/student-year-utils";

function DashboardLayoutContent({ children }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime]             = useState("");

  const {
    college,
    counts,
    openNotifCount,
    handleLogout,
    toast,
    setToast,
    selectedStudent,
    closeDetail,
    rollInput,
    setRollInput,
    enrollInput,
    setEnrollInput,
    sessionInput,
    setSessionInput,
    saving,
    saveDetails,
    studentQueries,
    editForm,
    setEditForm,
    startEdit,
    resubmit
  } = useDashboard();

  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // the public site's text-size zoom must not carry over into the dashboard
  useEffect(() => {
    try { document.documentElement.style.zoom = ""; } catch {}
  }, []);

  const navItems = [
    {
      href: "/college/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      isActive: pathname === "/college/dashboard",
    },
    {
      href: "/college/dashboard/register",
      label: "Register Student",
      icon: UserPlus,
      isActive: pathname === "/college/dashboard/register",
    },
    {
      href: "/college/dashboard/registrations",
      label: "All Registrations",
      icon: ClipboardList,
      badge: counts.all,
      isActive: pathname === "/college/dashboard/registrations",
    },
    {
      href: "/college/dashboard/pending",
      label: "Pending Approvals",
      icon: Clock,
      badge: counts.pending + counts.submitted,
      badgeColor: "amber",
      isActive: pathname === "/college/dashboard/pending",
    },
    {
      href: "/college/dashboard/enrolled",
      label: "Enrolled Students",
      icon: GraduationCap,
      badge: counts.approved || null,
      badgeColor: "green",
      isActive: pathname === "/college/dashboard/enrolled",
    },
    {
      href: "/college/dashboard/drafts",
      label: "Drafts",
      icon: FileText,
      isActive: pathname === "/college/dashboard/drafts",
    },
    {
      href: "/college/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      badge: openNotifCount || null,
      badgeColor: "red",
      isActive: pathname === "/college/dashboard/notifications",
    },
  ];

  const currentNav = navItems.find((n) => n.isActive) || navItems[0];

  if (!college) {
    return (
      <div className="min-h-screen bg-[#f4f8fe] flex items-center justify-center">
        <ResetPageZoom />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#082a63]/20 border-t-[#082a63] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3d5688]">Loading Study Centre Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-dashboard className="min-h-screen bg-[#f4f8fe] text-[#082a63] flex flex-col selection:bg-[#1b57d8] selection:text-white">
      <ResetPageZoom />

      {/* Floating Toast Notification */}
      {toast.show && (
        <div style={{ zIndex: 9999 }} className="fixed top-5 right-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#06204f] text-white shadow-xl border border-[#1b57d8]/40 animate-in fade-in slide-in-from-top-2">
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-[15px] font-semibold">{toast.message}</span>
          <button onClick={() => setToast({ show: false })} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student detail / query-resolution modal */}
      {(() => {
        const s = selectedStudent;
        const st = s ? STATUS_LABELS[s.status] || STATUS_LABELS.pending : null;
        const StIcon = st?.icon;
        const isQuery = s?.status === "query_raised";
        const openQueries = studentQueries.filter((q) => q.status === "open");
        const fieldCls =
          "h-11 w-full min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";
        const labelCls = "mb-1.5 block text-[13.5px] font-bold text-[#082a63]";
        const setEdit = (key) => (e) => setEditForm((f) => ({ ...f, [key]: e.target.value }));

        const footer = !s ? null : isQuery && editForm ? (
          <>
            <button type="button" onClick={() => setEditForm(null)} disabled={saving}
              className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60">
              Cancel
            </button>
            <button type="button" onClick={resubmit} disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Resubmit to Board
            </button>
          </>
        ) : isQuery ? (
          <>
            <button type="button" onClick={closeDetail}
              className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
              Close
            </button>
            <button type="button" onClick={startEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 text-[15px] font-bold text-white transition hover:bg-amber-700">
              <Pencil className="h-4 w-4" /> Edit &amp; resubmit application
            </button>
          </>
        ) : (
          <button type="button" onClick={closeDetail}
            className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
            Close
          </button>
        );

        return (
          <Modal
            open={!!s}
            onClose={closeDetail}
            busy={saving}
            icon={GraduationCap}
            title={s?.candidate_name || "Application"}
            subtitle={s?.courses?.course_name || ""}
            size="sm:max-w-2xl"
            footer={footer}
          >
            {s && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[13px] font-bold ${st.color}`}>
                    <StIcon className="h-3.5 w-3.5" /> {st.label}
                  </span>
                  {s.created_at && <span className="text-[13.5px] text-[#6b7ea3]">Applied {new Date(s.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>}
                </div>

                {/* Admin queries first: this is what the college has to act on */}
                {isQuery && (
                  <div className="space-y-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="flex items-center gap-2 text-[14.5px] font-bold text-amber-900">
                      <MessageSquare className="h-4 w-4" /> Board queries to resolve ({openQueries.length})
                    </p>
                    {openQueries.length === 0 ? (
                      <p className="text-[14px] text-amber-900/80">Loading the Board&apos;s queries…</p>
                    ) : (
                      openQueries.map((q) => (
                        <div key={q.id} className="rounded-xl border border-amber-200 bg-white px-4 py-3">
                          {q.field_name && <p className="mb-1 text-[12.5px] font-bold uppercase tracking-wide text-amber-700">{q.field_name.replace(/_/g, " ")}</p>}
                          <p className="break-words text-[15px] font-medium text-amber-950">{q.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Edit form */}
                {isQuery && editForm && (
                  <div className="space-y-4 rounded-2xl border border-[#d3e1f5] bg-white p-4">
                    <h4 className="text-[15px] font-bold text-[#082a63]">Edit application</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        ["Candidate name", "candidate_name", "text"],
                        ["Father's name", "father_name", "text"],
                        ["Mother's name", "mother_name", "text"],
                        ["Date of birth", "dob", "date"],
                        ["Phone", "phone", "tel"],
                        ["Email", "email", "email"],
                        ["Aadhaar no.", "aadhar_no", "text"],
                        ["City", "city", "text"],
                        ["State", "state", "text"],
                        ["Pincode", "pincode", "text"],
                      ].map(([label, key, type]) => (
                        <label key={key} className="block min-w-0">
                          <span className={labelCls}>{label}</span>
                          <input type={type} value={editForm[key] || ""} onChange={setEdit(key)} className={fieldCls} />
                        </label>
                      ))}
                      <div>
                        <span className={labelCls}>Gender</span>
                        <Select size="lg" ariaLabel="Gender" placeholder="Select" value={editForm.gender || ""} onChange={(v) => setEditForm((f) => ({ ...f, gender: v }))}
                          options={[{ value: "", label: "Not set" }, ...["Male", "Female", "Other"].map((g) => ({ value: g, label: g }))]} />
                      </div>
                      <div>
                        <span className={labelCls}>Category</span>
                        <Select size="lg" ariaLabel="Category" placeholder="Select" value={editForm.category || ""} onChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
                          options={[{ value: "", label: "Not set" }, ...["General", "OBC", "SC", "ST", "EWS"].map((c) => ({ value: c, label: c }))]} />
                      </div>
                      <label className="block min-w-0 sm:col-span-2">
                        <span className={labelCls}>Address</span>
                        <input type="text" value={editForm.address || ""} onChange={setEdit("address")} className={fieldCls} />
                      </label>
                    </div>
                  </div>
                )}

                {/* Student info */}
                {!editForm && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        ["Father's name", s.father_name],
                        ["Date of birth", s.dob],
                        ["Gender", s.gender],
                        ["Phone", s.phone],
                        ["Email", s.email],
                        ["Course", s.courses?.course_name],
                      ].map(([label, val]) => (
                        <div key={label} className="min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5">
                          <p className="text-[12.5px] font-bold uppercase tracking-wide text-[#6b7ea3]">{label}</p>
                          <p className="mt-0.5 break-words text-[15px] font-semibold text-[#082a63]">{val || "—"}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-[#d3e1f5] bg-[#f4f8fe] p-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-[#1b57d8]" />
                        <h4 className="text-[14.5px] font-bold text-[#082a63]">Academic details</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {[
                          ["Roll no.", s.roll_no],
                          ["Enrollment no.", s.enrollment_no],
                          ["Session", displaySession(s)],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <p className="mb-1 text-[13px] font-bold text-[#3d5688]">{label}</p>
                            <p className="break-words rounded-xl border border-[#d3e1f5] bg-white px-3.5 py-2.5 font-mono text-[14.5px] text-[#082a63]">{value || "Not allotted yet"}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[13px] text-[#3d5688]">Roll and enrollment numbers are allotted by the Board and cannot be edited here.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </Modal>
        );
      })()}

      {/* Main Dashboard Shell */}
      <div className="fixed inset-0 flex overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#06204f] text-white border-r border-[#1b57d8]/20 transition-transform duration-300 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <div className="relative w-10 h-10 shrink-0 rounded-xl bg-[#f4f8fe] p-1 ring-1 ring-[#1b57d8]/50 overflow-hidden shadow-xs">
              <Image src="/images/logo.png" alt="Logo" fill sizes="40px" className="object-contain p-0.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white leading-tight tracking-tight">
                Goa State Open School
              </p>
              <p lang="kok" className="font-devanagari text-[13.5px] font-semibold leading-tight text-[#bcd8fb]">गोंय राज्य मुक्त शाळा</p>
              <p className="text-[13px] text-[#5db0f4] font-semibold tracking-wider uppercase mt-0.5">
                Study Centre Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" style={{ scrollbarWidth: "none" }}>
            <p className="text-[13px] font-bold uppercase tracking-wider text-white/50 px-3 mb-2">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all text-left group ${
                    item.isActive
                      ? "bg-[#1b57d8]/20 text-[#bcd8fb] border border-[#1b57d8]/40 shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        item.isActive ? "text-[#1b57d8]" : "text-white/50 group-hover:text-white/90"
                      }`}
                    />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[13px] font-bold shrink-0 ${
                        item.badgeColor === "red"
                          ? "bg-red-500/25 text-red-200 border border-red-500/40"
                          : item.badgeColor === "amber"
                          ? "bg-amber-500/25 text-amber-200 border border-amber-500/40"
                          : item.badgeColor === "green"
                          ? "bg-emerald-500/25 text-emerald-200 border border-emerald-500/40"
                          : item.isActive
                          ? "bg-[#1b57d8]/35 text-[#bcd8fb]"
                          : "bg-white/15 text-white/70"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Quick Board Links */}
            <div className="pt-5 mt-4 border-t border-white/10">
              <p className="text-[13px] font-bold uppercase tracking-wider text-white/50 px-3 mb-2">
                Board Gateways
              </p>
              {[
                { href: "/result",         label: "Results Portal" },
                { href: "/admit-card",      label: "Admit Card" },
                { href: "/enrollment-card",         label: "Enrollment Card" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-[15px] font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all"
                >
                  <span>{label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1b57d8]" />
                </Link>
              ))}
            </div>
          </nav>

          {/* User College Bottom Card */}
          <div className="border-t border-white/10 p-3 bg-black/20">
            <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1b57d8] text-[#06204f] font-bold text-[15px] flex items-center justify-center shrink-0 shadow-xs">
                  {college.college_name?.charAt(0) || "C"}
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-white leading-tight break-words">
                    {college.college_name}
                  </p>
                  <p className="text-[13px] text-[#5db0f4] font-semibold">
                    Study Centre
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-white/50 hover:text-red-300 hover:bg-red-500/20 transition-all shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* ── MAIN WORKSPACE ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Glass Header */}
          <header className="bg-white/90 backdrop-blur-md border-b border-[#d3e1f5] px-5 sm:px-8 py-3.5 flex items-center justify-between shrink-0 z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-[#f4f8fe] text-[#082a63] border border-[#d3e1f5] hover:bg-[#d3e1f5] transition-colors"
              >
                {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#082a63] tracking-tight">
                  {currentNav.label}
                </h1>
                <p className="text-[13px] sm:text-[15px] text-[#3d5688] font-medium flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#1b57d8]" />
                  <span>{college.college_name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right text-[13px] text-[#3d5688]">
                <span className="font-mono font-bold text-[#082a63] text-[15px]">{currentTime || "—"}</span>
                <span className="text-[13px] font-medium">Server Time (IST)</span>
              </div>
              <Link
                href="/college/dashboard/notifications"
                className="relative p-2.5 rounded-xl bg-[#f4f8fe] border border-[#d3e1f5] text-[#082a63] hover:bg-[#f4f8fe] hover:border-[#1b57d8] transition-all"
              >
                <Bell className="w-4 h-4 text-[#082a63]" />
                {openNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[13px] font-bold flex items-center justify-center animate-pulse">
                    {openNotifCount}
                  </span>
                )}
              </Link>
            </div>
          </header>

          {/* Page Route Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
            {children}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function CollegeDashboardLayout({ children }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
