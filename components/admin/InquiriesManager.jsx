"use client";

import { useEffect, useMemo, useState } from "react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Inbox,
  Mail,
  MailOpen,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

const STATUS = {
  new: { label: "New", chip: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500", icon: Inbox },
  in_progress: { label: "In Progress", chip: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500", icon: Clock },
  resolved: { label: "Resolved", chip: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500", icon: CheckCircle2 },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const fullDate = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const nameOf = (i) => i.full_name || i.name || "Anonymous";
const digitsOf = (p) => String(p || "").replace(/\D/g, "").replace(/^0+/, "");
const waLink = (p) => {
  const d = digitsOf(p);
  if (d.length < 10) return null;
  return `https://wa.me/${d.length === 10 ? "91" + d : d}`;
};
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

function StatusChip({ status }) {
  const s = STATUS[status] || STATUS.new;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-bold ${s.chip}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
    {s.label}
  </span>;
}

export default function InquiriesManager({ inquiries, setInquiries, loading, onReload, onShowToast }) {
  const [filter, setFilter] = useState("all");
  const [subject, setSubject] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toast = (m, t = "success") => onShowToast && onShowToast(m, t);
  const list = inquiries || [];

  const counts = useMemo(
    () => ({
      all: list.length,
      new: list.filter((i) => (i.status || "new") === "new").length,
      in_progress: list.filter((i) => i.status === "in_progress").length,
      resolved: list.filter((i) => i.status === "resolved").length,
      unread: list.filter((i) => !i.is_read).length,
    }),
    [list],
  );
  const subjects = useMemo(() => [...new Set(list.map((i) => i.subject || i.query_type).filter(Boolean))], [list]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((i) => (filter === "all" ? true : (i.status || "new") === filter))
      .filter((i) => (subject === "all" ? true : (i.subject || i.query_type) === subject))
      .filter((i) => (unreadOnly ? !i.is_read : true))
      .filter(
        (i) =>
          !q ||
          [nameOf(i), i.email, i.phone, i.subject, i.message].some((v) => String(v || "").toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const d = new Date(b.created_at) - new Date(a.created_at);
        return sort === "newest" ? d : -d;
      });
  }, [list, filter, subject, unreadOnly, query, sort]);

  const selected = list.find((i) => i.id === selectedId) || null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  async function patch(id, body, okMsg) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setInquiries((p) => p.map((i) => (i.id === id ? data.data : i)));
      if (okMsg) toast(okMsg);
      return true;
    } catch {
      toast("Could not update the inquiry.", "error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function open(i) {
    setSelectedId(i.id);
    setNotes(i.admin_notes || "");
    setConfirmDelete(false);
    if (!i.is_read) {
      // opening a lead marks it as read
      setInquiries((p) => p.map((x) => (x.id === i.id ? { ...x, is_read: true } : x)));
      fetch(`/api/admin/inquiries/${i.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      }).catch(() => {});
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setInquiries((p) => p.filter((i) => i.id !== id));
      setSelectedId(null);
      setConfirmDelete(false);
      toast("Inquiry deleted.");
    } catch {
      toast("Could not delete the inquiry.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes() {
    if (!selected) return;
    setSavingNotes(true);
    await patch(selected.id, { admin_notes: notes }, "Notes saved.");
    setSavingNotes(false);
  }

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copied.`);
    } catch {
      toast("Copy failed.", "error");
    }
  }

  function exportCsv() {
    const rows = [["Date", "Name", "Phone", "Email", "Subject", "Status", "Message", "Admin notes"]].concat(
      visible.map((i) => [fullDate(i.created_at), nameOf(i), i.phone, i.email, i.subject || i.query_type, STATUS[i.status || "new"]?.label, i.message, i.admin_notes]),
    );
    const blob = new Blob(["﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contact-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const stat = [
    { key: "all", label: "Total inquiries", value: counts.all, icon: Inbox, tone: "bg-[#e3edfa] text-[#1245b8]" },
    { key: "new", label: "New", value: counts.new, icon: MailOpen, tone: "bg-blue-100 text-blue-700" },
    { key: "in_progress", label: "In progress", value: counts.in_progress, icon: Clock, tone: "bg-amber-100 text-amber-700" },
    { key: "resolved", label: "Resolved", value: counts.resolved, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082a63]">Contact Inquiries</h2>
          <p className="text-[14px] text-[#3d5688]">Leads from the website Contact form. Reply by call, WhatsApp or email and track each one to resolution.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} disabled={!visible.length}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 py-2 text-[13px] font-bold text-[#082a63] hover:bg-[#f4f8fe] disabled:opacity-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={onReload} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#082a63] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#0b3a85]">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* stat cards (click to filter) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stat.map(({ key, label, value, icon: Icon, tone }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${filter === key ? "border-[#1b57d8] ring-2 ring-[#1b57d8]/15" : "border-[#d3e1f5]"}`}>
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block text-2xl font-extrabold leading-none text-[#082a63]">{value}</span>
              <span className="mt-1 block text-[12px] font-bold uppercase tracking-wider text-[#4a6090]">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6090]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, email or message…"
            className="h-10 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] pl-9 pr-3 text-[14px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
        </div>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className="h-10 rounded-xl border border-[#d3e1f5] bg-white px-3 text-[14px] font-semibold text-[#082a63] outline-none focus:border-[#1b57d8]">
          <option value="all">All subjects</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-xl border border-[#d3e1f5] bg-white px-3 text-[14px] font-semibold text-[#082a63] outline-none focus:border-[#1b57d8]">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <button onClick={() => setUnreadOnly((v) => !v)}
          className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-[14px] font-bold transition ${unreadOnly ? "border-[#1b57d8] bg-[#1b57d8] text-white" : "border-[#d3e1f5] bg-white text-[#082a63] hover:bg-[#f4f8fe]"}`}>
          <MailOpen className="h-4 w-4" /> Unread{counts.unread ? ` (${counts.unread})` : ""}
        </button>
      </div>

      {/* inbox */}
      <div>
        {/* table */}
        <div className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[14px]">
              <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe] text-[12px] font-bold uppercase tracking-wider text-[#082a63]">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Subject</th>
                  <th className="px-4 py-3.5">Message</th>
                  <th className="px-4 py-3.5">Received</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3edfa]">
                {loading && !list.length ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-[#3d5688]">Loading…</td></tr>
                ) : visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <Inbox className="mx-auto h-10 w-10 text-[#a9bde0]" />
                      <p className="mt-3 text-[15px] font-bold text-[#082a63]">{list.length ? "No inquiries match your filters" : "No inquiries yet"}</p>
                      <p className="mt-1 text-[13px] text-[#4a6090]">{list.length ? "Try clearing the search or filters." : "Messages sent from the website Contact page will appear here."}</p>
                    </td>
                  </tr>
                ) : (
                  visible.map((i, idx) => (
                    <tr key={i.id} onClick={() => open(i)}
                      className={`cursor-pointer transition-colors hover:bg-[#f4f8fe] ${!i.is_read ? "bg-[#f7faff]" : ""}`}>
                      <td className="px-5 py-3.5 font-semibold text-[#4a6090]">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {!i.is_read ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#1b57d8]" title="Unread" /> : <span className="h-2 w-2 shrink-0" />}
                          <span className={`text-[#082a63] ${i.is_read ? "font-semibold" : "font-extrabold"}`}>{nameOf(i)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-[#082a63]">{i.phone || "—"}</div>
                        {i.email && <div className="max-w-[200px] truncate text-[13px] text-[#4a6090]">{i.email}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        {(i.subject || i.query_type) ? (
                          <span className="whitespace-nowrap rounded-md bg-[#eaf2fd] px-2 py-0.5 text-[12px] font-bold text-[#1245b8]">{i.subject || i.query_type}</span>
                        ) : "—"}
                      </td>
                      <td className="max-w-[280px] px-4 py-3.5 text-[#374151]"><span className="line-clamp-2">{i.message}</span></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-[#4a6090]" title={fullDate(i.created_at)}>{timeAgo(i.created_at)}</td>
                      <td className="px-4 py-3.5"><StatusChip status={i.status || "new"} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={(e) => { e.stopPropagation(); open(i); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#082a63] px-3.5 py-1.5 text-[13px] font-bold text-white hover:bg-[#0b3a85]">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {visible.length > 0 && (
            <div className="border-t border-[#e3edfa] bg-[#f4f8fe] px-5 py-3 text-[13px] font-semibold text-[#4a6090]">
              Showing {visible.length} of {list.length} inquir{list.length === 1 ? "y" : "ies"}
            </div>
          )}
        </div>

        {/* detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#06204f]/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
            onMouseDown={(e) => e.target === e.currentTarget && setSelectedId(null)} role="dialog" aria-modal="true" aria-label="Inquiry details">
            <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-[#d3e1f5] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-[#d3e1f5] bg-gradient-to-r from-[#e3edfa] to-white p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#082a63] text-lg font-extrabold text-white">
                    {nameOf(selected).trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-[18px] font-extrabold text-[#082a63]">{nameOf(selected)}</h3>
                    <p className="text-[13px] text-[#4a6090]">Received {fullDate(selected.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="rounded-lg p-1.5 text-[#4a6090] hover:bg-white" aria-label="Close"><X className="h-5 w-5" /></button>
              </div>

              <div className="space-y-5 p-5">
                {/* quick actions */}
                <div className="flex flex-wrap gap-2">
                  {selected.phone && (
                    <a href={`tel:${selected.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#082a63] px-4 py-2 text-[14px] font-bold text-white hover:bg-[#0b3a85]">
                      <Phone className="h-4 w-4" /> Call
                    </a>
                  )}
                  {waLink(selected.phone) && (
                    <a href={waLink(selected.phone)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-[14px] font-bold text-white hover:bg-emerald-700">
                      <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent("Re: " + (selected.subject || "Your enquiry to Goa Open School"))}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#b9cbe6] bg-white px-4 py-2 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                      <Mail className="h-4 w-4" /> Email
                    </a>
                  )}
                </div>

                {/* contact details */}
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Phone", selected.phone],
                    ["Email", selected.email],
                    ["Subject", selected.subject || selected.query_type],
                    ["Last updated", fullDate(selected.updated_at || selected.created_at)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[#e3edfa] bg-[#f4f8fe] px-3.5 py-2.5">
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-[#4a6090]">{k}</dt>
                      <dd className="mt-0.5 flex items-center justify-between gap-2 break-all text-[14px] font-semibold text-[#082a63]">
                        <span>{v || "—"}</span>
                        {v && (k === "Phone" || k === "Email") && (
                          <button onClick={() => copy(v, k)} className="shrink-0 rounded p-1 text-[#4a6090] hover:bg-white hover:text-[#082a63]" aria-label={`Copy ${k}`}>
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* message */}
                <div>
                  <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-[#4a6090]">Message</p>
                  <p className="whitespace-pre-wrap rounded-xl border border-[#d3e1f5] bg-white p-4 text-[15px] leading-relaxed text-[#1f2937]">{selected.message}</p>
                </div>

                {/* status */}
                <div>
                  <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-[#4a6090]">Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(STATUS).map(([key, s]) => {
                      const active = (selected.status || "new") === key;
                      const Icon = s.icon;
                      return (
                        <button key={key} disabled={busy} onClick={() => !active && patch(selected.id, { status: key }, `Marked as ${s.label}.`)}
                          className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[13px] font-bold transition ${active ? s.chip + " ring-2 ring-offset-1 ring-current/20" : "border-[#d3e1f5] bg-white text-[#3d5688] hover:bg-[#f4f8fe]"}`}>
                          {active ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />} {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* notes */}
                <div>
                  <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-[#4a6090]">Internal notes</p>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={2000}
                    placeholder="e.g. Called on 17 Nov, will visit the office on Monday…"
                    className="w-full resize-none rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] p-3 text-[14px] text-[#082a63] outline-none focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15" />
                  <div className="mt-2 flex justify-end">
                    <button onClick={saveNotes} disabled={savingNotes || notes === (selected.admin_notes || "")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#1b57d8] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-50">
                      {savingNotes ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save notes
                    </button>
                  </div>
                </div>

                {/* footer actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3edfa] pt-4">
                  <button disabled={busy} onClick={() => patch(selected.id, { is_read: false }, "Marked as unread.").then(() => setSelectedId(null))}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#3d5688] hover:text-[#082a63]">
                    <MailOpen className="h-4 w-4" /> Mark as unread
                  </button>
                  {confirmDelete ? (
                    <span className="inline-flex items-center gap-2 text-[13px]">
                      <span className="font-semibold text-red-700">Delete permanently?</span>
                      <button disabled={busy} onClick={() => remove(selected.id)} className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700">Yes, delete</button>
                      <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-[#d3e1f5] px-3 py-1.5 font-bold text-[#3d5688]">Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
