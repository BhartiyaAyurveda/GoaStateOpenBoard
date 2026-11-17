"use client";

import { useEffect, useState } from "react";
import Select from "@/components/ui/Select";
import { CheckCircle2, Loader2, Mail, Phone, Send, Tag, User, X } from "lucide-react";

const SUBJECTS = ["Admission", "Study Centre Enquiry", "General Enquiry", "Others"];
const EMPTY = { name: "", mobile: "", email: "", subject: "", message: "", website: "" };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2 || !/^[\p{L}\p{M}.' -]+$/u.test(v.name.trim())) e.name = "Enter a valid full name.";
  if (!/^(\+91)?[6-9]\d{9}$/.test(v.mobile.replace(/[\s-]/g, ""))) e.mobile = "Enter a valid 10-digit mobile number.";
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!SUBJECTS.includes(v.subject)) e.subject = "Please select a subject.";
  return e;
}

const controlCls = (err) =>
  `w-full rounded-md border bg-[#fbfdff] text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 ${
    err ? "border-[#e0242b] bg-[#fff8f8]" : "border-[#b9cbe6]"
  }`;

function Field({ label, required, error, htmlFor, icon: Icon, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-bold text-ink">
        {label} {required && <span className="text-[#e0242b]">*</span>}
      </label>
      <div className="relative h-[calc(100%-1.65rem)] min-h-[48px]">
        {Icon && (
          <Icon
            size={18}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3.5 top-[15px] z-10 text-[#5b78a8]"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-[13px] font-semibold text-[#e0242b]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  useEffect(() => {
    if (status !== "success") return;
    const onKey = (e) => e.key === "Escape" && setStatus("idle");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setValues(EMPTY);
        setStatus("success");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setServerError(data.error || "Please check the highlighted fields and try again.");
      setStatus("error");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="flex flex-1 flex-col gap-5 p-5 sm:p-7">
        <p className="flex items-center gap-2 rounded-md border border-[#c9daf2] bg-[#eef4fc] px-3 py-2 text-[13.5px] font-semibold text-[#44557a]">
          <span className="text-[15px] font-bold text-[#e0242b]">*</span> Fields marked with an asterisk are mandatory.
        </p>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <Field label="Full Name" required error={errors.name} htmlFor="c-name" icon={User}>
            <input
              id="c-name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={values.name}
              onChange={set("name")}
              placeholder="Enter your full name"
              className={`${controlCls(errors.name)} h-[48px] pl-11 pr-3`}
            />
          </Field>
          <Field label="Mobile No." required error={errors.mobile} htmlFor="c-mobile" icon={Phone}>
            <input
              id="c-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={15}
              value={values.mobile}
              onChange={set("mobile")}
              placeholder="10-digit mobile number"
              className={`${controlCls(errors.mobile)} h-[48px] pl-11 pr-3`}
            />
          </Field>
          <Field label="Email Id" error={errors.email} htmlFor="c-email" icon={Mail}>
            <input
              id="c-email"
              type="email"
              autoComplete="email"
              maxLength={120}
              value={values.email}
              onChange={set("email")}
              placeholder="name@example.com"
              className={`${controlCls(errors.email)} h-[48px] pl-11 pr-3`}
            />
          </Field>
          <Field label="Subject" required error={errors.subject} htmlFor="c-subject" icon={Tag}>
            <Select
              id="c-subject"
              variant="public"
              withIcon
              invalid={Boolean(errors.subject)}
              ariaLabel="Subject"
              placeholder="-- Select --"
              value={values.subject}
              onChange={(v) => set("subject")({ target: { value: v } })}
              options={SUBJECTS.map((s) => ({ value: s, label: s }))}
            />
          </Field>
        </div>

        <div className="flex flex-1 flex-col">
          <label htmlFor="c-message" className="mb-1.5 block text-[14px] font-bold text-ink">
            Message
          </label>
          <textarea
            id="c-message"
            maxLength={1000}
            value={values.message}
            onChange={set("message")}
            placeholder="Write your message here"
            className={`${controlCls(false)} min-h-[150px] flex-1 resize-y px-3.5 py-3 leading-relaxed`}
          />
          <p className="mt-1.5 text-right text-[12.5px] font-semibold text-[#6b7a99]">{values.message.length}/1000</p>
        </div>

        {/* Honeypot – hidden from people, bots tend to fill it */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="c-website">Website</label>
          <input
            id="c-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={set("website")}
          />
        </div>

        {status === "error" && serverError && (
          <p
            role="alert"
            className="rounded-md border border-[#e0242b]/40 bg-[#fff1f1] px-3 py-2 text-[14px] font-semibold text-[#b4161c]"
          >
            {serverError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-[#9db7e0] pt-5">
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex h-[46px] min-w-[140px] items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-7 text-[14.5px] font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
            {status === "sending" ? "Sending..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => {
              setValues(EMPTY);
              setErrors({});
              setStatus("idle");
              setServerError("");
            }}
            className="h-[46px] rounded-md border border-[#9db7e0] bg-white px-7 text-[14.5px] font-bold text-ink transition hover:bg-[#f2f7fe]"
          >
            Reset
          </button>
        </div>
      </form>

      {status === "success" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-thanks"
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/60 p-4"
          onClick={() => setStatus("idle")}
        >
          <div
            className="relative w-full max-w-[420px] rounded-lg bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setStatus("idle")}
              aria-label="Close"
              className="absolute right-3 top-3 rounded p-1 text-[#44557a] hover:bg-[#eef4fc]"
            >
              <X size={18} />
            </button>
            <CheckCircle2 size={56} className="mx-auto text-[#16a34a]" strokeWidth={1.6} />
            <h3 id="contact-thanks" className="mt-3 font-serif text-[26px] font-bold text-ink">
              Thank you!
            </h3>
            <p className="mt-2 text-[14.5px] font-medium leading-relaxed text-ink">
              Your information has been sent successfully. We will get back to you soon.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-5 h-[40px] rounded-md bg-navy px-8 text-[14px] font-bold text-white hover:bg-brand"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
