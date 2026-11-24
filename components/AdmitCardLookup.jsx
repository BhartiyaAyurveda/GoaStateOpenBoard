"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Hash, Loader2, Printer, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { ENROLLMENT_PATTERN } from "@/lib/result-options";
import DatePicker from "@/components/ui/DatePicker";
import AdmitCardTemplate from "@/components/admin/AdmitCardTemplate";

const EMPTY = { cls: "X", enrollment: "", dob: "" };
const CLASS_TABS = [
  { value: "X", label: "Class X", sub: "Secondary" },
  { value: "XII", label: "Class XII", sub: "Senior Secondary" },
];

const controlCls = (err) =>
  `h-[48px] w-full rounded-md border bg-[#fbfdff] pl-11 pr-3 text-[14.5px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 ${
    err ? "border-[#e0242b] bg-[#fff8f8]" : "border-[#b9cbe6]"
  }`;

const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const dayName = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "long", timeZone: "UTC" });

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

const candidateInstructions = [
  "Bring this admit card and a valid photo ID proof to the examination centre.",
  "Reach the examination centre at least 30 minutes before the start of the examination.",
  "Mobile phones, smart watches and other electronic devices are not allowed in the examination hall.",
  "Do not write anything other than your roll number on the question paper or answer book.",
  "Unfair means during the examination will lead to cancellation of the candidature.",
];

