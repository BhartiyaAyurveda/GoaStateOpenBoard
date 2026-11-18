"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Lock, LogIn, MailCheck, TriangleAlert, User } from "lucide-react";

const controlCls = (err) =>
  `h-[50px] w-full rounded-md border bg-[#fbfdff] pl-11 pr-3 text-[15px] font-medium text-ink outline-none transition placeholder:text-[#8a97b3] hover:border-[#7fa0d6] focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 ${
    err ? "border-[#e0242b] bg-[#fff8f8]" : "border-[#b9cbe6]"
  }`;

function Field({ label, error, htmlFor, icon: Icon, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[14px] font-bold text-ink">
        {label} <span className="text-[#e0242b]">*</span>
      </label>
      <div className="relative">
        <Icon size={18} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-[16px] text-[#5b78a8]" aria-hidden="true" />
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

export default function LoginForm({ role, idLabel, idPlaceholder }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | error | done
  const [message, setMessage] = useState("");
  const clear = (key) => errors[key] && setErrors((er) => ({ ...er, [key]: undefined }));

  // Board login, step 2: the code e-mailed after the password was accepted
  const [challenge, setChallenge] = useState("");
  const [emailHint, setEmailHint] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const backToPassword = () => {
    setChallenge("");
    setOtp("");
    setPassword("");
    setMessage("");
    setStatus("idle");
    setResent(false);
  };

  async function postJson(url, payload) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  }

  async function onVerify(e) {
    e.preventDefault();
    if (status === "loading") return;
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Enter the 6-digit code.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const { res, data } = await postJson("/api/login/verify-otp", { challenge, otp });
      if (res.ok && data.ok) {
        setStatus("done");
        window.location.assign(typeof data.redirect === "string" && data.redirect.startsWith("/") ? data.redirect : "/");
        return;
      }
      setMessage(data.error || "The code could not be verified.");
      setStatus("error");
      setOtp("");
      if (res.status === 401) backToPassword(); // the sign-in session expired
    } catch {
      setMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  async function onResend() {
    if (cooldown > 0 || status === "loading") return;
    setMessage("");
    setResent(false);
    try {
      const { res, data } = await postJson("/api/login/resend-otp", { challenge });
      if (res.ok && data.ok) {
        setResent(true);
        setCooldown(60);
        setStatus("idle");
      } else {
        setMessage(data.error || "Could not send the code again.");
        setStatus("error");
      }
    } catch {
      setMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    const found = {};
    if (!/^[A-Za-z0-9._@-]{3,60}$/.test(identifier.trim())) found.identifier = `Enter a valid ${idLabel}.`;
    if (password.length < 6) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, identifier: identifier.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok && data.otpRequired && typeof data.challenge === "string") {
        setChallenge(data.challenge);
        setEmailHint(typeof data.emailHint === "string" ? data.emailHint : "");
        setPassword("");
        setOtp("");
        setCooldown(60);
        setStatus("idle");
        return;
      }
      if (res.ok && data.ok) {
        setStatus("done");
        window.location.assign(typeof data.redirect === "string" && data.redirect.startsWith("/") ? data.redirect : "/");
        return;
      }
      if (data.errors) setErrors(data.errors);
      setMessage(data.error || "Please check the highlighted fields and try again.");
      setStatus("error");
      setPassword(""); // never keep a rejected password in the field
    } catch {
      setMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (challenge) {
    return (
      <form onSubmit={onVerify} noValidate autoComplete="off" className="space-y-5">
        <div className="flex items-start gap-3 rounded-md border border-[#c9daf2] bg-[#eef4fc] px-4 py-3">
          <MailCheck size={22} strokeWidth={1.8} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-[14px] font-medium leading-snug text-[#44557a]">
            We sent a 6-digit code to <b className="text-navy-deep">{emailHint || "the registered e-mail address"}</b>. Enter it below to finish signing in. It is valid for 10 minutes.
          </p>
        </div>

        <Field label="Login code" error={null} htmlFor={`${role}-otp`} icon={KeyRound}>
          <input
            id={`${role}-otp`}
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (status === "error") setStatus("idle");
            }}
            placeholder="6-digit code"
            className={`${controlCls(false)} font-mono text-[20px] font-bold tracking-[0.5em]`}
          />
        </Field>

        {status === "error" && message && (
          <p role="alert" className="rounded-md border border-[#e0242b]/40 bg-[#fff1f1] px-3 py-2.5 text-[14px] font-semibold text-[#b4161c]">
            {message}
          </p>
        )}
        {resent && status !== "error" && (
          <p role="status" className="rounded-md border border-[#a7d8b4] bg-[#ecf8ef] px-3 py-2.5 text-[14px] font-semibold text-[#166534]">
            A new code has been sent.
          </p>
        )}
        {status === "done" && (
          <p role="status" className="rounded-md border border-[#a7d8b4] bg-[#ecf8ef] px-3 py-2.5 text-[14px] font-semibold text-[#166534]">
            Login successful. Redirecting...
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || otp.length !== 6}
          className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] text-[15px] font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {status === "loading" ? "Verifying..." : "Verify and login"}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[14px] font-semibold">
          <button type="button" onClick={backToPassword} className="inline-flex items-center gap-1.5 text-[#44557a] hover:text-navy">
            <ArrowLeft size={15} /> Back
          </button>
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0}
            className="text-brand underline underline-offset-2 hover:text-navy disabled:cursor-not-allowed disabled:text-[#8a97b3] disabled:no-underline"
          >
            {cooldown > 0 ? `Send the code again in ${cooldown}s` : "Send the code again"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate autoComplete="on" className="space-y-5">
      <Field label={idLabel} error={errors.identifier} htmlFor={`${role}-id`} icon={User}>
        <input
          id={`${role}-id`}
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={60}
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clear("identifier");
          }}
          placeholder={idPlaceholder}
          className={controlCls(errors.identifier)}
        />
      </Field>

      <Field label="Password" error={errors.password} htmlFor={`${role}-pw`} icon={Lock}>
        <input
          id={`${role}-pw`}
          name="password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          maxLength={128}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
          onBlur={() => setCaps(false)}
          placeholder="Enter your password"
          className={`${controlCls(errors.password)} !pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-1.5 top-1.5 flex h-[38px] w-[38px] items-center justify-center rounded text-[#5b78a8] hover:bg-[#eef4fc] hover:text-navy"
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </Field>
      {caps && (
        <p className="-mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#9a5a05]" role="status">
          <TriangleAlert size={14} /> Caps Lock is on
        </p>
      )}

      {status === "error" && message && (
        <p role="alert" className="rounded-md border border-[#e0242b]/40 bg-[#fff1f1] px-3 py-2.5 text-[14px] font-semibold text-[#b4161c]">
          {message}
        </p>
      )}
      {status === "done" && (
        <p role="status" className="rounded-md border border-[#a7d8b4] bg-[#ecf8ef] px-3 py-2.5 text-[14px] font-semibold text-[#166534]">
          Login successful. Redirecting...
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#2b6ae6] to-[#1048bd] text-[15px] font-bold text-white shadow-md shadow-blue-900/25 transition hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
        {status === "loading" ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-[14px] font-medium text-[#44557a]">
        Forgot your password or ID?{" "}
        <Link href="/contact" className="font-bold text-brand underline underline-offset-2 hover:text-navy">
          Contact Goa State Open School
        </Link>
      </p>
    </form>
  );
}
