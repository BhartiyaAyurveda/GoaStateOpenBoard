"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  User,
  Users,
  Phone,
  BookOpen,
  GraduationCap,
  FileText,
  Eye,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Check,
  Mail,
  Calendar,
  CreditCard,
  BadgeCheck,
  Search,
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andaman and Nicobar Islands","Andhra Pradesh","Arunachal Pradesh","Assam",
  "Bihar","Chandigarh","Chhattisgarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Ladakh","Lakshadweep",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Puducherry","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const SESSIONS = ["2026-2027","2025-2026","2024-2025","2023-2024"];

const STEPS = [
  { id: 1, label: "Personal",   desc: "Candidate Info",   icon: User },
  { id: 2, label: "Contact",    desc: "Address & Mobile", icon: Phone },
  { id: 3, label: "Course",     desc: "Program & Batch",  icon: BookOpen },
  { id: 4, label: "Education",  desc: "Academic Record",  icon: GraduationCap },
  { id: 5, label: "Documents",  desc: "Certificates",     icon: FileText },
  { id: 6, label: "Review",     desc: "Verify & Submit",  icon: Eye },
];

const blank = {
  // Personal
  candidate_name:"", father_name:"", mother_name:"", dob:"",
  gender:"Male", category:"General", aadhar_no:"",
  // Contact
  phone:"", email:"", address:"", district:"", city:"",
  state:"Uttar Pradesh", pincode:"", academic_session:"2026-2027",
  // Course
  course_id:"",
  // Education
  education: {
    high_school:  { board:"", year:"", total:"", obtained:"", percentage:"" },
    intermediate: { board:"", year:"", total:"", obtained:"", percentage:"" },
    graduation:   { board:"", year:"", total:"", obtained:"", percentage:"", system:"marks", cgpa:"", cgpa_scale:"10" },
    other:        { board:"", year:"", total:"", obtained:"", percentage:"", system:"marks", cgpa:"", cgpa_scale:"10" },
  },
  // Docs
  photo_url:"", signature_url:"", aadhaar_url:"",
  tenth_marksheet_url:"", twelfth_marksheet_url:"", affidavit_url:"",
};

// ── Upload via server route ────────────────────────────────────────────────
async function uploadToImageKit(file, folder = "registrations") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.url;
}

// ── Field Helpers ──────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 sm:py-3 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] font-medium focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all";
const inputIconCls =
  "w-full pl-10 pr-4 py-2.5 sm:py-3 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] font-medium focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all";
const labelCls =
  "block text-[13px] font-bold uppercase tracking-widest text-[#3d5688] mb-1.5";
const errCls =
  "text-red-600 text-[13px] font-semibold mt-1 flex items-center gap-1";

