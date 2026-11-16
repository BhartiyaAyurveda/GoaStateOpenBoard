import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Only POST is exported, so every other method gets a 405 from Next.js.

const SUBJECTS = ["Admission", "Study Centre Enquiry", "General Enquiry", "Others"];
const MAX_BODY_BYTES = 5_000;

// --- very small in-memory rate limiter (per server instance) ---------------
// Good enough to blunt casual spam. For production use a shared store
// (Redis / Upstash / your platform's rate-limit feature) and a CAPTCHA.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

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

const clean = (v, max) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "";

function validate(body) {
  const errors = {};
  const name = clean(body.name, 80);
  const mobile = clean(body.mobile, 15).replace(/[\s-]/g, "");
  const email = clean(body.email, 120);
  const subject = clean(body.subject, 40);
  const message = typeof body.message === "string" ? body.message.replace(/\u0000/g, "").trim().slice(0, 1000) : "";

  if (name.length < 2 || !/^[\p{L}\p{M}.' -]+$/u.test(name)) errors.name = "Enter a valid full name.";
  if (!/^(\+91)?[6-9]\d{9}$/.test(mobile)) errors.mobile = "Enter a valid 10-digit mobile number.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  if (!SUBJECTS.includes(subject)) errors.subject = "Please select a subject.";

  return { errors, data: { name, mobile, email, subject, message } };
}

export async function POST(request) {
  try {
    // Same-origin only: blocks cross-site form posts.
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        /* invalid origin */
      }
      if (originHost !== host) {
        return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
      }
    }

    if (!(request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    // Honeypot: real users never fill this hidden field; bots usually do.
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ ok: true });
    }

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const { errors, data } = validate(body);
    if (Object.keys(errors).length) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // Save the lead so it shows up in the Board dashboard → Contact Inquiries.
    const { error: dbError } = await supabaseAdmin.from("contact_inquiries").insert({
      full_name: data.name,
      email: data.email || null,
      phone: data.mobile,
      subject: data.subject,
      message: data.message || "(no message)",
      status: "new",
      is_read: false,
    });
    if (dbError) {
      console.error("Contact inquiry save failed:", dbError.message);
      return NextResponse.json({ ok: false, error: "Could not submit your message. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
