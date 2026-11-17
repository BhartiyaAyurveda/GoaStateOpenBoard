"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  X,
  MapPin,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";

const STATES = ["Goa", "Maharashtra", "Karnataka", "Kerala", "Tamil Nadu", "Gujarat", "Delhi", "Other"];

const fieldCls =
  "h-11 w-full min-w-0 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";
const labelCls = "mb-1.5 block text-[13.5px] font-bold text-[#082a63]";

const EMPTY_FORM = {
  code: "", name: "", address: "",
  city: "", state: "Goa", type: "", phone: "", email: "", website: "",
  sort_order: 0, show_on_website: true,
};

export default function InstituteManager({ onShowToast }) {
  const [institutes, setInstitutes]     = useState([]);
  const [loading, setLoading]           = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [editingItem, setEditingItem]       = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting]         = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const loadInstitutes = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/affiliated-institutes");
      const data = await res.json();
      if (data.ok) setInstitutes(data.data || []);
      else if (onShowToast) onShowToast(data.error || "Failed to load institutes", "error");
    } catch {
      if (onShowToast) onShowToast("Network error loading institutes", "error");
    }
    setLoading(false);
  };

  useEffect(() => { loadInstitutes(); }, []);

  useEffect(() => {
    if (!deleteConfirmId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [deleteConfirmId]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code:       item.code       || "",
        name:       item.name       || "",
        address:    item.address    || "",
        city:       item.city       || "",
        state:      item.state      || "Goa",
        type:       item.type       || "",
        phone:      item.phone      || "",
        email:      item.email      || "",
        website:    item.website    || "",
        sort_order: item.sort_order ?? 0,
        show_on_website: item.show_on_website !== false,
      });
    } else {
      setEditingItem(null);
      const nextNum = institutes.length + 1;
      setFormData({ ...EMPTY_FORM, code: `GSOS-${String(nextNum).padStart(2, "0")}`, sort_order: nextNum });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim()) {
      if (onShowToast) onShowToast("Study centre name and city are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const url    = editingItem ? `/api/admin/affiliated-institutes/${editingItem.id}` : "/api/admin/affiliated-institutes";
      const method = editingItem ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        if (onShowToast) onShowToast(editingItem ? "Study centre updated!" : "Study centre added!", "success");
        closeModal();
        loadInstitutes();
      } else {
        if (onShowToast) onShowToast(data.error || "Save failed", "error");
      }
    } catch {
      if (onShowToast) onShowToast("Network error", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(`/api/admin/affiliated-institutes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setInstitutes((p) => p.filter((i) => i.id !== id));
        if (onShowToast) onShowToast("Study centre removed.", "info");
      } else {
        if (onShowToast) onShowToast(data.error || "Delete failed", "error");
      }
    } catch {
      if (onShowToast) onShowToast("Network error", "error");
    }
    setDeleteConfirmId(null);
  };

  const handleToggleActive = async (inst) => {
    try {
      const res  = await fetch(`/api/admin/affiliated-institutes/${inst.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !inst.is_active }),
      });
      const data = await res.json();
      if (data.ok) {
        setInstitutes((p) => p.map((i) => i.id === inst.id ? data.data : i));
        if (onShowToast) onShowToast("Status updated.", "info");
      }
    } catch {
      if (onShowToast) onShowToast("Network error", "error");
    }
  };

  const setField = (key) => (e) => setFormData((f) => ({ ...f, [key]: e.target.value }));
  // the form's state list, plus whatever state the record being edited already has
  const stateOptions = STATES.includes(formData.state) || !formData.state ? STATES : [formData.state, ...STATES];
  // the list filter only offers states that actually exist in the data
  const filterStates = ["All", ...Array.from(new Set(institutes.map((i) => i.state).filter(Boolean)))];

  const handleToggleWebsite = async (inst) => {
    const next = inst.show_on_website === false;
    setInstitutes((p) => p.map((i) => (i.id === inst.id ? { ...i, show_on_website: next } : i))); // optimistic
    try {
      const res = await fetch(`/api/admin/affiliated-institutes/${inst.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_on_website: next }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "failed");
      setInstitutes((p) => p.map((i) => (i.id === inst.id ? data.data : i)));
      if (onShowToast) onShowToast(next ? "Now shown on the website." : "Hidden from the website.", "info");
    } catch {
      setInstitutes((p) => p.map((i) => (i.id === inst.id ? { ...i, show_on_website: !next } : i)));
      if (onShowToast) onShowToast("Could not update. Try again.", "error");
    }
  };

  const filteredInstitutes = institutes.filter((item) => {
    const matchesState  = selectedState === "All" || item.state === selectedState;
    const matchesStatus = selectedStatus === "All"
      || (selectedStatus === "Active"   && item.is_active)
      || (selectedStatus === "Inactive" && !item.is_active);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q
      || (item.name  || "").toLowerCase().includes(q)
      || (item.code  || "").toLowerCase().includes(q)
      || (item.city  || "").toLowerCase().includes(q);
    return matchesState && matchesStatus && matchesSearch;
  });

  const activeCount = institutes.filter((i) => i.is_active).length;
  const shownCount = institutes.filter((i) => i.is_active && i.show_on_website !== false).length;
  const hasFilters = searchQuery || selectedState !== "All" || selectedStatus !== "All";
  const hasList = !(loading && institutes.length === 0) && filteredInstitutes.length > 0;

  const WebsiteSwitch = ({ inst }) => {
    const on = inst.show_on_website !== false;
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => handleToggleWebsite(inst)}
        title={on ? "Shown on the website. Click to hide." : "Hidden from the website. Click to show."}
        className="inline-flex items-center gap-2 text-[13.5px] font-bold text-[#3d5688]"
      >
        <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-[#1b57d8]" : "bg-[#b9cbe6]"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
        </span>
        {on ? "Shown" : "Hidden"}
      </button>
    );
  };

  const StatusBadge = ({ inst }) => (
    <button
      onClick={() => handleToggleActive(inst)}
      title="Click to switch"
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-bold transition ${
        inst.is_active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-red-100 text-red-800 hover:bg-red-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inst.is_active ? "bg-emerald-500" : "bg-red-500"}`} />
      {inst.is_active ? "Active" : "Inactive"}
    </button>
  );

  return (
    <div className="min-w-0 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082a63]">Study Centres</h2>
          <p className="text-[14px] text-[#3d5688] sm:text-[15px]">
            {institutes.length} {institutes.length === 1 ? "centre" : "centres"} · {activeCount} active · {shownCount} shown on the website
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2 sm:flex sm:items-center">
          <button
            onClick={loadInstitutes}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 text-[14px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1b57d8] px-5 text-[14.5px] font-bold text-white transition hover:bg-[#1245b8]"
          >
            <Plus className="h-4 w-4" /> Add Study Centre
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d3e1f5] bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4a6090]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search centres…"
            className={`${fieldCls} pl-10 pr-10`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#4a6090] hover:bg-[#eaf2fd]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Select size="lg" ariaLabel="Filter by state" className="sm:w-44" value={selectedState} onChange={setSelectedState}
            options={filterStates.map((st) => ({ value: st, label: st === "All" ? "All states" : st }))} />
          <Select size="lg" ariaLabel="Filter by status" className="sm:w-44" align="right" value={selectedStatus} onChange={setSelectedStatus}
            options={[{ value: "All", label: "All status" }, { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
        </div>
      </div>

      {/* List */}
      <div className={hasList ? "lg:overflow-hidden lg:rounded-2xl lg:border lg:border-[#d3e1f5] lg:bg-white lg:shadow-sm" : "overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm"}>
        {loading && institutes.length === 0 ? (
          <div className="p-12 text-center text-[#3d5688]">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-[#1b57d8]" />
            <p className="text-[16px] font-semibold">Loading study centres…</p>
          </div>
        ) : filteredInstitutes.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-[#a9bde0]" />
            <p className="text-[16px] font-bold text-[#082a63]">{hasFilters ? "No study centres match your filters" : "No study centres yet"}</p>
            <p className="mt-1 text-[14px] text-[#4a6090]">{hasFilters ? "Try a different search or filter." : "Add your first study centre to show it on the website."}</p>
            {hasFilters ? (
              <button onClick={() => { setSearchQuery(""); setSelectedState("All"); setSelectedStatus("All"); }}
                className="mt-4 h-10 rounded-xl border border-[#d3e1f5] px-5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                Clear filters
              </button>
            ) : (
              <button onClick={() => openModal()} className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white hover:bg-[#1245b8]">
                <Plus className="h-4 w-4" /> Add Study Centre
              </button>
            )}
          </div>
        ) : (
          <>
            {/* table (laptops) */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-[15px]">
                <thead className="border-b border-[#d3e1f5] bg-[#f4f8fe]">
                  <tr className="text-[12.5px] font-bold uppercase tracking-wider text-[#4a6090]">
                    <th className="whitespace-nowrap px-4 py-3.5">Code</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Study Centre</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Location</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Program focus</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Status</th>
                    <th className="whitespace-nowrap px-4 py-3.5">On website</th>
                    <th className="whitespace-nowrap px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4edf9]">
                  {filteredInstitutes.map((inst) => (
                    <tr key={inst.id} className="transition-colors hover:bg-[#f4f8fe]">
                      <td className="whitespace-nowrap px-4 py-4 align-top">
                        <span className="inline-block rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[13px] font-bold text-[#1245b8]">{inst.code}</span>
                      </td>
                      <td className="min-w-[14rem] px-4 py-4 align-top">
                        <p className="font-bold text-[#082a63]">{inst.name}</p>
                        {inst.phone && <p className="mt-0.5 whitespace-nowrap text-[13.5px] text-[#4a6090]">{inst.phone}</p>}
                        {inst.email && <p className="break-all text-[13.5px] text-[#4a6090]">{inst.email}</p>}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="flex items-center gap-1 whitespace-nowrap font-semibold text-[#082a63]"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#1b57d8]" /> {inst.city}</p>
                        <p className="pl-[18px] text-[13.5px] text-[#3d5688]">{inst.state}</p>
                      </td>
                      <td className="max-w-[13rem] px-4 py-4 align-top">
                        {inst.type ? <p className="text-[14px] font-semibold leading-snug text-[#0b3a85]">{inst.type}</p> : <span className="text-[#8a97b3]">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-top"><StatusBadge inst={inst} /></td>
                      <td className="whitespace-nowrap px-4 py-4 align-top"><WebsiteSwitch inst={inst} /></td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openModal(inst)} title="Edit" aria-label="Edit study centre"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:bg-[#eaf2fd]">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(inst.id)} title="Delete" aria-label="Delete study centre"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d3e1f5] text-[#3d5688] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* cards (mobile / tablet) */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
              {filteredInstitutes.map((inst) => (
                <div key={inst.id} className="min-w-0 rounded-2xl border border-[#d3e1f5] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="whitespace-nowrap rounded-md bg-[#eaf2fd] px-2 py-0.5 font-mono text-[12.5px] font-bold text-[#1245b8]">{inst.code}</span>
                    <StatusBadge inst={inst} />
                  </div>
                  <p className="mt-2 break-words text-[17px] font-bold leading-snug text-[#082a63]">{inst.name}</p>
                  <div className="mt-2.5 space-y-1 text-[14px] text-[#3d5688]">
                    <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0 text-[#1b57d8]" /> {[inst.city, inst.state].filter(Boolean).join(", ")}</p>
                    {inst.type && <p className="break-words">{inst.type}</p>}
                    {inst.phone && <p>{inst.phone}</p>}
                    {inst.email && <p className="break-all">{inst.email}</p>}
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f4f8fe] px-3 py-2">
                    <span className="text-[13.5px] font-semibold text-[#4a6090]">On website</span>
                    <WebsiteSwitch inst={inst} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button onClick={() => openModal(inst)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirmId(inst.id)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white py-2.5 text-[14px] font-bold text-[#082a63] hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-1 pt-1 text-[13.5px] text-[#3d5688] lg:border-t lg:border-[#d3e1f5] lg:bg-[#f4f8fe] lg:px-5 lg:py-3">
              Showing {filteredInstitutes.length} of {institutes.length}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        busy={submitting}
        icon={Building2}
        title={editingItem ? "Edit Study Centre" : "Add New Study Centre"}
        subtitle="Shown on the website under Study Centres"
        onSubmit={handleSubmit}
        footer={
          <>
            <button type="button" onClick={closeModal} disabled={submitting}
              className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe] disabled:opacity-60">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-7 text-[15px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Saving…" : editingItem ? "Save Changes" : "Add Study Centre"}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Basics */}
          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Study Centre</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block min-w-0">
                <span className={labelCls}>Code <span className="text-red-500">*</span></span>
                <input type="text" value={formData.code} onChange={setField("code")} placeholder="GSOS-01" required
                  className={`${fieldCls} font-mono font-bold`} />
              </label>
              <label className="block min-w-0 sm:col-span-2">
                <span className={labelCls}>Name <span className="text-red-500">*</span></span>
                <input type="text" value={formData.name} onChange={setField("name")} placeholder="e.g. Panaji Study Centre" required
                  className={fieldCls} />
              </label>
              <label className="block min-w-0 sm:col-span-3">
                <span className={labelCls}>Program focus</span>
                <input type="text" value={formData.type} onChange={setField("type")} placeholder="e.g. Secondary & Senior Secondary"
                  className={fieldCls} />
              </label>
            </div>
          </section>

          {/* Location */}
          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Location</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block min-w-0 sm:col-span-2">
                <span className={labelCls}>Address</span>
                <input type="text" value={formData.address} onChange={setField("address")} placeholder="Street, locality, pin code"
                  className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>City <span className="text-red-500">*</span></span>
                <input type="text" value={formData.city} onChange={setField("city")} placeholder="e.g. Panaji" required
                  className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>State</span>
                <Select size="lg" ariaLabel="State" value={formData.state}
                  onChange={(v) => setFormData((f) => ({ ...f, state: v }))}
                  options={stateOptions.map((st) => ({ value: st, label: st }))} />
              </label>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h4 className="mb-3 text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Contact</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className={labelCls}>Phone</span>
                <input type="tel" inputMode="tel" value={formData.phone} onChange={setField("phone")} placeholder="+91 98765 43210"
                  className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>Email</span>
                <input type="email" value={formData.email} onChange={setField("email")} placeholder="centre@example.com"
                  className={fieldCls} />
              </label>
              <label className="block min-w-0">
                <span className={labelCls}>Website</span>
                <input type="url" value={formData.website} onChange={setField("website")} placeholder="https://"
                  className={fieldCls} />
              </label>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 py-3 sm:col-span-2">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-[#082a63]">Show on website</p>
                  <p className="text-[13px] text-[#4a6090]">Turn off to hide this centre from the public Study Centres page. It stays available everywhere else.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.show_on_website}
                  aria-label="Show on website"
                  onClick={() => setFormData((f) => ({ ...f, show_on_website: !f.show_on_website }))}
                  className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${formData.show_on_website ? "bg-[#1b57d8]" : "bg-[#b9cbe6]"}`}
                >
                  <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${formData.show_on_website ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
              <label className="block min-w-0">
                <span className={labelCls}>Display order</span>
                <input type="number" min={0} value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) || 0 })}
                  className={fieldCls} />
              </label>
            </div>
          </section>
        </div>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#f4f8fe] text-[#082a63] max-w-sm w-full rounded-2xl p-6 shadow-2xl border border-[#d3e1f5] text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-[18px] font-extrabold text-[#082a63]">Delete Study Centre?</h4>
            <p className="mb-5 mt-1 text-[14.5px] text-[#3d5688]">This will permanently remove the study centre from the database. It cannot be undone.</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setDeleteConfirmId(null)}
                className="h-11 rounded-xl border border-[#d3e1f5] bg-white text-[15px] font-bold text-[#082a63] transition hover:bg-[#f4f8fe]">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)}
                className="h-11 rounded-xl bg-red-600 text-[15px] font-bold text-white transition hover:bg-red-700">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
