import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { adminOtpEmail, emailOtpEnabled, maskEmail, requestOtp } from "@/lib/otp";
import { supabaseAdmin } from "@/lib/supabase";

// Change password, step 1: check the current password, then e-mail a one-time code to the admin address.
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

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden." }, 403);
    const session = await requireAdmin(request);
    if (!session) return json({ ok: false, error: "Unauthorized" }, 401);

    const body = await readJson(request);
    const current = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    if (!current) return json({ ok: false, error: "Enter your current password." }, 400);

    if (tooManyFails(session.admin_id)) return json({ ok: false, error: "Too many wrong attempts. Please try again after some time." }, 429);
    if (!(await checkCurrentPassword(session.admin_id, current))) {
      recordFail(session.admin_id);
      return json({ ok: false, error: "Your current password is not correct." }, 400);
    }

    if (!adminOtpEmail() || !emailOtpEnabled()) {
      return json({ ok: false, error: "Changing the password needs the e-mail service, which is not set up." }, 503);
    }
    const sent = await requestOtp(adminOtpEmail(), "admin_password_change");
    if (!sent.success) return json({ ok: false, error: sent.error || "Could not send the code." }, 429);
    return json({ ok: true, emailHint: maskEmail(adminOtpEmail()) });
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
