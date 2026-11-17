"use client";

import { useState, useEffect, useMemo } from "react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { AlertTriangle, Check, Clock, ExternalLink, Mail, MapPin, Phone, RefreshCw, RotateCcw } from "lucide-react";

const DEFAULT_CONTACT = {
  primaryPhone:        "",
  secondaryPhone:      "",
  whatsappNumber:      "",
  primaryEmail:        "",
  admissionsEmail:     "",
  verificationEmail:   "",
  addressLine1:        "",
  city:                "",
  state:               "Goa",
  pincode:             "",
  country:             "India",
  workingHoursWeekday: "Monday – Saturday: 10:00 AM – 5:00 PM",
  workingHoursSunday:  "Closed on Sundays and public holidays",
  registrationNote:    "",
  registrationUrl:     "",
  headerLogoUrl:       "",
  headerLogoAlt:       "",
  headerLogoLink:      "",
};

const SITE_DEFAULTS = {
  phone: "0832–2743300",
  email: "support@goaopenschool.in",
  address: ["Goa State Open School,", "Panaji, Goa – 403001"],
  hoursWeekday: "Monday – Friday: 10:00 AM – 5:30 PM",
  hoursOther: "Closed on Saturday, Sunday & public holidays",
};

const REQUIRED = []; // nothing is mandatory: the website falls back to its defaults for empty fields
const digits = (v) => String(v || "").replace(/\D/g, "");
const validPhone = (v) => {
  const n = digits(v).length;
  return n >= 8 && n <= 13;
};
const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// returns { fieldKey: "message" } for everything that is wrong
function validate(d) {
  const e = {};
  for (const k of REQUIRED) if (!String(d[k] || "").trim()) e[k] = "This field is required.";
  for (const k of ["primaryPhone", "secondaryPhone", "whatsappNumber"]) {
    if (d[k] && !e[k] && !validPhone(d[k])) e[k] = "Enter a valid phone number (8–13 digits).";
  }
  for (const k of ["primaryEmail", "admissionsEmail", "verificationEmail"]) {
    if (d[k] && !e[k] && !validEmail(d[k].trim())) e[k] = "Enter a valid email address.";
  }
  if (d.pincode && !/^\d{6}$/.test(d.pincode)) e.pincode = "Pincode must be 6 digits.";
  if (d.registrationUrl && !/^https?:\/\/\S+\.\S+/i.test(d.registrationUrl.trim())) e.registrationUrl = "Enter a full link starting with https://";
  if (d.headerLogoUrl && !/^https:\/\/\S+\.\S+/i.test(d.headerLogoUrl.trim())) e.headerLogoUrl = "The logo link must start with https://";
  if (d.headerLogoLink && !/^https?:\/\/\S+\.\S+/i.test(d.headerLogoLink.trim())) e.headerLogoLink = "Enter a full link starting with https://";
  return e;
}

