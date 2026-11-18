"use client";

import { useState, useRef, useEffect } from "react";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
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

// Fallback list (2015-2016 up to the current one; the academic year starts in July; newest first). It is used only if
// the sessions cannot be loaded from the database (Board dashboard > Exam Management > Exam Sessions).
const FIRST_SESSION_YEAR = 2015;
function buildSessions() {
  const now = new Date();
  const current = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const list = [];
  for (let y = current; y >= FIRST_SESSION_YEAR; y--) list.push(`${y}-${y + 1}`);
  return list;
}
const SESSIONS = buildSessions();

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
  state:"Goa", pincode:"", academic_session:"2026-2027",
  // Course
  course_id:"",
  language_subject_id:"",
  // Education
  education: {
    middle:       { board:"", year:"", total:"", obtained:"", percentage:"" },
    high_school:  { board:"", year:"", total:"", obtained:"", percentage:"" },
    intermediate: { board:"", year:"", total:"", obtained:"", percentage:"" },
    graduation:   { board:"", year:"", total:"", obtained:"", percentage:"", system:"marks", cgpa:"", cgpa_scale:"10" },
    other:        { board:"", year:"", total:"", obtained:"", percentage:"", system:"marks", cgpa:"", cgpa_scale:"10" },
  },
  // Docs
  photo_url:"", signature_url:"", aadhaar_url:"",
  eighth_marksheet_url:"", tenth_marksheet_url:"", twelfth_marksheet_url:"", affidavit_url:"",
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
  "w-full px-4 py-3 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] font-medium focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all";
const inputIconCls =
  "w-full pl-10 pr-4 py-3 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] font-medium focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all";
const labelCls =
  "block text-[14px] font-bold leading-snug text-[#082a63] mb-1.5";
const errCls =
  "text-red-600 text-[13px] font-semibold mt-1 flex items-center gap-1";

function Field({ label, req, error, icon: Icon, children }) {
  return (
    <div className="flex h-full flex-col">
      <label className={labelCls}>
        {label}
        {req && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-auto">
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
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 pt-1 pb-0.5">
      <span className="text-[13px] font-extrabold uppercase tracking-wider text-[#1245b8]">{children}</span>
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
              <Select ariaLabel="CGPA scale" value={value.cgpa_scale || "10"} onChange={(v) => set("cgpa_scale", v)}
                options={[{ value: "10", label: "10" }, { value: "4", label: "4" }]} />
            </div>
          </div>
        </td>
      )}
    </tr>
  );
}

