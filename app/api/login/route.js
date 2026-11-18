import { NextResponse } from "next/server";
import { LOGIN_ROLES, authConfigured, authenticate, sessionCookieOptions, signOtpChallenge } from "@/lib/auth";
import { adminOtpEmail, adminOtpRequired, emailOtpEnabled, maskEmail, requestOtp } from "@/lib/otp";

// Only POST is exported, so every other method gets a 405 from Next.js.
// Credentials are only ever read from the JSON body: never from the URL, and
// never logged or echoed back.

const MAX_BODY_BYTES = 2_000;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9._@-]{3,60}$/;

// Brute-force protection (in-memory, per server instance). For production use a
// shared store (Redis / platform rate limit) and lock accounts after repeated failures.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 20;
const MAX_PER_ACCOUNT = 5;
const hits = new Map();

function limited(key, max) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

// per-account throttle counts FAILED attempts only; a successful login clears it
function blocked(key, max) {
  const now = Date.now();
  return (hits.get(key) || []).filter((t) => now - t < WINDOW_MS).length >= max;
}
function recordFailure(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
}

const json = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request) {
  try {
    // same-origin only
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        /* invalid origin */
      }
      if (originHost !== host) return json({ ok: false, error: "Forbidden." }, 403);
    }

    if (!(request.headers.get("content-type") || "").includes("application/json")) {
      return json({ ok: false, error: "Unsupported content type." }, 415);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ ok: false, error: "Request too large." }, 413);

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ ok: false, error: "Invalid request." }, 400);
    }

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    if (limited(`ip:${ip}`, MAX_PER_IP)) {
      return json({ ok: false, error: "Too many attempts. Please try again after some time." }, 429);
    }

    // validate (never trust client values)
    const role = typeof body.role === "string" ? body.role : "";
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const errors = {};
    if (!LOGIN_ROLES.includes(role)) return json({ ok: false, error: "Invalid request." }, 400);
    if (!IDENTIFIER_PATTERN.test(identifier)) errors.identifier = "Enter a valid ID.";
    if (password.length < 6 || password.length > 128) errors.password = "Enter your password.";
    if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

    // throttle guesses against a single account (also counts unknown IDs, so nothing is revealed)
    const acctKey = `acct:${role}:${identifier.toLowerCase()}`;
    if (blocked(acctKey, MAX_PER_ACCOUNT)) {
      return json({ ok: false, error: "Too many attempts for this account. Please try again after some time." }, 429);
    }

    if (!authConfigured()) {
      return json({ ok: false, error: "Login is not available right now. Please contact Goa State Open School." }, 503);
    }

    const session = await authenticate({ role, identifier, password });
    if (!session) {
      recordFailure(acctKey);
      // one generic message for every failure, so IDs cannot be probed
      return json({ ok: false, error: "Invalid ID or password." }, 401);
    }
    hits.delete(acctKey);

    // Board login needs a second step: a one-time code e-mailed to the admin address. No session cookie until it is entered.
    if (role === "board" && adminOtpRequired()) {
      if (!emailOtpEnabled()) {
        return json({ ok: false, error: "Board login needs the e-mail service, which is not set up. Please contact the administrator." }, 503);
      }
      const otp = await requestOtp(adminOtpEmail(), "admin_login");
      if (!otp.success) return json({ ok: false, error: otp.error || "Could not send the login code." }, 429);
      const challenge = signOtpChallenge({ aid: session.user.id, usr: session.user.username });
      return json({ ok: true, otpRequired: true, challenge, emailHint: maskEmail(adminOtpEmail()) });
    }

    const res = json({ ok: true, redirect: role === "board" ? "/super-admin/dashboard" : "/college/dashboard" });
    res.cookies.set(session.cookieName, session.token, sessionCookieOptions());
    return res;
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