function Field({ label, icon: Icon, error, hint, className = "", children }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="mb-1.5 block text-[14px] font-bold text-[#3d5688]">
        {label} {hint && <span className="font-medium text-[#8a9bbd]">{hint}</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7fa6]" />}
        {children(`w-full rounded-xl border ${error ? "border-red-300 bg-red-50/40" : "border-[#d3e1f5] bg-[#f4f8fe]"} py-2.5 ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 text-[15px] text-[#082a63] placeholder:text-[#8a9bbd] outline-none transition focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15`)}
      </div>
      {error && <p className="mt-1 text-[13px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function Section({ icon: Icon, tone, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#d3e1f5] bg-white">
      <div className="flex items-center gap-3 border-b border-[#e3edfa] p-4 sm:px-6">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>{Icon}</span>
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold leading-tight text-[#082a63]">{title}</h3>
          {subtitle && <p className="text-[13.5px] text-[#4a6090]">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

export default function ContactManager({ onShowToast }) {
  const [data, setData] = useState(DEFAULT_CONTACT);
  const [initial, setInitial] = useState(DEFAULT_CONTACT); // last saved version
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [touched, setTouched] = useState(false); // show validation messages after the first save attempt

  useEffect(() => {
    setLoading(true);
    fetch("/api/public/site-settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok && res.contact) {
          const merged = { ...DEFAULT_CONTACT, ...res.contact };
          setData(merged);
          setInitial(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const errors = useMemo(() => validate(data), [data]);
  const showErr = (k) => (touched ? errors[k] : undefined);
  const dirty = JSON.stringify(data) !== JSON.stringify(initial);

  const set = (key, value) => {
    setData((p) => ({ ...p, [key]: value }));
    setJustSaved(false);
  };

  const [logoUploading, setLogoUploading] = useState(false);
  async function uploadLogo(file) {
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/home-content/upload", { method: "POST", body: fd });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.url) {
        set("headerLogoUrl", out.url);
        onShowToast?.("Logo uploaded. Press Save to show it in the header.", "success");
      } else {
        onShowToast?.(out.error || "Upload failed", "error");
      }
    } catch {
      onShowToast?.("Network error while uploading.", "error");
    }
    setLogoUploading(false);
  }

  const text = (key, props = {}) => (cls) => (
    <input value={data[key] || ""} onChange={(e) => set(key, e.target.value)} className={cls} {...props} />
  );

  async function save(e) {
    e?.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length) {
      onShowToast?.("Please fix the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    try {
      const clean = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? "").trim()]));
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "contact_info", value: JSON.stringify(clean) }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        setData(clean);
        setInitial(clean);
        setTouched(false);
        setJustSaved(true);
        onShowToast?.("Contact information saved. It is live on the website.", "success");
        setTimeout(() => setJustSaved(false), 3000);
      } else {
        onShowToast?.(out.error || "Save failed", "error");
      }
    } catch {
      onShowToast?.("Network error. Please try again.", "error");
    }
    setSaving(false);
  }

  function discard() {
    setData(initial);
    setTouched(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d3e1f5] bg-white p-12 text-center">
        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#1b57d8]" />
      </div>
    );
  }

  // what the website will show: the same rules as lib/site-settings.js (empty fields use the default)
  const place = [data.city, data.state].filter(Boolean).join(", ");
  const cityLine = [place, data.pincode].filter(Boolean).join(" – ");
  const addressLines = data.addressLine1.trim()
    ? ["Goa State Open School,", data.addressLine1.trim() + (cityLine ? "," : ""), cityLine].filter(Boolean)
    : SITE_DEFAULTS.address;
  const sitePhone = data.primaryPhone.trim() || SITE_DEFAULTS.phone;
  const siteEmail = validEmail(data.primaryEmail.trim()) ? data.primaryEmail.trim() : SITE_DEFAULTS.email;
  const hoursWeekday = data.workingHoursWeekday.trim() || SITE_DEFAULTS.hoursWeekday;
  const hoursOther = data.workingHoursSunday.trim() || SITE_DEFAULTS.hoursOther;

  return (
    <form onSubmit={save} className="min-w-0 space-y-5">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#082a63]">Contact &amp; Location</h2>
          <p className="text-[14px] text-[#3d5688] sm:text-[15px]">These details appear on the Contact page and across the website. Changes go live as soon as you save.</p>
        </div>
        <a href="/contact" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-4 py-3 text-[14px] font-bold text-[#082a63] hover:bg-[#f4f8fe] sm:py-2.5">
          <ExternalLink className="h-4 w-4" /> View Contact page
        </a>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        {/* form sections */}
        <div className="min-w-0 space-y-5">
          <Section icon={<Phone className="h-5 w-5" />} tone="bg-[#e3edfa] text-[#1245b8]" title="Phone &amp; WhatsApp" subtitle="The primary phone is shown across the website. The secondary phone and WhatsApp number appear on the Contact page.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Primary phone" icon={Phone} error={showErr("primaryPhone")}>
                {text("primaryPhone", { type: "tel", inputMode: "tel", placeholder: `Empty = ${SITE_DEFAULTS.phone}`, maxLength: 20, autoComplete: "off" })}
              </Field>
              <Field label="Secondary phone" hint="(Contact page)" icon={Phone} error={showErr("secondaryPhone")}>
                {text("secondaryPhone", { type: "tel", inputMode: "tel", placeholder: "Optional", maxLength: 20, autoComplete: "off" })}
              </Field>
              <Field label="WhatsApp number" hint="(Contact page, e.g. 919876543210)" icon={WhatsAppIcon} error={showErr("whatsappNumber")} className="sm:col-span-2">
                {text("whatsappNumber", { type: "tel", inputMode: "tel", placeholder: "Optional", maxLength: 20, autoComplete: "off" })}
              </Field>
            </div>
          </Section>

          <Section icon={<Mail className="h-5 w-5" />} tone="bg-[#eaf2fd] text-[#1245b8]" title="Email addresses" subtitle="The general email is shown across the website. Admissions and verification emails appear on the Contact page.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="General / contact email" icon={Mail} error={showErr("primaryEmail")} className="sm:col-span-2">
                {text("primaryEmail", { type: "email", inputMode: "email", placeholder: `Empty = ${SITE_DEFAULTS.email}`, maxLength: 120, autoComplete: "off" })}
              </Field>
              <Field label="Admissions email" hint="(Contact page)" icon={Mail} error={showErr("admissionsEmail")}>
                {text("admissionsEmail", { type: "email", inputMode: "email", placeholder: "Optional", maxLength: 120, autoComplete: "off" })}
              </Field>
              <Field label="Verification / certificate email" hint="(Contact page)" icon={Mail} error={showErr("verificationEmail")}>
                {text("verificationEmail", { type: "email", inputMode: "email", placeholder: "Optional", maxLength: 120, autoComplete: "off" })}
              </Field>
            </div>
          </Section>

          <Section icon={<MapPin className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-700" title="Address" subtitle="Shown on the Contact page and in the footer. The address (with country) also drives the map.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Street address / area" icon={MapPin} className="sm:col-span-2">
                {text("addressLine1", { placeholder: "e.g. Street / building, Porvorim", maxLength: 200 })}
              </Field>
              <Field label="City">{text("city", { placeholder: "City", maxLength: 80 })}</Field>
              <Field label="State">{text("state", { placeholder: "State", maxLength: 80 })}</Field>
              <Field label="Pincode" error={showErr("pincode")}>
                {text("pincode", { inputMode: "numeric", placeholder: "6 digits", maxLength: 6 })}
              </Field>
              <Field label="Country" hint="(used for the map)">{text("country", { placeholder: "Country", maxLength: 80 })}</Field>
            </div>
          </Section>

          <Section icon={<Clock className="h-5 w-5" />} tone="bg-amber-50 text-amber-700" title="Office hours" subtitle="When the office is open.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Weekdays" icon={Clock}>{text("workingHoursWeekday", { placeholder: "e.g. Monday – Saturday: 10:00 AM – 5:00 PM", maxLength: 120 })}</Field>
              <Field label="Sunday / holidays" icon={Clock}>{text("workingHoursSunday", { placeholder: "e.g. Closed on Sundays and public holidays", maxLength: 120 })}</Field>
            </div>
          </Section>

          <Section icon={<ExternalLink className="h-5 w-5" />} tone="bg-violet-50 text-violet-700" title="Header logo" subtitle="An optional logo at the top right of the website header. Empty = nothing is shown.">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#b9cbe6] bg-[#f4f8fe] p-2">
                  {data.headerLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.headerLogoUrl} alt="Header logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[13px] font-semibold text-[#8a9bbd]">No logo</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#1b57d8] px-5 text-[14.5px] font-bold text-white transition hover:bg-[#1245b8] ${logoUploading ? "pointer-events-none opacity-60" : ""}`}>
                    {logoUploading ? "Uploading…" : data.headerLogoUrl ? "Replace logo" : "Upload logo"}
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => { uploadLogo(e.target.files?.[0]); e.target.value = ""; }} />
                  </label>
                  {data.headerLogoUrl && (
                    <button type="button" onClick={() => set("headerLogoUrl", "")} className="h-11 rounded-xl border border-[#d3e1f5] bg-white px-5 text-[14.5px] font-bold text-[#082a63] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {data.headerLogoUrl && (
                <>
                  <Field label="Logo description" hint="(for screen readers)">
                    {text("headerLogoAlt", { placeholder: "e.g. Partner logo", maxLength: 80 })}
                  </Field>
                  <Field label="Link when clicked" hint="(optional)" icon={ExternalLink} error={showErr("headerLogoLink")}>
                    {text("headerLogoLink", { type: "url", placeholder: "https://…", maxLength: 300, autoComplete: "off" })}
                  </Field>
                </>
              )}
              {showErr("headerLogoUrl") && <p className="text-[13px] font-semibold text-red-600">{showErr("headerLogoUrl")}</p>}
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-amber-900">
                PNG, JPG or WebP, up to 5 MB. Upload only a logo you have the right to use. The State Emblem of India and other government logos cannot be used without written permission.
              </p>
            </div>
          </Section>

          <Section icon={<Check className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-700" title="Registration line" subtitle="A small line under the school name in the website header. Empty = nothing is shown.">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Text" hint="(max 140 characters)">
                {text("registrationNote", { placeholder: "e.g. Registered on NGO-DARPAN (NITI Aayog) · Unique ID: XX/2025/0000000", maxLength: 140 })}
              </Field>
              <Field label="Verification link" hint="(optional)" icon={ExternalLink} error={showErr("registrationUrl")}>
                {text("registrationUrl", { type: "url", placeholder: "https://… (page where visitors can verify it)", maxLength: 300, autoComplete: "off" })}
              </Field>
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-amber-900">
                Write only a registration your organisation actually holds, with its number, so visitors can check it. Do not use the NITI Aayog, MSME or any government logo here.
              </p>
            </div>
          </Section>
        </div>

        {/* live preview */}
        <aside className="min-w-0">
          <div className="rounded-2xl border border-[#d3e1f5] bg-white xl:sticky xl:top-4">
            <div className="border-b border-[#e3edfa] px-5 py-3.5">
              <p className="text-[12.5px] font-extrabold uppercase tracking-wider text-[#4a6090]">Preview</p>
              <p className="text-[13.5px] text-[#4a6090]">What visitors see (empty fields show the default)</p>
            </div>
            <div className="space-y-4 p-5 text-[14.5px] text-[#082a63]">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1245b8]" />
                <div className="min-w-0 text-[#3d5688]">
                  {addressLines.map((l) => <p key={l} className="break-words first:font-bold first:text-[#082a63]">{l}</p>)}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#1245b8]" />
                <div className="min-w-0">
                  <p className="break-all font-semibold text-[#082a63]">{sitePhone}</p>
                  {data.secondaryPhone.trim() && <p className="break-all font-semibold text-[#082a63]">{data.secondaryPhone.trim()}</p>}
                  {data.whatsappNumber.trim() && (
                    <p className="mt-0.5 flex items-center gap-1.5 break-all text-[#3d5688]"><WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-[#25D366]" /> {data.whatsappNumber.trim()}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#1245b8]" />
                <div className="min-w-0 break-all text-[#3d5688]">
                  <p>{siteEmail}</p>
                  {validEmail(data.admissionsEmail.trim()) && <p>Admissions: {data.admissionsEmail.trim()}</p>}
                  {validEmail(data.verificationEmail.trim()) && <p>Verification: {data.verificationEmail.trim()}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#1245b8]" />
                <div className="min-w-0 text-[#3d5688]">
                  <p>{hoursWeekday}</p>
                  <p>{hoursOther}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* save bar */}
      <div className={`sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
        dirty ? "border-amber-300 bg-amber-50/95" : "border-[#d3e1f5] bg-white/95"
      }`}>
        <p className={`flex items-center gap-2 text-[14.5px] font-semibold ${dirty ? "text-amber-800" : "text-[#4a6090]"}`}>
          {dirty ? <><AlertTriangle className="h-4 w-4 shrink-0" /> You have unsaved changes</> : justSaved ? <><Check className="h-4 w-4 text-emerald-600" /> All changes saved</> : "No changes to save"}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          {dirty && (
            <button type="button" onClick={discard} disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d3e1f5] bg-white px-5 py-3 text-[14.5px] font-bold text-[#3d5688] hover:bg-[#f4f8fe] disabled:opacity-60 sm:py-2.5">
              <RotateCcw className="h-4 w-4" /> Discard
            </button>
          )}
          <button type="submit" disabled={saving || !dirty}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 py-3 text-[14.5px] font-bold text-white transition hover:bg-[#1245b8] disabled:opacity-50 sm:py-2.5">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