// ── Education card (phones): the same fields as EduRow, stacked with labels ─────────
function EduCard({ label, hindiLabel, required, value, onChange, error }) {
  const [obtainedError, setObtainedError] = useState("");

  const set = (k, v) => {
    const updated = { ...value, [k]: v };
    if (k === "obtained" || k === "total") {
      const obt = parseFloat(k === "obtained" ? v : updated.obtained);
      const tot = parseFloat(k === "total" ? v : updated.total);
      if (!isNaN(obt) && !isNaN(tot) && tot > 0) {
        if (obt > tot) { setObtainedError("Obtained cannot exceed total"); onChange(updated); return; }
        setObtainedError("");
        updated.percentage = ((obt / tot) * 100).toFixed(2);
      } else { setObtainedError(""); }
    }
    onChange(updated);
  };

  const inp = "w-full h-12 px-3.5 text-[15px] rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] text-[#082a63] placeholder-[#8a97b3] font-medium focus:outline-none focus:ring-4 focus:ring-[#1b57d8]/15 focus:border-[#1b57d8] focus:bg-white transition-all";
  const lbl = "mb-1.5 block text-[13px] font-bold text-[#082a63]";

  return (
    <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4 space-y-3.5">
      <div>
        <p className="text-[16px] font-bold text-[#082a63]">{label}{required && <span className="ml-1 text-red-500">*</span>}</p>
        <p className="text-[13.5px] text-slate-500">{hindiLabel}</p>
      </div>

      <div>
        <label className={lbl}>School / Board / University</label>
        <input value={value.board} onChange={(e) => set("board", e.target.value)} placeholder="e.g. CBSE / Goa Board / School name" className={inp} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Passing year</label>
          <input value={value.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, ""))} placeholder="YYYY" maxLength={4} inputMode="numeric" className={inp} />
        </div>
        <div>
          <label className={lbl}>Percentage %</label>
          <input value={value.percentage} onChange={(e) => set("percentage", e.target.value)} placeholder="%" type="number" step="0.01" inputMode="decimal" className={inp + " bg-[#eaf2fd] font-semibold"} />
        </div>
        <div>
          <label className={lbl}>Total marks</label>
          <input value={value.total} onChange={(e) => set("total", e.target.value)} placeholder="Total" type="number" min={0} inputMode="numeric" className={inp} />
        </div>
        <div>
          <label className={lbl}>Marks obtained</label>
          <input value={value.obtained} onChange={(e) => set("obtained", e.target.value)} placeholder="Obtained" type="number" min={0} inputMode="numeric"
            className={inp + (obtainedError ? " !border-red-400" : "")} />
        </div>
      </div>
      {obtainedError && <p className="text-[13px] font-semibold text-red-600">{obtainedError}</p>}
    </div>
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
  // language options of the selected course (English and the other subjects are compulsory)
  const languageOptions = courses.find((c) => c.id === form.course_id)?.language_options || [];
  // Class X: 8th class details + 8th marksheet. Class XII: 10th class details + 10th marksheet.
  const chosenCourseName = courses.find((c) => c.id === form.course_id)?.course_name || "";
  const isXII = /\bXII\b|senior\s*secondary/i.test(chosenCourseName);
  // academic sessions come from the database; the built-in list above is only the fallback
  const [sessionList, setSessionList] = useState(SESSIONS);
  useEffect(() => {
    let alive = true;
    fetch("/api/college/sessions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d?.ok || !Array.isArray(d.sessions) || d.sessions.length === 0) return;
        setSessionList(d.sessions);
        // a brand-new form starts on the session the Board marked Active
        if (!initialData?.form?.academic_session && d.active) {
          setForm((f) => (f.academic_session === blank.academic_session ? { ...f, academic_session: d.active } : f));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);

  // DB draft state
  const [activeDraftId, setActiveDraftId] = useState(initialDraftId);
  const [draftSaving, setDraftSaving]     = useState(false);

  // Create the DB draft lazily, on the first autosave
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

  // Autosave to DB whenever the step advances
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
  }, [activeDraftId, form, step]);

  // ── Validation per step ──────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.candidate_name.trim()) e.candidate_name = "Candidate name is required";
      if (!form.father_name.trim())   e.father_name    = "Father's name is required";
      if (!form.dob)                  e.dob            = "Date of birth is required";
    }
    if (s === 2) {
      // mobile number and e-mail are optional, but must be valid when given
      if (form.phone.trim() && !/^[6-9]\d{9}$/.test(form.phone.trim()))
        e.phone = "Enter a valid 10-digit mobile number (starts with 6-9)";
      if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim()))
        e.email = "Enter a valid email address";
      if (!form.address.trim()) e.address = "Complete address is required";
      if (!form.state.trim())   e.state   = "State is required";
      if (form.pincode && !/^\d{6}$/.test(form.pincode))
        e.pincode = "Enter a valid 6-digit PIN code";
    }
    if (s === 3) {
      if (!form.course_id) e.course_id = "Please select an approved course";
      else if (languageOptions.length > 0 && !form.language_subject_id) e.language_subject_id = "Please choose a language option";
    }
    if (s === 4) {
      // the qualification the student already has: 10th for Class XII, 8th for Class X
      const prev = isXII ? form.education.high_school : form.education.middle;
      if (!prev?.board) e["edu_prev_board"] = isXII ? "High school board required" : "School / board required";
      if (!prev?.year)  e["edu_prev_year"]  = "Passing year required";
    }
    if (s === 5) {
      if (!form.photo_url)     e.photo_url     = "Passport size photograph required";
      if (!form.signature_url) e.signature_url = "Candidate signature required";
      if (!form.aadhaar_url)   e.aadhaar_url   = "Aadhaar card required";
      if (isXII ? !form.tenth_marksheet_url : !form.eighth_marksheet_url) e.edu_doc = isXII ? "10th marksheet required" : "8th marksheet required";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    const nextStep = Math.min(step + 1, 6);
    setStep(nextStep);
    autosaveDraft(form, nextStep);
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
            <DatePicker
              variant="form"
              withIcon
              ariaLabel="Date of birth"
              value={form.dob}
              onChange={(v) => set("dob", v)}
              min="1940-01-01"
              max={new Date().toISOString().slice(0, 10)}
              invalid={Boolean(errors.dob)}
            />
          </Field>

          <Field label="Gender / लिंग" icon={User}>
            <Select
              variant="form"
              withIcon
              ariaLabel="Gender"
              value={form.gender}
              onChange={(v) => set("gender", v)}
              options={["Male / दादलो", "Female / बायल", "Other / हेर"].map((g) => ({ value: g.split(" /")[0], label: g }))}
            />
          </Field>

          <Field label="Category / Reservation / आरक्षण वर्ग" icon={BadgeCheck}>
            <Select
              variant="form"
              withIcon
              ariaLabel="Category"
              value={form.category}
              onChange={(v) => set("category", v)}
              options={["General / सर्वसादारण", "OBC / हेर मागासवर्गीय", "SC / अनुसूचित जात", "ST / अनुसूचित जमात", "EWS / आर्थिक दृष्ट्या दुबळो"].map((c) => ({ value: c.split(" /")[0], label: c }))}
            />
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
          <Field label="Mobile Number / मोबाइल क्रमांक (Optional)" error={errors.phone}>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="10-digit candidate mobile number"
              maxLength={10}
              className={inputCls}
            />
          </Field>

          <Field label="Email Address / ईमेल पत्तो (Optional)" error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="candidate@email.com"
              className={inputCls}
            />
          </Field>

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
            <Select
              variant="form"
              invalid={Boolean(errors.state)}
              ariaLabel="State"
              value={form.state}
              onChange={(v) => set("state", v)}
              options={INDIAN_STATES.map((st) => ({ value: st, label: st }))}
            />
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
            <Select
              variant="form"
              ariaLabel="Academic session"
              value={form.academic_session}
              onChange={(v) => set("academic_session", v)}
              options={(sessionList.includes(form.academic_session) || !form.academic_session ? sessionList : [form.academic_session, ...sessionList]).map((se) => ({ value: se, label: se }))}
            />
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
              onChange={(id) => { set("course_id", id); set("language_subject_id", ""); }}
              error={errors.course_id}
            />
          </Field>

          {languageOptions.length > 0 && (
            <Field label="Language option / भास निवड (choose one)" req error={errors.language_subject_id}>
              <Select
                variant="form"
                invalid={Boolean(errors.language_subject_id)}
                ariaLabel="Language option"
                placeholder="Select a language"
                value={form.language_subject_id}
                onChange={(v) => set("language_subject_id", v)}
                options={languageOptions.map((l) => ({ value: l.id, label: l.code ? `${l.name} (${l.code})` : l.name }))}
              />
              <p className="mt-1.5 text-[13px] text-[#3d5688]">English is compulsory. The student studies English and the one language chosen here.</p>
            </Field>
          )}

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
          {isXII
            ? "Fill in the High School (10th) details."
            : "Fill in the Middle School (8th class) details."}
        </p>

        {/* phones: a stacked card */}
        <div className="sm:hidden">
          {isXII ? (
            <EduCard label="High School (10th)" hindiLabel="हायस्कूल (10वी)" required
              value={form.education.high_school}
              onChange={v => setForm(f => ({ ...f, education: { ...f.education, high_school: v } }))} />
          ) : (
            <EduCard label="Middle School (8th)" hindiLabel="मिडल स्कूल (8वी)" required
              value={form.education.middle || blank.education.middle}
              onChange={v => setForm(f => ({ ...f, education: { ...f.education, middle: v } }))} />
          )}
        </div>

        {/* tablet / desktop: the table */}
        <div className="hidden overflow-x-auto rounded-md border border-slate-200 sm:block">
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
              {isXII ? (
                <EduRow label="High School (10th)" hindiLabel="हायस्कूल (10वी)" required
                  value={form.education.high_school}
                  onChange={v => setForm(f => ({ ...f, education: { ...f.education, high_school: v } }))} />
              ) : (
                <EduRow label="Middle School (8th)" hindiLabel="मिडल स्कूल (8वी)" required
                  value={form.education.middle || blank.education.middle}
                  onChange={v => setForm(f => ({ ...f, education: { ...f.education, middle: v } }))} />
              )}
            </tbody>
          </table>
        </div>

        {(errors.edu_prev_board || errors.edu_prev_year) && (
          <p className={errCls}>
            {isXII ? "Please fill in the High School (10th) board name and passing year." : "Please fill in the Middle School (8th) name / board and passing year."}
          </p>
        )}
      </div>
    ),

    5: (
      <div className="space-y-4">
        <p className="text-[13px] text-[#3d5688]">
          Upload clear, legible document scans in JPG, PNG, or PDF format (maximum 5MB each). Passport photo, signature, Aadhaar card and the {isXII ? "10th" : "8th"} marksheet are mandatory.
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
            required
            hint="Clear signature in blue/black ink on white paper"
            accept="image/*"
            value={form.signature_url}
            onChange={(v) => set("signature_url", v)}
          />
          <DocUpload
            label="Aadhaar Card"
            required
            hint="Front and back scan (image or PDF)"
            accept="image/*,.pdf"
            value={form.aadhaar_url}
            onChange={(v) => set("aadhaar_url", v)}
          />
          {isXII ? (
            <DocUpload
              label="10th Marksheet"
              required
              hint="Official 10th marksheet or certificate"
              accept="image/*,.pdf"
              value={form.tenth_marksheet_url}
              onChange={(v) => set("tenth_marksheet_url", v)}
            />
          ) : (
            <DocUpload
              label="8th Marksheet"
              required
              hint="Official 8th class marksheet or certificate"
              accept="image/*,.pdf"
              value={form.eighth_marksheet_url}
              onChange={(v) => set("eighth_marksheet_url", v)}
            />
          )}
          <DocUpload
            label="Affidavit / Declaration (Optional)"
            hint="Self-declaration affidavit if applicable"
            accept="image/*,.pdf"
            value={form.affidavit_url}
            onChange={(v) => set("affidavit_url", v)}
          />
        </div>

        {(errors.photo_url || errors.signature_url || errors.aadhaar_url || errors.edu_doc) && (
          <p className={errCls}>
            Please upload all mandatory documents (Passport Photo, Signature, Aadhaar Card and the {isXII ? "10th" : "8th"} Marksheet).
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
                {languageOptions.length > 0 && <> • Language: {languageOptions.find((l) => l.id === form.language_subject_id)?.name || "not chosen"}</>}
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
                isXII ? ["10th Marksheet", form.tenth_marksheet_url] : ["8th Marksheet", form.eighth_marksheet_url],
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
      <div className="rounded-2xl border border-amber-200 bg-[#FFF9E6] p-4 sm:p-5 shadow-xs">
        <h4 className="mb-2 flex items-center gap-2.5 text-[15.5px] font-bold text-[#082a63]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle className="w-4 h-4" />
          </span>
          Important Instructions / महाविद्यालयां खातीर म्हत्वाच्यो सूचना
        </h4>
        <ul className="ml-1 list-inside list-disc space-y-1.5 text-[14px] leading-relaxed text-[#082a63] marker:text-amber-600">
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
            <span className="w-8 h-8 rounded-full bg-white/15 ring-1 ring-white/30 text-white font-extrabold text-[15px] flex items-center justify-center shrink-0">
              {step}
            </span>
            <h2 className="text-white font-bold text-[15px] sm:text-[16px] leading-tight">
              {step === 1 && <><span>Personal Details</span><span className="font-semibold text-[#bcd8fb]"> / वैयक्तिक तपशील</span></>}
              {step === 2 && <><span>Contact &amp; Address</span><span className="font-semibold text-[#bcd8fb]"> / संपर्क आनी पत्तो</span></>}
              {step === 3 && <><span>Course &amp; Session</span><span className="font-semibold text-[#bcd8fb]"> / अभ्यासक्रम तपशील</span></>}
              {step === 4 && <><span>Education</span><span className="font-semibold text-[#bcd8fb]"> / शैक्षणीक पात्रता</span></>}
              {step === 5 && <><span>Documents</span><span className="font-semibold text-[#bcd8fb]"> / दस्तावेज अपलोड</span></>}
              {step === 6 && <><span>Review</span><span className="font-semibold text-[#bcd8fb]"> / पुनरावलोकन आनी घोशणा</span></>}
            </h2>
          </div>
          <span className="text-[13px] font-semibold text-[#d3e1f5] hidden sm:inline-block shrink-0">
            {step === 5 ? "JPG / PNG / PDF · Max 5MB" :
             step === 4 ? (isXII ? "10th details mandatory" : "8th details mandatory") :
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
            className="px-3 sm:px-5 py-3 rounded-xl border border-[#d3e1f5] text-[15px] font-bold text-[#3d5688] hover:text-[#082a63] hover:bg-white disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Previous</span>
            <span className="hidden sm:inline"> / फाटीं</span>
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
              className="px-4 sm:px-6 py-3 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] active:scale-95 text-white text-[15px] font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm cursor-pointer"
            >
              <span className="sm:hidden">Next</span>
              <span className="hidden sm:inline">Save &amp; Continue / फुडें</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#1b57d8] hover:bg-[#1245b8] active:scale-95 text-white text-[15px] font-extrabold flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-60 shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>Submitting…</span>
                  <span className="hidden sm:inline"> / सादर जाता आसा…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">Submit</span>
                  <span className="hidden sm:inline">Submit Registration / नोंदणी सादर करात</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
