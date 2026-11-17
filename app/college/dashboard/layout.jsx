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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#082a63]/20 border-t-[#082a63] rounded-full animate-spin" />
          <p className="text-[15px] font-semibold text-[#3d5688]">Loading Study Centre Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-dashboard className="min-h-screen bg-[#f4f8fe] text-[#082a63] flex flex-col selection:bg-[#1b57d8] selection:text-white">

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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-[#082a63] max-w-lg w-full rounded-3xl shadow-2xl border border-[#d3e1f5] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#d3e1f5] shrink-0 flex items-center justify-between bg-[#f4f8fe]">
              <div>
                <h3 className="text-lg font-bold text-[#082a63]">{selectedStudent.candidate_name}</h3>
                <p className="text-[15px] text-[#3d5688] mt-0.5">{selectedStudent.courses?.course_name || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const st = STATUS_LABELS[selectedStudent.status] || STATUS_LABELS.pending;
                  const Icon = st.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold border ${st.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {st.label}
                    </span>
                  );
                })()}
                <button
                  onClick={closeDetail}
                  className="p-1.5 rounded-full text-[#3d5688] hover:text-[#082a63] hover:bg-[#d3e1f5] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "thin" }}>
              {/* Student info grid */}
              <div className="grid grid-cols-2 gap-3 text-[13px] sm:text-[15px]">
                {[
                  ["Father's Name", selectedStudent.father_name],
                  ["Date of Birth",  selectedStudent.dob],
                  ["Gender",         selectedStudent.gender],
                  ["Phone",          selectedStudent.phone],
                  ["Email",          selectedStudent.email],
                  ["Applied On",     selectedStudent.created_at ? new Date(selectedStudent.created_at).toLocaleDateString("en-IN") : "—"],
                ].map(([label, val]) => (
                  <div key={label} className="bg-[#f4f8fe] rounded-xl px-3.5 py-2.5 border border-[#d3e1f5]">
                    <p className="text-[13px] text-[#3d5688] font-bold uppercase tracking-wider">{label}</p>
                    <p className="font-semibold text-[#082a63] text-[15px] mt-0.5 break-words">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Assign Roll / Enrollment / Session */}
              <div className="bg-[#f4f8fe] rounded-2xl border border-[#d3e1f5] p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#1b57d8]" />
                  <h4 className="text-[15px] font-bold text-[#082a63] uppercase tracking-wider">
                    Academic Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ["Roll No", selectedStudent.roll_no],
                    ["Enrollment No", selectedStudent.enrollment_no],
                    ["Session", selectedStudent.academic_session || selectedStudent.session_label],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="block text-[13px] sm:text-[15px] font-bold text-[#082a63] mb-1.5">{label}</p>
                      <p className="w-full px-3.5 py-2.5 text-[15px] rounded-xl border border-[#d3e1f5] bg-white text-[#082a63] font-mono">{value || "Not allotted yet"}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-[#3d5688]">Roll and enrollment numbers are allotted by the Board and cannot be edited here.</p>
              </div>

              {/* Query Raised */}
              {selectedStudent.status === "query_raised" && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <p className="text-[15px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Admin Queries
                    </p>
                    {studentQueries.filter((q) => q.status === "open").map((q) => (
                      <div key={q.id} className="bg-white rounded-xl px-4 py-3 border border-amber-200">
                        {q.field_name && (
                          <p className="text-[13px] font-bold text-amber-700 uppercase tracking-wide mb-1">
                            {q.field_name.replace(/_/g, " ")}
                          </p>
                        )}
                        <p className="text-[15px] text-amber-950 font-medium">{q.message}</p>
                      </div>
                    ))}
                  </div>

                  {editForm ? (
                    <div className="bg-white rounded-2xl border border-[#d3e1f5] p-4 sm:p-5 space-y-3">
                      <h4 className="text-[15px] font-bold text-[#082a63] uppercase tracking-wider">Edit Application</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ["Candidate Name","candidate_name","text"],
                          ["Father's Name","father_name","text"],
                          ["Mother's Name","mother_name","text"],
                          ["Date of Birth","dob","date"],
                          ["Phone","phone","tel"],
                          ["Email","email","email"],
                          ["Aadhar No","aadhar_no","text"],
                          ["City","city","text"],
                          ["State","state","text"],
                          ["Pincode","pincode","text"],
                          ["Address","address","text"],
                        ].map(([label, key, type]) => (
                          <div key={key} className={key === "address" ? "col-span-2" : ""}>
                            <label className="block text-[13px] sm:text-[15px] font-bold text-[#082a63] mb-1">{label}</label>
                            <input
                              type={type}
                              value={editForm[key] || ""}
                              onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3.5 py-2 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8]"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setEditForm(null)}
                          className="py-2.5 rounded-xl border border-[#d3e1f5] text-[15px] font-bold text-[#3d5688] hover:bg-[#f4f8fe] transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={resubmit}
                          disabled={saving}
                          className="py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[15px] font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          Resubmit to Admin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={startEdit}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[15px] font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" /> Edit &amp; Resubmit Application
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
