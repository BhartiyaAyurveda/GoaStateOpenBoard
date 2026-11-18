import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE_NAME, requireAdmin, sessionCookieOptions, signAdminToken } from "@/lib/auth";
import { adminOtpEmail, verifyOtp } from "@/lib/otp";
import { supabaseAdmin } from "@/lib/supabase";

// Change password, step 2: current password + the e-mailed code + the new password.
// On success every older login is signed out, and this browser gets a fresh login cookie.
// Only POST is exported (every other method gets a 405).

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

// failed "current password" guesses, per admin (in-memory, per server instance)
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map();
function tooManyFails(id) {
  const now = Date.now();
  return (fails.get(id) || []).filter((t) => now - t < WINDOW_MS).length >= MAX_FAILS;
}
function recordFail(id) {
  const now = Date.now();
  fails.set(id, [...(fails.get(id) || []).filter((t) => now - t < WINDOW_MS), now]);
}

async function readJson(request) {
  if (!(request.headers.get("content-type") || "").includes("application/json")) return null;
  const raw = await request.text();
  if (raw.length > 2000) return null;
  try {
    const b = JSON.parse(raw);
    return b && typeof b === "object" && !Array.isArray(b) ? b : null;
  } catch {
    return null;
  }
}

async function checkCurrentPassword(adminId, password) {
  const { data: row } = await supabaseAdmin.from("admins").select("password_hash").eq("id", adminId).maybeSingle();
  return Boolean(row && (await bcrypt.compare(password, row.password_hash)));
}

function passwordProblem(pw, current) {
  if (pw.length < 8) return "The new password must be at least 8 characters.";
  if (pw.length > 128) return "The new password is too long.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number in the new password.";
  if (pw === current) return "The new password must be different from the current one.";
  return "";
}

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden." }, 403);
    const session = await requireAdmin(request);
    if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

    const body = await readJson(request);
    const current = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const next = typeof body?.newPassword === "string" ? body.newPassword : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    if (!current || !next) return json({ ok: false, error: "Fill in all the fields." }, 400);
    if (!/^\d{6}$/.test(otp)) return json({ ok: false, error: "Enter the 6-digit code." }, 400);
    const problem = passwordProblem(next, current);
    if (problem) return json({ ok: false, error: problem }, 400);
    if (!adminOtpEmail()) return json({ ok: false, error: "Changing the password needs the e-mail service, which is not set up." }, 503);

    if (tooManyFails(session.admin_id)) return json({ ok: false, error: "Too many wrong attempts. Please try again after some time." }, 429);
    if (!(await checkCurrentPassword(session.admin_id, current))) {
      recordFail(session.admin_id);
      return json({ ok: false, error: "Your current password is not correct." }, 400);
    }

    const verified = await verifyOtp(adminOtpEmail(), "admin_password_change", otp);
    if (!verified.success) return json({ ok: false, error: verified.error }, 400);

    const hash = await bcrypt.hash(next, 12);
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("admins").update({ password_hash: hash, password_changed_at: now }).eq("id", session.admin_id);
    if (error) return json({ ok: false, error: "Could not save the new password. Please try again." }, 500);

    const res = json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, signAdminToken({ admin_id: session.admin_id, username: session.username }), sessionCookieOptions());
    return res;
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
