"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Hash, Loader2, Printer, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { ENROLLMENT_PATTERN } from "@/lib/result-options";

const EMPTY = { acknowledgement: "", dob: "" };

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

function EnrollmentSheet({ data, onReset }) {
  const { candidate: c, centre, subjects, sample } = data;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 className="text-[20px] font-bold text-ink">Your Enrollment Card</h2>
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
            <RotateCcw size={16} /> Get another card
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
            <p className="text-[22px] font-extrabold tracking-wide text-navy sm:text-[26px]">GOA OPEN SCHOOL</p>
            <p className="text-[13.5px] font-semibold text-[#44557a]">Directorate of Education, Government of Goa</p>
          </div>
          <span className="hidden w-[54px] sm:block" />
        </header>

        <div className="bg-navy px-5 py-2 text-center text-[14px] font-bold uppercase tracking-[0.18em] text-white">
          Student Enrollment Card
        </div>

        {sample && (
          <p className="border-b border-[#e0242b]/30 bg-[#fff1f1] px-5 py-1.5 text-center text-[13px] font-bold text-[#b4161c]">
            SAMPLE ENROLLMENT CARD FOR DESIGN REVIEW &ndash; NOT A REAL CARD
          </p>
        )}

        <p className="px-5 pt-4 text-center text-[14px] font-bold text-ink">
          Academic Session {c.session} &nbsp;|&nbsp; {c.programme}
        </p>

        {/* enrollment number highlight */}
        <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-2 border border-navy bg-[#eef4fc] px-4 py-2.5">
          <p className="text-[14px] font-bold text-[#44557a]">Enrollment No.</p>
          <p className="text-[22px] font-extrabold tracking-widest text-navy">{c.enrollment}</p>
        </div>

        {/* candidate + photo */}
        <div className="grid grid-cols-[1fr_auto] gap-4 px-5 pt-4">
          <table className="w-full border-collapse text-[14px]">
            <tbody>
              {[
                ["Name of the Candidate", c.name],
                ["Father's Name", c.father],
                ["Mother's Name", c.mother],
                ["Date of Birth", fmtDate(c.dob)],
                ["Gender / Category", `${c.gender} / ${c.category}`],
                ["Medium", c.medium],
                ["Acknowledgement No.", c.acknowledgement],
              ].map(([l, v]) => (
                <tr key={l}>
                  <th className="w-[38%] border border-[#9db7e0] bg-[#eef4fc] px-3 py-1.5 text-left font-bold text-ink">{l}</th>
                  <td className="border border-[#9db7e0] px-3 py-1.5 font-semibold text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex h-[150px] w-[120px] items-center justify-center border border-[#111] px-2 text-center text-[12px] font-medium text-[#555]">
            Affix passport size photograph
          </div>
        </div>

        {/* study centre */}
        <div className="px-5 pt-4">
          <div className="border border-[#9db7e0] bg-[#fbfdff] px-3 py-2 text-[14px]">
            <b className="text-ink">Study Centre:</b>{" "}
            <span className="font-semibold text-ink">
              {centre.name}, {centre.address}
            </span>
          </div>
        </div>

        {/* subjects */}
        <div className="overflow-x-auto px-5 pt-4">
          <table className="w-full min-w-[420px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-navy text-white">
                {["Sr.", "Subject Code", "Subject Enrolled For"].map((h) => (
                  <th key={h} className="border border-navy px-3 py-2 text-center text-[13.5px] font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((s, i) => (
                <tr key={s.code} className={i % 2 ? "bg-[#f7faff]" : ""}>
                  <td className="w-[60px] border border-[#9db7e0] px-3 py-1.5 text-center">{i + 1}</td>
                  <td className="w-[130px] border border-[#9db7e0] px-3 py-1.5 text-center">{s.code}</td>
                  <td className="border border-[#9db7e0] px-3 py-1.5 font-semibold">{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* validity */}
        <div className="grid grid-cols-2 gap-3 px-5 pt-4 text-[14px]">
          <div className="border border-[#9db7e0] bg-[#fbfdff] px-3 py-2">
            <span className="font-bold text-ink">Date of Enrollment:</span> <span className="font-semibold">{fmtDate(c.enrolledOn)}</span>
          </div>
          <div className="border border-[#9db7e0] bg-[#fbfdff] px-3 py-2">
            <span className="font-bold text-ink">Valid Till:</span> <span className="font-semibold">{fmtDate(c.validTill)}</span>
          </div>
        </div>

        {/* signatures */}
        <div className="grid grid-cols-3 gap-6 px-5 pb-5 pt-14 text-center text-[13px] font-bold italic text-ink">
          <div className="border-t border-[#111] pt-1">Signature of the Candidate</div>
          <div className="border-t border-[#111] pt-1">Study Centre Coordinator (with seal)</div>
          <div className="border-t border-[#111] pt-1">Authorised Signatory, Goa Open School</div>
        </div>

        <p className="border-t border-dashed border-[#9db7e0] bg-[#fff8e6] px-5 py-2.5 text-[12.5px] font-medium leading-relaxed text-[#5a4300]">
          <b>Note:</b> Keep this enrollment card safe. The Enrollment Number is required for the Admit Card, Result and all other
          correspondence with Goa Open School. Report any error to the Study Centre immediately.
        </p>
      </article>
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
    if (!ENROLLMENT_PATTERN.test(values.acknowledgement.trim().toUpperCase())) found.acknowledgement = "Enter a valid acknowledgement number.";
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
          acknowledgement: values.acknowledgement.trim().toUpperCase(),
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
      <div className="p-5 sm:p-7 print:p-0">
        <EnrollmentSheet data={card} onReset={reset} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 p-5 sm:p-7">
      <p className="flex items-center gap-2 rounded-md border border-[#c9daf2] bg-[#eef4fc] px-3 py-2 text-[13.5px] font-semibold text-[#44557a]">
        <span className="text-[15px] font-bold text-[#e0242b]">*</span> Enter the Acknowledgement Number given to you at the time of
        admission, and your Date of Birth.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Acknowledgement No." error={errors.acknowledgement} htmlFor="e-ack" icon={Hash}>
          <input
            id="e-ack"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={20}
            value={values.acknowledgement}
            onChange={set("acknowledgement")}
            placeholder="Enter acknowledgement number"
            className={`${controlCls(errors.acknowledgement)} uppercase placeholder:normal-case`}
          />
        </Field>

        <Field label="Date of Birth" error={errors.dob} htmlFor="e-dob" icon={CalendarDays}>
          <input
            id="e-dob"
            type="date"
            autoComplete="off"
            min="1940-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={values.dob}
            onChange={set("dob")}
            className={controlCls(errors.dob)}
          />
        </Field>
      </div>

      {/* sum-the-numbers verification */}
      <div>
        <label htmlFor="e-captcha" className="mb-1.5 block text-[14px] font-bold text-ink">
          Verification: sum the numbers <span className="text-[#e0242b]">*</span>
        </label>
        <div className="flex items-stretch gap-3">
          <div className="flex h-[48px] min-w-[170px] select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed border-[#7fa0d6] bg-[#eef4fc] px-4 text-[18px] font-extrabold tracking-widest text-navy">
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
        <b>Note:</b> Your Enrollment Number is shown on the card. If you do not have your Acknowledgement Number or cannot find your card,
        contact your Study Centre or Goa Open School.
      </p>
    </form>
  );
}
