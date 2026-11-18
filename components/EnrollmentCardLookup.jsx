"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Hash, Loader2, Printer, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { ENROLLMENT_PATTERN } from "@/lib/result-options";
import DatePicker from "@/components/ui/DatePicker";
import EnrollmentCardTemplate from "@/components/EnrollmentCardTemplate";

const EMPTY = { enrollment: "", dob: "" };

const controlCls = (err) =>
  `h-[48px] w-full rounded-md border bg-[#fbfdff] pl-11 pr-3 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 ${
    err ? "border-[#e0242b] bg-[#fff8f8]" : "border-[#b9cbe6]"
  }`;

const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function Field({ label, error, htmlFor, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-bold text-ink">
        {label} <span className="text-[#e0242b]">*</span>
      </label>
      <div className="relative">
        <Icon size={18} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-[15px] z-10 text-[#5b78a8]" aria-hidden="true" />
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

export default function EnrollmentCardLookup() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [message, setMessage] = useState("");
  const [card, setCard] = useState(null);
  const [captcha, setCaptcha] = useState({ question: "", token: "", failed: false });
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const loadCaptcha = useCallback(async () => {
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/result/captcha", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) setCaptcha({ question: data.question, token: data.token, failed: false });
      else setCaptcha({ question: "", token: "", failed: true });
    } catch {
      setCaptcha({ question: "", token: "", failed: true });
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
    setMessage("");
    setCard(null);
    loadCaptcha();
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    const found = {};
    if (!ENROLLMENT_PATTERN.test(values.enrollment.trim().toUpperCase())) found.enrollment = "Enter a valid enrollment number.";
    if (!values.dob) found.dob = "Enter your date of birth.";
    if (!captchaAnswer.trim()) found.captcha = "Enter the answer shown above.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/enrollment-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment: values.enrollment.trim().toUpperCase(),
          dob: values.dob,
          captchaToken: captcha.token,
          captchaAnswer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setCard(data.card);
        setStatus("done");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setMessage(data.error || (data.errors?.captcha ? "" : "Please check the highlighted fields and try again."));
      setStatus("error");
      loadCaptcha(); // every challenge is single-use
    } catch {
      setMessage("Network error. Please check your connection and try again.");
      setStatus("error");
      loadCaptcha();
    }
  }

  if (status === "done" && card) {
    return (
      <div className="p-4 sm:p-7 print:p-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={reset}
            className="inline-flex h-[40px] items-center gap-2 rounded-md border border-[#9db7e0] bg-white px-5 text-[14px] font-bold text-ink hover:bg-[#f2f7fe]"
          >
            <RotateCcw size={16} /> Get another card
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex h-[40px] items-center gap-2 rounded-md bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
          >
            <Printer size={16} /> Print / Download Enrollment Card
          </button>
        </div>
        <EnrollmentCardTemplate data={card} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-7">
      <p className="flex items-center gap-2 rounded-md border border-[#c9daf2] bg-[#eef4fc] px-3 py-2 text-[13.5px] font-semibold text-[#44557a]">
        <span className="text-[15px] font-bold text-[#e0242b]">*</span> Enter the Enrollment Number given to you when your admission was
        submitted, and your Date of Birth.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Enrollment No." error={errors.enrollment} htmlFor="e-enr" icon={Hash}>
          <input
            id="e-enr"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={20}
            value={values.enrollment}
            onChange={set("enrollment")}
            placeholder="Enter enrollment number"
            className={`${controlCls(errors.enrollment)} uppercase placeholder:normal-case`}
          />
        </Field>

        <Field label="Date of Birth" error={errors.dob} htmlFor="e-dob" icon={CalendarDays}>
          <DatePicker
            id="e-dob"
            variant="public"
            withIcon
            ariaLabel="Date of birth"
            min="1940-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={values.dob}
            onChange={(v) => set("dob")({ target: { value: v } })}
            invalid={Boolean(errors.dob)}
          />
        </Field>
      </div>

      {/* sum-the-numbers verification */}
      <div>
        <label htmlFor="e-captcha" className="mb-1.5 block text-[14px] font-bold text-ink">
          Verification: sum the numbers <span className="text-[#e0242b]">*</span>
        </label>
        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex h-[48px] min-w-0 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md sm:min-w-[170px] sm:flex-none sm:gap-2 border border-dashed border-[#7fa0d6] bg-[#eef4fc] px-4 text-[18px] font-extrabold tracking-widest text-navy">
            <ShieldCheck size={18} strokeWidth={2} className="text-[#5b78a8]" aria-hidden="true" />
            {captcha.question ? `${captcha.question} =` : captcha.failed ? "—" : "..."}
          </div>
          <input
            id="e-captcha"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={captchaAnswer}
            onChange={(e) => {
              setCaptchaAnswer(e.target.value.replace(/\D/g, ""));
              if (errors.captcha) setErrors((er) => ({ ...er, captcha: undefined }));
            }}
            placeholder="Sum"
            className={`${controlCls(errors.captcha)} !w-[84px] !px-3 shrink-0 sm:!w-[120px] sm:!pl-4`}
          />
          <button
            type="button"
            onClick={loadCaptcha}
            aria-label="Get a new verification question"
            title="New question"
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-md border border-[#b9cbe6] bg-white text-navy hover:bg-[#f2f7fe]"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        {errors.captcha && (
          <p role="alert" className="mt-1.5 text-[13px] font-semibold text-[#e0242b]">
            {errors.captcha}
          </p>
        )}
        {captcha.failed && (
          <p role="alert" className="mt-1.5 text-[13px] font-semibold text-[#b4161c]">
            Verification could not be loaded. Click the refresh button to try again.
          </p>
        )}
      </div>

      {status === "error" && message && (
        <p role="alert" className="rounded-md border border-[#e0242b]/40 bg-[#fff1f1] px-3 py-2 text-[14px] font-semibold text-[#b4161c]">
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-dashed border-[#9db7e0] pt-5">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-[46px] min-w-[190px] items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-7 text-[14.5px] font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {status === "loading" ? "Searching..." : "Get Enrollment Card"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-[46px] rounded-md border border-[#9db7e0] bg-white px-7 text-[14.5px] font-bold text-ink transition hover:bg-[#f2f7fe]"
        >
          Reset
        </button>
      </div>

      <p className="rounded-md border border-[#f3d28a] bg-[#fff8e6] px-4 py-3 text-[13px] font-medium leading-relaxed text-[#5a4300]">
        <b>Note:</b> The card is available once your admission has been approved by the Board. If you do not have your Enrollment Number or cannot find your card,
        contact your Study Centre or Goa State Open School.
      </p>
    </form>
  );
}
