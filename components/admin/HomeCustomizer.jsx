"use client";

import { useEffect, useRef, useState } from "react";
import Select from "@/components/ui/Select";
import { HOME_LIMITS } from "@/lib/home-defaults";
import { ICON_OPTIONS, iconByName } from "@/lib/home-icons";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChartColumn,
  Check,
  ExternalLink,
  FileText,
  Layers,
  LayoutGrid,
  Link2,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

const SECTIONS = [
  { id: "hero", icon: Sparkles, label: "Hero banner", desc: "The big heading, text and two buttons at the top of the homepage." },
  { id: "cards", icon: LayoutGrid, label: "Quick cards", desc: "The cards right under the hero (Enrollment Card, Admit Card, Result…).", max: HOME_LIMITS.cards },
  { id: "quickLinks", icon: Link2, label: "Quick links", desc: "The Quick Links panel next to the notices. Upload a PDF or paste a link.", max: HOME_LIMITS.quickLinks },
  { id: "services", icon: Layers, label: "Services", desc: "The \"Our Services\" tiles.", max: HOME_LIMITS.services },
  { id: "syllabus", icon: FileText, label: "Syllabus PDF", desc: "The syllabus file shown on the Class X / XII programme pages, the footer, the sitemap and the homepage \"Syllabus\" tile." },
  { id: "stats", icon: ChartColumn, label: "Statistics", desc: "The numbers bar (learners, study centres…).", max: HOME_LIMITS.stats },
];

const inputCls =
  "w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 text-[15px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";

const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const savedNote = (o) => (o && o.size < o.originalSize ? ` Compressed ${fmtSize(o.originalSize)} → ${fmtSize(o.size)}.` : "");

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
};
const setAt = (arr, i, patch) => arr.map((x, k) => (k === i ? { ...x, ...patch } : x));
const removeAt = (arr, i) => arr.filter((_, k) => k !== i);

