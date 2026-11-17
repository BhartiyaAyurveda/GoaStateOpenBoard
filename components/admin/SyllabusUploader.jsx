"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ExternalLink, FileText, RefreshCw, Upload } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const savedNote = (o) => (o && o.size < o.originalSize ? ` Compressed ${fmtSize(o.originalSize)} → ${fmtSize(o.size)}.` : "");

// Upload / replace the syllabus PDF. One click uploads the file AND saves it, so the new PDF is
// live on the Programme pages, footer, sitemap and the homepage "Syllabus" tile within a minute.
export default function SyllabusUploader({ onShowToast }) {
  const toast = (m, t = "success") => onShowToast && onShowToast(m, t);
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null); // { title, url } as saved
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    fetch("/api/admin/home-content")
      .then((r) => r.json())
      .then((d) => {
        if (off || !d.ok) return;
        setCurrent(d.content.syllabus);
        setTitle(d.content.syllabus.title);
      })
      .catch(() => {})
      .finally(() => !off && setLoading(false));
    return () => {
      off = true;
    };
  }, []);

  async function save(url, name) {
    const res = await fetch("/api/admin/home-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "syllabus", data: { title: name, url } }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error(out.error || "Could not save.");
    setCurrent(out.content.syllabus);
    setTitle(out.content.syllabus.title);
  }

  async function onPick(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    if (f.type !== "application/pdf") return setError("Please choose a PDF file.");
    if (f.size > MAX_BYTES) return setError("The PDF must be 5 MB or smaller.");
    const name = title.trim();
    if (!name) return setError("Enter a name for the syllabus first (e.g. Syllabus 2026–27).");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const up = await fetch("/api/admin/home-content/upload", { method: "POST", body: fd });
      const upOut = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(upOut.error || "Upload failed.");
      await save(upOut.url, name);
      toast("Syllabus PDF uploaded." + savedNote(upOut) + " It is now live on the website.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      toast(err.message || "Upload failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function saveName() {
    if (!current || !title.trim() || title.trim() === current.title) return;
    setBusy(true);
    setError("");
    try {
      await save(current.url, title.trim());
      toast("Syllabus name updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isDefaultFile = current?.url?.startsWith("/downloads/");

  return (
    <div className="rounded-2xl border border-[#d3e1f5] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><FileText className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h3 className="text-[17px] font-extrabold text-[#082a63]">Syllabus PDF</h3>
            <p className="text-[14px] text-[#4a6090]">
              Shown on the Class X / XII programme pages, the footer, the sitemap and the homepage &quot;Syllabus&quot; tile.
            </p>
            {loading ? (
              <p className="mt-2 text-[14px] text-[#4a6090]">Loading…</p>
            ) : current ? (
              <a href={current.url} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#eaf2fd] px-2.5 py-1 text-[13.5px] font-bold text-[#1245b8] hover:bg-[#d3e1f5]">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Open current file <span className="hidden sm:inline">({isDefaultFile ? "original" : "uploaded"})</span></span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:min-w-[460px]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveName}
            maxLength={80}
            placeholder="Name, e.g. Syllabus 2026–27"
            aria-label="Syllabus name"
            disabled={loading || busy}
            className="min-w-0 flex-1 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-2.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a9bbd] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15 disabled:opacity-60"
          />
          <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={onPick} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={loading || busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-5 py-3 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60 sm:py-2.5">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {busy ? "Uploading…" : "Upload new PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-[14.5px] text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {!error && !loading && current && !isDefaultFile && (
        <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-semibold text-emerald-700"><Check className="h-4 w-4" /> Live: {current.title}</p>
      )}
    </div>
  );
}
