"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, LogIn, TriangleAlert, User } from "lucide-react";

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
          Contact Goa Open School
        </Link>
      </p>
    </form>
  );
}