function Field({ label, hint, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">
        {label} {hint && <span className="font-medium text-[#8a9bbd]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

// a link box; "Upload" puts an uploaded PDF / image URL into it
function LinkInput({ value, onChange, upload, onUpload }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const url = await onUpload(f);
      if (url) onChange(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/page, https://… or #" maxLength={500} className={`${inputCls} min-w-0 flex-1`} />
      {upload && (
        <>
          <input ref={ref} type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
          <button type="button" onClick={() => ref.current?.click()} disabled={busy} title="Upload a PDF or image (max 5 MB)"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#b9cbe6] bg-white px-3.5 py-2.5 text-[14px] font-bold text-[#1245b8] hover:bg-[#eaf2fd] disabled:opacity-60 sm:py-0">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{busy ? "Uploading…" : "Upload"}</span>
          </button>
        </>
      )}
    </div>
  );
}

function IconPicker({ value, onChange }) {
  const Icon = iconByName(value);
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d3e1f5] bg-[#eaf2fd] text-[#1245b8]"><Icon className="h-5 w-5" /></span>
      <Select value={value} onChange={onChange} options={ICON_OPTIONS} ariaLabel="Icon" className="min-w-0 flex-1 [&>button]:h-11 [&>button]:bg-[#f4f8fe]" />
    </div>
  );
}

// a picture box: preview + upload (+ back to the original)
// frame = the shape the website crops the photo to (aspect ratio + which part stays visible)
function ImageField({ label, hint, value, defaultValue, onChange, onUpload, frame = "aspect-[5/2] object-[75%_30%]" }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const isDefault = value === defaultValue;

  async function pick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    try {
      const url = await onUpload(f);
      if (url) onChange(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#d3e1f5] bg-[#f4f8fe] p-4">
      <p className="text-[14px] font-bold text-[#3d5688]">{label}</p>
      {hint && <p className="text-[13px] text-[#6b7fa6]">{hint}</p>}
      {frame === "natural" ? (
        <div className="mx-auto mt-3 max-w-[390px] overflow-hidden rounded-xl border border-[#d3e1f5] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className="block h-auto w-full" /> : <div className="flex h-40 items-center justify-center text-[13px] text-[#8a9bbd]">No image</div>}
        </div>
      ) : (
        <div className={`mt-3 overflow-hidden rounded-xl border border-[#d3e1f5] bg-white ${frame.split(" ").find((c) => c.startsWith("aspect-"))}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" className={`h-full w-full object-cover ${frame.split(" ").find((c) => c.startsWith("object-["))}`} /> : <div className="flex h-full items-center justify-center text-[13px] text-[#8a9bbd]">No image</div>}
        </div>
      )}
      <p className="mt-1.5 text-[12.5px] text-[#6b7fa6]">{frame === "natural" ? "Shown in its own proportions (not cropped)." : "Shown cropped like this on the website."}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b57d8] px-4 py-2.5 text-[14px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60">
          {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {busy ? "Uploading…" : "Upload new image"}
        </button>
        {!isDefault && (
          <button type="button" onClick={() => onChange(defaultValue)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-3.5 py-2.5 text-[14px] font-bold text-[#3d5688] hover:bg-[#f4f8fe]">
            <RotateCcw className="h-4 w-4" /> Use original
          </button>
        )}
      </div>
    </div>
  );
}

// one row of a list with reorder / delete controls
function Row({ index, total, label, onMove, onRemove, children }) {
  return (
    <div className="rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:p-4">
      <div className="mb-2.5 flex items-start justify-between gap-2 sm:mb-3">
        <span className="flex min-w-0 flex-1 items-start gap-2">
          <span className="shrink-0 rounded-lg bg-[#eaf2fd] px-2.5 py-1 text-[12.5px] font-extrabold text-[#1245b8]">#{index + 1}</span>
          <span className="break-words pt-0.5 text-[14px] font-bold leading-snug text-[#082a63] sm:text-[14.5px]">{label || "Untitled"}</span>
        </span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up" title="Move up"
            className="rounded-lg border border-[#d3e1f5] p-1.5 text-[#3d5688] hover:bg-[#f4f8fe] disabled:opacity-30 sm:p-2"><ArrowUp className="h-4 w-4" /></button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Move down" title="Move down"
            className="rounded-lg border border-[#d3e1f5] p-1.5 text-[#3d5688] hover:bg-[#f4f8fe] disabled:opacity-30 sm:p-2"><ArrowDown className="h-4 w-4" /></button>
          <button type="button" onClick={onRemove} aria-label="Remove" title="Remove"
            className="rounded-lg border border-[#d3e1f5] p-1.5 text-[#3d5688] hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:p-2"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, disabled, children }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b9cbe6] bg-[#f4f8fe] px-4 py-3 text-[14.5px] font-bold text-[#1245b8] transition hover:border-[#1b57d8] hover:bg-[#eaf2fd] disabled:cursor-not-allowed disabled:opacity-50">
      <Plus className="h-4 w-4" /> {children}
    </button>
  );
}


// What the section will look like on the website (simplified, updates as you type)
function PreviewPane({ id, data }) {
  const box = "rounded-xl border border-[#c9daf2] bg-white shadow-sm";
  if (id === "hero") {
    return (
      <div className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#bcdcf8] via-[#d8ebfc] to-white p-5">
        {data.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover object-[75%_30%]" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/85 to-transparent" />
        <span className="mb-3 block h-[2px] w-10 bg-[#1b57d8]" />
        <h4 className="font-serif text-[24px] font-extrabold leading-[1.1] tracking-tight text-[#0b1f4d]">{data.heading || "Heading"}</h4>
        {data.text && <p className="mt-3 text-[14px] font-medium leading-relaxed text-[#0b1f4d]">{data.text}</p>}
        <div className="mt-4 flex flex-wrap gap-2.5">
          {data.primary.label && <span className="inline-flex h-9 items-center gap-1.5 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-4 text-[13px] font-semibold text-white">{data.primary.label} <ArrowRight className="h-3.5 w-3.5" /></span>}
          {data.secondary.label && <span className="inline-flex h-9 items-center rounded-md border border-[#9db7e0] bg-white/80 px-4 text-[13px] font-semibold text-[#0b1f4d]">{data.secondary.label}</span>}
        </div>
      </div>
    );
  }
  if (id === "cards") {
    return (
      <div className="space-y-2.5">
        {data.map((c, i) => {
          const Icon = iconByName(c.icon);
          return (
            <div key={i} className={`${box} flex items-center gap-3 bg-gradient-to-br from-white to-[#e6effb] p-3.5`}>
              <Icon className="h-9 w-9 shrink-0 text-[#1b57d8]" strokeWidth={1.4} />
              <div className="min-w-0 flex-1">
                <p className="break-words font-serif text-[16px] font-bold text-[#0b1f4d]">{c.title || "Title"}</p>
                {c.sub && <p className="break-words text-[12.5px] font-medium text-[#0b1f4d]/80">{c.sub}</p>}
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#082a63] text-white"><ArrowRight className="h-3 w-3" /></span>
            </div>
          );
        })}
      </div>
    );
  }
  if (id === "quickLinks") {
    return (
      <div className={`${box} overflow-hidden`}>
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-4 py-3">
          <Link2 className="h-5 w-5 text-[#082a63]" />
          <p className="font-serif text-[16px] font-bold text-[#0b1f4d]">Quick Links</p>
        </div>
        <ul className="px-4">
          {data.items.map((q, i) => (
            <li key={i} className="flex items-center gap-2.5 border-b border-dashed border-[#9db7e0] py-3 last:border-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-[#082a63]"><FileText className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1 break-words text-[13.5px] font-semibold text-[#0b1f4d]">{q.text || "Link text"}</span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#082a63] text-white"><ArrowRight className="h-3 w-3" /></span>
            </li>
          ))}
        </ul>
        {data.note && <p className="mx-4 mb-4 rounded border border-[#c9daf2] bg-[#eef4fc] px-3 py-2.5 text-[12.5px] font-medium leading-relaxed text-[#44557a]">{data.note}</p>}
      </div>
    );
  }
  if (id === "services") {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {data.map((sv, i) => {
          const Icon = iconByName(sv.icon);
          return (
            <div key={i} className={`${box} flex min-h-[96px] flex-col items-center justify-center bg-gradient-to-b from-white to-[#e4edf9] px-1.5 text-center`}>
              <Icon className="h-7 w-7 text-[#1b57d8]" strokeWidth={1.4} />
              <span className="mt-1.5 text-[12px] font-bold leading-tight text-[#0b1f4d]">{sv.label || "Name"}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (id === "stats") {
    return (
      <div className={`${box} grid grid-cols-2 gap-y-4 bg-gradient-to-r from-[#f1f6fd] to-[#e3edfa] p-4`}>
        {data.map((st, i) => {
          const Icon = iconByName(st.icon, "Users");
          return (
            <div key={i} className="flex items-center gap-2.5">
              <Icon className="h-8 w-8 shrink-0 text-[#1b57d8]" strokeWidth={1.4} />
              <div className="min-w-0 leading-tight">
                <p className="break-words font-serif text-[19px] font-bold text-[#0b1f4d]">{st.value || "—"}</p>
                <p className="break-words text-[12.5px] font-medium text-[#0b1f4d]">{st.label || "Label"}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  if (id === "syllabus") {
    return (
      <div className={`${box} flex items-center gap-3 p-4`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><FileText className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="break-words text-[15px] font-bold text-[#0b1f4d]">{data.title || "Syllabus"}</p>
          <p className="break-words text-[12.5px] text-[#4a6090]">{data.url && data.url !== "#" ? "PDF · opens in a new tab" : "No file yet"}</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function HomeCustomizer({ onShowToast }) {
  const toast = (m, t = "success") => onShowToast && onShowToast(m, t);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saved, setSaved] = useState(null); // what the website shows now
  const [draft, setDraft] = useState(null); // what is being edited
  const [defaults, setDefaults] = useState(null);
  const [customised, setCustomised] = useState({});
  const [active, setActive] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/home-content");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setSaved(data.content);
      setDraft(structuredClone(data.content));
      setDefaults(data.defaults);
      setCustomised(data.customised || {});
    } catch (e) {
      setLoadError(e.message === "Failed" ? "Could not load the homepage content." : e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setError("");
    setConfirmReset(false);
  }, [active]);

  const sec = SECTIONS.find((s) => s.id === active);
  const data = draft?.[active];
  const dirty = !!draft && JSON.stringify(draft[active]) !== JSON.stringify(saved[active]);

  const update = (next) => setDraft((d) => ({ ...d, [active]: typeof next === "function" ? next(d[active]) : next }));

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/home-content/upload", { method: "POST", body: fd });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(out.error || "Upload failed.", "error");
        return null;
      }
      toast("File uploaded." + savedNote(out) + " Remember to save your changes.");
      return out.url;
    } catch {
      toast("Network error while uploading.", "error");
      return null;
    }
  }

  async function put(payload, okMsg) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) {
        setError(out.error || "Could not save.");
        toast(out.error || "Could not save.", "error");
        return;
      }
      setSaved(out.content);
      setDraft((d) => ({ ...d, [payload.section]: structuredClone(out.content[payload.section]) }));
      setCustomised(out.customised || {});
      setConfirmReset(false);
      toast(okMsg);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const save = () => put({ section: active, data: draft[active] }, "Homepage updated.");
  const reset = () => put({ section: active, data: null }, "Section reset to the default.");
  const discard = () => {
    setDraft((d) => ({ ...d, [active]: structuredClone(saved[active]) }));
    setError("");
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d3e1f5] bg-white p-12 text-center">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#1b57d8]" />
      </div>
    );
  }
  if (loadError || !draft) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertTriangle className="mx-auto h-7 w-7 text-red-500" />
        <p className="mt-2 text-[15px] font-semibold text-red-700">{loadError || "Could not load the homepage content."}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-[#082a63] px-5 py-2.5 text-[14px] font-bold text-white">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082a63]">Home Customization</h2>
          <p className="text-[14px] text-[#3d5688] sm:text-[15px]">Change what visitors see on the homepage. Changes go live as soon as you save.</p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 py-3 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe] sm:py-2.5">
          <ExternalLink className="h-4 w-4" /> View homepage
        </a>
      </div>

      {/* section tabs */}
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((x) => {
          const Icon = x.icon;
          const on = active === x.id;
          return (
            <button key={x.id} onClick={() => setActive(x.id)} aria-current={on ? "true" : undefined}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[14px] font-bold transition sm:px-4 sm:text-[14.5px] ${
                on ? "border-[#1b57d8] bg-gradient-to-b from-[#1b57d8] to-[#1245b8] text-white shadow-md" : "border-[#d3e1f5] bg-white text-[#082a63] hover:border-[#a9bde0] hover:bg-[#f4f8fe]"
              }`}>
              <Icon className={`h-4 w-4 ${on ? "text-white" : "text-[#1245b8]"}`} />
              {x.label}
              {customised[x.id] && <span className={`h-2 w-2 rounded-full ${on ? "bg-emerald-300" : "bg-emerald-500"}`} title="Customised" />}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* editor */}
      <div className="rounded-2xl border border-[#d3e1f5] bg-white">
        <div className="flex flex-col gap-1 border-b border-[#e3edfa] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h3 className="text-[18px] font-extrabold text-[#082a63]">{sec.label}</h3>
            <p className="text-[14px] text-[#4a6090]">{sec.desc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`w-fit rounded-full px-3 py-1 text-[12.5px] font-bold ${customised[active] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {customised[active] ? "Customised" : "Default"}
            </span>
            {confirmReset ? (
              <span className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-[13.5px]">
                <span className="font-semibold text-red-700">Reset to original?</span>
                <button onClick={reset} disabled={saving} className="rounded-lg bg-red-600 px-2.5 py-1 font-bold text-white hover:bg-red-700 disabled:opacity-60">Yes</button>
                <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-red-200 bg-white px-2.5 py-1 font-bold text-[#3d5688]">No</button>
              </span>
            ) : (
              customised[active] && (
                <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d3e1f5] px-3 py-1 text-[13px] font-bold text-[#3d5688] hover:bg-[#f4f8fe]">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              )
            )}
          </div>
        </div>

        <div className="min-w-0 space-y-4 p-4 sm:p-5">
          {/* ── hero ── */}
          {active === "hero" && (
            <div className="space-y-4">
              <Field label="Heading">
                <textarea value={data.heading} rows={2} maxLength={160} onChange={(e) => update((h) => ({ ...h, heading: e.target.value.replace(/\n/g, " ") }))} className={`${inputCls} resize-none`} />
              </Field>
              <Field label="Text under the heading" hint="(optional)">
                <textarea value={data.text} rows={3} maxLength={400} onChange={(e) => update((h) => ({ ...h, text: e.target.value }))} className={`${inputCls} resize-y`} />
              </Field>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
                <ImageField label="Banner image" hint="Shown behind the heading on laptops and tablets. Wide photo, JPG / PNG / WebP, up to 5 MB."
                  value={data.image} defaultValue="/images/hero.webp" onUpload={uploadFile} onChange={(v) => update((h) => ({ ...h, image: v }))} />
                <ImageField label="Phone image" hint="Shown below the heading on phones, in the photo's own proportions (portrait 3:4 works well)." frame="natural"
                  value={data.imageMobile} defaultValue="/images/hero-mobile.webp" onUpload={uploadFile} onChange={(v) => update((h) => ({ ...h, imageMobile: v }))} />
              </div>
              <Field label="Image description" hint="(for screen readers and when the image cannot load)">
                <input value={data.imageAlt} maxLength={160} onChange={(e) => update((h) => ({ ...h, imageAlt: e.target.value }))} className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[["primary", "Button 1"], ["secondary", "Button 2"]].map(([k, title]) => (
                  <div key={k} className="min-w-0 space-y-3 rounded-2xl border border-[#d3e1f5] bg-[#f4f8fe] p-4">
                    <p className="text-[13px] font-extrabold uppercase tracking-wider text-[#4a6090]">{title}</p>
                    <Field label="Button text" hint="(leave empty to hide)">
                      <input value={data[k].label} maxLength={40} onChange={(e) => update((h) => ({ ...h, [k]: { ...h[k], label: e.target.value } }))} className={`${inputCls} bg-white`} />
                    </Field>
                    <Field label="Link">
                      <LinkInput value={data[k].href} onChange={(v) => update((h) => ({ ...h, [k]: { ...h[k], href: v } }))} upload onUpload={uploadFile} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── quick cards ── */}
          {active === "cards" && (
            <>
              {data.map((c, i) => (
                <Row key={i} index={i} total={data.length} label={c.title} onMove={(d) => update((a) => move(a, i, d))} onRemove={() => update((a) => removeAt(a, i))}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Title"><input value={c.title} maxLength={60} onChange={(e) => update((a) => setAt(a, i, { title: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Icon"><IconPicker value={c.icon} onChange={(v) => update((a) => setAt(a, i, { icon: v }))} /></Field>
                    <Field label="Short description" hint="(optional)" className="sm:col-span-2"><textarea value={c.sub} rows={2} maxLength={120} onChange={(e) => update((a) => setAt(a, i, { sub: e.target.value.split(String.fromCharCode(10)).join(" ") }))} className={`${inputCls} resize-none`} /></Field>
                    <Field label="Link" className="sm:col-span-2"><LinkInput value={c.href} onChange={(v) => update((a) => setAt(a, i, { href: v }))} upload onUpload={uploadFile} /></Field>
                  </div>
                </Row>
              ))}
              <AddButton disabled={data.length >= sec.max} onClick={() => update((a) => [...a, { title: "", sub: "", icon: "FileText", href: "#" }])}>
                Add card ({data.length}/{sec.max})
              </AddButton>
            </>
          )}

          {/* ── quick links ── */}
          {active === "quickLinks" && (
            <>
              {data.items.map((q, i) => (
                <Row key={i} index={i} total={data.items.length} label={q.text}
                  onMove={(d) => update((x) => ({ ...x, items: move(x.items, i, d) }))}
                  onRemove={() => update((x) => ({ ...x, items: removeAt(x.items, i) }))}>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <Field label="Link text"><input value={q.text} maxLength={120} placeholder="e.g. Admission Form Class X" onChange={(e) => update((x) => ({ ...x, items: setAt(x.items, i, { text: e.target.value }) }))} className={inputCls} /></Field>
                    <Field label="Link or PDF">
                      <LinkInput value={q.href} onChange={(v) => update((x) => ({ ...x, items: setAt(x.items, i, { href: v }) }))} upload onUpload={uploadFile} />
                    </Field>
                  </div>
                </Row>
              ))}
              <AddButton disabled={data.items.length >= sec.max} onClick={() => update((x) => ({ ...x, items: [...x.items, { text: "", href: "#" }] }))}>
                Add link ({data.items.length}/{sec.max})
              </AddButton>
              <Field label="Note under the links" hint="(optional, shown in a blue box)">
                <textarea value={data.note} rows={2} maxLength={300} onChange={(e) => update((x) => ({ ...x, note: e.target.value }))} className={`${inputCls} resize-y`} />
              </Field>
            </>
          )}

          {/* ── services ── */}
          {active === "services" && (
            <>
              {data.map((s, i) => (
                <Row key={i} index={i} total={data.length} label={s.label} onMove={(d) => update((a) => move(a, i, d))} onRemove={() => update((a) => removeAt(a, i))}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Name"><input value={s.label} maxLength={50} onChange={(e) => update((a) => setAt(a, i, { label: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Icon"><IconPicker value={s.icon} onChange={(v) => update((a) => setAt(a, i, { icon: v }))} /></Field>
                    <Field label="Link" className="sm:col-span-2"><LinkInput value={s.href} onChange={(v) => update((a) => setAt(a, i, { href: v }))} upload onUpload={uploadFile} /></Field>
                  </div>
                </Row>
              ))}
              <AddButton disabled={data.length >= sec.max} onClick={() => update((a) => [...a, { label: "", icon: "FileText", href: "#" }])}>
                Add service ({data.length}/{sec.max})
              </AddButton>
            </>
          )}

          {/* ── syllabus ── */}
          {active === "syllabus" && (
            <div className="space-y-4">
              <Field label="Name shown on the website">
                <input value={data.title} maxLength={80} placeholder="e.g. Syllabus 2026–27" onChange={(e) => update((x) => ({ ...x, title: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Syllabus PDF" hint="(upload a PDF, max 5 MB — or paste a link)">
                <LinkInput value={data.url} onChange={(v) => update((x) => ({ ...x, url: v }))} upload onUpload={uploadFile} />
              </Field>
              {data.url && data.url !== "#" && (
                <a href={data.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-4 py-2.5 text-[14px] font-bold text-[#1245b8] hover:bg-[#eaf2fd]">
                  <ExternalLink className="h-4 w-4" /> Open the current file
                </a>
              )}
              <p className="rounded-xl bg-[#eaf2fd] px-3.5 py-2.5 text-[13.5px] text-[#3d5688]">
                After you upload, click <b>Save changes</b>. The new PDF replaces the old one on all those pages within a minute.
              </p>
            </div>
          )}

          {/* ── stats ── */}
          {active === "stats" && (
            <>
              {data.map((s, i) => (
                <Row key={i} index={i} total={data.length} label={s.value ? `${s.value} ${s.label}` : s.label} onMove={(d) => update((a) => move(a, i, d))} onRemove={() => update((a) => removeAt(a, i))}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Field label="Number"><input value={s.value} maxLength={20} placeholder="e.g. 1,25,000+" onChange={(e) => update((a) => setAt(a, i, { value: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Label"><input value={s.label} maxLength={40} placeholder="e.g. Learners Enrolled" onChange={(e) => update((a) => setAt(a, i, { label: e.target.value }))} className={inputCls} /></Field>
                    <Field label="Icon" className="col-span-2 sm:col-span-1"><IconPicker value={s.icon} onChange={(v) => update((a) => setAt(a, i, { icon: v }))} /></Field>
                  </div>
                </Row>
              ))}
              <AddButton disabled={data.length >= sec.max} onClick={() => update((a) => [...a, { value: "", label: "", icon: "Users" }])}>
                Add statistic ({data.length}/{sec.max})
              </AddButton>
            </>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-[15px] text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> <span>{error}</span>
            </div>
          )}
        </div>

      </div>

      {/* live preview */}
      <aside className="min-w-0">
        <div className="rounded-2xl border border-[#d3e1f5] bg-white xl:sticky xl:top-4">
          <div className="border-b border-[#e3edfa] px-5 py-3.5">
            <p className="text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Preview</p>
            <p className="text-[13.5px] text-[#4a6090]">Simplified view of the {sec.label.toLowerCase()}. Updates as you type.</p>
          </div>
          <div className="bg-[#f4f8fe] p-4">
            <PreviewPane id={active} data={data} />
          </div>
        </div>
      </aside>
      </div>

      {/* save bar: only while there are unsaved changes */}
      {dirty && (
        <div className="sticky bottom-3 z-10 flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-amber-800 sm:text-[14.5px]">
            <AlertTriangle className="h-4 w-4 shrink-0" /> Unsaved changes<span className="hidden sm:inline"> in {sec.label}</span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button onClick={discard} disabled={saving} className="rounded-xl border border-[#d3e1f5] bg-white px-5 py-2.5 text-[14.5px] font-bold text-[#3d5688] hover:bg-[#f4f8fe] disabled:opacity-60">
              Discard
            </button>
            <button onClick={save} disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 py-2.5 text-[14.5px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