function Field({ label, req, error, icon: Icon, children }) {
  return (
    <div className="space-y-0.5">
      <label className={labelCls}>
        {label}
        {req && <span className="text-red-500 ml-1">*</span>}
      </label>
      {Icon ? (
        <div className="relative group">
          <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3d5688] group-focus-within:text-[#1b57d8] transition-colors pointer-events-none" />
          {children}
        </div>
      ) : children}
      {error && (
        <p className={errCls}>
          <span className="w-1 h-1 rounded-full bg-red-600" />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 pt-1 pb-0.5">
      <span className="text-[12px] font-bold uppercase tracking-widest text-[#1b57d8]">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#1b57d8]/30 to-transparent" />
    </div>
  );
}

// ── Searchable Course Dropdown ─────────────────────────────────────────────
function CourseSelect({ courses, value, onChange, error }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const ref                 = useRef(null);
  const inputRef            = useRef(null);

  const selected = courses.find(c => c.id === value);
  const filtered = query.trim()
    ? courses.filter(c => c.course_name.toLowerCase().includes(query.toLowerCase()))
    : courses;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full px-4 py-2.5 sm:py-3 text-[15px] rounded-xl border text-left flex items-center justify-between gap-2 transition-all focus:outline-none
          ${error ? "border-red-400 bg-red-50" : open ? "border-[#1b57d8] ring-4 ring-[#1b57d8]/15 bg-white" : "border-[#d3e1f5] bg-[#f4f8fe] hover:border-[#1b57d8]"}
          ${selected ? "text-[#082a63] font-medium" : "text-[#8a97b3]"}`}
      >
        <span className="truncate">{selected ? `${selected.course_name}${selected.duration_label ? ` (${selected.duration_label})` : ""}` : "— Select Recognized Council Course —"}</span>
        <Search className={`w-4 h-4 shrink-0 transition-colors ${open ? "text-[#1b57d8]" : "text-[#8a97b3]"}`} />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#d3e1f5] rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[#eaf2fd]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a97b3] pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to search course..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] rounded-lg border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] focus:outline-none focus:ring-2 focus:ring-[#1b57d8]/20 focus:border-[#1b57d8]"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto text-[15px]">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-[13px] text-[#8a97b3] text-center">No courses found</li>
            ) : filtered.map(c => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => { onChange(c.id); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] sm:text-[15px] hover:bg-[#f4f8fe] transition-colors flex items-center justify-between gap-2
                    ${c.id === value ? "bg-[#f4f8fe] text-[#082a63] font-bold" : "text-[#082a63]"}`}
                >
                  <span>{c.course_name}</span>
                  {c.duration_label && <span className="text-[12px] text-[#1245b8] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">{c.duration_label}</span>}
                </button>
              </li>
            ))}
          </ul>
          {filtered.length > 0 && (
            <div className="px-4 py-1.5 border-t border-[#eaf2fd] text-[12px] text-[#8a97b3]">
              {filtered.length} course{filtered.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Education Row ──────────────────────────────────────────────────────────
function EduRow({ label, hindiLabel, required, value, onChange, allowCgpa = false }) {
  const [obtainedError, setObtainedError] = useState("");
  const system = value.system || "marks";

  const set = (k, v) => {
    const updated = { ...value, [k]: v };
    if (k === "system") { onChange(updated); return; }
    if (k === "obtained" || k === "total") {
      const obt = parseFloat(k === "obtained" ? v : updated.obtained);
      const tot = parseFloat(k === "total"    ? v : updated.total);
      if (!isNaN(obt) && !isNaN(tot) && tot > 0) {
        if (obt > tot) {
          setObtainedError("Obtained cannot exceed total");
          onChange(updated); return;
        } else {
          setObtainedError("");
          updated.percentage = ((obt / tot) * 100).toFixed(2);
        }
      } else { setObtainedError(""); }
    }
    onChange(updated);
  };

  const inp = "w-full px-2.5 py-2 text-[13px] sm:text-[15px] bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1b57d8] focus:border-[#1b57d8] placeholder:text-slate-400 text-[#082a63]";

  return (
    <tr className="border-b border-slate-200 hover:bg-[#f4f8fe]/60 transition-colors">
      {/* Label */}
      <td className="py-3 px-3.5 bg-slate-50/50 align-top">
        <div className="font-semibold text-[#082a63] text-[13px] sm:text-[14px]">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <div className="text-[13px] text-slate-500 mt-0.5">{hindiLabel}</div>
        {allowCgpa && (
          <div className="flex items-center gap-1 mt-1.5">
            {["marks", "cgpa"].map(s => (
              <button key={s} type="button" onClick={() => set("system", s)}
                className={`px-2 py-0.5 text-[12px] font-bold rounded border transition-colors ${
                  system === s
                    ? "bg-[#082a63] text-white border-[#082a63]"
                    : "bg-white text-[#3d5688] border-slate-300 hover:border-[#1b57d8]"
                }`}>
                {s === "marks" ? "Marks" : "CGPA"}
              </button>
            ))}
          </div>
        )}
      </td>

      {/* Board */}
      <td className="py-2.5 px-2.5">
        <input value={value.board} onChange={e => set("board", e.target.value)}
          placeholder="e.g. CBSE / University" className={inp} />
      </td>

      {/* Year */}
      <td className="py-2.5 px-2.5">
        <input value={value.year} onChange={e => set("year", e.target.value)}
          placeholder="YYYY" maxLength={4} className={inp} />
      </td>

      {/* Marks system */}
      {system === "marks" ? (
        <>
          <td className="py-2.5 px-2.5">
            <input value={value.total} onChange={e => set("total", e.target.value)}
              placeholder="Total" type="number" min={0} className={inp} />
          </td>
          <td className="py-2.5 px-2.5">
            <input value={value.obtained} onChange={e => set("obtained", e.target.value)}
              placeholder="Obtained" type="number" min={0}
              className={inp + (obtainedError ? " border-red-400" : "")} />
            {obtainedError && <span className="text-[12px] text-red-600 block mt-0.5">{obtainedError}</span>}
          </td>
          <td className="py-2.5 px-2.5">
            <input value={value.percentage} onChange={e => set("percentage", e.target.value)}
              placeholder="%" type="number" step="0.01"
              className={inp + " bg-[#f4f8fe] font-medium"} />
          </td>
        </>
      ) : (
        /* CGPA system — spans 3 columns */
        <td colSpan={3} className="py-2.5 px-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[12px] text-slate-500 mb-1">CGPA Score</p>
              <input value={value.cgpa || ""} onChange={e => set("cgpa", e.target.value)}
                placeholder="e.g. 8.2" type="number" step="0.01" min={0}
                className={inp} />
            </div>
            <div className="text-slate-400 font-bold text-[15px] mt-4">/</div>
            <div className="w-24">
              <p className="text-[12px] text-slate-500 mb-1">Scale (Out of)</p>
              <select value={value.cgpa_scale || "10"} onChange={e => set("cgpa_scale", e.target.value)}
                className={inp}>
                <option value="10">10</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>
        </td>
      )}
    </tr>
  );
}

// ── Doc Upload Tile ────────────────────────────────────────────────────────
function DocUpload({ label, required, hint, value, onChange, accept = "image/*,.pdf" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const inputRef                  = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large (maximum 5MB allowed)");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const url = await uploadToImageKit(file);
      onChange(url);
    } catch {
      setError("Upload failed. Please retry.");
    }
    setUploading(false);
  };

  return (
    <div className="bg-[#f4f8fe] rounded-2xl border border-[#d3e1f5] p-4 space-y-2 hover:border-[#1b57d8]/60 transition-all">
      <div className="flex items-center justify-between">
        <p className="text-[13px] sm:text-[15px] font-bold text-[#082a63]">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
        {value && (
          <span className="inline-flex items-center gap-1 text-[13px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <Check className="w-3.5 h-3.5" /> Uploaded
          </span>
        )}
      </div>

      {hint && <p className="text-[13px] text-[#3d5688]">{hint}</p>}

      {value ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#d3e1f5]">
          <div className="flex items-center gap-3 min-w-0">
            {value.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={label}
                className="h-12 w-12 object-cover rounded-xl border border-[#d3e1f5] shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#f4f8fe] flex items-center justify-center shrink-0 border border-[#d3e1f5]">
                <FileText className="w-5 h-5 text-[#1b57d8]" />
              </div>
            )}
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] sm:text-[15px] font-semibold text-[#082a63] hover:text-[#1b57d8] underline truncate"
            >
              View Uploaded Document
            </a>
          </div>

          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full py-4 border-2 border-dashed border-[#d3e1f5] hover:border-[#1b57d8] rounded-xl text-[13px] sm:text-[15px] font-semibold text-[#3d5688] hover:text-[#082a63] bg-white hover:bg-[#f4f8fe] transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
        >
          {uploading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#1b57d8]" />
          ) : (
            <Upload className="w-4 h-4 text-[#1245b8]" />
          )}
          <span>{uploading ? "Uploading Document…" : "Choose File to Upload"}</span>
          <span className="text-[13px] text-[#8a97b3] font-normal">JPG, PNG, or PDF (Max 5MB)</span>
        </button>
      )}

      {error && <p className={errCls}>{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Main Registration Component ────────────────────────────────────────────
export default function StudentRegistrationForm({ courses = [], college, onSuccess, draftId: initialDraftId = null, initialData = null }) {
  const [step, setStep]             = useState(initialData?.step || 1);
  const [form, setForm]             = useState(initialData?.form ? { ...blank, ...initialData.form } : blank);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  // DB draft state
  const [activeDraftId, setActiveDraftId] = useState(initialDraftId);
  const [draftSaving, setDraftSaving]     = useState(false);

  // Email OTP state
  const [emailVerified, setEmailVerified]     = useState(!!initialDraftId); // skip OTP gate when resuming
  const [otpSent, setOtpSent]                 = useState(false);
  const [otpDigits, setOtpDigits]             = useState(["","","","","",""]);
  const otpRefs                               = useRef([]);
  const otpInput                              = otpDigits.join("");
  const [otpLoading, setOtpLoading]           = useState(false);
  const [otpError, setOtpError]               = useState("");
  const [otpSuccess, setOtpSuccess]           = useState("");
  const [otpCooldown, setOtpCooldown]         = useState(0);

  const startOtpCooldown = () => {
    setOtpCooldown(60);
    const t = setInterval(() => {
      setOtpCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  // Create DB draft after OTP verified (or lazily on first autosave)
  const createDraftIfNeeded = async (currentForm) => {
    if (activeDraftId) return activeDraftId;
    try {
      const res = await fetch("/api/college/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentForm.email?.trim().toLowerCase(),
          candidate_name: currentForm.candidate_name || "",
          father_name: currentForm.father_name || "",
          form_data: currentForm,
        }),
      });
      const data = await res.json();
      if (data.ok && data.draft?.id) {
        setActiveDraftId(data.draft.id);
        return data.draft.id;
      }
    } catch {}
    return null;
  };

  const handleSendOtp = async () => {
    if (!form.email?.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      setOtpError("Please enter a valid email address first.");
      return;
    }
    setOtpLoading(true); setOtpError(""); setOtpSuccess("");
    try {
      const res = await fetch("/api/student/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || "Failed to send OTP."); }
      else if (data.skipped) { setEmailVerified(true); setOtpSuccess("Email accepted."); createDraftIfNeeded(form); }
      else { setOtpSent(true); setOtpSuccess("OTP sent! Check your email inbox."); setOtpDigits(["","","","","",""]); setTimeout(() => otpRefs.current[0]?.focus(), 100); startOtpCooldown(); }
    } catch { setOtpError("Network error."); }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || otpInput.length < 6) { setOtpError("Enter the 6-digit OTP."); return; }
    setOtpLoading(true); setOtpError(""); setOtpSuccess("");
    try {
      const res = await fetch("/api/student/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), otp: otpInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setOtpError(data.error || "Invalid OTP."); }
      else {
        setEmailVerified(true);
        setOtpSuccess("Email verified successfully!");
        // Create DB draft immediately after OTP verification
        createDraftIfNeeded(form);
      }
    } catch { setOtpError("Network error."); }
    setOtpLoading(false);
  };

  const [captchaCode, setCaptchaCode] = useState(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  });
  const [captchaInput, setCaptchaInput] = useState("");
  const [declaration, setDeclaration]   = useState(false);
  const [submitError, setSubmitError]   = useState("");

  const regenerateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    setCaptchaCode(Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
    setCaptchaInput("");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setEdu = (level, k, v) =>
    setForm((f) => ({
      ...f,
      education: { ...f.education, [level]: { ...f.education[level], [k]: v } },
    }));

  // Autosave to DB whenever step advances (only when email is verified)
  const autosaveDraft = async (draftFormData, currentStep) => {
    const id = activeDraftId || await createDraftIfNeeded(draftFormData);
    if (!id) return;
    setDraftSaving(true);
    try {
      await fetch(`/api/college/drafts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_data: draftFormData, current_step: currentStep }),
      });
    } catch {}
    setDraftSaving(false);
  };

  // Delete the draft after successful final submission
  const deleteDraft = async () => {
    if (!activeDraftId) return;
    try {
      await fetch(`/api/college/drafts/${activeDraftId}`, { method: "DELETE" });
    } catch {}
  };

  // Save on tab close / browser unload — fire-and-forget best effort
  useEffect(() => {
    if (!emailVerified) return;
    const handleUnload = () => {
      const id = activeDraftId;
      if (!id) return;
      const payload = JSON.stringify({ form_data: form, current_step: step });
      // sendBeacon is non-blocking and survives page unload
      navigator.sendBeacon(
        `/api/college/drafts/${id}`,
        new Blob([payload], { type: "application/json" })
      );
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [emailVerified, activeDraftId, form, step]);

  // ── Validation per step ──────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.candidate_name.trim()) e.candidate_name = "Candidate name is required";
      if (!form.father_name.trim())   e.father_name    = "Father's name is required";
      if (!form.dob)                  e.dob            = "Date of birth is required";
    }
    if (s === 2) {
      if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone))
        e.phone = "Valid 10-digit mobile number required (starts with 6-9)";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
        e.email = "Valid email address required";
      if (!form.address.trim()) e.address = "Complete address is required";
      if (!form.state.trim())   e.state   = "State is required";
      if (form.pincode && !/^\d{6}$/.test(form.pincode))
        e.pincode = "Enter a valid 6-digit PIN code";
    }
    if (s === 3) {
      if (!form.course_id) e.course_id = "Please select an approved course";
    }
    if (s === 4) {
      const hs = form.education.high_school;
      if (!hs.board) e["edu_hs_board"] = "High school board required";
      if (!hs.year)  e["edu_hs_year"]  = "Passing year required";
      const inter = form.education.intermediate;
      if (!inter.board) e["edu_inter_board"] = "Intermediate board required";
      if (!inter.year)  e["edu_inter_year"]  = "Passing year required";
    }
    if (s === 5) {
      if (!form.photo_url)             e.photo_url = "Passport size photograph required";
      if (!form.tenth_marksheet_url)   e.tenth     = "10th High School marksheet required";
      if (!form.twelfth_marksheet_url) e.twelfth   = "12th Intermediate marksheet required";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (step === 2 && !emailVerified) {
      setErrors({ email: "Please verify your email address with OTP before proceeding." });
      return;
    }
    setErrors({});
    const nextStep = Math.min(step + 1, 6);
    setStep(nextStep);
    if (emailVerified) autosaveDraft(form, nextStep);
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  // ── Submit Form ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!declaration) {
      setSubmitError("Please confirm the candidate declaration checkbox to proceed.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setSubmitError("Captcha code does not match. Please enter the exact characters.");
      return;
    }
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (data.ok) {
        await deleteDraft();
        onSuccess && onSuccess(data.data);
      } else {
        setSubmitError(data.error || "Submission failed. Please check form details and retry.");
      }
    } catch {
      setSubmitError("Network connection error. Please verify your internet and retry.");
    }
    setSubmitting(false);
  };

  // ── Step Content Renderer ────────────────────────────────────────────────
  const stepContent = {
    1: (
      <div className="space-y-5">
        <SectionLabel>Identity / ओळख</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Candidate Full Name / उमेदवाराचें पुराय नांव" req icon={User} error={errors.candidate_name}>
            <input
              value={form.candidate_name}
              onChange={(e) => set("candidate_name", e.target.value)}
              placeholder="As per 10th matric certificate"
              className={inputIconCls}
            />
          </Field>

          <Field label="Father's Name / बापायचें नांव" req icon={Users} error={errors.father_name}>
            <input
              value={form.father_name}
              onChange={(e) => set("father_name", e.target.value)}
              placeholder="Father's full name"
              className={inputIconCls}
            />
          </Field>

          <Field label="Mother's Name / आवयचें नांव" icon={Users}>
            <input
              value={form.mother_name}
              onChange={(e) => set("mother_name", e.target.value)}
              placeholder="Mother's full name"
              className={inputIconCls}
            />
          </Field>
        </div>

        <SectionLabel>Personal Info / वैयक्तिक म्हायती</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date of Birth / जल्मतारीख" req icon={Calendar} error={errors.dob}>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              className={inputIconCls}
            />
          </Field>

          <Field label="Gender / लिंग" icon={User}>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={inputIconCls}
            >
              {["Male / दादलो", "Female / बायल", "Other / हेर"].map((g) => (
                <option key={g} value={g.split(" /")[0]}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Category / Reservation / आरक्षण वर्ग" icon={BadgeCheck}>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputIconCls}
            >
              {["General / सर्वसादारण", "OBC / हेर मागासवर्गीय", "SC / अनुसूचित जात", "ST / अनुसूचित जमात", "EWS / आर्थिक दृष्ट्या दुबळो"].map((c) => (
                <option key={c} value={c.split(" /")[0]}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Aadhaar Number / आधार क्रमांक" icon={CreditCard}>
            <input
              value={form.aadhar_no}
              onChange={(e) => set("aadhar_no", e.target.value)}
              placeholder="12-digit Aadhaar number"
              maxLength={12}
              className={inputIconCls}
            />
          </Field>
        </div>
      </div>
    ),

    2: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Mobile Number / मोबाइल क्रमांक" req error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="10-digit candidate mobile number"
              maxLength={10}
              className={inputCls}
            />
          </Field>

          <div className="space-y-2">
            <Field label="Email Address / ईमेल पत्तो" req error={errors.email}>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { set("email", e.target.value); setEmailVerified(false); setOtpSent(false); setOtpDigits(["","","","","",""]); setOtpError(""); setOtpSuccess(""); }}
                  placeholder="candidate@email.com"
                  disabled={emailVerified}
                  className={inputCls + (emailVerified ? " opacity-70" : "")}
                />
                {!emailVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={otpLoading || otpCooldown > 0}
                    className="shrink-0 w-20 sm:w-auto sm:px-4 py-2.5 rounded-xl bg-[#082a63] text-white text-[13px] font-bold disabled:opacity-50 hover:bg-[#0b3a85] transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center">
                    {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? "Resend" : "Send OTP"}
                  </button>
                )}
                {emailVerified && (
                  <div className="shrink-0 flex items-center gap-1 px-2.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-[13px] font-bold whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Verified</span>
                  </div>
                )}
              </div>
            </Field>
            {otpError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold animate-in fade-in">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{otpError}
              </div>
            )}
            {emailVerified ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                Email verified successfully! / ईमेल पडताळणी जाली
              </div>
            ) : otpSuccess && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[13px] font-semibold animate-in fade-in">
                <Mail className="w-3.5 h-3.5 shrink-0" />{otpSuccess}
              </div>
            )}
            {otpSent && !emailVerified && (
              <div className="rounded-2xl border border-[#1b57d8]/40 bg-gradient-to-br from-[#FFFBF2] to-[#f4f8fe] p-4 space-y-3 animate-in fade-in">
                <p className="text-[13px] font-bold uppercase tracking-widest text-[#1245b8] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enter OTP / ओटीपी नोंद करात
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      disabled={otpLoading}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g,"").slice(-1);
                        const next = [...otpDigits];
                        next[i] = val;
                        setOtpDigits(next);
                        if (val && i < 5) otpRefs.current[i + 1]?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
                        if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
                        if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
                      }}
                      onPaste={e => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
                        const next = ["","","","","",""];
                        pasted.split("").forEach((ch, idx) => { next[idx] = ch; });
                        setOtpDigits(next);
                        otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                      }}
                      className={`flex-1 min-w-0 max-w-[44px] aspect-square text-center text-base font-bold rounded-xl border-2 outline-none transition-all disabled:opacity-50
                        ${d ? "border-[#082a63] bg-[#082a63] text-white" : "border-[#d3e1f5] bg-white text-[#082a63]"}
                        focus:ring-4 focus:ring-[#1b57d8]/25 focus:border-[#1b57d8]`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpDigits.some(d => !d)}
                  className="w-full mt-1 py-2.5 rounded-xl bg-[#1b57d8] hover:bg-[#5db0f4] active:scale-95 text-[#06204f] text-[15px] font-extrabold disabled:opacity-50 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {otpLoading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
                    : <><CheckCircle2 className="w-4 h-4" /> Verify OTP / पडताळणी करात</>}
                </button>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <Field label="Permanent Address / कायमचो पत्तो" req error={errors.address}>
              <textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="House / Street / Village / Post Office"
                rows={2}
                className={inputCls + " resize-none"}
              />
            </Field>
          </div>

          <Field label="District / जिल्लो">
            <input
              value={form.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder="District"
              className={inputCls}
            />
          </Field>

          <Field label="City / Town / शार">
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="City"
              className={inputCls}
            />
          </Field>

          <Field label="State / UT / राज्य" req error={errors.state}>
            <select
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className={inputCls}
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="PIN Code / पिन कोड" error={errors.pincode}>
            <input
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
              placeholder="6-digit PIN code"
              maxLength={6}
              className={inputCls}
            />
          </Field>

          <Field label="Academic Session / शैक्षणीक सत्र">
            <select
              value={form.academic_session}
              onChange={(e) => set("academic_session", e.target.value)}
              className={inputCls}
            >
              {SESSIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </div>
    ),

    3: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Course Program / अभ्यासक्रम" req error={errors.course_id}>
            <CourseSelect
              courses={courses}
              value={form.course_id}
              onChange={(id) => set("course_id", id)}
              error={errors.course_id}
            />
          </Field>

        </div>

        <div className="bg-[#f4f8fe] border border-[#d3e1f5] rounded-2xl p-4 text-[15px] text-[#082a63] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1b57d8] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[#082a63] text-[15px]">
              Affiliation Enrollment Note
            </p>
            <p className="text-[#3d5688] text-[13px] sm:text-[15px] leading-relaxed">
              This registration will be lodged under <strong>{college?.college_name}</strong>. The Goa State Open School Board's Examination Directorate will review candidate credentials and issue official Enrollment and Roll Numbers upon approval.
            </p>
          </div>
        </div>
      </div>
    ),

    4: (
      <div className="space-y-3">
        <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
          Fill in High School (10th) and Intermediate (12th) details. Graduation and other qualifications are optional.
        </p>

        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f8fe] border-b border-slate-300 text-[13px] sm:text-[13px] font-bold text-[#082a63] uppercase tracking-wide">
                <th className="py-3 px-3.5 w-[22%]">Examination / परिक्षा</th>
                <th className="py-3 px-3.5 w-[28%]">Board / University</th>
                <th className="py-3 px-3.5 w-[13%]">Passing Year</th>
                <th className="py-3 px-3.5 w-[12%]">Total Marks</th>
                <th className="py-3 px-3.5 w-[12%]">Obtained</th>
                <th className="py-3 px-3.5 w-[13%]">Percentage %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              <EduRow label="High School (10th)" hindiLabel="हायस्कूल" required
                value={form.education.high_school}
                onChange={v => setForm(f => ({ ...f, education: { ...f.education, high_school: v } }))} />
              <EduRow label="Intermediate (12th / 10+2)" hindiLabel="इंटरमीडिएट" required
                value={form.education.intermediate}
                onChange={v => setForm(f => ({ ...f, education: { ...f.education, intermediate: v } }))} />
              <EduRow label="Graduation" hindiLabel="पदवी (ऐच्छिक)" allowCgpa
                value={form.education.graduation}
                onChange={v => setForm(f => ({ ...f, education: { ...f.education, graduation: v } }))} />
              <EduRow label="Other / Diploma" hindiLabel="हेर / डिप्लोमा" allowCgpa
                value={form.education.other}
                onChange={v => setForm(f => ({ ...f, education: { ...f.education, other: v } }))} />
            </tbody>
          </table>
        </div>

        {(errors.edu_hs_board || errors.edu_inter_board) && (
          <p className={errCls}>
            Please fill in High School and Intermediate board name and passing year.
          </p>
        )}
      </div>
    ),

    5: (
      <div className="space-y-4">
        <p className="text-[13px] text-[#3d5688]">
          Upload clear, legible document scans in JPG, PNG, or PDF format (maximum 5MB each). Passport photo and academic marksheets are mandatory.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <DocUpload
            label="Passport Size Photograph"
            required
            hint="Clear frontal photo with white/light background"
            accept="image/*"
            value={form.photo_url}
            onChange={(v) => set("photo_url", v)}
          />
          <DocUpload
            label="Candidate Signature"
            hint="Clear signature in blue/black ink on white paper"
            accept="image/*"
            value={form.signature_url}
            onChange={(v) => set("signature_url", v)}
          />
          <DocUpload
            label="Aadhaar Card"
            hint="Front and back scan (image or PDF)"
            accept="image/*,.pdf"
            value={form.aadhaar_url}
            onChange={(v) => set("aadhaar_url", v)}
          />
          <DocUpload
            label="10th High School Marksheet"
            required
            hint="Official matric certificate or mark statement"
            accept="image/*,.pdf"
            value={form.tenth_marksheet_url}
            onChange={(v) => set("tenth_marksheet_url", v)}
          />
          <DocUpload
            label="12th Intermediate Marksheet"
            required
            hint="Official 10+2 marksheet or certificate"
            accept="image/*,.pdf"
            value={form.twelfth_marksheet_url}
            onChange={(v) => set("twelfth_marksheet_url", v)}
          />
          <DocUpload
            label="Affidavit / Declaration (Optional)"
            hint="Self-declaration affidavit if applicable"
            accept="image/*,.pdf"
            value={form.affidavit_url}
            onChange={(v) => set("affidavit_url", v)}
          />
        </div>

        {(errors.photo_url || errors.tenth || errors.twelfth) && (
          <p className={errCls}>
            Please upload all mandatory documents (Passport Photo, 10th and 12th Marksheets).
          </p>
        )}
      </div>
    ),

    6: (
      <div className="space-y-5">
        {/* Candidate Dossier Card */}
        <div className="bg-white rounded-3xl border border-[#d3e1f5] shadow-xs overflow-hidden divide-y divide-[#d3e1f5]">
          {/* Header Row with Photo */}
          <div className="p-5 bg-[#f8fafc] flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {form.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photo_url}
                alt="Candidate"
                className="w-20 h-24 object-cover rounded-2xl border-2 border-[#1b57d8] shadow-sm shrink-0"
              />
            ) : (
              <div className="w-20 h-24 rounded-2xl bg-[#d3e1f5] border-2 border-dashed border-[#1b57d8] flex items-center justify-center shrink-0 text-[#1245b8]">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[13px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Board Submission
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#082a63]">
                {form.candidate_name || "Candidate Name"}
              </h3>
              <p className="text-[13px] sm:text-[15px] text-[#1245b8] font-semibold">
                {courses.find((c) => c.id === form.course_id)?.course_name || "Program not selected"}
              </p>
              <p className="text-[13px] sm:text-[15px] text-[#3d5688]">
                Session: {form.academic_session} • {college?.college_name}
              </p>
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-[13px] sm:text-[15px] font-bold uppercase tracking-wider text-[#1245b8]">
              Personal Information
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Father's Name</p>
                <p className="text-[15px] font-bold text-[#082a63] mt-0.5">{form.father_name || "—"}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Mother's Name</p>
                <p className="text-[15px] font-bold text-[#082a63] mt-0.5">{form.mother_name || "—"}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Date of Birth</p>
                <p className="text-[15px] font-bold text-[#082a63] mt-0.5">{form.dob || "—"}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Gender / Category</p>
                <p className="text-[15px] font-bold text-[#082a63] mt-0.5">{form.gender} / {form.category}</p>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-[13px] sm:text-[15px] font-bold uppercase tracking-wider text-[#1245b8]">
              Contact & Address
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Mobile Number</p>
                <p className="text-[15px] font-bold font-mono text-[#082a63] mt-0.5">{form.phone || "—"}</p>
              </div>
              <div>
                <p className="text-[13px] text-[#3d5688] font-semibold">Email Address</p>
                <p className="text-[15px] font-bold text-[#082a63] break-all mt-0.5">{form.email || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[13px] text-[#3d5688] font-semibold">Permanent Address</p>
                <p className="text-[15px] font-bold text-[#082a63] mt-0.5">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
              </div>
            </div>
          </div>

          {/* Uploaded Documents Badges */}
          <div className="p-5 sm:p-6 space-y-3">
            <p className="text-[13px] sm:text-[15px] font-bold uppercase tracking-wider text-[#1245b8]">
              Verified Dossier Documents
            </p>
            <div className="flex flex-wrap gap-2.5">
              {[
                ["Photo", form.photo_url],
                ["Signature", form.signature_url],
                ["Aadhaar Card", form.aadhaar_url],
                ["10th Marksheet", form.tenth_marksheet_url],
                ["12th Marksheet", form.twelfth_marksheet_url],
                ["Affidavit", form.affidavit_url],
              ].map(([lbl, val]) => (
                <span
                  key={lbl}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold ${
                    val
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {val ? "✓" : "✗"} {lbl}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Captcha Verification */}
        <div className="bg-white rounded-2xl border border-[#d3e1f5] shadow-xs overflow-hidden">
          <div className="bg-gradient-to-r from-[#082a63] to-[#1245b8] px-4 sm:px-5 py-3 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#1b57d8] shrink-0" />
            <span className="text-white font-bold text-[13px] sm:text-[15px] tracking-wide uppercase">
              Security Verification / सुरक्षा पडताळणी
            </span>
            <span className="text-red-400 font-bold ml-0.5">*</span>
          </div>
          <div className="p-4 sm:p-5">
            <p className="text-[13px] text-[#3d5688] mb-3">Enter the characters shown below to verify you are human / सकयल दाखयल्लो कोड नोंद करात.</p>
            <div className="flex flex-wrap items-center gap-3">
              {/* SVG Captcha Display */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="rounded-xl overflow-hidden border-2 border-[#a9bde0] shadow-sm select-none" style={{width:188, height:60}}>
                  <svg width="188" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="188" height="60" fill="#eaf2fd"/>
                    {/* noise dots */}
                    {[12,28,45,70,95,115,140,165,180].map((cx,i)=>(
                      <circle key={i} cx={cx} cy={8+i*5%50} r={1+i%2} fill={["#1245b8","#082a63","#5b78a8"][i%3]} opacity="0.25"/>
                    ))}
                    {/* noise lines */}
                    <line x1="0" y1="18" x2="188" y2="42" stroke="#1b57d8" strokeWidth="1.2" opacity="0.35"/>
                    <line x1="0" y1="50" x2="188" y2="12" stroke="#082a63" strokeWidth="0.9" opacity="0.2"/>
                    <line x1="5" y1="60" x2="183" y2="5" stroke="#1245b8" strokeWidth="0.7" opacity="0.3"/>
                    <line x1="0" y1="30" x2="188" y2="28" stroke="#5b78a8" strokeWidth="0.6" opacity="0.25"/>
                    {/* characters with rotation and y jitter */}
                    {captchaCode.split("").map((char, i) => {
                      const rotations = [-12, 8, -6, 10, -9, 7];
                      const yOffsets  = [-3, 5, -5, 3, -4, 6];
                      const colors    = ["#082a63","#6B3D00","#1245b8","#1245b8","#082a63","#3D6B00"];
                      return (
                        <text
                          key={i}
                          x={16 + i * 27}
                          y={38 + yOffsets[i]}
                          fontSize={22}
                          fontFamily="'Courier New', monospace"
                          fontWeight="900"
                          fill={colors[i]}
                          transform={`rotate(${rotations[i]}, ${16 + i * 27}, 30)`}
                          style={{letterSpacing:0}}
                        >
                          {char}
                        </text>
                      );
                    })}
                    {/* extra dots over text */}
                    {[35,80,125,160].map((cx,i)=>(
                      <circle key={"t"+i} cx={cx} cy={20+i*8} r={1.2} fill="#1245b8" opacity="0.2"/>
                    ))}
                  </svg>
                </div>
                <button type="button" onClick={regenerateCaptcha}
                  className="p-2.5 rounded-xl bg-[#f4f8fe] border border-[#d3e1f5] hover:bg-[#f4f8fe] hover:border-[#1b57d8] text-[#3d5688] hover:text-[#082a63] transition-all"
                  title="Refresh captcha">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {/* Input — fixed width */}
              <input
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={6}
                className="w-36 px-4 py-3 text-base font-mono font-bold rounded-xl border-2 border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white uppercase tracking-[6px] transition-all placeholder:tracking-normal placeholder:text-[#a9bde0] placeholder:text-[15px] placeholder:font-normal"
              />
            </div>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <label className="flex items-start gap-3 p-4 sm:p-5 bg-amber-50/80 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={declaration}
            onChange={(e) => setDeclaration(e.target.checked)}
            className="w-4 h-4 accent-[#082a63] mt-1 shrink-0 rounded"
          />
          <span className="text-[13px] text-amber-950 leading-relaxed font-medium">
            I hereby declare on behalf of the institution that all particulars provided in this student registration dossier are authentic and verified against original certificates.
            <br />
            <span className="font-bold text-[#082a63] mt-1 block font-devanagari">
              हांव प्रमाणीत करतां कीं ह्या अर्जांत दिल्लीं सगळीं म्हायती मूळ कागदपत्रांवरवीं पडताळून पळयल्ली आनी खरी आसात.
            </span>
          </span>
        </label>

        {submitError && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="space-y-5">
      {/* ── Resuming Draft Banner ── */}
      {initialDraftId && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs animate-in fade-in">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-amber-900">Resuming saved draft / सांठयल्लो मसुदो चालू आसा</p>
            <p className="text-[13px] text-amber-700 mt-0.5">
              Your progress has been loaded. Continue from Step {step}. Changes are auto-saved as you advance.
            </p>
          </div>
          {draftSaving && (
            <div className="flex items-center gap-1.5 text-[13px] text-amber-700 shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…
            </div>
          )}
        </div>
      )}

      {/* ── Guidelines Banner (standard style) ── */}
      <div className="bg-[#FFF9E6] border-l-4 border-[#1b57d8] p-4 rounded-r-xl shadow-xs">
        <h4 className="font-bold text-[#082a63] mb-1.5 flex items-center gap-2 text-[15px]">
          <AlertTriangle className="w-4 h-4 text-[#B13B1C]" />
          Important Instructions / महाविद्यालयां खातीर म्हत्वाच्यो सूचना
        </h4>
        <ul className="list-disc list-inside space-y-1 text-[13px] text-[#082a63] ml-1 leading-relaxed">
          <li>Verify candidate's personal and academic particulars with original certificates before submission.</li>
          <li>Ensure active student mobile number and email ID are provided for board notifications.</li>
          <li>Uploaded documents must be legible and in JPG/PNG/PDF format within the specified size limits.</li>
        </ul>
      </div>

      {/* ── Sleek Step Progress Indicator ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#d3e1f5] p-3 sm:p-5 shadow-xs">
        <div className="grid grid-cols-6 gap-1 sm:gap-2 items-center">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone = step > s.id;
            const isActive = step === s.id;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white shadow-xs cursor-pointer"
                      : isActive
                      ? "bg-[#082a63] text-white ring-4 ring-[#1b57d8]/25 shadow-sm"
                      : "bg-[#f4f8fe] text-[#8a97b3] border border-[#d3e1f5]"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <div className="hidden sm:block text-center">
                  <p
                    className={`text-[13px] font-bold uppercase tracking-wider leading-tight ${
                      isActive ? "text-[#082a63]" : isDone ? "text-emerald-700" : "text-[#8a97b3]"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[13px] text-[#8a97b3] leading-tight">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-[#f4f8fe] h-1.5 rounded-full overflow-hidden mt-3 sm:mt-4">
          <div
            className="h-full bg-gradient-to-r from-[#082a63] via-[#1b57d8] to-[#1245b8] transition-all duration-300"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Mobile-only step label */}
        <div className="sm:hidden flex items-center justify-between mt-2">
          <p className="text-[13px] font-bold text-[#082a63] uppercase tracking-wider">
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </p>
          <p className="text-[13px] text-[#3d5688]">{STEPS[step - 1].desc}</p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-2xl border border-[#d3e1f5] shadow-sm">
        {/* Step Card Header */}
        <div className="bg-gradient-to-r from-[#082a63] to-[#1245b8] px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between gap-2 border-b border-[#06204f] rounded-t-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full bg-[#1b57d8] text-[#06204f] font-extrabold text-[15px] flex items-center justify-center shadow-sm shrink-0">
              {step}
            </span>
            <h2 className="text-white font-bold text-[13px] sm:text-[15px] tracking-wide leading-tight">
              {step === 1 && <><span className="uppercase">Personal Details</span><span className="text-[#1b57d8]/80"> / वैयक्तिक तपशील</span></>}
              {step === 2 && <><span className="uppercase">Contact &amp; Address</span><span className="text-[#1b57d8]/80"> / संपर्क आनी पत्तो</span></>}
              {step === 3 && <><span className="uppercase">Course &amp; Session</span><span className="text-[#1b57d8]/80"> / अभ्यासक्रम तपशील</span></>}
              {step === 4 && <><span className="uppercase">Education</span><span className="text-[#1b57d8]/80"> / शैक्षणीक पात्रता</span></>}
              {step === 5 && <><span className="uppercase">Documents</span><span className="text-[#1b57d8]/80"> / दस्तावेज अपलोड</span></>}
              {step === 6 && <><span className="uppercase">Review</span><span className="text-[#1b57d8]/80"> / पुनरावलोकन आनी घोशणा</span></>}
            </h2>
          </div>
          <span className="text-[12px] font-semibold text-[#bccbe6] hidden sm:inline-block shrink-0">
            {step === 5 ? "JPG / PNG / PDF · Max 5MB" :
             step === 4 ? "10th & 12th mandatory" :
             step === 1 ? "* Fields mandatory" :
             `Step ${step} of ${STEPS.length}`}
          </span>
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 lg:p-8">{stepContent[step]}</div>

        {/* Step Card Footer / Action Buttons */}
        <div className="px-4 sm:px-6 py-4 bg-[#f4f8fe] border-t border-[#d3e1f5] flex items-center justify-between gap-2 sm:gap-3 relative rounded-b-2xl">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="px-3 sm:px-5 py-2.5 rounded-xl border border-[#d3e1f5] text-[15px] font-bold text-[#3d5688] hover:text-[#082a63] hover:bg-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="hidden xs:inline">Previous /</span>
            <span> फाटीं</span>
          </button>

          {draftSaving && (
            <span className="hidden sm:flex items-center gap-1 text-[13px] text-[#8a97b3]">
              <RefreshCw className="w-3 h-3 animate-spin" /> Saving draft…
            </span>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={next}
              className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#082a63] hover:bg-[#0b3a85] active:scale-95 text-white text-[15px] font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span className="hidden sm:inline">Save &amp; Continue /</span>
              <span>फुडें</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#1b57d8] hover:bg-[#5db0f4] active:scale-95 text-[#06204f] text-[15px] font-extrabold flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-60 shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Submitting… /</span>
                  <span>सादर जाता आसा…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Submit Registration /</span>
                  <span>नोंदणी सादर करात</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
