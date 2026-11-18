"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2, MailCheck, ShieldCheck } from "lucide-react";

const fieldCls =
  "h-11 w-full rounded-xl border border-[#d3e1f5] bg-[#f4f8fe] px-3.5 pr-11 text-[15px] text-[#082a63] outline-none placeholder:text-[#8a97b3] focus:border-[#1b57d8] focus:bg-white focus:ring-2 focus:ring-[#1b57d8]/15";

function PasswordField({ label, value, onChange, autoComplete, show, onToggle, disabled, hint }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">{label}</span>
      <span className="relative block">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          maxLength={128}
          disabled={disabled}
          className={fieldCls + (disabled ? " opacity-70" : "")}
        />
        <button type="button" onClick={onToggle} aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#5b78a8] hover:bg-[#eaf2fd]">
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
      {hint && <span className="mt-1 block text-[12.5px] text-[#6b7ea3]">{hint}</span>}
    </label>
  );
}

// Board dashboard > Change Password. The current password is checked first, then a code is e-mailed to the
// admin address; the new password is only saved when the code is right.
export default function ChangePasswordSection({ username, fullName, onDone }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [show, setShow] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [emailHint, setEmailHint] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const strong = next.length >= 8 && /[A-Za-z]/.test(next) && /\d/.test(next);

  function reset() {
    setCurrent(""); setNext(""); setConfirm(""); setOtp(""); setShow(false);
    setCodeSent(false); setEmailHint(""); setCooldown(0); setBusy(false); setError(""); setDone(false);
  }

  async function post(url, payload) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  function checkNewPassword() {
    if (!current) return "Enter your current password.";
    if (!strong) return "The new password must be at least 8 characters, with letters and a number.";
    if (next !== confirm) return "The two new passwords do not match.";
    if (next === current) return "The new password must be different from the current one.";
    return "";
  }

  async function sendCode() {
    const problem = checkNewPassword();
    if (problem) return setError(problem);
    setBusy(true);
    setError("");
    try {
      const { res, data } = await post("/api/admin/change-password/send-otp", { currentPassword: current });
      if (res.ok && data.ok) {
        setCodeSent(true);
        setEmailHint(data.emailHint || "");
        setCooldown(60);
      } else {
        setError(data.error || "Could not send the code.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!codeSent) return sendCode();
    const problem = checkNewPassword();
    if (problem) return setError(problem);
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your e-mail.");
    setBusy(true);
    setError("");
    try {
      const { res, data } = await post("/api/admin/change-password", { currentPassword: current, newPassword: next, otp });
      if (res.ok && data.ok) {
        setDone(true);
        onDone?.();
      } else {
        setError(data.error || "Could not change the password.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#082a63]">Change password</h2>
        <p className="text-[14px] text-[#3d5688] sm:text-[15px]">Change your Board login password. A 6-digit code is e-mailed to the registered address to confirm it is you.</p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#d3e1f5] bg-white shadow-sm">
        <div className="border-b border-[#d3e1f5] bg-[#f4f8fe] px-4 py-3.5 sm:px-5">
          <h3 className="text-[15.5px] font-bold text-[#082a63]">Your password</h3>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center sm:px-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-8 w-8" /></span>
            <p className="text-[17px] font-bold text-[#082a63]">Password changed</p>
            <p className="max-w-sm text-[14px] text-[#3d5688]">Use the new password the next time you sign in. Any other device that was signed in has been signed out.</p>
            <button type="button" onClick={reset}
              className="mt-2 h-11 rounded-xl border border-[#d3e1f5] bg-white px-6 text-[15px] font-bold text-[#082a63] hover:bg-[#f4f8fe]">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-4 sm:p-5">
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[14px] font-semibold text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <label className="block min-w-0">
              <span className="mb-1.5 block text-[13.5px] font-bold text-[#082a63]">Username</span>
              <input
                type="text"
                value={username || ""}
                readOnly
                autoComplete="username"
                className="h-11 w-full cursor-default rounded-xl border border-[#d3e1f5] bg-[#eef2f8] px-3.5 text-[15px] font-semibold text-[#082a63] outline-none"
              />
              {fullName && <span className="mt-1 block text-[12.5px] text-[#6b7ea3]">{fullName}</span>}
            </label>

            <PasswordField label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" show={show} onToggle={() => setShow((v) => !v)} disabled={codeSent} />
            <PasswordField label="New password" value={next} onChange={setNext} autoComplete="new-password" show={show} onToggle={() => setShow((v) => !v)} disabled={codeSent}
              hint="At least 8 characters, with letters and a number." />
            <PasswordField label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" show={show} onToggle={() => setShow((v) => !v)} disabled={codeSent} />

            {codeSent && (
              <div className="space-y-3 rounded-xl border border-[#c9daf2] bg-[#eef4fc] p-4">
                <p className="flex items-start gap-2 text-[14px] font-medium leading-snug text-[#44557a]">
                  <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#1b57d8]" />
                  <span>We sent a 6-digit code to <b className="text-[#082a63]">{emailHint || "the registered e-mail address"}</b>. It is valid for 10 minutes.</span>
                </p>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  placeholder="6-digit code"
                  className="h-12 w-full rounded-xl border border-[#b9cbe6] bg-white px-3.5 text-center font-mono text-[20px] font-bold tracking-[0.5em] text-[#082a63] outline-none focus:border-[#1b57d8] focus:ring-2 focus:ring-[#1b57d8]/15"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13.5px] font-semibold">
                  <button type="button" onClick={() => { setCodeSent(false); setOtp(""); setError(""); }} className="text-[#44557a] hover:text-[#082a63]">Edit the passwords</button>
                  <button type="button" onClick={sendCode} disabled={cooldown > 0 || busy}
                    className="text-[#1b57d8] underline underline-offset-2 disabled:cursor-not-allowed disabled:text-[#8a97b3] disabled:no-underline">
                    {cooldown > 0 ? `Send the code again in ${cooldown}s` : "Send the code again"}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={busy}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1b57d8] px-6 text-[15px] font-bold text-white hover:bg-[#1245b8] disabled:opacity-60 sm:w-auto">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : codeSent ? <ShieldCheck className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                {busy ? "Please wait…" : codeSent ? "Change password" : "Send code to e-mail"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
