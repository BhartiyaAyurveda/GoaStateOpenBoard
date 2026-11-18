"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Users,
  Award,
  Building2,
  Activity,
  LogOut,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  Image as ImageIcon,
  Phone,
  Share2,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  Info,
  PowerOff,
  Power,
  WifiOff,
  ClipboardList,
  MessageSquarePlus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ChevronDown,
  GraduationCap,
  KeyRound,
  Pencil,
  Trash2,
  Copy,
  ShieldOff,
  Plus,
  BookOpen as BookOpenIcon,
  Download,
  MapPin,
  Mail as MailIcon,
  User as UserIcon,
} from "lucide-react";

import ContactManager from "@/components/admin/ContactManager";
import SocialLinksManager from "@/components/admin/SocialLinksManager";
import SecretarySignatureManager from "@/components/admin/SecretarySignatureManager";
import ChangePasswordSection from "@/components/admin/ChangePasswordSection";
import InstituteManager from "@/components/admin/InstituteManager";
import InquiriesManager from "@/components/admin/InquiriesManager";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";
import HomeCustomizer from "@/components/admin/HomeCustomizer";
import SyllabusUploader from "@/components/admin/SyllabusUploader";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { useConfirm } from "@/components/ui/ConfirmDialog";

// Labelled input with a leading icon (used by the Register College modal)
function CollegeField({ icon: Icon, label, req, value, onChange, placeholder, type = "text", autoComplete = "off", inputMode, maxLength, action, className = "", inputClassName = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">
        {label}
        {req && <span className="text-red-500"> *</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7fa6]" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            type={type}
            autoComplete={autoComplete}
            inputMode={inputMode}
            maxLength={maxLength}
            className={`w-full rounded-xl border border-[#d3e1f5] bg-white py-2.5 pl-10 pr-3.5 text-[16px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15 ${inputClassName}`}
          />
        </div>
        {action}
      </div>
    </div>
  );
}

const fmtExamDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation tab state — synced with ?tab= URL param
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Maintenance mode state
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // User & System states
  const [adminUser, setAdminUser] = useState({ username: "superadmin", full_name: "Super Admin" });
  const [currentTime, setCurrentTime] = useState({ time: "", date: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Dynamic counts for overview cards
  const [instituteCount, setInstituteCount] = useState(0);

  // Applications tab state
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appFilter, setAppFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [appQuery, setAppQuery] = useState(""); // debounced search that is sent to the server
  const [appPage, setAppPage] = useState(1);
  const [appTotal, setAppTotal] = useState(0); // applications matching the current filter
  const [appCounts, setAppCounts] = useState(null); // per-status counts across ALL applications
  const appReq = useRef(0);
  const APP_PAGE_SIZE = 15;
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetailLoading, setAppDetailLoading] = useState(false);
  const [appQueries, setAppQueries] = useState([]);
  const [queryModal, setQueryModal] = useState(false);
  const [queryField, setQueryField] = useState("general");
  const [queryMsg, setQueryMsg] = useState("");
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Bell dropdown: closes on outside click / Esc
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);
  useEffect(() => {
    if (!bellOpen) return;
    const onDown = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setBellOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [bellOpen]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Sync activeTab → URL so refresh restores the same tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === "overview") params.delete("tab");
    else params.set("tab", activeTab);
    const newUrl = params.toString() ? `?${params}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "colleges") loadColleges();
    if (activeTab === "courses") loadCourses();
    if (activeTab === "exam") { loadExamSessions(); loadExamCenters(); }
    if (activeTab === "inquiries") loadInquiries();
    if (activeTab === "announcements") loadAnnouncements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // applications: debounce the search box, then (re)load whenever tab / filter / page / search changes
  useEffect(() => {
    const t = setTimeout(() => { setAppQuery(appSearch.trim()); setAppPage(1); }, 350);
    return () => clearTimeout(t);
  }, [appSearch]);

  useEffect(() => {
    if (activeTab === "applications") loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, appFilter, appPage, appQuery]);

  useEffect(() => {
    // Verify admin session via API
    fetch("/api/admin/me")
      .then((r) => { if (r.status === 401) { window.location.href = "/board-login"; throw new Error("unauthenticated"); } return r.json(); })
      .then((d) => { if (d.admin) setAdminUser(d.admin); })
      .catch(() => {});

    // Preload counts for the overview
    loadApplications(); loadColleges(); loadCourses(); loadExamSessions(); loadAnnouncements(); loadInquiries();
    fetch("/api/admin/affiliated-institutes").then((r) => r.json()).then((d) => { if (Array.isArray(d.data)) setInstituteCount(d.data.length); }).catch(() => {});

    // Load maintenance settings
    fetch("/api/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setMaintenanceOn(d.settings.maintenance_mode === "true");
          setMaintenanceMsg(d.settings.maintenance_message || "");
          setSettingsLoaded(true);
        }
      })
      .catch(() => {});

    // Set real-time clock
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
      const date = now.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
      setCurrentTime({ time, date });
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.warn("Logout request error:", err);
    } finally {
      // Clear session cookie on client-side as fallback
      document.cookie = "admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/board-login";
    }
  };

  const toggleMaintenance = async () => {
    const newVal = !maintenanceOn;
    setMaintenanceLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_mode", value: String(newVal) }),
      });
      if (res.ok) {
        setMaintenanceOn(newVal);
        showToast(
          newVal ? "Maintenance mode ENABLED — site is now offline for visitors." : "Maintenance mode DISABLED — site is live.",
          newVal ? "error" : "success"
        );
      } else {
        showToast("Failed to update maintenance mode.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
    setMaintenanceLoading(false);
  };

  const saveMaintenanceMessage = async () => {
    try {
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "maintenance_message", value: maintenanceMsg }),
      });
      showToast("Maintenance message saved.");
    } catch {
      showToast("Failed to save message.", "error");
    }
  };

  // ── Colleges Management State ────────────────────────────
  const [colleges, setColleges] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  // Register form
  const [clgName, setClgName] = useState("");
  const [clgUsername, setClgUsername] = useState("");
  const [clgEmail, setClgEmail] = useState("");
  const [clgPhone, setClgPhone] = useState("");
  const [clgCity, setClgCity] = useState("");
  const [clgState, setClgState] = useState("");
  const [clgPassword, setClgPassword] = useState("");
  const [clgSubmitting, setClgSubmitting] = useState(false);
  const [clgFormError, setClgFormError] = useState("");
  const [clgQuery, setClgQuery] = useState("");
  const [clgFilter, setClgFilter] = useState("all"); // all | active | inactive
  const [newCredentials, setNewCredentials] = useState(null); // {college_name, username, password}
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCredPwd, setShowCredPwd] = useState(false); // credentials modal: reveal the password
  // Edit modal
  const [editClg, setEditClg] = useState(null);
  const [editClgName, setEditClgName] = useState("");
  const [editClgCity, setEditClgCity] = useState("");
  const [editClgState, setEditClgState] = useState("");
  const [editClgEmail, setEditClgEmail] = useState("");
  const [editClgPhone, setEditClgPhone] = useState("");
  const [editClgError, setEditClgError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  // Reset password modal
  const [resetClg, setResetClg] = useState(null);
  const [resetPwd, setResetPwd] = useState("");
  const [resetSaving, setResetSaving] = useState(false);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [togglingClgId, setTogglingClgId] = useState(null);
  const [deletingClgId, setDeletingClgId] = useState(null);

  // ── Courses Management State ─────────────────────────────
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseModal, setCourseModal] = useState(false); // add / edit popup
  const [courseEditId, setCourseEditId] = useState(null); // null = adding a new course
  const [courseForm, setCourseForm] = useState({ name: "", hindi: "", duration: "", category: "secondary", custom: "", eligibility: "", about: "" });
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [courseConfirmId, setCourseConfirmId] = useState(null); // inline "delete?" confirmation
  const [courseDeletingId, setCourseDeletingId] = useState(null);

  // Exam Sessions & Centers state
  const [examSessions, setExamSessions] = useState([]);
  const [examCenters, setExamCenters] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [confirm, confirmDialog] = useConfirm();
  const [resetErr, setResetErr] = useState("");
  const [newSession, setNewSession] = useState({ session_name: "", start_date: "", end_date: "" });
  const [sessionSubmitting, setSessionSubmitting] = useState(false);
  const [newCenter, setNewCenter] = useState({ center_name: "", center_code: "", city: "", state: "", address: "" });
  const [centerSubmitting, setCenterSubmitting] = useState(false);
  const [showCenterForm, setShowCenterForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  // the "Add Exam Center" popup: Esc closes it, and the page behind does not scroll while it is open
  useEffect(() => {
    if (!showCenterForm && !showSessionForm) return;
    const onKey = (e) => { if (e.key === "Escape") { setShowCenterForm(false); setShowSessionForm(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showCenterForm, showSessionForm]);
  const [examSubTab, setExamSubTab] = useState("sessions");

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquiryFilter, setInquiryFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryNotes, setInquiryNotes] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("new");
  const [inquirySaving, setInquirySaving] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(false);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const loadColleges = async () => {
    setCollegesLoading(true);
    try {
      const res = await fetch("/api/admin/colleges");
      const data = await res.json();
      if (data.ok) setColleges(data.data || []);
    } catch {}
    setCollegesLoading(false);
  };

  const loadExamSessions = async () => {
    setExamLoading(true);
    try {
      const [sr, cr] = await Promise.all([fetch("/api/admin/exam-sessions"), fetch("/api/admin/exam-centers")]);
      const [sd, cd] = await Promise.all([sr.json(), cr.json()]);
      if (sd.ok) setExamSessions(sd.data || []);
      if (cd.ok) setExamCenters(cd.centers || cd.data || []);
    } catch {}
    setExamLoading(false);
  };

  const loadExamCenters = async () => {}; // loaded together in loadExamSessions

  const addSession = async (e) => {
    e.preventDefault();
    if (!newSession.session_name) return;
    setSessionSubmitting(true);
    try {
      const res = await fetch("/api/admin/exam-sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newSession) });
      const data = await res.json();
      if (data.ok) { setExamSessions(p => [data.data, ...p]); setNewSession({ session_name: "", start_date: "", end_date: "" }); setShowSessionForm(false); showToast("Session added!"); }
      else showToast(data.error || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    setSessionSubmitting(false);
  };

  const toggleSession = async (id, is_active) => {
    const res = await fetch(`/api/admin/exam-sessions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active }) });
    const data = await res.json();
    if (data.ok) setExamSessions(p => p.map(s => s.id === id ? { ...s, is_active } : is_active ? { ...s, is_active: false } : s));
  };

  const deleteSession = async (id) => {
    if (!(await confirm({ title: "Delete exam session?", message: "Roll numbers, admit cards and results linked to this session may stop working.", confirmLabel: "Delete", danger: true }))) return;
    const res = await fetch(`/api/admin/exam-sessions/${id}`, { method: "DELETE" });
    if ((await res.json()).ok) setExamSessions(p => p.filter(s => s.id !== id));
  };

  const addCenter = async (e) => {
    e.preventDefault();
    if (!newCenter.center_name) return;
    setCenterSubmitting(true);
    try {
      const res = await fetch("/api/admin/exam-centers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCenter) });
      const data = await res.json();
      if (data.ok) { setExamCenters(p => [...p, data.center || data.data]); setNewCenter({ center_name: "", center_code: "", city: "", state: "", address: "" }); setShowCenterForm(false); showToast("Center added!"); }
      else showToast(data.error || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    setCenterSubmitting(false);
  };

  const deleteCenter = async (id) => {
    if (!(await confirm({ title: "Delete exam center?", message: "This cannot be undone.", confirmLabel: "Delete", danger: true }))) return;
    const res = await fetch(`/api/admin/exam-centers/${id}`, { method: "DELETE" });
    if ((await res.json()).ok) setExamCenters(p => p.filter(c => c.id !== id));
  };

  const loadInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      const data = await res.json();
      if (data.ok) setInquiries(data.data || []);
    } catch {}
    setInquiriesLoading(false);
  };

  const saveInquiry = async () => {
    if (!selectedInquiry) return;
    setInquirySaving(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: inquiryStatus, admin_notes: inquiryNotes, is_read: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setInquiries(p => p.map(i => i.id === selectedInquiry.id ? data.data : i));
        setSelectedInquiry(null);
        showToast("Inquiry updated!");
      } else showToast(data.error || "Failed", "error");
    } catch { showToast("Network error", "error"); }
    setInquirySaving(false);
  };

  const loadAnnouncements = async () => {
    setAnnLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data.ok) setAnnouncements(data.data || []);
    } catch {}
    setAnnLoading(false);
  };

  const handleRegisterCollege = async (e) => {
    e.preventDefault();
    setClgFormError("");
    if (!clgName || !clgUsername || !clgPassword) { setClgFormError("Name, username, and password are required."); return; }
    if (clgPhone && !/^\d{10}$/.test(clgPhone)) { setClgFormError("Phone number must be exactly 10 digits."); return; }
    setClgSubmitting(true);
    try {
      const res = await fetch("/api/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college_name: clgName, username: clgUsername, password: clgPassword, email: clgEmail, phone: clgPhone, city: clgCity, state: clgState }),
      });
      const data = await res.json();
      if (!res.ok) { setClgFormError(data.error || "Failed to register college"); }
      else {
        setNewCredentials({ college_name: clgName, username: clgUsername, password: clgPassword });
        setClgName(""); setClgUsername(""); setClgPassword(""); setClgEmail(""); setClgPhone(""); setClgCity(""); setClgState("");
        setShowRegisterForm(false);
        loadColleges();
        showToast("College registered successfully!", "success");
      }
    } catch { setClgFormError("Network error"); }
    setClgSubmitting(false);
  };

  const openEditCollege = (clg) => {
    setEditClg(clg);
    setEditClgName(clg.college_name);
    setEditClgEmail(clg.email || "");
    setEditClgCity(clg.city || "");
    setEditClgState(clg.state || "");
    setEditClgPhone(String(clg.phone || "").replace(/\D/g, "").slice(-10)); // drop spaces / +91
    setEditClgError("");
  };
  const openResetCollege = (clg) => { setResetClg(clg); setResetPwd(""); };

  const clgCounts = {
    all: colleges.length,
    active: colleges.filter((c) => c.is_active).length,
    inactive: colleges.filter((c) => !c.is_active).length,
  };
  const visibleColleges = colleges
    .filter((c) => (clgFilter === "all" ? true : clgFilter === "active" ? c.is_active : !c.is_active))
    .filter((c) => {
      const q = clgQuery.trim().toLowerCase();
      return !q || [c.college_name, c.username, c.email, c.phone, c.city, c.state].some((v) => String(v || "").toLowerCase().includes(q));
    });
  const fmtClgDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const toggleCollegeActive = async (college) => {
    setTogglingClgId(college.id);
    try {
      const res = await fetch(`/api/admin/colleges/${college.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !college.is_active }),
      });
      const data = await res.json();
      if (data.ok) {
        setColleges((prev) => prev.map((c) => c.id === college.id ? { ...c, is_active: !college.is_active } : c));
        showToast(`College ${!college.is_active ? "activated" : "deactivated"}`, "success");
      }
    } catch {}
    setTogglingClgId(null);
  };

  const deleteCollege = async (college) => {
    if (!(await confirm({
      title: "Delete college?",
      message: `"${college.college_name}" and its login (${college.username}) will be removed. This cannot be undone. A college that already has student registrations cannot be deleted; deactivate it instead.`,
      confirmLabel: "Delete college",
      danger: true,
    }))) return;
    setDeletingClgId(college.id);
    try {
      const res = await fetch(`/api/admin/colleges/${college.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setColleges((prev) => prev.filter((c) => c.id !== college.id));
        showToast("College deleted", "success");
      } else {
        showToast(data.error || "Could not delete the college.", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
    setDeletingClgId(null);
  };

  const saveEditCollege = async (e) => {
    if (e) e.preventDefault();
    if (!editClg) return;
    setEditClgError("");
    if (!editClgName.trim()) { setEditClgError("College name is required."); return; }
    if (editClgPhone && !/^\d{10}$/.test(editClgPhone)) { setEditClgError("Phone number must be exactly 10 digits."); return; }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/colleges/${editClg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ college_name: editClgName.trim(), email: editClgEmail.trim(), phone: editClgPhone, city: editClgCity.trim(), state: editClgState.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setColleges((prev) => prev.map((c) => c.id === editClg.id ? { ...c, ...data.data } : c));
        setEditClg(null);
        showToast("College updated!", "success");
      } else {
        setEditClgError(data.error || "Could not update the college.");
      }
    } catch {
      setEditClgError("Network error. Please try again.");
    }
    setEditSaving(false);
  };

  const saveResetPassword = async () => {
    if (!resetClg) return;
    const pwd = resetPwd || generatePassword();
    setResetSaving(true);
    setResetErr("");
    try {
      const res = await fetch(`/api/admin/colleges/${resetClg.id}/regenerate-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        setResetCredentials({ college_name: resetClg.college_name, username: resetClg.username, password: data.password });
        setResetClg(null);
        setResetPwd("");
        showToast("Password reset successfully!", "success");
      } else {
        setResetErr(data.error || "Could not reset the password. Try again.");
      }
    } catch {
      setResetErr("Network error. Please try again.");
    }
    setResetSaving(false);
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.ok) setCourses(data.data || []);
    } catch {}
    setCoursesLoading(false);
  };

  const COURSE_CATEGORIES = ["secondary", "senior_secondary"];
  const prettyCategory = (c) => String(c || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  const openNewCourse = () => {
    setCourseEditId(null);
    setCourseForm({ name: "", hindi: "", duration: "", category: "secondary", custom: "", eligibility: "", about: "" });
    setCourseError("");
    setCourseModal(true);
  };

  const openEditCourse = (c) => {
    const cat = c.category || "secondary";
    const known = COURSE_CATEGORIES.includes(cat);
    setCourseEditId(c.id);
    setCourseForm({ name: c.course_name || "", hindi: c.course_name_hindi || "", duration: c.duration_label || "", category: known ? cat : "__custom", custom: known ? "" : cat, eligibility: c.eligibility || "", about: c.career_scope || "" });
    setCourseError("");
    setCourseConfirmId(null);
    setCourseModal(true);
  };

  const saveCourse = async (e) => {
    e?.preventDefault();
    setCourseError("");
    const name = courseForm.name.trim();
    if (!name) { setCourseError("Course name (English) is required."); return; }
    const category = courseForm.category === "__custom" ? courseForm.custom.trim().toLowerCase().replace(/\s+/g, "_") : courseForm.category;
    if (!category) { setCourseError("Please enter the category."); return; }
    const body = { course_name: name, course_name_hindi: courseForm.hindi.trim(), duration_label: courseForm.duration.trim(), category, eligibility: courseForm.eligibility.trim(), career_scope: courseForm.about.trim() };
    setCourseSaving(true);
    try {
      const res = await fetch(courseEditId ? `/api/admin/courses/${courseEditId}` : "/api/admin/courses", {
        method: courseEditId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setCourseModal(false);
        loadCourses();
        showToast(courseEditId ? "Course updated!" : "Course added!", "success");
      } else {
        setCourseError(data.error || "Could not save the course.");
      }
    } catch {
      setCourseError("Network error. Please try again.");
    }
    setCourseSaving(false);
  };

  const deleteCourse = async (id) => {
    setCourseDeletingId(id);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        setCourseConfirmId(null);
        showToast("Course deleted.", "success");
      } else {
        showToast(data.error || "Could not delete the course.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
    setCourseDeletingId(null);
  };

  const loadApplications = async () => {
    const reqId = ++appReq.current; // ignore out-of-order responses
    setAppLoading(true);
    try {
      const params = new URLSearchParams({ page: String(appPage), limit: String(APP_PAGE_SIZE), counts: "1" });
      if (appFilter !== "all") params.set("status", appFilter);
      if (appQuery) params.set("search", appQuery);
      const res = await fetch(`/api/admin/registrations?${params}`);
      const data = await res.json();
      if (reqId !== appReq.current) return;
      if (data.ok) {
        setApplications(data.data || []);
        setAppTotal(data.total || 0);
        if (data.counts) setAppCounts(data.counts);
        // e.g. the last item of the last page was just approved: step back one page
        const pages = Math.max(1, Math.ceil((data.total || 0) / APP_PAGE_SIZE));
        if (appPage > pages) setAppPage(pages);
      }
    } catch {}
    if (reqId === appReq.current) setAppLoading(false);
  };

  const changeAppFilter = (f) => { setAppFilter(f); setAppPage(1); };

  const openAppDetail = async (app) => {
    setSelectedApp(app);
    setAppDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${app.id}`);
      const data = await res.json();
      if (data.ok) {
        setSelectedApp(data.data);
        setAppQueries(data.queries || []);
      }
    } catch {}
    setAppDetailLoading(false);
  };

  const approveApp = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a));
        loadApplications();
        setSelectedApp((prev) => prev ? { ...prev, status: "approved" } : null);
        showToast("Application approved successfully!", "success");
      } else showToast(data.error || "Failed to approve", "error");
    } catch { showToast("Network error", "error"); }
    setActionLoading(false);
  };

  const rejectApp = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a));
        loadApplications();
        setSelectedApp((prev) => prev ? { ...prev, status: "rejected" } : null);
        setRejectModal(false);
        setRejectReason("");
        showToast("Application rejected.", "error");
      } else showToast(data.error || "Failed to reject", "error");
    } catch { showToast("Network error", "error"); }
    setActionLoading(false);
  };

  const raiseQuery = async (id) => {
    if (!queryMsg.trim()) return;
    setQuerySubmitting(true);
    try {
      const res = await fetch(`/api/admin/registrations/${id}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_name: queryField, message: queryMsg }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "query_raised" } : a));
        loadApplications();
        setSelectedApp((prev) => prev ? { ...prev, status: "query_raised" } : null);
        setAppQueries((prev) => [data.query, ...prev]);
        setQueryModal(false);
        setQueryMsg("");
        setQueryField("general");
        showToast("Query raised — college notified!", "success");
      } else showToast(data.error || "Failed to raise query", "error");
    } catch { showToast("Network error", "error"); }
    setQuerySubmitting(false);
  };


  const APP_STATUS = {
    pending:      { label: "Pending",      color: "bg-amber-100 text-amber-800",    dot: "bg-amber-500" },
    submitted:    { label: "Submitted",    color: "bg-blue-100 text-blue-800",      dot: "bg-blue-500" },
    under_review: { label: "Under Review", color: "bg-violet-100 text-violet-800",  dot: "bg-violet-500" },
    query_raised: { label: "Query Raised", color: "bg-orange-100 text-orange-800",  dot: "bg-orange-500" },
    approved:     { label: "Approved",     color: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
    rejected:     { label: "Rejected",     color: "bg-red-100 text-red-800",         dot: "bg-red-500" },
  };

  const appAllTotal = appCounts ? Object.values(appCounts).reduce((x, y) => x + y, 0) : applications.length;
  const appAwaiting = appCounts
    ? (appCounts.pending || 0) + (appCounts.submitted || 0) + (appCounts.under_review || 0)
    : applications.filter((a) => ["pending", "submitted", "under_review"].includes(a.status)).length;
  const appPages = Math.max(1, Math.ceil(appTotal / APP_PAGE_SIZE));
  const appFrom = appTotal ? (appPage - 1) * APP_PAGE_SIZE + 1 : 0;
  const appTo = Math.min(appPage * APP_PAGE_SIZE, appTotal);
  const fmtAppDate = (iso) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

  const navigationItems = [
    { id: "overview",       label: "Overview & Metrics",    icon: LayoutDashboard },
    { id: "applications",   label: "Student Applications",  icon: ClipboardList,  badge: (appCounts ? (appCounts.submitted || 0) + (appCounts.pending || 0) : applications.filter(a => a.status === "submitted" || a.status === "pending").length) || null },
    { id: "colleges",       label: "College Management",    icon: Building2,      badge: colleges.length || null },
    { id: "courses",        label: "Courses & Subjects",    icon: GraduationCap,  badge: courses.length || null },
    { id: "exam",           label: "Exam Management",       icon: BookOpen },
    { id: "announcements",  label: "Announcements",         icon: Bell,           badge: announcements.filter(a => a.is_published).length || null },
    { id: "inquiries",      label: "Contact Inquiries",     icon: MessageSquarePlus, badge: inquiries.filter(i => !i.is_read).length || null, badgeColor: "red" },
    { id: "home",           label: "Home Customization",    icon: Sparkles },
    { id: "maintenance",    label: "Maintenance Mode",      icon: WifiOff,        badge: maintenanceOn ? "ON" : null, badgeColor: "red" },
    { id: "contact",        label: "Contact Info",          icon: Phone },
    { id: "social",         label: "Social Media Links",    icon: Share2 },
    { id: "institutes",     label: "Study Centres", icon: Building2,      badge: instituteCount },
    { id: "password",       label: "Change Password",       icon: KeyRound },
  ];

  const adminName = adminUser.full_name || adminUser.username || "Super Admin";
  const adminInitials = (() => {
    const w = adminName.trim().split(/\s+/).filter(Boolean);
    return (w.length > 1 ? w.slice(-2) : w).map((x) => x[0]).join("").toUpperCase().slice(0, 2) || "SA";
  })();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const hasBadge = item.badge !== undefined && item.badge !== null;
    return (
      <button key={item.id}
        onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[16px] font-semibold transition-all ${
          isActive
            ? "bg-gradient-to-r from-[#1b57d8]/35 to-[#1b57d8]/10 text-white"
            : "text-white/75 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#5db0f4]" aria-hidden="true" />}
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
            isActive ? "bg-[#1b57d8] text-white shadow-sm" : "bg-white/[0.06] text-white/55 group-hover:bg-white/10 group-hover:text-white"
          }`}>
            <Icon className="h-[17px] w-[17px]" />
          </span>
          <span className="truncate">{item.label}</span>
        </span>
        {hasBadge && (
          <span className={`min-w-[1.6rem] shrink-0 rounded-full px-2 py-0.5 text-center text-[13px] font-bold ${
            item.badgeColor === "red"     ? "border border-red-500/30 bg-red-500/20 text-red-300"
            : item.badgeColor === "green" ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
            : isActive                     ? "bg-white/20 text-white"
            :                                "bg-white/10 text-white/60"
          }`}>{item.badge}</span>
        )}
      </button>
    );
  };

  return (
    <div data-dashboard className="min-h-screen bg-[#f0f5fc] text-[#082a63] flex flex-col selection:bg-[#1b57d8] selection:text-white">

      {/* Toast */}
      {toast.show && (
        <div style={{ zIndex: 9999 }} className="fixed top-5 right-5 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#082a63] text-white shadow-2xl border border-[#1b57d8]/40">
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            : toast.type === "error" ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            : <Info className="w-5 h-5 text-[#1b57d8] shrink-0" />}
          <span className="text-[15px] font-semibold">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="text-white/60 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* fixed + inset-0 always fills the visible window (100vh can come out shorter in some browsers/zoom levels) */}
      <div className="fixed inset-0 flex overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-[19rem] flex flex-col
          bg-gradient-to-b from-[#06204f] to-[#041a42] text-white
          shadow-xl lg:shadow-none
          transition-transform duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>

          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-5 min-h-[76px] border-b border-white/10">
            <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden ring-2 ring-[#5db0f4]/40 bg-white/5">
              <Image src="/images/logo.png" alt="Logo" fill sizes="44px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[17px] font-extrabold text-white truncate leading-tight">Goa State Open School</p>
              <p lang="kok" className="font-devanagari truncate text-[13.5px] font-semibold leading-tight text-[#bcd8fb]">गोंय राज्य मुक्त शाळा</p>
              <p className="mt-0.5 text-[13px] font-semibold uppercase tracking-wider text-[#8ec9fa]">Board Admin Console</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav aria-label="Dashboard sections" className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">

            <p className="px-3 pb-2 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/45 pt-0">Management</p>
            {navigationItems.slice(0, 7).map(renderNavItem)}

            <div className="pt-4 mt-3 border-t border-white/10">
              <p className="px-3 pb-2 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/45">Settings</p>
              <div className="space-y-0.5">{navigationItems.slice(7).map(renderNavItem)}</div>
            </div>

            <div className="pt-4 mt-3 border-t border-white/10">
              <p className="px-3 pb-2 text-[12.5px] font-bold uppercase tracking-[0.16em] text-white/45">Quick Links</p>
              {[
                { href: "/contact", label: "Contact Page" },
                { href: "/notices", label: "Notices Page" },
                { href: "/result", label: "Results Portal" },
                { href: "/admit-card", label: "Admit Card" },
                { href: "/super-admin/dashboard/roll-numbers/audit", label: "Roll No. Audit" },
              ].map(({ href, label }) => (
                <Link key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl px-3 py-2 text-[15px] font-medium text-white/65 transition-all hover:bg-white/[0.07] hover:text-white"
                >
                  <span>{label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-[#5db0f4]" />
                </Link>
              ))}
            </div>
          </nav>

          {/* Sidebar Footer — user + logout */}
          <div className="border-t border-white/10 bg-black/10 p-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1b57d8] to-[#5db0f4] text-[13px] font-extrabold text-white">
                {adminInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 break-words text-[14.5px] font-bold leading-tight text-white" title={adminName}>{adminName}</p>
                <p className="mt-0.5 text-[12.5px] font-semibold text-[#8ec9fa]">Master Access</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="shrink-0 rounded-lg p-2 text-white/50 transition-all hover:bg-red-900/30 hover:text-red-300"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden" />
        )}

        {/* ── MAIN AREA ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top bar */}
          <header className="bg-white border-b border-[#d3e1f5] shadow-[0_1px_8px_rgba(8,42,99,0.06)] px-5 sm:px-8 py-0 flex items-stretch justify-between shrink-0 min-h-[76px]">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2.5 rounded-lg bg-[#eaf2fd] text-[#082a63] hover:bg-[#d3e1f5] transition-colors">
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {/* Active tab label with left border accent */}
              <div className="flex items-center gap-3.5 py-4">
                <span className="hidden sm:block w-1 h-10 rounded-full bg-gradient-to-b from-[#1b57d8] to-[#5db0f4]" aria-hidden="true" />
                <div>
                  <h1 className="text-[22px] sm:text-[24px] font-extrabold text-[#082a63] leading-tight tracking-tight">
                    {navigationItems.find(n => n.id === activeTab)?.label || "Dashboard"}
                  </h1>
                  <p className="text-[14px] sm:text-[15px] text-[#4a6090] mt-1 font-medium">
                    <span className="hidden sm:inline">Goa State Open School <span className="mx-1 text-[#9db3d6]">·</span> </span>Board Admin
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {maintenanceOn && (
                <button onClick={() => setActiveTab("maintenance")}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[15px] font-bold hover:bg-red-100 transition-colors">
                  <WifiOff className="w-4 h-4" /> Site Offline
                </button>
              )}
              {/* Clock pill */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#eaf2fd] border border-[#d3e1f5]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="leading-tight">
                  <p className="font-mono font-bold text-[16px] text-[#082a63] tracking-tight">{currentTime.time || "—"}</p>
                  <p className="text-[13.5px] text-[#4a6090] font-medium mt-0.5">{currentTime.date || "Loading…"}</p>
                </div>
              </div>
              {/* Bell */}
              {(() => {
                const pendingApps = appCounts
                  ? (appCounts.pending || 0) + (appCounts.submitted || 0)
                  : applications.filter((a) => a.status === "submitted" || a.status === "pending").length;
                const unreadInquiries = inquiries.filter((i) => !i.is_read).length;
                const bellItems = [
                  pendingApps > 0 && {
                    key: "apps", icon: ClipboardList, tone: "bg-blue-50 text-blue-700",
                    title: `${pendingApps} student application${pendingApps === 1 ? "" : "s"} awaiting review`,
                    sub: "Approve, reject or raise a query", go: () => { changeAppFilter("all"); setActiveTab("applications"); },
                  },
                  unreadInquiries > 0 && {
                    key: "inq", icon: MessageSquarePlus, tone: "bg-orange-50 text-orange-700",
                    title: `${unreadInquiries} unread contact inquir${unreadInquiries === 1 ? "y" : "ies"}`,
                    sub: "Messages from the contact form", go: () => setActiveTab("inquiries"),
                  },
                  maintenanceOn && {
                    key: "maint", icon: WifiOff, tone: "bg-red-50 text-red-600",
                    title: "Site is in maintenance mode",
                    sub: "Visitors currently see the offline page", go: () => setActiveTab("maintenance"),
                  },
                ].filter(Boolean);
                const toggleBell = () => {
                  const next = !bellOpen;
                  setBellOpen(next);
                  if (next) { loadApplications(); loadInquiries(); } // refresh the counts when opened
                };
                return (
                  <div className="relative" ref={bellRef}>
                    <button
                      type="button"
                      onClick={toggleBell}
                      aria-label={bellItems.length ? `Notifications (${bellItems.length} new)` : "Notifications"}
                      aria-haspopup="true"
                      aria-expanded={bellOpen}
                      className={`relative p-3 rounded-xl border border-[#d3e1f5] text-[#3d5688] transition-colors ${bellOpen ? "bg-[#d3e1f5]" : "bg-[#eaf2fd] hover:bg-[#d3e1f5]"}`}
                    >
                      <Bell className="w-5 h-5" />
                      {bellItems.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#1b57d8] ring-2 ring-[#eaf2fd]" />
                      )}
                    </button>
                    {bellOpen && (
                      <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-[340px] max-w-[calc(100vw_-_2.5rem)] overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-[#eaf2fd] px-4 py-3">
                          <p className="text-[15px] font-bold text-[#082a63]">Notifications</p>
                          {bellItems.length > 0 && (
                            <span className="rounded-full bg-[#eaf2fd] px-2 py-0.5 text-[12.5px] font-bold text-[#1245b8]">{bellItems.length} new</span>
                          )}
                        </div>
                        {bellItems.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
                            <p className="text-[15px] font-bold text-[#082a63]">You&apos;re all caught up</p>
                            <p className="mt-0.5 text-[13.5px] text-[#4a6090]">Nothing needs your attention right now.</p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-[#eaf2fd]">
                            {bellItems.map((it) => {
                              const ItemIcon = it.icon;
                              return (
                                <li key={it.key}>
                                  <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => { setBellOpen(false); it.go(); }}
                                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f4f8fe]"
                                  >
                                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${it.tone}`}>
                                      <ItemIcon className="h-[18px] w-[18px]" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-[14.5px] font-semibold leading-snug text-[#082a63]">{it.title}</span>
                                      <span className="block text-[13px] text-[#4a6090]">{it.sub}</span>
                                    </span>
                                    <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#9db3d6]" />
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-7">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (() => {
            const unread = inquiries.filter((i) => !i.is_read).length;
            const activeSession = examSessions.find((s) => s.is_active);
            const alerts = [
              maintenanceOn && { tone: "red", icon: WifiOff, text: "The website is in maintenance mode. Visitors see the offline page.", tab: "maintenance", cta: "Turn off" },
              appAwaiting > 0 && { tone: "amber", icon: Clock, text: `${appAwaiting} student application${appAwaiting === 1 ? "" : "s"} waiting for review.`, tab: "applications", cta: "Review" },
              unread > 0 && { tone: "blue", icon: MessageSquarePlus, text: `${unread} unread contact ${unread === 1 ? "inquiry" : "inquiries"}.`, tab: "inquiries", cta: "Open" },
              !examLoading && !activeSession && { tone: "amber", icon: BookOpen, text: "No active exam session. Roll numbers, admit cards and results need one.", tab: "exam", cta: "Set up" },
            ].filter(Boolean);
            const toneCls = {
              red: "border-red-200 bg-red-50 text-red-800",
              amber: "border-amber-200 bg-amber-50 text-amber-900",
              blue: "border-[#c9daf2] bg-[#eef4fc] text-[#1245b8]",
            };
            const stats = [
              { tab: "applications", label: "Applications", value: appAllTotal, sub: "Total received", icon: ClipboardList, bg: "bg-[#e3edfa]", ic: "text-[#1245b8]", accent: "text-[#1245b8]" },
              { tab: "applications", label: "Awaiting action", value: appAwaiting, sub: "Need review", icon: Clock, bg: "bg-amber-50", ic: "text-amber-700", accent: "text-amber-700" },
              { tab: "colleges", label: "Colleges", value: colleges.length, sub: `${colleges.filter((c) => c.is_active).length} active`, icon: Building2, bg: "bg-[#e3edfa]", ic: "text-[#1245b8]", accent: "text-[#1245b8]" },
              { tab: "courses", label: "Courses", value: courses.length, sub: "Programmes offered", icon: GraduationCap, bg: "bg-emerald-50", ic: "text-emerald-700", accent: "text-emerald-700" },
              { tab: "institutes", label: "Study centres", value: instituteCount ?? "–", sub: "In the directory", icon: MapPin, bg: "bg-violet-50", ic: "text-violet-700", accent: "text-violet-700" },
              { tab: "inquiries", label: "Inquiries", value: inquiries.length, sub: `${unread} unread`, icon: MessageSquarePlus, bg: "bg-rose-50", ic: "text-rose-700", accent: "text-rose-700" },
            ];
            const modules = [
              { tab: "exam", icon: BookOpen, title: "Exam Management", sub: "Sessions, roll numbers, results" },
              { tab: "announcements", icon: Bell, title: "Announcements", sub: "Notices and circulars" },
              { tab: "institutes", icon: MapPin, title: "Study Centres", sub: "Shown on the website" },
              { tab: "home", icon: Sparkles, title: "Home Customization", sub: "Hero, cards and links" },
              { tab: "contact", icon: Phone, title: "Contact Info", sub: "Phone, email and address" },
              { tab: "social", icon: Share2, title: "Social Links", sub: "Footer and contact page" },
              { tab: "maintenance", icon: WifiOff, title: "Maintenance Mode", sub: maintenanceOn ? "Site is offline" : "Site is live" },
              { href: "/", icon: ExternalLink, title: "View Website", sub: "Open the public site" },
            ];
            const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "");
            return (
            <div className="min-w-0 space-y-5">

              {/* Welcome */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#082a63] via-[#0b3a85] to-[#1245b8] text-white shadow-lg">
                <ShieldCheck className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-white/[0.06]" aria-hidden="true" />
                <div className="relative flex flex-col gap-4 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2.5 py-1 text-[14px] font-semibold text-emerald-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> System active
                      </span>
                      {maintenanceOn && (
                        <button onClick={() => setActiveTab("maintenance")} className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-[14px] font-bold text-red-300 transition hover:bg-red-500/30">
                          <WifiOff className="h-3.5 w-3.5" /> Site offline
                        </button>
                      )}
                    </div>
                    <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">Board Admin Hub</h1>
                    <p className="max-w-lg text-[15.5px] leading-relaxed text-white/75">Goa State Open School · Board administration panel</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 md:flex md:shrink-0">
                    <button onClick={() => setActiveTab("applications")} className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-4 text-[15px] font-bold text-[#082a63] shadow-md transition hover:bg-[#e3edfa] sm:px-5">
                      <ClipboardList className="h-5 w-5 shrink-0" strokeWidth={2} /> Applications
                    </button>
                    <button onClick={() => setActiveTab("colleges")} className="inline-flex h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/20 bg-white/10 px-4 text-[15px] font-semibold text-white transition hover:bg-white/15 sm:px-5">
                      <Building2 className="h-5 w-5 shrink-0 text-[#bcd8fb]" strokeWidth={2} /> Colleges
                    </button>
                  </div>
                </div>
              </div>

              {/* Needs attention */}
              {alerts.length > 0 && (
                <div className="space-y-2">
                  {alerts.map((a) => (
                    <div key={a.tab + a.text} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${toneCls[a.tone]}`}>
                      <a.icon className="h-5 w-5 shrink-0" />
                      <p className="min-w-0 flex-1 text-[14.5px] font-semibold leading-snug">{a.text}</p>
                      <button onClick={() => setActiveTab(a.tab)} className="shrink-0 rounded-lg bg-white/80 px-3 py-1.5 text-[13.5px] font-bold text-[#082a63] transition hover:bg-white">{a.cta}</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map(({ tab, label, value, sub, icon: Icon, bg, ic, accent }) => (
                  <button key={label} onClick={() => setActiveTab(tab)}
                    className="group rounded-2xl border border-[#d3e1f5] bg-white p-4 text-left shadow-sm transition hover:border-[#1b57d8]/60 hover:shadow-md">
                    <div className="mb-3 flex items-start justify-between">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} ${ic} transition-transform group-hover:scale-110`}><Icon className="h-4 w-4" /></span>
                      <ChevronRight className="h-4 w-4 text-[#1b57d8]/40 transition group-hover:translate-x-0.5 group-hover:text-[#1b57d8]" />
                    </div>
                    <p className="mb-1 text-[12px] font-bold uppercase leading-tight tracking-wide text-[#4a6090] sm:text-[12.5px] sm:tracking-wider">{label}</p>
                    <p className="text-[30px] font-extrabold leading-none text-[#082a63]">{value}</p>
                    <p className={`mt-1.5 text-[14px] font-medium leading-snug ${accent}`}>{sub}</p>
                  </button>
                ))}
              </div>

              {/* Quick access */}
              <div>
                <h2 className="mb-3 text-[16px] font-bold text-[#082a63]">Quick access</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {modules.map(({ tab, href, icon: Icon, title, sub }) => {
                    const cls = "group flex min-w-0 flex-col items-start gap-2.5 rounded-2xl border border-[#d3e1f5] bg-white p-3.5 text-left shadow-sm transition hover:border-[#1b57d8]/60 hover:shadow-md sm:flex-row sm:gap-3";
                    const body = (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3edfa] text-[#1245b8] transition-colors group-hover:bg-[#082a63] group-hover:text-white"><Icon className="h-5 w-5" /></span>
                        <span className="min-w-0 break-words">
                          <span className="block text-[15px] font-bold leading-tight text-[#082a63]">{title}</span>
                          <span className="block text-[13.5px] leading-snug text-[#3d5688]">{sub}</span>
                        </span>
                      </>
                    );
                    return href ? (
                      <a key={title} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{body}</a>
                    ) : (
                      <button key={title} onClick={() => setActiveTab(tab)} className={cls}>{body}</button>
                    );
                  })}
                </div>
              </div>

              {/* Recent applications */}
              <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#d3e1f5] px-4 py-4 sm:px-5">
                  <div className="min-w-0">
                    <h2 className="text-[17px] font-bold text-[#082a63]">Recent student applications</h2>
                    <p className="text-[14px] text-[#3d5688]">Latest registrations submitted by colleges</p>
                  </div>
                  <button onClick={() => setActiveTab("applications")} className="shrink-0 rounded-lg border border-[#d3e1f5] px-3.5 py-2 text-[14px] font-bold text-[#1245b8] transition hover:bg-[#f4f8fe]">View all</button>
                </div>

                {applications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                    <p className="text-[16px] font-bold text-[#082a63]">No applications yet</p>
                    <p className="mt-1 text-[14px] text-[#4a6090]">Registrations submitted by colleges will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full text-left text-[15px]">
                        <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                          <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                            <th className="px-5 py-3">Candidate</th>
                            <th className="px-4 py-3">Course</th>
                            <th className="px-4 py-3">College</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4edf9] text-[#082a63]">
                          {applications.slice(0, 5).map((a) => {
                            const st = APP_STATUS[a.status] || APP_STATUS.pending;
                            return (
                              <tr key={a.id} className="transition-colors hover:bg-[#f4f8fe]">
                                <td className="px-5 py-3.5 font-bold"><Link href={`/super-admin/dashboard/registrations/${a.id}`} className="hover:text-[#1b57d8] hover:underline">{a.candidate_name}</Link></td>
                                <td className="px-4 py-3.5 text-[#3d5688]">{a.courses?.course_name || "—"}</td>
                                <td className="px-4 py-3.5 text-[#3d5688]">{a.colleges?.college_name || "—"}</td>
                                <td className="whitespace-nowrap px-4 py-3.5 text-[#3d5688]">{fmt(a.created_at) || "—"}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13.5px] font-bold ${st.color}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{st.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="divide-y divide-[#e4edf9] md:hidden">
                      {applications.slice(0, 5).map((a) => {
                        const st = APP_STATUS[a.status] || APP_STATUS.pending;
                        return (
                          <Link key={a.id} href={`/super-admin/dashboard/registrations/${a.id}`} className="block px-4 py-3.5 transition hover:bg-[#f4f8fe]">
                            <div className="flex items-start justify-between gap-3">
                              <p className="min-w-0 break-words text-[16px] font-bold text-[#082a63]">{a.candidate_name}</p>
                              <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12.5px] font-bold ${st.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />{st.label}
                              </span>
                            </div>
                            <p className="mt-0.5 break-words text-[14px] text-[#3d5688]">{[a.courses?.course_name, a.colleges?.college_name].filter(Boolean).join(" · ") || "—"}</p>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

            </div>
            );
          })()}

          {/* TAB: MAINTENANCE MODE */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#d3e1f5] shadow-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${maintenanceOn ? "bg-red-100 text-red-600" : "bg-[#e3edfa] text-[#1245b8]"}`}>
                    <WifiOff className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[19px] sm:text-xl font-serif font-bold text-[#082a63]">Maintenance Mode</h2>
                    <p className="text-[14px] sm:text-[15px] text-[#3d5688]">Take the public website offline for maintenance or updates.</p>
                  </div>
                </div>
              </div>

              {/* Toggle Card */}
              <div className={`p-4 sm:p-6 rounded-2xl border-2 shadow-sm transition-all ${maintenanceOn ? "bg-red-50 border-red-300" : "bg-white border-[#d3e1f5]"}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {maintenanceOn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[15px] font-bold border border-red-200">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          MAINTENANCE MODE: ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[15px] font-bold border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          SITE STATUS: LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[16px] sm:text-[17px] font-semibold text-[#082a63]">
                      {maintenanceOn ? "Website is currently offline for visitors." : "Website is live and accessible to everyone."}
                    </p>
                    <p className="text-[15px] text-[#3d5688]">
                      {maintenanceOn
                        ? "Visitors see the maintenance page. Super Admins who are logged in (like you) can still browse the site."
                        : "Turning ON will redirect all public traffic to the maintenance page."}
                    </p>
                  </div>

                  <button
                    onClick={toggleMaintenance}
                    disabled={maintenanceLoading || !settingsLoaded}
                    className={`flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl font-bold text-[16px] sm:text-[17px] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed shrink-0 ${
                      maintenanceOn
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {maintenanceLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : maintenanceOn ? (
                      <Power className="w-4 h-4" />
                    ) : (
                      <PowerOff className="w-4 h-4" />
                    )}
                    {maintenanceLoading ? "Updating..." : maintenanceOn ? "Turn OFF — Go Live" : "Turn ON — Take Offline"}
                  </button>
                </div>
              </div>

              {/* How visitors see it */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#eaf2fd] border border-[#d3e1f5] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#1245b8] shrink-0 mt-0.5" />
                  <div className="text-[15px] text-[#3d5688] space-y-1">
                    <p className="font-bold text-[#082a63]">You are logged in, so you still see the normal site.</p>
                    <p>
                      Maintenance mode only affects visitors. To see what they see, open the website in a <b>private / incognito window</b>,
                      or use the preview button.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full lg:w-auto">
                  <a href="/maintenance" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[14.5px] font-bold transition-colors">
                    <Eye className="w-4 h-4" /> Preview maintenance page
                  </a>
                  <a href="/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#d3e1f5] hover:bg-[#f4f8fe] text-[#082a63] text-[14.5px] font-bold transition-colors">
                    <ExternalLink className="w-4 h-4" /> Open website
                  </a>
                </div>
              </div>

              {/* Maintenance Message Editor */}
              <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#d3e1f5] shadow-sm space-y-4">
                <div>
                  <h3 className="text-[17px] font-bold text-[#082a63] mb-1">Maintenance Message</h3>
                  <p className="text-[15px] text-[#3d5688]">This message is shown to visitors on the maintenance page.</p>
                </div>
                <textarea
                  value={maintenanceMsg}
                  onChange={(e) => setMaintenanceMsg(e.target.value)}
                  rows={3}
                  placeholder="We are performing scheduled maintenance. Please check back shortly."
                  className="w-full px-4 py-3 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[17px] text-[#082a63] placeholder-[#a9bde0] focus:outline-none focus:ring-2 focus:ring-[#1b57d8] resize-none"
                />
                <button
                  onClick={saveMaintenanceMessage}
                  className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[15px] font-bold transition-all"
                >
                  Save Message
                </button>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[15px] text-amber-800 space-y-1">
                  <p className="font-bold">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                    <li>Super Admins with an active session can still access the site normally.</li>
                    <li>College portal and admin panel remain accessible.</li>
                    <li>API endpoints remain active during maintenance.</li>
                    <li>Changes take effect within ~30 seconds across all visitors.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT INFO MANAGEMENT */}
          {activeTab === "home" && (
            <HomeCustomizer onShowToast={showToast} />
          )}

          {activeTab === "contact" && (
            <ContactManager onShowToast={showToast} />
          )}

          {/* TAB 4: SOCIAL LINKS MANAGEMENT */}
          {activeTab === "social" && (
            <SocialLinksManager onShowToast={showToast} />
          )}

          {/* TAB 5: AFFILIATED INSTITUTES MANAGEMENT */}
          {activeTab === "institutes" && (
            <InstituteManager onShowToast={showToast} />
          )}

          {/* CHANGE PASSWORD (Board login, confirmed with an e-mailed code) */}
          {activeTab === "password" && (
            <ChangePasswordSection username={adminUser.username} fullName={adminUser.full_name} onDone={() => showToast("Password changed", "success")} />
          )}

          {/* ═══ TAB: COLLEGE MANAGEMENT ═══ */}
          {activeTab === "colleges" && (
            <div className="space-y-6">

              {/* Credentials Success Modal */}
              {(newCredentials || resetCredentials) && (() => {
                const cred = newCredentials || resetCredentials;
                const isNew = !!newCredentials;
                const loginUrl = `${window.location.origin}/college-login`;
                const closeCreds = () => { setNewCredentials(null); setResetCredentials(null); setShowCredPwd(false); };
                const textBlock = [
                  "=======================================================",
                  "                     GOA STATE OPEN SCHOOL",
                  "              COLLEGE LOGIN CREDENTIALS",
                  "=======================================================",
                  "",
                  `College Name : ${cred.college_name}`,
                  `Username     : ${cred.username}`,
                  `Password     : ${cred.password}`,
                  `Login page   : ${loginUrl}`,
                  "",
                  `Generated on : ${new Date().toLocaleString("en-IN")}`,
                  "",
                  "Keep this file confidential.",
                  "=======================================================",
                ].join("\n");
                const rows = [
                  { key: "name", label: "College name", val: cred.college_name, Icon: Building2 },
                  { key: "user", label: "Username", val: cred.username, Icon: UserIcon, mono: true },
                  { key: "pwd", label: "Password", val: cred.password, Icon: KeyRound, mono: true, secret: true },
                ];
                return createPortal(
                  <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#06204f]/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                    role="dialog" aria-modal="true" aria-label="College login credentials">
                    <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[#1b57d8]/30 bg-[#f4f8fe] shadow-2xl">
                      {/* Header */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#06204f] via-[#082a63] to-[#0b3a85] px-5 pb-5 pt-6 sm:px-6">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#1b57d8]/20 blur-3xl" />
                        <div className="relative z-10">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3.5">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/20">
                                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                              </div>
                              <div className="min-w-0">
                                <p className="mb-0.5 text-[13px] font-bold uppercase tracking-widest text-[#8ec9fa]">
                                  {isNew ? "College registered" : "Password reset"}
                                </p>
                                <h3 className="text-[21px] font-extrabold leading-tight text-white sm:text-2xl">
                                  {isNew ? "Save these credentials" : "New credentials ready"}
                                </h3>
                              </div>
                            </div>
                            <button onClick={closeCreds} aria-label="Close"
                              className="shrink-0 rounded-xl p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3.5 py-2.5">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                            <p className="text-[14.5px] leading-snug text-white/90">
                              Shown <span className="font-bold text-amber-300">only once</span>. Copy or download them now and share with the college securely.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Credentials */}
                      <div className="space-y-3 px-5 pt-5 sm:px-6">
                        {rows.map(({ key, label, val, Icon, mono, secret }) => (
                          <div key={key} className="flex items-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white px-3.5 py-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf2fd] text-[#1245b8]"><Icon className="h-5 w-5" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="mb-0.5 text-[12px] font-bold uppercase tracking-widest text-[#4a6090]">{label}</p>
                              <p className={`break-all text-[17px] font-bold text-[#082a63] ${mono ? "font-mono" : ""}`}>
                                {secret && !showCredPwd ? "•".repeat(Math.min(String(val).length, 14)) : val}
                              </p>
                            </div>
                            {secret && (
                              <button onClick={() => setShowCredPwd((v) => !v)} aria-label={showCredPwd ? "Hide password" : "Show password"} title={showCredPwd ? "Hide" : "Show"}
                                className="shrink-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-2.5 text-[#3d5688] transition-all hover:border-[#1b57d8] hover:text-[#082a63]">
                                {showCredPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                            <button onClick={() => copyToClipboard(val, key)} aria-label={`Copy ${label}`} title="Copy"
                              className={`shrink-0 rounded-xl border p-2.5 transition-all ${
                                copiedKey === key
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                  : "border-[#d3e1f5] bg-[#f4f8fe] text-[#3d5688] hover:border-[#1b57d8] hover:text-[#082a63]"
                              }`}>
                              {copiedKey === key ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 rounded-xl bg-[#eaf2fd] px-3.5 py-2.5 text-[13.5px] text-[#3d5688]">
                          <ExternalLink className="h-4 w-4 shrink-0 text-[#1245b8]" />
                          <span className="min-w-0 break-all">Login page: <span className="font-semibold text-[#082a63]">{loginUrl}</span></span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          <button onClick={() => copyToClipboard(textBlock, "all")}
                            className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-[15.5px] font-bold transition-all active:scale-[0.98] ${
                              copiedKey === "all"
                                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#1b57d8]"
                            }`}>
                            {copiedKey === "all" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4 text-[#1b57d8]" />}
                            {copiedKey === "all" ? "Copied!" : "Copy all"}
                          </button>
                          <button
                            onClick={() => {
                              const blob = new Blob([textBlock], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${cred.username}_credentials.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-[#d3e1f5] bg-white py-3 text-[15.5px] font-bold text-[#082a63] transition-all hover:border-[#1b57d8] active:scale-[0.98]">
                            <Download className="h-4 w-4 text-[#1b57d8]" /> Download .txt
                          </button>
                        </div>
                        <button onClick={closeCreds}
                          className="w-full rounded-2xl bg-[#082a63] py-3.5 text-[16px] font-bold text-white shadow-sm transition-all hover:bg-[#0b3a85] active:scale-[0.98]">
                          Done — I&apos;ve saved the credentials
                        </button>
                      </div>
                    </div>
                  </div>,
                  document.body,
                );
              })()}

              {/* Page header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#082a63]">Colleges &amp; study centres</h2>
                  <p className="text-[14px] sm:text-[15px] text-[#3d5688]">Register colleges, manage their logins and control who can sign in.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowRegisterForm(true); setClgFormError(""); }}
                    className="order-1 sm:order-2 flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[14px] font-bold whitespace-nowrap transition-colors">
                    <Plus className="w-4 h-4 shrink-0" /> Register New College
                  </button>
                  <button onClick={loadColleges} disabled={collegesLoading} aria-label="Refresh"
                    className="order-2 sm:order-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-3 sm:py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[14px] font-bold transition-colors disabled:opacity-60">
                    <RefreshCw className={`w-4 h-4 ${collegesLoading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Stats (click to filter) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { key: "all", label: "Total", value: clgCounts.all, Icon: Building2, tone: "bg-[#e3edfa] text-[#1245b8]" },
                  { key: "active", label: "Active", value: clgCounts.active, Icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
                  { key: "inactive", label: "Inactive", value: clgCounts.inactive, Icon: ShieldOff, tone: "bg-red-100 text-red-600" },
                ].map(({ key, label, value, Icon, tone }) => (
                  <button key={key} onClick={() => setClgFilter(key)}
                    className={`flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition hover:shadow-md sm:px-4 sm:py-3 ${clgFilter === key ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5]"}`}>
                    <span className={`hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-extrabold leading-none text-[#082a63]">{value}</span>
                      <span className="mt-1 block text-[10.5px] sm:text-[12px] font-bold uppercase tracking-normal sm:tracking-wider text-[#4a6090]">{label}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Search + filter */}
              <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6090]" />
                  <input value={clgQuery} onChange={(e) => setClgQuery(e.target.value)} placeholder="Search by name, username, city, email or phone…"
                    className="h-10 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-9 pr-3 text-[14px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                </div>
                <Select value={clgFilter} onChange={setClgFilter} ariaLabel="Filter by status" className="sm:w-48"
                  options={[{ value: "all", label: "All statuses" }, { value: "active", label: "Active only" }, { value: "inactive", label: "Inactive only" }]} />
              </div>

              {/* Colleges list */}
              <div className="bg-white rounded-2xl border border-[#d3e1f5] shadow-sm overflow-hidden">
                {/* Register college modal */}
                <Modal
                  open={showRegisterForm}
                  onClose={() => setShowRegisterForm(false)}
                  busy={clgSubmitting}
                  title="Register new college"
                  subtitle="Create a login for a study centre or affiliated college."
                  icon={Building2}
                  size="sm:max-w-2xl"
                  onSubmit={handleRegisterCollege}
                  footer={
                    <>
                      <button type="button" onClick={() => setShowRegisterForm(false)} disabled={clgSubmitting}
                        className="px-5 py-3 sm:py-2.5 rounded-xl bg-white border border-[#d3e1f5] text-[#3d5688] hover:bg-[#f4f8fe] text-[15px] font-bold transition-colors disabled:opacity-60">
                        Cancel
                      </button>
                      <button type="submit" disabled={clgSubmitting}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[15px] font-bold transition-all disabled:opacity-60">
                        {clgSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {clgSubmitting ? "Registering…" : "Register college"}
                      </button>
                    </>
                  }
                >
                  {clgFormError && (
                    <div role="alert" className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[15px]">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{clgFormError}</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    <section>
                      <h4 className="mb-3 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]"><Building2 className="w-4 h-4" /> College details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CollegeField className="sm:col-span-2" icon={Building2} label="College name" req value={clgName} onChange={setClgName} placeholder="Full college name" />
                        <CollegeField icon={MapPin} label="City" value={clgCity} onChange={setClgCity} placeholder="City" />
                        <CollegeField icon={MapPin} label="State" value={clgState} onChange={setClgState} placeholder="State" />
                      </div>
                    </section>

                    <section>
                      <h4 className="mb-3 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]"><Phone className="w-4 h-4" /> Contact</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CollegeField icon={MailIcon} label="Email" type="email" value={clgEmail} onChange={setClgEmail} placeholder="college@email.com" />
                        <CollegeField icon={Phone} label="Phone" type="tel" inputMode="numeric" maxLength={10} value={clgPhone} onChange={(v) => setClgPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" />
                      </div>
                    </section>

                    <section className="rounded-2xl border border-[#d3e1f5] bg-[#f4f8fe] p-4 sm:p-5">
                      <h4 className="mb-3 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]"><KeyRound className="w-4 h-4" /> Login credentials</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CollegeField icon={UserIcon} label="Username" req value={clgUsername} onChange={setClgUsername} placeholder="Login username" />
                        <CollegeField icon={KeyRound} label="Password" req value={clgPassword} onChange={setClgPassword} placeholder="Min 8 characters" autoComplete="new-password"
                          action={
                            <button type="button" onClick={() => setClgPassword(generatePassword())} title="Generate a strong password"
                              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 rounded-xl bg-white border border-[#b9cbe6] text-[#1245b8] hover:bg-[#eaf2fd] transition-colors text-[14px] font-bold">
                              <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Generate</span>
                            </button>
                          }
                        />
                      </div>
                      <p className="mt-3 text-[13px] text-[#4a6090]">Share the username and password with the college. The password is shown once after registering.</p>
                    </section>
                  </div>
                </Modal>

                {/* Colleges Table */}
                {collegesLoading ? (
                  <div className="p-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1b57d8]" /></div>
                ) : colleges.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="w-10 h-10 mx-auto text-[#d3e1f5] mb-3" />
                    <p className="text-[#3d5688] text-[17px] font-medium">No colleges registered yet.</p>
                    <p className="text-[#4a6090] text-[15px] mt-1">Click "Register New College" above to add one.</p>
                  </div>
                ) : visibleColleges.length === 0 ? (
                  <div className="p-12 text-center">
                    <Search className="w-9 h-9 mx-auto text-[#a9bde0] mb-3" />
                    <p className="text-[#082a63] text-[16px] font-bold">No colleges match your filters</p>
                    <p className="text-[#4a6090] text-[14px] mt-1">Try clearing the search or choosing &quot;All statuses&quot;.</p>
                  </div>
                ) : (
                  <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-[15px] text-left">
                      <thead className="bg-[#f4f8fe] border-b border-[#d3e1f5]">
                        <tr>
                          <th className="w-[34%] min-w-[260px] py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">College</th>
                          <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Username</th>
                          <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Contact</th>
                          <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Registered</th>
                          <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Status</th>
                          <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaf2fd]">
                        {visibleColleges.map((clg) => (
                          <tr key={clg.id} className="hover:bg-[#f7faff] transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082a63] text-[16px] font-extrabold text-white">
                                  {(clg.college_name || "?").trim().charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-bold text-[#082a63] leading-tight">{clg.college_name}</p>
                                  {clg.city && (
                                    <p className="mt-1 flex items-start gap-1.5 text-[#3d5688] text-[14px] leading-snug">
                                      <MapPin className="mt-[3px] h-3.5 w-3.5 shrink-0" /> <span>{clg.city}{clg.state ? `, ${clg.state}` : ""}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="inline-block whitespace-nowrap rounded-lg bg-[#eaf2fd] px-2.5 py-1 font-mono text-[14px] font-semibold text-[#082a63]">{clg.username}</span>
                            </td>
                            <td className="py-4 px-5 space-y-1.5">
                              {clg.email && <p className="flex items-center gap-2 whitespace-nowrap text-[#3d5688]"><MailIcon className="h-4 w-4 shrink-0 text-[#6b7fa6]" /> {clg.email}</p>}
                              {clg.phone && <p className="flex items-center gap-2 whitespace-nowrap text-[#3d5688]"><Phone className="h-4 w-4 shrink-0 text-[#6b7fa6]" /> {clg.phone}</p>}
                              {!clg.email && !clg.phone && <span className="text-[#a9bde0]">—</span>}
                            </td>
                            <td className="py-4 px-5 whitespace-nowrap text-[14.5px] text-[#4a6090]">{fmtClgDate(clg.created_at)}</td>
                            <td className="py-4 px-5">
                              <button onClick={() => toggleCollegeActive(clg)} disabled={togglingClgId === clg.id} title="Click to change status"
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 rounded-full text-[14px] font-bold transition-all ${clg.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                                {togglingClgId === clg.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : clg.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                {clg.is_active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="whitespace-nowrap py-4 px-5">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => openEditCollege(clg)}
                                  className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d3e1f5] bg-white px-3 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe] transition-colors">
                                  <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => openResetCollege(clg)}
                                  className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#d3e1f5] bg-white px-3 text-[14px] font-bold text-[#082a63] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 transition-colors">
                                  <KeyRound className="w-3.5 h-3.5" /> Reset password
                                </button>
                                <button onClick={() => deleteCollege(clg)} disabled={deletingClgId === clg.id} aria-label={`Delete ${clg.college_name}`} title="Delete college"
                                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d3e1f5] bg-white text-[#3d5688] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-60">
                                  {deletingClgId === clg.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="divide-y divide-[#eaf2fd] lg:hidden">
                    {visibleColleges.map((clg) => (
                      <div key={clg.id} className="min-w-0 space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-[17px] font-bold leading-snug text-[#082a63]">{clg.college_name}</p>
                            {clg.city && (
                              <p className="mt-0.5 flex items-center gap-1 text-[14px] text-[#3d5688]">
                                <MapPin className="h-3.5 w-3.5 shrink-0" /> {clg.city}{clg.state ? `, ${clg.state}` : ""}
                              </p>
                            )}
                          </div>
                          <button onClick={() => toggleCollegeActive(clg)} disabled={togglingClgId === clg.id}
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[14px] font-bold transition-all ${clg.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"}`}>
                            {togglingClgId === clg.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : clg.is_active ? <CheckCircle2 className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                            {clg.is_active ? "Active" : "Inactive"}
                          </button>
                        </div>

                        <div className="space-y-1.5 text-[14.5px] text-[#3d5688]">
                          <div className="flex items-center gap-2"><UserIcon className="h-4 w-4 shrink-0 text-[#6b7fa6]" /> <span className="break-all font-mono">{clg.username}</span></div>
                          {clg.email && <div className="flex items-center gap-2"><MailIcon className="h-4 w-4 shrink-0 text-[#6b7fa6]" /> <span className="break-all">{clg.email}</span></div>}
                          {clg.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-[#6b7fa6]" /> <span>{clg.phone}</span></div>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => openEditCollege(clg)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button onClick={() => openResetCollege(clg)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800">
                            <KeyRound className="h-4 w-4" /> Reset password
                          </button>
                          <button onClick={() => deleteCollege(clg)} disabled={deletingClgId === clg.id}
                            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-[14px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-60">
                            {deletingClgId === clg.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete college
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Edit College Modal */}
          <Modal
            open={!!editClg}
            onClose={() => setEditClg(null)}
            busy={editSaving}
            title="Edit college"
            subtitle={editClg ? editClg.college_name : ""}
            icon={Pencil}
            size="sm:max-w-2xl"
            onSubmit={saveEditCollege}
            footer={
              <>
                <button type="button" onClick={() => setEditClg(null)} disabled={editSaving}
                  className="px-5 py-3 sm:py-2.5 rounded-xl bg-white border border-[#d3e1f5] text-[#3d5688] hover:bg-[#f4f8fe] text-[15px] font-bold transition-colors disabled:opacity-60">
                  Cancel
                </button>
                <button type="submit" disabled={editSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[15px] font-bold transition-all disabled:opacity-60">
                  {editSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {editSaving ? "Saving…" : "Save changes"}
                </button>
              </>
            }
          >
            {editClg && (
              <>
                {editClgError && (
                  <div role="alert" className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[15px]">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{editClgError}</span>
                  </div>
                )}

                <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-[#eaf2fd] px-3.5 py-2.5 text-[14px] text-[#3d5688]">
                  <UserIcon className="h-4 w-4 shrink-0 text-[#1245b8]" />
                  <span>Username</span>
                  <span className="rounded-md bg-white px-2 py-0.5 font-mono font-bold text-[#082a63]">{editClg.username}</span>
                  <span className="text-[#6b7fa6]">· cannot be changed</span>
                </div>

                <div className="space-y-6">
                  <section>
                    <h4 className="mb-3 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]"><Building2 className="w-4 h-4" /> College details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CollegeField className="sm:col-span-2" icon={Building2} label="College name" req value={editClgName} onChange={setEditClgName} placeholder="Full college name" />
                      <CollegeField icon={MapPin} label="City" value={editClgCity} onChange={setEditClgCity} placeholder="City" />
                      <CollegeField icon={MapPin} label="State" value={editClgState} onChange={setEditClgState} placeholder="State" />
                    </div>
                  </section>

                  <section>
                    <h4 className="mb-3 flex items-center gap-2 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]"><Phone className="w-4 h-4" /> Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CollegeField icon={MailIcon} label="Email" type="email" value={editClgEmail} onChange={setEditClgEmail} placeholder="college@email.com" />
                      <CollegeField icon={Phone} label="Phone" type="tel" inputMode="numeric" maxLength={10} value={editClgPhone} onChange={(v) => setEditClgPhone(v.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile number" />
                    </div>
                  </section>
                </div>
              </>
            )}
          </Modal>

          {/* Reset Password Modal */}
          <Modal
            open={!!resetClg}
            onClose={() => { setResetClg(null); setResetErr(""); }}
            busy={resetSaving}
            icon={KeyRound}
            title="Reset Password"
            subtitle={resetClg?.college_name}
            size="sm:max-w-md"
            onSubmit={(e) => { e.preventDefault(); saveResetPassword(); }}
            footer={
              <>
                <button type="button" onClick={() => { setResetClg(null); setResetErr(""); }} disabled={resetSaving}
                  className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60">
                  Cancel
                </button>
                <button type="submit" disabled={resetSaving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 text-[15px] font-bold text-white transition hover:bg-amber-600 disabled:opacity-60">
                  <KeyRound className="h-4 w-4" /> {resetSaving ? "Resetting…" : "Reset Password"}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-amber-900">
                The college's current password stops working immediately. You will see the new password once, so copy it and share it with the college.
              </p>
              {resetErr && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[14px] font-semibold text-red-700">{resetErr}</p>}
              <label className="block">
                <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">New password</span>
                <div className="flex gap-2">
                  <input value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} placeholder="Leave blank to auto-generate" autoComplete="off"
                    className="h-11 min-w-0 flex-1 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                  <button type="button" onClick={() => setResetPwd(generatePassword())}
                    className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-[#eaf2fd] px-4 text-[14px] font-bold text-[#082a63] hover:bg-[#d3e1f5]">
                    <Sparkles className="h-4 w-4" /> Auto
                  </button>
                </div>
              </label>
            </div>
          </Modal>

          {confirmDialog}

          {/* ═══ TAB: COURSES & SUBJECTS ═══ */}
          {activeTab === "courses" && (() => {
            const totalSubjects = courses.reduce((n, c) => n + (c.subjects?.length || 0), 0);
            const categories = new Set(courses.map((c) => c.category).filter(Boolean)).size;
            const catChip = (c) =>
              c === "secondary" ? "bg-blue-50 text-blue-800 border-blue-200"
              : c === "senior_secondary" ? "bg-violet-50 text-violet-800 border-violet-200"
              : "bg-slate-100 text-slate-700 border-slate-200";
            return (
            <div className="min-w-0 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#082a63]">Courses &amp; Subjects</h2>
                  <p className="text-[14px] sm:text-[15px] text-[#3d5688]">Manage the programmes offered by Goa State Open School.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={openNewCourse}
                    className="order-1 sm:order-2 flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[14px] font-bold whitespace-nowrap transition-colors">
                    <Plus className="w-4 h-4 shrink-0" /> Add Course
                  </button>
                  <button onClick={loadCourses} disabled={coursesLoading} aria-label="Refresh"
                    className="order-2 sm:order-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-3 sm:py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] text-white text-[14px] font-bold transition-colors disabled:opacity-60">
                    <RefreshCw className={`w-4 h-4 ${coursesLoading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { label: "Courses", value: courses.length, Icon: GraduationCap, tone: "bg-[#e3edfa] text-[#1245b8]" },
                  { label: "Subjects", value: totalSubjects, Icon: BookOpen, tone: "bg-emerald-100 text-emerald-700" },
                  { label: "Categories", value: categories, Icon: ClipboardList, tone: "bg-violet-100 text-violet-700" },
                ].map(({ label, value, Icon, tone }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:p-4">
                    <span className={`hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-extrabold leading-none text-[#082a63]">{value}</span>
                      <span className="mt-1 block text-[10.5px] sm:text-[12px] font-bold uppercase tracking-normal sm:tracking-wider text-[#4a6090]">{label}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Syllabus PDF (upload / replace) */}
              <SyllabusUploader onShowToast={showToast} />

              {/* Add / edit popup */}
              <Modal
                open={courseModal}
                onClose={() => setCourseModal(false)}
                busy={courseSaving}
                title={courseEditId ? "Edit course" : "Add new course"}
                subtitle={courseEditId ? "Update the programme details." : "Create a programme that students can register for."}
                icon={courseEditId ? Pencil : GraduationCap}
                size="sm:max-w-xl"
                onSubmit={saveCourse}
                footer={
                  <>
                    <button type="button" onClick={() => setCourseModal(false)} disabled={courseSaving}
                      className="px-5 py-3 sm:py-2.5 rounded-xl bg-white border border-[#d3e1f5] text-[#3d5688] hover:bg-[#f4f8fe] text-[15px] font-bold transition-colors disabled:opacity-60">
                      Cancel
                    </button>
                    <button type="submit" disabled={courseSaving}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] text-white text-[15px] font-bold transition-all disabled:opacity-60">
                      {courseSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : courseEditId ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {courseSaving ? "Saving…" : courseEditId ? "Save changes" : "Add course"}
                    </button>
                  </>
                }
              >
                {courseError && (
                  <div role="alert" className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[15px]">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{courseError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CollegeField className="sm:col-span-2" icon={GraduationCap} label="Course name (English)" req value={courseForm.name}
                    onChange={(v) => setCourseForm((f) => ({ ...f, name: v }))} placeholder="e.g. Secondary Programme (Class X)" maxLength={120} />
                  <CollegeField className="sm:col-span-2" icon={GraduationCap} label="Course name (Konkani)" value={courseForm.hindi}
                    onChange={(v) => setCourseForm((f) => ({ ...f, hindi: v }))} placeholder="Optional" maxLength={120} inputClassName="font-devanagari" />
                  <CollegeField icon={Clock} label="Duration" value={courseForm.duration}
                    onChange={(v) => setCourseForm((f) => ({ ...f, duration: v }))} placeholder="e.g. 1 Year" maxLength={40} />
                  <div className="min-w-0">
                    <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Category</label>
                    <Select value={courseForm.category} onChange={(v) => setCourseForm((f) => ({ ...f, category: v }))} ariaLabel="Category"
                      className="[&>button]:h-11 [&>button]:text-[16px]"
                      options={[{ value: "secondary", label: "Secondary" }, { value: "senior_secondary", label: "Senior Secondary" }, { value: "__custom", label: "Other…" }]} />
                  </div>
                  {courseForm.category === "__custom" && (
                    <CollegeField className="sm:col-span-2" icon={ClipboardList} label="Category name" req value={courseForm.custom}
                      onChange={(v) => setCourseForm((f) => ({ ...f, custom: v }))} placeholder="e.g. Vocational" maxLength={40} />
                  )}
                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Eligibility <span className="font-medium text-[#8a9bbd]">(shown on the website)</span></label>
                    <textarea value={courseForm.eligibility} rows={2} maxLength={400}
                      onChange={(e) => setCourseForm((f) => ({ ...f, eligibility: e.target.value }))}
                      placeholder="e.g. Passed Class VIII at least two years earlier; minimum age 14 years"
                      className="w-full resize-y rounded-xl border border-[#d3e1f5] bg-white px-3.5 py-2.5 text-[16px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15" />
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">About this course <span className="font-medium text-[#8a9bbd]">(shown on the website)</span></label>
                    <textarea value={courseForm.about} rows={3} maxLength={600}
                      onChange={(e) => setCourseForm((f) => ({ ...f, about: e.target.value }))}
                      placeholder="A short description for visitors"
                      className="w-full resize-y rounded-xl border border-[#d3e1f5] bg-white px-3.5 py-2.5 text-[16px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15" />
                  </div>
                </div>
                {courseEditId && (
                  <p className="mt-4 rounded-xl bg-[#eaf2fd] px-3.5 py-2.5 text-[13.5px] text-[#3d5688]">
                    Courses appear on the homepage and the Courses page. Subjects and exam sessions follow the course when you rename it; manage subjects in <b>Exam Management</b>.
                  </p>
                )}
              </Modal>

              {/* Courses list */}
              {coursesLoading && courses.length === 0 ? (
                <div className="p-12 text-center"><RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#1b57d8]" /></div>
              ) : courses.length === 0 ? (
                <div className="rounded-2xl border border-[#d3e1f5] bg-white px-5 py-14 text-center">
                  <GraduationCap className="mx-auto h-10 w-10 text-[#a9bde0]" />
                  <p className="mt-3 text-[16px] font-bold text-[#082a63]">No courses yet</p>
                  <p className="mt-1 text-[14px] text-[#4a6090]">Click &quot;Add Course&quot; to create the first programme.</p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 transition-opacity ${coursesLoading ? "opacity-60" : ""}`}>
                  {courses.map((course) => {
                    const subs = course.subjects || [];
                    return (
                      <div key={course.id} className="flex min-w-0 flex-col rounded-2xl border border-[#d3e1f5] bg-white p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {course.category && (
                              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${catChip(course.category)}`}>{prettyCategory(course.category)}</span>
                            )}
                            <h3 className="mt-2 break-words text-[18px] font-extrabold leading-snug text-[#082a63]">{course.course_name}</h3>
                            {course.course_name_hindi && <p className="mt-0.5 break-words font-devanagari text-[15px] text-[#3d5688]">{course.course_name_hindi}</p>}
                          </div>
                          {courseConfirmId !== course.id && (
                            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                              <button onClick={() => openEditCourse(course)} aria-label="Edit course" title="Edit"
                                className="rounded-xl border border-[#d3e1f5] p-2.5 text-[#3d5688] hover:bg-[#f4f8fe] hover:text-[#082a63] transition-colors"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => setCourseConfirmId(course.id)} aria-label="Delete course" title="Delete"
                                className="rounded-xl border border-[#d3e1f5] p-2.5 text-[#3d5688] hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px]">
                          {course.duration_label && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f4f8fe] px-2.5 py-1 font-semibold text-[#3d5688]"><Clock className="h-3.5 w-3.5" /> {course.duration_label}</span>
                          )}
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#eaf2fd] px-2.5 py-1 font-semibold text-[#1245b8]">
                            <BookOpen className="h-3.5 w-3.5" /> {subs.length} subject{subs.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {subs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {subs.slice(0, 6).map((sub) => (
                              <span key={sub.id} className="rounded-md border border-[#e3edfa] bg-white px-2 py-0.5 text-[13px] font-medium text-[#3d5688]">{sub.subject_name}</span>
                            ))}
                            {subs.length > 6 && <span className="rounded-md bg-[#f4f8fe] px-2 py-0.5 text-[13px] font-semibold text-[#4a6090]">+{subs.length - 6} more</span>}
                          </div>
                        )}

                        <div className="mt-auto pt-4">
                          {courseConfirmId === course.id ? (
                            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5">
                              <span className="text-[14px] font-semibold text-red-700">Delete this course?</span>
                              <button onClick={() => deleteCourse(course.id)} disabled={courseDeletingId === course.id}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60">
                                {courseDeletingId === course.id ? "Deleting…" : "Yes, delete"}
                              </button>
                              <button onClick={() => setCourseConfirmId(null)} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-bold text-[#3d5688]">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="grid grid-cols-2 gap-2 sm:hidden">
                                <button onClick={() => openEditCourse(course)}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                                  <Pencil className="h-4 w-4" /> Edit
                                </button>
                                <button onClick={() => setCourseConfirmId(course.id)}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </div>
                              <Link href="/super-admin/dashboard/exam-management"
                                className="inline-flex items-center gap-1 text-[14px] font-bold text-[#1245b8] hover:text-[#082a63]">
                                Manage subjects <ChevronRight className="h-4 w-4" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })()}

          {/* ── TAB: EXAM MANAGEMENT ── */}
          {activeTab === "exam" && (
            <div className="min-w-0 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-[#082a63] max-sm:sr-only">Exam Management</h2>
                  <p className="text-[14px] sm:text-[15px] text-[#3d5688]">Exam sessions, centers and exam tools.</p>
                </div>
                <button onClick={loadExamSessions} disabled={examLoading} aria-label="Refresh"
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#082a63] px-3.5 py-2.5 text-[14px] font-bold text-white transition hover:bg-[#0b3a85] disabled:opacity-60 sm:px-4">
                  <RefreshCw className={`h-4 w-4 ${examLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Link href="/super-admin/dashboard/exam-management"
                  className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#082a63] to-[#0f4aa8] p-3.5 text-white shadow-sm transition hover:shadow-md sm:gap-4 sm:p-4">
                  <span className="flex h-11 w-11 shrink-0 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/15"><BookOpen className="h-6 w-6" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16.5px] font-bold">Exam Hub</span>
                    <span className="block text-[13.5px] leading-snug text-blue-100">Subjects, datesheet, roll numbers, marks &amp; results</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-0.5" />
                </Link>

                <Link href="/super-admin/dashboard/exam-config"
                  className="group flex items-center gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3.5 shadow-sm transition hover:border-[#9db7e0] hover:shadow-md sm:gap-4 sm:p-4">
                  <span className="flex h-11 w-11 shrink-0 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#eaf2fd] text-[#1b57d8]"><Clock className="h-6 w-6" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16.5px] font-bold text-[#082a63]">Exam Configuration</span>
                    <span className="block text-[13.5px] leading-snug text-[#3d5688]">Center, date &amp; time per course, for admit cards</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#3d5688] transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Sub-tabs */}
              <div className="inline-flex w-full gap-1 rounded-2xl border border-[#d3e1f5] bg-white p-1 sm:w-auto">
                {[
                  { key: "sessions", label: "Exam Sessions", count: examSessions.length },
                  { key: "centers", label: "Exam Centers", count: examCenters.length },
                  { key: "signature", label: "Signature" },
                ].map((t) => (
                  <button key={t.key} onClick={() => setExamSubTab(t.key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-2.5 text-[13.5px] font-bold transition sm:flex-none sm:gap-2 sm:px-4 sm:text-[14.5px] ${examSubTab === t.key ? "bg-[#082a63] text-white shadow-sm" : "text-[#3d5688] hover:bg-[#f4f8fe]"}`}>
                    {t.label}
                    {t.count !== undefined && <span className={`rounded-full px-2 py-0.5 text-[12px] font-extrabold ${examSubTab === t.key ? "bg-white/20 text-white" : "bg-[#eaf2fd] text-[#1b57d8]"}`}>{t.count}</span>}
                  </button>
                ))}
              </div>

              {examSubTab === "sessions" && (
                <div className="space-y-4">
                  <p className="flex items-start gap-2 rounded-xl border border-[#c9daf2] bg-[#eef4fc] px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-[#44557a]">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1b57d8]" />
                    <span>A session is one exam cycle (e.g. 2025-26 Annual). The <b>Active</b> session is the one used for roll numbers, admit cards and results.</span>
                  </p>

                  {/* Add session: a button; the form opens as a popup */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[14.5px] font-medium text-[#3d5688]">{examSessions.length} exam session{examSessions.length === 1 ? "" : "s"}</p>
                    <button type="button" onClick={() => setShowSessionForm(true)}
                      className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8]">
                      <Plus className="h-4 w-4" /> Add New Session
                    </button>
                  </div>
                  {showSessionForm && (
                  <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#06204f]/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                    onMouseDown={(e) => { if (e.target === e.currentTarget && !sessionSubmitting) setShowSessionForm(false); }}>
                  <form onSubmit={addSession} role="dialog" aria-modal="true" aria-labelledby="add-session-title"
                    className="my-auto w-full max-w-[560px] rounded-2xl border border-[#d3e1f5] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 id="add-session-title" className="flex items-center gap-2 text-[18px] font-bold text-[#082a63]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fd] text-[#1b57d8]"><Plus className="h-4 w-4" /></span>
                        Add New Session
                      </h3>
                      <button type="button" onClick={() => setShowSessionForm(false)} disabled={sessionSubmitting} aria-label="Close"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#3d5688] transition hover:bg-[#eaf2fd]">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block min-w-0 sm:col-span-2">
                        <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">Session name <span className="text-red-500">*</span></span>
                        <input value={newSession.session_name} onChange={e => setNewSession(p => ({ ...p, session_name: e.target.value }))}
                          placeholder="e.g. 2024-25 Annual" required
                          className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">Start date</span>
                        <DatePicker ariaLabel="Start date" value={newSession.start_date} onChange={(v) => setNewSession(p => ({ ...p, start_date: v }))} min="2000-01-01" max="2100-12-31" />
                      </label>
                      <label className="block min-w-0">
                        <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">End date</span>
                        <DatePicker ariaLabel="End date" value={newSession.end_date} min={newSession.start_date || "2000-01-01"} max="2100-12-31" onChange={(v) => setNewSession(p => ({ ...p, end_date: v }))} />
                      </label>
                    </div>
                    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                      <button type="submit" disabled={sessionSubmitting}
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 sm:w-auto">
                        <Plus className="h-4 w-4" /> {sessionSubmitting ? "Adding..." : "Add Session"}
                      </button>
                      <button type="button" onClick={() => setShowSessionForm(false)} disabled={sessionSubmitting}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60 sm:w-auto">
                        Cancel
                      </button>
                    </div>
                  </form>
                  </div>
                  )}

                  {/* Sessions list */}
                  <div className="space-y-3">
                    {examSessions.map(s => (
                      <div key={s.id} className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${s.is_active ? "border-emerald-300 bg-emerald-50/70" : "border-[#d3e1f5] bg-white"}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-[#eaf2fd] text-[#1b57d8]"}`}>
                            <GraduationCap className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="break-words text-[16.5px] font-bold text-[#082a63]">{s.session_name}</p>
                              {s.is_active && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[12.5px] font-bold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-[14px] text-[#3d5688]">
                              {s.start_date || s.end_date ? `${fmtExamDate(s.start_date)} – ${fmtExamDate(s.end_date)}` : "No dates set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:shrink-0">
                          <button onClick={() => toggleSession(s.id, !s.is_active)}
                            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[14px] font-bold transition sm:flex-none ${s.is_active ? "border border-[#d3e1f5] bg-white text-[#3d5688] hover:bg-[#f4f8fe]" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                            <Power className="h-4 w-4" /> {s.is_active ? "Deactivate" : "Set Active"}
                          </button>
                          <button onClick={() => deleteSession(s.id)} aria-label="Delete session" title="Delete"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d3e1f5] bg-white text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {examSessions.length === 0 && !examLoading && (
                      <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white p-10 text-center">
                        <GraduationCap className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                        <p className="text-[16px] font-bold text-[#082a63]">No exam sessions yet</p>
                        <p className="mt-1 text-[14px] text-[#4a6090]">Click "Add New Session" to add your first session.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {examSubTab === "signature" && <SecretarySignatureManager onShowToast={showToast} />}

              {examSubTab === "centers" && (
                <div className="space-y-4">
                  {/* Add center: a button; the form opens as a popup */}
                  {(
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[14.5px] font-medium text-[#3d5688]">{examCenters.length} exam center{examCenters.length === 1 ? "" : "s"}</p>
                      <button type="button" onClick={() => setShowCenterForm(true)}
                        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-5 text-[15px] font-bold text-white shadow-sm transition hover:bg-[#1245b8]">
                        <Plus className="h-4 w-4" /> Add Exam Center
                      </button>
                    </div>
                  )}
                  {showCenterForm && (
                  <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#06204f]/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
                    onMouseDown={(e) => { if (e.target === e.currentTarget && !centerSubmitting) setShowCenterForm(false); }}>
                  <form onSubmit={addCenter} role="dialog" aria-modal="true" aria-labelledby="add-center-title"
                    className="my-auto w-full max-w-[640px] rounded-2xl border border-[#d3e1f5] bg-white p-5 shadow-2xl sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 id="add-center-title" className="flex items-center gap-2 text-[18px] font-bold text-[#082a63]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf2fd] text-[#1b57d8]"><Plus className="h-4 w-4" /></span>
                        Add Exam Center
                      </h3>
                      <button type="button" onClick={() => setShowCenterForm(false)} disabled={centerSubmitting} aria-label="Close"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#3d5688] transition hover:bg-[#eaf2fd]">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        { key: "center_name", label: "Center name", placeholder: "e.g. Government High School", required: true },
                        { key: "center_code", label: "Center code", placeholder: "e.g. GOA-101" },
                        { key: "city", label: "City", placeholder: "e.g. Panaji" },
                        { key: "state", label: "State", placeholder: "e.g. Goa" },
                      ].map((f) => (
                        <label key={f.key} className="block min-w-0">
                          <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">{f.label} {f.required && <span className="text-red-500">*</span>}</span>
                          <input value={newCenter[f.key]} onChange={e => setNewCenter(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} required={f.required}
                            className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                        </label>
                      ))}
                      <label className="block min-w-0 sm:col-span-2">
                        <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">Address</span>
                        <input value={newCenter.address} onChange={e => setNewCenter(p => ({ ...p, address: e.target.value }))}
                          placeholder="Street, locality, pin code"
                          className="h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                      </label>
                    </div>
                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <button type="submit" disabled={centerSubmitting}
                        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 sm:w-auto">
                        <Plus className="h-4 w-4" /> {centerSubmitting ? "Adding..." : "Add Center"}
                      </button>
                      <button type="button" onClick={() => setShowCenterForm(false)} disabled={centerSubmitting}
                        className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60 sm:w-auto">
                        Cancel
                      </button>
                    </div>
                  </form>
                  </div>
                  )}

                  {/* Centers list */}
                  {examCenters.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {examCenters.map(c => (
                        <div key={c.id} className="flex min-w-0 items-start justify-between gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf2fd] text-[#1b57d8]"><MapPin className="h-5 w-5" /></span>
                            <div className="min-w-0">
                              <p className="break-words text-[16px] font-bold text-[#082a63]">{c.center_name}</p>
                              {c.center_code && <span className="mt-0.5 inline-block rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{c.center_code}</span>}
                              {(c.city || c.state) && <p className="mt-1 text-[14px] text-[#3d5688]">{[c.city, c.state].filter(Boolean).join(", ")}</p>}
                              {c.address && <p className="break-words text-[13.5px] text-[#4a6090]">{c.address}</p>}
                            </div>
                          </div>
                          <button onClick={() => deleteCenter(c.id)} aria-label="Delete center" title="Delete"
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d3e1f5] bg-white text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {examCenters.length === 0 && !examLoading && (
                    <div className="rounded-2xl border border-dashed border-[#b9cbe6] bg-white p-10 text-center">
                      <MapPin className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                      <p className="text-[16px] font-bold text-[#082a63]">No exam centers yet</p>
                      <p className="mt-1 text-[14px] text-[#4a6090]">Click "Add Exam Center" to add your first center.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: ANNOUNCEMENTS ── */}
          {activeTab === "announcements" && (
            <AnnouncementsManager
              announcements={announcements}
              setAnnouncements={setAnnouncements}
              loading={annLoading}
              onReload={loadAnnouncements}
              onShowToast={showToast}
            />
          )}

          {/* ── TAB: CONTACT INQUIRIES ── */}
          {activeTab === "inquiries" && (
            <InquiriesManager
              inquiries={inquiries}
              setInquiries={setInquiries}
              loading={inquiriesLoading}
              onReload={loadInquiries}
              onShowToast={showToast}
            />
          )}

          {/* TAB: STUDENT APPLICATIONS */}
          {activeTab === "applications" && (
            <div className="min-w-0 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#082a63]">Student Applications</h2>
                  <p className="text-[14px] sm:text-[15px] text-[#3d5688]">Review, approve, reject or raise queries on submitted registrations.</p>
                </div>
                <button onClick={loadApplications} disabled={appLoading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl bg-[#082a63] text-white text-[14px] font-bold hover:bg-[#0b3a85] transition-all disabled:opacity-60">
                  <RefreshCw className={`w-4 h-4 ${appLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {/* Status cards (click to filter) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {Object.entries(APP_STATUS).map(([key, cfg]) => (
                  <button key={key} onClick={() => changeAppFilter(appFilter === key ? "all" : key)}
                    className={`rounded-2xl border bg-white p-3.5 text-left transition hover:shadow-md ${appFilter === key ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5]"}`}>
                    <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-[#4a6090]">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} /> <span className="truncate">{cfg.label}</span>
                    </span>
                    <span className="mt-2 block text-[28px] font-extrabold leading-none text-[#082a63]">{appCounts ? appCounts[key] ?? 0 : "–"}</span>
                  </button>
                ))}
              </div>

              {/* Search + filter */}
              <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6090]" />
                  <input type="text" placeholder="Search by candidate name, roll or enrollment no…" value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-9 pr-9 text-[14px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                  {appSearch && (
                    <button onClick={() => setAppSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]"><X className="h-4 w-4" /></button>
                  )}
                </div>
                <Select value={appFilter} onChange={changeAppFilter} ariaLabel="Filter by status" className="sm:w-52"
                  options={[{ value: "all", label: "All statuses" }, ...Object.entries(APP_STATUS).map(([key, cfg]) => ({ value: key, label: cfg.label }))]} />
              </div>

              {/* List */}
              <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
                {appLoading && applications.length === 0 ? (
                  <div className="p-12 text-center text-[#3d5688]">
                    <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-[#1b57d8]" />
                    <p className="text-[16px] font-semibold">Loading applications…</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
                    <p className="text-[16px] font-bold text-[#082a63]">{appFilter !== "all" || appQuery ? "No applications match your filters" : "No applications yet"}</p>
                    <p className="mt-1 text-[14px] text-[#4a6090]">{appFilter !== "all" || appQuery ? "Try a different search or status." : "Registrations submitted by colleges will appear here."}</p>
                    {(appFilter !== "all" || appQuery) && (
                      <button onClick={() => { setAppSearch(""); changeAppFilter("all"); }} className="mt-4 rounded-xl border border-[#d3e1f5] px-4 py-2 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">Clear filters</button>
                    )}
                  </div>
                ) : (
                  <div className={`transition-opacity ${appLoading ? "opacity-60" : ""}`}>
                    {/* table (laptops) */}
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full text-left text-[15px]">
                        <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                          <tr>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Candidate</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Enrollment no.</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Course</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">College</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Submitted</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">Status</th>
                            <th className="py-3.5 px-5 text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090] text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eaf2fd]">
                          {applications.map((app) => {
                            const cfg = APP_STATUS[app.status] || APP_STATUS.pending;
                            return (
                              <tr key={app.id} className="transition-colors hover:bg-[#f7faff]">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082a63] text-[16px] font-extrabold text-white">
                                      {(app.candidate_name || "?").trim().charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                      <p className="font-bold leading-tight text-[#082a63]">{app.candidate_name}</p>
                                      {app.phone && <p className="mt-0.5 text-[13.5px] text-[#4a6090]">{app.phone}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  {app.enrollment_no ? <span className="inline-block rounded-lg bg-[#eaf2fd] px-2.5 py-1 font-mono text-[13.5px] font-semibold text-[#082a63]">{app.enrollment_no}</span> : <span className="text-[#a9bde0]">—</span>}
                                </td>
                                <td className="max-w-[220px] px-5 py-3.5 text-[#3d5688]"><span className="line-clamp-2">{app.courses?.course_name || "—"}</span></td>
                                <td className="max-w-[220px] px-5 py-3.5 text-[#3d5688]">
                                  <span className="line-clamp-2">{app.colleges?.college_name || "—"}</span>
                                  {app.colleges?.city && <span className="block text-[13px] text-[#6b7fa6]">{app.colleges.city}</span>}
                                </td>
                                <td className="whitespace-nowrap px-5 py-3.5 text-[14.5px] text-[#4a6090]">{fmtAppDate(app.created_at)}</td>
                                <td className="px-5 py-3.5">
                                  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13.5px] font-bold ${cfg.color}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => openAppDetail(app)}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#d3e1f5] bg-white px-3 py-1.5 text-[14px] font-bold text-[#082a63] transition-colors hover:bg-[#f4f8fe]">
                                      <Eye className="h-3.5 w-3.5" /> Quick view
                                    </button>
                                    <Link href={`/super-admin/dashboard/registrations/${app.id}`}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1b57d8] px-3 py-1.5 text-[14px] font-bold text-white transition-colors hover:bg-[#1245b8]">
                                      <ExternalLink className="h-3.5 w-3.5" /> Open
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* cards (phones / tablets) */}
                    <div className="divide-y divide-[#eaf2fd] lg:hidden">
                      {applications.map((app) => {
                        const cfg = APP_STATUS[app.status] || APP_STATUS.pending;
                        return (
                          <div key={app.id} className="min-w-0 space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#082a63] text-[16px] font-extrabold text-white">
                                  {(app.candidate_name || "?").trim().charAt(0).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="break-words text-[16.5px] font-bold leading-snug text-[#082a63]">{app.candidate_name}</p>
                                  <p className="text-[13px] text-[#4a6090]">{fmtAppDate(app.created_at)}</p>
                                </div>
                              </div>
                              <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-bold ${cfg.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-[14.5px] text-[#3d5688]">
                              {app.enrollment_no && <p><span className="text-[#6b7fa6]">Enrollment:</span> <span className="break-all font-mono font-semibold text-[#082a63]">{app.enrollment_no}</span></p>}
                              <p><span className="text-[#6b7fa6]">Course:</span> {app.courses?.course_name || "—"}</p>
                              <p><span className="text-[#6b7fa6]">College:</span> {app.colleges?.college_name || "—"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button onClick={() => openAppDetail(app)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                                <Eye className="h-4 w-4" /> Quick view
                              </button>
                              <Link href={`/super-admin/dashboard/registrations/${app.id}`}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] py-2.5 text-[14px] font-bold text-white hover:bg-[#1245b8]">
                                <ExternalLink className="h-4 w-4" /> Open
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* pagination */}
                    <div className="flex flex-col gap-3 border-t border-[#e3edfa] bg-[#f4f8fe] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <p className="text-[13.5px] font-semibold text-[#4a6090]">Showing {appFrom}–{appTo} of {appTotal} application{appTotal === 1 ? "" : "s"}</p>
                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <button onClick={() => setAppPage((x) => Math.max(1, x - 1))} disabled={appPage <= 1 || appLoading}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d3e1f5] bg-white px-3 py-2 text-[14px] font-bold text-[#082a63] hover:bg-[#eaf2fd] disabled:opacity-40">
                          <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <span className="px-2 text-[14px] font-semibold text-[#3d5688]">Page {appPage} of {appPages}</span>
                        <button onClick={() => setAppPage((x) => Math.min(appPages, x + 1))} disabled={appPage >= appPages || appLoading}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#d3e1f5] bg-white px-3 py-2 text-[14px] font-bold text-[#082a63] hover:bg-[#eaf2fd] disabled:opacity-40">
                          Next <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPLICATION DETAIL SLIDE-OVER */}
          {selectedApp && (
            <div className="fixed inset-0 z-50 flex">
              <div className="flex-1 bg-black/50" onClick={() => setSelectedApp(null)} />
              <div className="w-full max-w-2xl bg-white flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-[#082a63] text-white px-4 py-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg leading-tight break-words">{selectedApp.candidate_name}</h3>
                    <p className="text-[15px] text-[#d3e1f5] font-mono break-all">{selectedApp.enrollment_no || "No enrollment no."}</p>
                  </div>
                  <button onClick={() => setSelectedApp(null)} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
                  {appDetailLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1b57d8]" />
                    </div>
                  ) : (
                    <>
                      {/* Status badge */}
                      <div className="flex items-center justify-between">
                        {(() => { const cfg = APP_STATUS[selectedApp.status] || APP_STATUS.pending; return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[15px] font-bold ${cfg.color}`}>
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        ); })()}
                        <span className="text-[15px] text-[#3d5688]">{selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleDateString("en-IN") : ""}</span>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-[15px]">
                        {[
                          ["Father's Name", selectedApp.father_name],
                          ["Mother's Name", selectedApp.mother_name],
                          ["Date of Birth", selectedApp.dob],
                          ["Gender", selectedApp.gender],
                          ["Category", selectedApp.category],
                          ["Phone", selectedApp.phone],
                          ["Email", selectedApp.email],
                          ["Course", selectedApp.courses?.course_name],
                          ["College", selectedApp.colleges?.college_name],
                          ["Session", selectedApp.session_label || selectedApp.academic_session],
                          ["State", selectedApp.state],
                          ["City", selectedApp.city],
                        ].map(([label, val]) => val ? (
                          <div key={label} className={`min-w-0 bg-[#f4f8fe] rounded-xl p-3 border border-[#d3e1f5] ${["Email", "Course", "College"].includes(label) ? "col-span-2" : ""}`}>
                            <p className="text-[13px] sm:text-[14px] font-bold uppercase text-[#3d5688] mb-0.5">{label}</p>
                            <p className="font-semibold text-[#082a63] break-words">{val}</p>
                          </div>
                        ) : null)}
                      </div>

                      {/* Document Links */}
                      {(() => {
                        const docs = [
                          ["Photo", selectedApp.photo_url],
                          ["Signature", selectedApp.signature_url],
                          ["Aadhaar", selectedApp.aadhaar_url],
                          ["8th Marksheet", selectedApp.eighth_marksheet_url],
                          ["10th Marksheet", selectedApp.tenth_marksheet_url],
                          ["12th Marksheet", selectedApp.twelfth_marksheet_url],
                          ["Affidavit", selectedApp.affidavit_url],
                        ].filter(([, url]) => url);
                        if (!docs.length) return null;
                        return (
                          <div>
                            <p className="text-[15px] font-bold text-[#082a63] mb-2 uppercase tracking-wide">Documents</p>
                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                              {docs.map(([label, url]) => (
                                <a key={label} href={url} target="_blank" rel="noreferrer"
                                  className="inline-flex items-center justify-center rounded-lg border border-[#d3e1f5] bg-[#eaf2fd] px-3 py-2 text-center text-[15px] font-semibold text-[#082a63] hover:border-[#1b57d8]">
                                  {label}
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Existing Queries */}
                      {appQueries.length > 0 && (
                        <div>
                          <p className="text-[15px] font-bold text-[#082a63] mb-2 uppercase tracking-wide">Queries Raised</p>
                          <div className="space-y-2">
                            {appQueries.map((q) => (
                              <div key={q.id} className={`p-3 rounded-xl border text-[15px] ${q.status === "resolved" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-[#082a63] capitalize">{q.field_name}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[14px] font-bold ${q.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                    {q.status}
                                  </span>
                                </div>
                                <p className="text-[#3d5688]">{q.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions Footer */}
                {!appDetailLoading && selectedApp.status !== "approved" && selectedApp.status !== "rejected" && (
                  <div className="border-t border-[#d3e1f5] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4 grid grid-cols-2 gap-2 sm:grid-cols-3 shrink-0 bg-[#f4f8fe]">
                    <button onClick={() => approveApp(selectedApp.id)} disabled={actionLoading}
                      className="inline-flex h-11 items-center justify-center gap-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-bold transition-all disabled:opacity-60"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setQueryModal(true)} disabled={actionLoading}
                      className="inline-flex h-11 items-center justify-center gap-1.5 px-3 whitespace-nowrap rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-bold transition-all disabled:opacity-60"
                    >
                      <MessageSquarePlus className="w-4 h-4" /> Raise Query
                    </button>
                    <button onClick={() => setRejectModal(true)} disabled={actionLoading}
                      className="col-span-2 sm:col-span-1 inline-flex h-11 items-center justify-center gap-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[15px] font-bold transition-all disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* QUERY MODAL */}
          {queryModal && selectedApp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setQueryModal(false)} />
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="font-bold text-[#082a63] text-lg">Raise a Query</h3>
                <p className="text-[15px] text-[#3d5688]">College will see this in their notifications and can resubmit after fixing.</p>
                <div>
                  <label className="text-[15px] font-bold text-[#082a63] uppercase mb-1 block">Field / Section</label>
                  <Select size="lg" ariaLabel="Field or section" value={queryField} onChange={setQueryField}
                    options={[
                      { value: "general", label: "General" },
                      { value: "photo", label: "Photograph" },
                      { value: "aadhaar", label: "Aadhaar Card" },
                      { value: "signature", label: "Signature" },
                      { value: "marksheet_8th", label: "8th Marksheet" },
                      { value: "marksheet_10th", label: "10th Marksheet" },
                      { value: "marksheet_12th", label: "12th Marksheet" },
                      { value: "personal_details", label: "Personal Details" },
                      { value: "course_details", label: "Course Details" },
                    ]} />
                </div>
                <div>
                  <label className="text-[15px] font-bold text-[#082a63] uppercase mb-1 block">Query Message</label>
                  <textarea value={queryMsg} onChange={(e) => setQueryMsg(e.target.value)}
                    rows={3} placeholder="Describe the issue clearly so the college can fix it..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d3e1f5] text-[17px] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8] resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQueryModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#d3e1f5] text-[15px] font-bold text-[#3d5688] hover:bg-[#eaf2fd] transition-all">Cancel</button>
                  <button onClick={() => raiseQuery(selectedApp.id)} disabled={querySubmitting || !queryMsg.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[15px] font-bold transition-all disabled:opacity-60"
                  >
                    {querySubmitting ? "Sending..." : "Send Query"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REJECT MODAL */}
          {rejectModal && selectedApp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60" onClick={() => setRejectModal(false)} />
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <h3 className="font-bold text-[#082a63] text-lg">Reject Application</h3>
                <div>
                  <label className="text-[15px] font-bold text-[#082a63] uppercase mb-1 block">Reason (optional)</label>
                  <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    rows={3} placeholder="Briefly state the rejection reason..."
                    className="w-full px-3 py-2.5 rounded-xl border border-[#d3e1f5] text-[17px] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8] resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRejectModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-[#d3e1f5] text-[15px] font-bold text-[#3d5688] hover:bg-[#eaf2fd] transition-all">Cancel</button>
                  <button onClick={() => rejectApp(selectedApp.id)} disabled={actionLoading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[15px] font-bold transition-all disabled:opacity-60"
                  >
                    {actionLoading ? "Rejecting..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}

          </main>
        </div>
      </div>
    </div>
  );
}
