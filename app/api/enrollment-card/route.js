import { NextResponse } from "next/server";
import { ENROLLMENT_PATTERN } from "@/lib/result-options";
import { findEnrollmentCard, enrollmentCardsAvailable } from "@/lib/enrollment-cards";
import { verifyChallenge } from "@/lib/captcha";

// Only POST is exported, so every other method gets a 405 from Next.js.

const MAX_BODY_BYTES = 3_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map();

// Small in-memory limiter (per server instance). For production use a shared
// store (Redis / platform rate-limit) and a managed CAPTCHA.
function rateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
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

const json = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function isValidDob(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) return false;
  return d.getUTCFullYear() >= 1940 && d.getTime() <= Date.now();
}

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
    if (rateLimited(ip)) {
      return json({ ok: false, error: "Too many attempts. Please try again after some time." }, 429);
    }

    // validate (never trust client values)
    const enrollment = typeof body.enrollment === "string" ? body.enrollment.trim().toUpperCase() : "";
    const dob = typeof body.dob === "string" ? body.dob.trim() : "";
    const cls = typeof body.cls === "string" ? body.cls.trim().toUpperCase() : "";
    const errors = {};
    if (cls !== "X" && cls !== "XII") errors.cls = "Select Class X or Class XII.";
    if (!ENROLLMENT_PATTERN.test(enrollment)) errors.enrollment = "Enter a valid enrollment number.";
    if (!isValidDob(dob)) errors.dob = "Enter a valid date of birth.";
    if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

    if (!verifyChallenge(body.captchaToken, body.captchaAnswer)) {
      return json({ ok: false, errors: { captcha: "Incorrect or expired verification. Please try again." } }, 400);
    }

    if (!enrollmentCardsAvailable()) {
      return json({ ok: false, error: "Online enrollment cards will be available soon. Please check back later." }, 503);
    }

    const card = await findEnrollmentCard({ enrollment, dob, cls });
    if (!card) {
      // one generic message for every mismatch, so details cannot be probed
      return json({ ok: false, error: `No Class ${cls} enrollment card found for the details entered. Please check the class, enrollment number and date of birth and try again.` }, 404);
    }
    return json({ ok: true, card });
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
