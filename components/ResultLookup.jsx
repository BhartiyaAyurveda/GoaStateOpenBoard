"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Loader2, Printer, Search, RotateCcw, Hash, CalendarDays, ClipboardList, ShieldCheck } from "lucide-react";
import { ENROLLMENT_PATTERN, RESULT_CLASSES, RESULT_SESSIONS } from "@/lib/result-options";

const EMPTY = { cls: "", session: "", enrollment: "", dob: "" };

function validate(v) {
  const e = {};
  if (!RESULT_CLASSES.some((c) => c.value === v.cls)) e.cls = "Select a class.";
  if (!RESULT_SESSIONS.some((s) => s.value === v.session)) e.session = "Select an examination.";
  if (!ENROLLMENT_PATTERN.test(v.enrollment.trim().toUpperCase())) e.enrollment = "Enter a valid enrollment number.";
  if (!v.dob) e.dob = "Enter your date of birth.";
  return e;
}

const controlCls = (err) =>
  `h-[48px] w-full rounded-md border bg-[#fbfdff] pl-11 pr-3 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 ${
    err ? "border-[#e0242b] bg-[#fff8f8]" : "border-[#b9cbe6]"
  }`;

function Field({ label, error, htmlFor, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-bold text-ink">
        {label} <span className="text-[#e0242b]">*</span>
      </label>
      <div className="relative">
        <Icon size={18} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
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

const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function ResultSheet({ data, onReset }) {
  const { candidate: c, subjects, summary, sample } = data;
  const session = RESULT_SESSIONS.find((s) => s.value === c.session)?.label ?? c.session;
  const cls = RESULT_CLASSES.find((x) => x.value === c.cls)?.label ?? c.cls;
  const pass = summary.status === "PASS";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-[20px] font-bold text-ink">Your Result</h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex h-[40px] items-center gap-2 rounded-md bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={onReset}
            className="inline-flex h-[40px] items-center gap-2 rounded-md border border-[#9db7e0] bg-white px-5 text-[14px] font-bold text-ink hover:bg-[#f2f7fe]"
          >
            <RotateCcw size={16} /> Check another result
          </button>
        </div>
      </div>

      <article className="relative overflow-hidden border-2 border-navy bg-white print:border">
        {sample && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="-rotate-[24deg] select-none text-[64px] font-extrabold uppercase tracking-widest text-[#e0242b]/15 sm:text-[96px]">
              Sample
            </span>
          </div>
        )}

        {/* header */}
        <header className="flex items-center gap-4 border-b-[3px] border-navy bg-[#f4f8fe] px-5 py-4">
          <Image src="/images/logo.png" alt="" width={480} height={266} className="h-[54px] w-auto" />
          <div className="flex-1 text-center">
            <p className="text-[22px] font-extrabold tracking-wide text-navy sm:text-[26px]">GOA OPEN SCHOOL</p>
            <p className="text-[13.5px] font-semibold text-[#44557a]">Directorate of Education, Government of Goa</p>
          </div>
          <span className="hidden w-[54px] sm:block" />
        </header>

        <div className="bg-navy px-5 py-2 text-center text-[14px] font-bold uppercase tracking-[0.18em] text-white">
          Statement of Marks &ndash; Provisional
        </div>

        {sample && (
          <p className="border-b border-[#e0242b]/30 bg-[#fff1f1] px-5 py-1.5 text-center text-[13px] font-bold text-[#b4161c]">
            SAMPLE RESULT FOR DESIGN REVIEW &ndash; NOT A REAL RESULT
          </p>
        )}

        {/* candidate details */}
        <div className="px-5 pt-5">
          <table className="w-full border-collapse text-[14px]">
            <tbody>
              {[
                ["Name of the Candidate", c.name, "Enrollment No.", c.enrollment],
                ["Father's Name", c.father, "Date of Birth", fmtDate(c.dob)],
                ["Programme", cls, "Examination", session],
              ].map(([l1, v1, l2, v2]) => (
                <tr key={l1}>
                  <th className="w-[17%] border border-[#9db7e0] bg-[#eef4fc] px-3 py-2 text-left font-bold text-ink">{l1}</th>
                  <td className="border border-[#9db7e0] px-3 py-2 font-semibold text-ink">{v1}</td>
                  <th className="w-[17%] border border-[#9db7e0] bg-[#eef4fc] px-3 py-2 text-left font-bold text-ink">{l2}</th>
                  <td className="border border-[#9db7e0] px-3 py-2 font-semibold text-ink">{v2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* marks */}
        <div className="overflow-x-auto px-5 pt-5">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-navy text-white">
                {["Sr.", "Subject Code", "Subject", "Theory (80)", "TMA / Practical (20)", "Total (100)", "Grade"].map((h) => (
                  <th key={h} className="border border-navy px-3 py-2 text-center text-[13.5px] font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={s.code} className={i % 2 ? "bg-[#f7faff]" : ""}>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{i + 1}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{s.code}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 font-semibold">{s.name}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{s.theory}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{s.internal}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center font-bold">{s.total}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center font-bold">{s.grade}</td>
                </tr>
              ))}
              <tr className="bg-[#eef4fc] font-bold">
                <td colSpan={5} className="border border-[#9db7e0] px-3 py-2 text-right">
                  Grand Total
                </td>
                <td className="border border-[#9db7e0] px-3 py-2 text-center">
                  {summary.total} / {summary.max}
                </td>
                <td className="border border-[#9db7e0] px-3 py-2 text-center">{summary.percentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* result */}
        <div className="flex items-center justify-between gap-4 px-5 py-5">
          <p className="text-[14px] font-bold text-ink">
            Result:{" "}
            <span
              className={`ml-1 inline-block border-2 px-4 py-1 text-[16px] font-extrabold tracking-widest ${
                pass ? "border-[#16a34a] text-[#15803d]" : "border-[#e0242b] text-[#b4161c]"
              }`}
            >
              {summary.status}
            </span>
          </p>
          <p className="text-[13px] font-semibold text-[#5b6b8c]">Percentage: {summary.percentage}%</p>
        </div>

        <p className="border-t border-dashed border-[#9db7e0] bg-[#fff8e6] px-5 py-3 text-[12.5px] font-medium leading-relaxed text-[#5a4300]">
          <b>Note:</b> This is a provisional online result for information only and is not a valid document. Errors, if any, must be
          reported to the Study Centre / Goa Open School within the notified period. The original marksheet issued by Goa Open School
          shall be treated as final.
        </p>
      </article>
    </div>
  );
}

export default function ResultLookup() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
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
    setResult(null);
    loadCaptcha();
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    const found = validate(values);
    if (!captchaAnswer.trim()) found.captcha = "Enter the answer shown above.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          enrollment: values.enrollment.trim().toUpperCase(),
          captchaToken: captcha.token,
          captchaAnswer,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setResult(data.result);
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

  if (status === "done" && result) {
    return (
      <div className="p-5 sm:p-7 print:p-0">
        <ResultSheet data={result} onReset={reset} />
      </div>
    );
  }

  const latest = RESULT_SESSIONS.find((s) => s.declared);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-7">
      {/* class tabs (like the Board's result page) */}
      <div role="group" aria-label="Select class" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {RESULT_CLASSES.map((c) => {
          const active = values.cls === c.value;
          return (
            <button
              key={c.value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setValues((v) => ({ ...v, cls: c.value }));
                if (errors.cls) setErrors((er) => ({ ...er, cls: undefined }));
              }}
              className={`rounded-full border px-4 py-2.5 text-[14px] font-bold transition ${
                active
                  ? "border-navy bg-navy text-white shadow-md"
                  : errors.cls
                    ? "border-[#e0242b] bg-[#fff8f8] text-ink"
                    : "border-[#b9cbe6] bg-[#f4f8fe] text-ink hover:border-navy hover:bg-white"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {errors.cls && (
        <p role="alert" className="-mt-3 text-[13px] font-semibold text-[#e0242b]">
          {errors.cls}
        </p>
      )}

      {latest && (
        <p className="inline-flex items-center gap-2 rounded-full border border-[#a7d8b4] bg-[#ecf8ef] px-3.5 py-1.5 text-[14px] font-semibold text-[#166534]">
          <span className="h-2 w-2 rounded-full bg-[#16a34a]" aria-hidden="true" />
          {latest.label} &mdash; Result declared
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Examination" error={errors.session} htmlFor="r-session" icon={ClipboardList}>
            <select
              id="r-session"
              value={values.session}
              onChange={set("session")}
              className={`${controlCls(errors.session)} cursor-pointer appearance-none pr-10 ${values.session ? "" : "text-[#8a97b3]"}`}
            >
              <option value="">-- Select Examination --</option>
              {RESULT_SESSIONS.map((s) => (
                <option key={s.value} value={s.value} className="text-ink">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} strokeWidth={2.2} className="pointer-events-none absolute right-3.5 top-[15px] text-[#5b78a8]" aria-hidden="true" />
          </Field>
        </div>

        <Field label="Enrollment No." error={errors.enrollment} htmlFor="r-enr" icon={Hash}>
          <input
            id="r-enr"
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

        <Field label="Date of Birth" error={errors.dob} htmlFor="r-dob" icon={CalendarDays}>
          <input
            id="r-dob"
            type="date"
            autoComplete="off"
            min="1940-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={values.dob}
            onChange={set("dob")}
            className={controlCls(errors.dob)}
          />
        </Field>

        {/* sum-the-numbers verification (like the JSOS result page) */}
        <div className="sm:col-span-2">
          <label htmlFor="r-captcha" className="mb-1.5 block text-[14px] font-bold text-ink">
            Verification: sum the numbers <span className="text-[#e0242b]">*</span>
          </label>
          <div className="flex items-stretch gap-3">
            <div className="flex h-[48px] min-w-[170px] select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed border-[#7fa0d6] bg-[#eef4fc] px-4 text-[18px] font-extrabold tracking-widest text-navy">
              <ShieldCheck size={18} strokeWidth={2} className="text-[#5b78a8]" aria-hidden="true" />
              {captcha.question ? `${captcha.question} =` : captcha.failed ? "—" : "..."}
            </div>
            <input
              id="r-captcha"
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
              className={`${controlCls(errors.captcha)} !w-[120px] !pl-4 shrink-0`}
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
          className="inline-flex h-[46px] min-w-[150px] items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-7 text-[14.5px] font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {status === "loading" ? "Searching..." : "Get Result"}
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
        <b>Note:</b> The results published on the net are for immediate information to the examinees. Although every effort is made to
        maintain the accuracy of the results, errors may creep in inadvertently. Students are advised to verify their marks with the
        official marksheet issued through the Study Centre. For discrepancies, contact your Study Centre or Goa Open School.
      </p>
    </form>
  );
}
