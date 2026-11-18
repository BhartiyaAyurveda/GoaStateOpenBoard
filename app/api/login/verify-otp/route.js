import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, authConfigured, sessionCookieOptions, signAdminToken, verifyOtpChallenge } from "@/lib/auth";
import { adminOtpEmail, adminOtpRequired, verifyOtp } from "@/lib/otp";
import { supabaseAdmin } from "@/lib/supabase";

// Board login, step 2: the e-mailed code. Only POST is exported (every other method gets a 405).
// A wrong code counts against the code itself (5 tries), and the challenge from step 1 expires after 10 minutes.

const json = (body, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readJson(request) {
  if (!(request.headers.get("content-type") || "").includes("application/json")) return { error: json({ ok: false, error: "Unsupported content type." }, 415) };
  const raw = await request.text();
  if (raw.length > 4000) return { error: json({ ok: false, error: "Request too large." }, 413) };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: json({ ok: false, error: "Invalid request." }, 400) };
  }
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 30;
const hits = new Map();
function limited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_IP) return true;
  recent.push(now);
  hits.set(key, recent);
  return false;
}

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden." }, 403);
    const { body, error } = await readJson(request);
    if (error) return error;

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    if (limited(`ip:${ip}`)) return json({ ok: false, error: "Too many attempts. Please try again after some time." }, 429);

    if (!authConfigured() || !adminOtpRequired()) return json({ ok: false, error: "Login is not available right now." }, 503);

    const challenge = verifyOtpChallenge(typeof body?.challenge === "string" ? body.challenge : "");
    if (!challenge) return json({ ok: false, error: "Your sign-in session expired. Please log in again." }, 401);
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    if (!/^\d{6}$/.test(otp)) return json({ ok: false, error: "Enter the 6-digit code." }, 400);

    const result = await verifyOtp(adminOtpEmail(), "admin_login", otp);
    if (!result.success) return json({ ok: false, error: result.error }, 400);

    // the account must still be active
    const { data: admin } = await supabaseAdmin.from("admins").select("id, username, is_active").eq("id", challenge.aid).maybeSingle();
    if (!admin || !admin.is_active) return json({ ok: false, error: "Your sign-in session expired. Please log in again." }, 401);

    const res = json({ ok: true, redirect: "/super-admin/dashboard" });
    res.cookies.set(ADMIN_COOKIE_NAME, signAdminToken({ admin_id: admin.id, username: admin.username }), sessionCookieOptions());
    return res;
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
