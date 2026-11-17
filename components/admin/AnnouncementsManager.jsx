"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Select from "@/components/ui/Select";
import {
  Calendar,
  Check,
  Eye,
  EyeOff,
  FileText,
  Link as LinkIcon,
  Megaphone,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const CATEGORIES = ["Admission", "Examination", "Study Centres", "General"];
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));
const CAT_CHIP = {
  Admission: "bg-blue-50 text-blue-800 border-blue-200",
  Examination: "bg-violet-50 text-violet-800 border-violet-200",
  "Study Centres": "bg-amber-50 text-amber-800 border-amber-200",
  General: "bg-slate-100 text-slate-700 border-slate-200",
};

const MAX_BYTES = 5 * 1024 * 1024;
const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const savedNote = (o) => (o && o.size < o.originalSize ? ` Compressed ${fmtSize(o.originalSize)} → ${fmtSize(o.size)}.` : "");
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// only link to https:// URLs or same-site paths
const safeHref = (u) => (typeof u === "string" && (/^https:\/\//.test(u) || /^\/(?!\/)/.test(u)) ? u : null);
const isFile = (u) => /\.(pdf|jpe?g|png|webp)(\?.*)?$/i.test(u || "");

const EMPTY_FORM = { title: "", content: "", category: "General", is_published: true }; // publish is ON by default

export default function AnnouncementsManager({ announcements, setAnnouncements, loading, onReload, onShowToast }) {
  const toast = (m, t = "success") => onShowToast && onShowToast(m, t);
  const list = announcements || [];

  // ── create / edit form (one modal for both) ──
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null); // null = creating a new announcement
  const [removeAtt, setRemoveAtt] = useState(false); // editing: drop the current attachment
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // ── list controls ──
  const [filter, setFilter] = useState("all"); // all | published | draft
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");

  // ── per-row state ──
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // modal: close on Escape (unless saving) and lock the page scroll behind it
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !submitting && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, submitting]);

  const counts = useMemo(
    () => ({
      all: list.length,
      published: list.filter((a) => a.is_published).length,
      draft: list.filter((a) => !a.is_published).length,
    }),
    [list],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((a) => (filter === "all" ? true : filter === "published" ? a.is_published : !a.is_published))
      .filter((a) => (catFilter === "all" ? true : (a.category || "General") === catFilter))
      .filter((a) => !q || [a.title, a.content, a.attachment_name].some((v) => String(v || "").toLowerCase().includes(q)));
  }, [list, filter, catFilter, query]);

  function pickFile(f) {
    if (!f) return setFile(null);
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast("Only PDF or image (JPG, PNG, WebP) files are allowed.", "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (f.size > MAX_BYTES) {
      toast("File must be 5 MB or smaller.", "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFile(f);
  }

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  // every time the modal opens for a new announcement, it starts empty with "Publish" ON
  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    clearFile();
    setRemoveAtt(false);
    setOpen(true);
  }

  function startEdit(a) {
    setConfirmId(null);
    setEditId(a.id);
    setForm({
      title: a.title || "",
      content: a.content || "",
      category: CATEGORIES.includes(a.category) ? a.category : "General",
      is_published: !!a.is_published,
    });
    clearFile();
    setRemoveAtt(false);
    setOpen(true);
  }

  async function saveAnnouncement(e) {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    setSubmitting(true);
    try {
      let attachment_url = null;
      let attachment_name = null;
      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch("/api/admin/announcements/upload", { method: "POST", body: fd });
        const upData = await upRes.json().catch(() => ({}));
        setUploading(false);
        if (!upRes.ok) {
          toast(upData.error || "Upload failed.", "error");
          return;
        }
        attachment_url = upData.url;
        if (upData.size < upData.originalSize) toast(`PDF compressed ${fmtSize(upData.originalSize)} → ${fmtSize(upData.size)}.`);
        attachment_name = upData.originalName || file.name;
      }
      if (editId) {
        const body = { title, content: form.content.trim() || null, category: form.category, is_published: form.is_published };
        if (attachment_url) {
          body.attachment_url = attachment_url;
          body.attachment_name = attachment_name;
        } else if (removeAtt) {
          body.attachment_url = null;
          body.attachment_name = null;
        }
        const ok = await patch(editId, body, "Announcement updated.");
        if (ok) {
          clearFile();
          setOpen(false);
        }
        return;
      }
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, title, attachment_url, attachment_name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setAnnouncements((p) => [data.data, ...p]);
        setForm(EMPTY_FORM);
        clearFile();
        setOpen(false);
        toast(form.is_published ? "Announcement published." : "Announcement saved as draft.");
      } else {
        toast(data.error || "Could not add the announcement.", "error");
      }
    } catch {
      setUploading(false);
      toast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function patch(id, body, okMsg) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error();
      setAnnouncements((p) => p.map((a) => (a.id === id ? data.data : a)));
      if (okMsg) toast(okMsg);
      return true;
    } catch {
      toast("Could not update the announcement.", "error");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error();
      setAnnouncements((p) => p.filter((a) => a.id !== id));
      setConfirmId(null);
      toast("Announcement deleted.");
    } catch {
      toast("Could not delete the announcement.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const stat = [
    { key: "all", label: "Total", value: counts.all, icon: Megaphone, tone: "bg-[#e3edfa] text-[#1245b8]" },
    { key: "published", label: "Published", value: counts.published, icon: Eye, tone: "bg-emerald-100 text-emerald-700" },
    { key: "draft", label: "Drafts", value: counts.draft, icon: EyeOff, tone: "bg-slate-100 text-slate-600" },
  ];

  const editing = list.find((a) => a.id === editId) || null;
  const curHref = editing ? safeHref(editing.attachment_url) : null;

  const inputCls =
    "w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 text-[15px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";

  return (
    <div className="min-w-0 space-y-5">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082a63]">Announcements</h2>
          <p className="text-[14px] text-[#3d5688] sm:text-[15px]">Published announcements appear on the public Notices page and the homepage notice board.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNew}
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1b57d8] px-4 py-3 text-[14px] font-bold text-white hover:bg-[#1245b8] sm:flex-none sm:py-2.5">
            <Plus className="h-4 w-4 shrink-0" /> New announcement
          </button>
          <button onClick={onReload} disabled={loading}
            aria-label="Refresh" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#082a63] px-4 py-3 text-[14px] font-bold text-white hover:bg-[#0b3a85] disabled:opacity-60 sm:py-2.5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* stat cards (click to filter) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stat.map(({ key, label, value, icon: Icon, tone }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition hover:shadow-md sm:p-4 ${filter === key ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5]"}`}>
            <span className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${tone}`}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-2xl font-extrabold leading-none text-[#082a63]">{value}</span>
              <span className="mt-1 block text-[10.5px] font-bold uppercase tracking-normal text-[#4a6090] sm:text-[12px] sm:tracking-wider">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* create / edit modal */}
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden overscroll-contain bg-[#06204f]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && !submitting && setOpen(false)} role="dialog" aria-modal="true" aria-label={editing ? "Edit announcement" : "New announcement"}>
          <form onSubmit={saveAnnouncement}
            className="min-h-full w-full min-w-0 bg-white sm:my-auto sm:min-h-0 sm:max-w-3xl sm:rounded-3xl sm:border sm:border-[#d3e1f5] sm:shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#d3e1f5] bg-gradient-to-r from-[#e3edfa] to-white p-4 sm:static sm:rounded-t-3xl sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b57d8] text-white">{editing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}</span>
                <div>
                  <h3 className="text-[18px] font-extrabold leading-tight text-[#082a63]">{editing ? "Edit announcement" : "New announcement"}</h3>
                  <p className="text-[13px] text-[#4a6090]">{editing ? "Update the details and save your changes." : "Fill in the details below and publish it to the website."}</p>
                </div>
              </div>
              <button type="button" onClick={() => !submitting && setOpen(false)} aria-label="Close"
                className="shrink-0 rounded-lg bg-white/70 p-2 text-[#4a6090] hover:bg-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="min-w-0 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="min-w-0 space-y-4">
              <div>
                <label htmlFor="ann-title" className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Title <span className="text-red-500">*</span></label>
                <textarea id="ann-title" value={form.title} rows={2}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value.replace(/\s*\n+\s*/g, " ") }))}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  placeholder="e.g. Revised schedule for public examination" required autoFocus={!editId} maxLength={300} className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label htmlFor="ann-content" className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Details <span className="font-medium text-[#8a9bbd]">(optional)</span></label>
                <textarea id="ann-content" value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  rows={4} maxLength={5000} placeholder="Add more information for readers…" className={`${inputCls} resize-y`} />
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              <div>
                <span className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Category <span className="font-medium text-[#8a9bbd]">(shown on the Notices page)</span></span>
                <Select value={form.category} onChange={(v) => setForm((p) => ({ ...p, category: v }))} options={CATEGORY_OPTIONS} ariaLabel="Category" className="[&>button]:h-11 [&>button]:bg-[#f4f8fe] [&>button]:text-[15px]" />
              </div>

              <div>
                <span className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">Attachment <span className="font-medium text-[#8a9bbd]">(PDF or image, max 5 MB)</span></span>
                <input ref={fileRef} id="ann-file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5">
                    <FileText className="h-5 w-5 shrink-0 text-emerald-700" />
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-[14px] font-bold text-emerald-900">{file.name}</p>
                      <p className="text-[12.5px] text-emerald-700">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={clearFile} aria-label="Remove file" className="rounded-lg p-1.5 text-emerald-800 hover:bg-emerald-100"><X className="h-4 w-4" /></button>
                  </div>
                ) : editing && curHref && !removeAtt ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5">
                    {isFile(curHref) ? <Paperclip className="h-5 w-5 shrink-0 text-[#1245b8]" /> : <LinkIcon className="h-5 w-5 shrink-0 text-[#1245b8]" />}
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="break-words text-[14px] font-bold text-[#082a63]">{editing.attachment_name || (isFile(curHref) ? "Attachment" : "Link")}</p>
                      <p className="text-[12.5px] text-[#4a6090]">Current {isFile(curHref) ? "attachment" : "link"}</p>
                    </div>
                    <div className="flex w-full items-center gap-2 border-t border-[#e3edfa] pt-2 sm:w-auto sm:border-0 sm:pt-0">
                      <label htmlFor="ann-file" className="flex-1 cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-[13px] font-bold text-[#1245b8] hover:bg-[#e3edfa] sm:flex-none">Replace</label>
                      <button type="button" onClick={() => setRemoveAtt(true)} className="flex-1 rounded-lg px-2.5 py-1.5 text-[13px] font-bold text-red-600 hover:bg-red-50 sm:flex-none">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="ann-file"
                    className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#b9cbe6] bg-[#f4f8fe] px-4 py-5 text-center transition hover:border-[#1b57d8] hover:bg-[#eaf2fd]">
                    <Upload className="h-5 w-5 text-[#1245b8]" />
                    <span className="text-[14px] font-bold text-[#082a63]">Choose a file</span>
                    <span className="text-[12.5px] text-[#4a6090]">PDF, JPG, PNG or WebP</span>
                  </label>
                )}
                {editing && removeAtt && !file && (
                  <p className="mt-1.5 text-[12.5px] font-semibold text-amber-700">
                    The current attachment will be removed when you save.{" "}
                    <button type="button" onClick={() => setRemoveAtt(false)} className="font-bold underline">Undo</button>
                  </p>
                )}
              </div>
            </div>
          </div>

            </div>

            <div className="flex flex-col gap-3 border-t border-[#e3edfa] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <label className="flex cursor-pointer items-center gap-3 text-[15px] font-semibold text-[#3d5688]">
                <span className="relative inline-flex h-6 w-11 shrink-0">
                  <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.checked }))} className="peer sr-only" />
                  <span className="absolute inset-0 rounded-full bg-[#c4d3ea] transition peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-[#1b57d8]/40" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
                {editing ? "Published" : "Publish immediately"}
              </label>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button type="button" onClick={() => setOpen(false)} disabled={submitting}
                  className="rounded-xl border border-[#d3e1f5] px-5 py-3 text-[15px] font-bold text-[#3d5688] hover:bg-[#f4f8fe] disabled:opacity-60 sm:py-2.5">Cancel</button>
                <button type="submit" disabled={submitting || uploading || !form.title.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 sm:py-2.5">
                  {uploading || submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {uploading ? "Uploading…" : submitting ? (editing ? "Saving…" : "Adding…") : editing ? "Save changes" : "Add announcement"}
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body,
      )}

      {/* list controls */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6090]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search announcements…"
            className="h-10 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-9 pr-3 text-[14px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
        </div>
        <Select value={catFilter} onChange={setCatFilter} ariaLabel="Filter by category" className="sm:w-52"
          options={[{ value: "all", label: "All categories" }, ...CATEGORY_OPTIONS]} />
      </div>

      {/* list */}
      <div className="space-y-3">
        {loading && !list.length && (
          <div className="rounded-2xl border border-[#d3e1f5] bg-white p-10 text-center"><RefreshCw className="mx-auto h-6 w-6 animate-spin text-[#1b57d8]" /></div>
        )}

        {!loading && visible.length === 0 && (
          <div className="rounded-2xl border border-[#d3e1f5] bg-white px-5 py-12 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-[#a9bde0]" />
            <p className="mt-3 text-[16px] font-bold text-[#082a63]">{list.length ? "No announcements match your filters" : "No announcements yet"}</p>
            <p className="mt-1 text-[14px] text-[#4a6090]">{list.length ? "Try clearing the search or filters." : "Click “New announcement” to publish your first notice."}</p>
          </div>
        )}

        {visible.map((a) => {
          const href = safeHref(a.attachment_url);
          const busy = busyId === a.id;
          const cat = CATEGORIES.includes(a.category) ? a.category : "General";
          return (
            <div key={a.id} className={`rounded-2xl border bg-white p-4 sm:p-5 ${a.is_published ? "border-emerald-200" : "border-[#d3e1f5]"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${CAT_CHIP[cat]}`}>{cat}</span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-bold ${a.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.is_published ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {a.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="break-words text-[17px] font-bold leading-snug text-[#082a63]">{a.title}</p>
                    {a.content && <p className="mt-1 line-clamp-2 break-words text-[15px] text-[#3d5688]">{a.content}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#4a6090]"><Calendar className="h-3.5 w-3.5" /> {fmtDate(a.created_at)}</span>
                      {href && (
                        <a href={href} target="_blank" rel="noopener noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#eaf2fd] px-2.5 py-1 text-[13px] font-bold text-[#1245b8] hover:bg-[#d3e1f5]">
                          {isFile(href) ? <Paperclip className="h-3.5 w-3.5 shrink-0" /> : <LinkIcon className="h-3.5 w-3.5 shrink-0" />}
                          <span className="truncate">{a.attachment_name || (isFile(href) ? "Attachment" : "Open link")}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {confirmId === a.id ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
                        <span className="text-[14px] font-semibold text-red-700">Delete permanently?</span>
                        <button onClick={() => remove(a.id)} disabled={busy} className="rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-60">Yes, delete</button>
                        <button onClick={() => setConfirmId(null)} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[13px] font-bold text-[#3d5688]">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => patch(a.id, { is_published: !a.is_published }, a.is_published ? "Moved to drafts." : "Announcement published.")} disabled={busy}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[14px] font-bold transition disabled:opacity-60 ${a.is_published ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                          {a.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {a.is_published ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => startEdit(a)} aria-label="Edit" title="Edit"
                          className="rounded-xl border border-[#d3e1f5] p-2.5 text-[#3d5688] hover:bg-[#f4f8fe] hover:text-[#082a63]"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmId(a.id)} aria-label="Delete" title="Delete"
                          className="rounded-xl border border-[#d3e1f5] p-2.5 text-[#3d5688] hover:border-red-200 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </div>
            </div>
          );
        })}

        {visible.length > 0 && (
          <p className="px-1 text-[13.5px] font-semibold text-[#4a6090]">Showing {visible.length} of {list.length} announcement{list.length === 1 ? "" : "s"}</p>
        )}
      </div>
    </div>
  );
}