function AdmitCardSheet({ data, onReset }) {
  const { candidate: c, centre, schedule, sample } = data;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-[20px] font-bold text-ink">Your Admit Card</h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex h-[40px] items-center gap-2 rounded-md bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
          >
            <Printer size={16} /> Print / Save as PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex h-[40px] items-center gap-2 rounded-md border border-[#9db7e0] bg-white px-5 text-[14px] font-bold text-ink hover:bg-[#f2f7fe]"
          >
            <RotateCcw size={16} /> Get another admit card
          </button>
        </div>
      </div>

      <article className="relative overflow-hidden border-2 border-navy bg-white print:border">
        {sample && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="-rotate-[24deg] select-none text-[64px] font-extrabold uppercase tracking-widest text-[#e0242b]/15 sm:text-[96px]">
              Sample
            </span>
          </div>
        )}

        <header className="flex items-center gap-4 border-b-[3px] border-navy bg-[#f4f8fe] px-5 py-4">
          <Image src="/images/logo.png" alt="" width={480} height={266} className="h-[54px] w-auto" />
          <div className="flex-1 text-center">
            <p className="text-[22px] font-extrabold tracking-wide text-navy sm:text-[26px]">GOA STATE OPEN SCHOOL</p>
            <p lang="kok" className="font-devanagari text-[15px] font-semibold text-navy">गोंय राज्य मुक्त शाळा</p>
            <p className="text-[13.5px] font-semibold text-[#44557a]">Open Schooling | Flexible Learning</p>
          </div>
          <span className="hidden w-[54px] sm:block" />
        </header>

        <div className="bg-navy px-5 py-2 text-center text-[14px] font-bold uppercase tracking-[0.18em] text-white">
          Admit Card / Hall Ticket
        </div>

        {sample && (
          <p className="border-b border-[#e0242b]/30 bg-[#fff1f1] px-5 py-1.5 text-center text-[13px] font-bold text-[#b4161c]">
            SAMPLE ADMIT CARD FOR DESIGN REVIEW &ndash; NOT A REAL ADMIT CARD
          </p>
        )}

        <p className="px-5 pt-4 text-center text-[14px] font-bold text-ink">{c.examination}</p>

        {/* candidate + photo */}
        <div className="grid grid-cols-[1fr_auto] gap-4 px-5 pt-4">
          <table className="w-full border-collapse text-[14px]">
            <tbody>
              {[
                ["Roll No.", c.roll],
                ["Enrollment No.", c.enrollment],
                ["Name of the Candidate", c.name],
                ["Father's Name", c.father],
                ["Date of Birth", fmtDate(c.dob)],
                ["Programme", c.programme],
              ].map(([l, v]) => (
                <tr key={l}>
                  <th className="w-[36%] border border-[#9db7e0] bg-[#eef4fc] px-3 py-1.5 text-left font-bold text-ink">{l}</th>
                  <td className="border border-[#9db7e0] px-3 py-1.5 font-semibold text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex h-[150px] w-[120px] items-center justify-center border border-[#111] px-2 text-center text-[12px] font-medium text-[#555]">
            Affix passport size photograph
          </div>
        </div>

        {/* centre */}
        <div className="px-5 pt-4">
          <div className="border border-[#9db7e0] bg-[#fbfdff] px-3 py-2 text-[14px]">
            <b className="text-ink">Examination Centre:</b>{" "}
            <span className="font-semibold text-ink">
              {[centre.name, centre.address].filter(Boolean).join(", ")}
            </span>
          </div>
        </div>

        {/* schedule */}
        <div className="overflow-x-auto px-5 pt-4">
          <table className="w-full min-w-[520px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-navy text-white">
                {["Date", "Day", "Subject Code", "Subject", "Time"].map((h) => (
                  <th key={h} className="border border-navy px-3 py-2 text-center text-[13.5px] font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedule.map((r, i) => (
                <tr key={r.code} className={i % 2 ? "bg-[#f7faff]" : ""}>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center font-semibold">{fmtDate(r.date)}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{dayName(r.date)}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{r.code}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 font-semibold">{r.subject}</td>
                  <td className="border border-[#9db7e0] px-3 py-2 text-center">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* instructions */}
        <div className="px-5 pt-4">
          <p className="mb-1 text-[13.5px] font-extrabold uppercase tracking-wider text-navy">Instructions to candidates</p>
          <ol className="list-decimal space-y-0.5 pl-5 text-[13.5px] font-medium leading-snug text-ink">
            {candidateInstructions.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>

        {/* signatures */}
        <div className="grid grid-cols-3 gap-6 px-5 pb-5 pt-14 text-center text-[13px] font-bold italic text-ink">
          <div className="border-t border-[#111] pt-1">Signature of the Candidate</div>
          <div className="border-t border-[#111] pt-1">Study Centre Coordinator (with seal)</div>
          <div className="border-t border-[#111] pt-1">Authorised Signatory, Goa State Open School</div>
        </div>

        <p className="border-t border-dashed border-[#9db7e0] bg-[#fff8e6] px-5 py-2.5 text-[12.5px] font-medium leading-relaxed text-[#5a4300]">
          <b>Note:</b> This is a computer-generated admit card. Candidates must carry a printed copy to the examination centre. Report
          any error to the Study Centre / Goa State Open School immediately.
        </p>
      </article>
    </div>
  );
}

export default function AdmitCardLookup() {
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

  // Class X and Class XII are checked separately: switching class clears the entered details
  const chooseClass = (cls) => {
    if (cls === values.cls) return;
    setValues({ ...EMPTY, cls });
    setErrors({});
    setStatus("idle");
    setMessage("");
    loadCaptcha();
  };

  const reset = () => {
    setValues((v) => ({ ...EMPTY, cls: v.cls }));
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
      const res = await fetch("/api/admit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cls: values.cls,
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
          <RotateCcw size={16} /> Search another
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex h-[40px] items-center gap-2 rounded-md bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
        >
          <Printer size={16} /> Print / Download Admit Card
        </button>
      </div>
        {card.template ? <AdmitCardTemplate data={card.template} /> : <AdmitCardSheet data={card} onReset={reset} />}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-7">
      <div role="tablist" aria-label="Select class" className="grid grid-cols-2 gap-2 rounded-lg bg-[#eef4fc] p-1.5">
        {CLASS_TABS.map((t) => {
          const active = values.cls === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => chooseClass(t.value)}
              className={`min-w-0 rounded-md px-2 py-2.5 text-center transition sm:px-3 ${
                active ? "bg-navy text-white shadow-md" : "text-ink hover:bg-white"
              }`}
            >
              <span className="block whitespace-nowrap text-[15px] font-extrabold leading-tight sm:text-[16px]">
                {t.label}
                <span className="hidden sm:inline"> Admit Card</span>
              </span>
              <span className={`block text-[12px] font-semibold leading-tight sm:text-[12.5px] ${active ? "text-white/80" : "text-[#5b6b8c]"}`}>{t.sub}</span>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-2 rounded-md border border-[#c9daf2] bg-[#eef4fc] px-3 py-2 text-[13.5px] font-semibold text-[#44557a]">
        <span className="text-[15px] font-bold text-[#e0242b]">*</span> Enter your Enrollment Number and Date of Birth exactly as given
        in your admission form.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Enrollment No." error={errors.enrollment} htmlFor="a-enr" icon={Hash}>
          <input
            id="a-enr"
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

        <Field label="Date of Birth" error={errors.dob} htmlFor="a-dob" icon={CalendarDays}>
          <DatePicker
            id="a-dob"
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
        <label htmlFor="a-captcha" className="mb-1.5 block text-[14px] font-bold text-ink">
          Verification: sum the numbers <span className="text-[#e0242b]">*</span>
        </label>
        <div className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex h-[48px] min-w-0 flex-1 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md sm:min-w-[170px] sm:flex-none sm:gap-2 border border-dashed border-[#7fa0d6] bg-[#eef4fc] px-4 text-[18px] font-extrabold tracking-widest text-navy">
            <ShieldCheck size={18} strokeWidth={2} className="text-[#5b78a8]" aria-hidden="true" />
            {captcha.question ? `${captcha.question} =` : captcha.failed ? "—" : "..."}
          </div>
          <input
            id="a-captcha"
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

      <div className="flex items-center gap-3 border-t border-dashed border-[#9db7e0] pt-5">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-[46px] min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] px-4 text-[14.5px] sm:min-w-[170px] sm:flex-none sm:px-7 font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
          {status === "loading" ? "Searching..." : `Get Class ${values.cls} Admit Card`}
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-[46px] shrink-0 rounded-md border border-[#9db7e0] bg-white px-5 text-[14.5px] sm:px-7 font-bold text-ink transition hover:bg-[#f2f7fe]"
        >
          Reset
        </button>
      </div>

      <p className="rounded-md border border-[#f3d28a] bg-[#fff8e6] px-4 py-3 text-[13px] font-medium leading-relaxed text-[#5a4300]">
        <b>Note:</b> Candidates must carry a printed copy of the admit card to the examination centre. If your admit card is not
        available or has an error, contact your Study Centre or Goa State Open School.
      </p>
    </form>
  );
}
