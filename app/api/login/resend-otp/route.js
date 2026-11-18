import { NextResponse } from "next/server";
import { authConfigured, verifyOtpChallenge } from "@/lib/auth";
import { adminOtpEmail, adminOtpRequired, emailOtpEnabled, requestOtp } from "@/lib/otp";

// Board login: send the code again (the first step's challenge must still be valid). Only POST is exported.
// requestOtp itself refuses a new code within 60 seconds of the previous one.

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

export async function POST(request) {
  try {
    if (!sameOrigin(request)) return json({ ok: false, error: "Forbidden." }, 403);
    const { body, error } = await readJson(request);
    if (error) return error;

    if (!authConfigured() || !adminOtpRequired() || !emailOtpEnabled()) return json({ ok: false, error: "Login is not available right now." }, 503);
    if (!verifyOtpChallenge(typeof body?.challenge === "string" ? body.challenge : "")) {
      return json({ ok: false, error: "Your sign-in session expired. Please log in again." }, 401);
    }

    const sent = await requestOtp(adminOtpEmail(), "admin_login");
    if (!sent.success) return json({ ok: false, error: sent.error || "Could not send the login code." }, 429);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}
