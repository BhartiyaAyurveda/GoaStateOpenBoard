// SERVER-ONLY authentication. Never import this file from a client component.
//
// Board admins live in `admins`, colleges in `colleges` (bcrypt password hashes,
// stored in the database). A successful login issues a signed JWT in an HttpOnly,
// SameSite=Strict (+ Secure in production) cookie. Every protected API re-checks the
// cookie AND that the account is still active (requireAdmin / requireCollege).
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export const ADMIN_COOKIE_NAME = "admin_session";
export const COLLEGE_COOKIE_NAME = "college_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export const LOGIN_ROLES = ["board", "college"];

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET is not configured");
  return s;
}

export function authConfigured() {
  const s = process.env.JWT_SECRET;
  return Boolean(s && s.length >= 32 && process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

export const signAdminToken = (payload) => jwt.sign(payload, secret(), { expiresIn: SESSION_MAX_AGE, algorithm: "HS256" });
export const signCollegeToken = (payload) => jwt.sign(payload, secret(), { expiresIn: SESSION_MAX_AGE, algorithm: "HS256" });

// Board login step 1 (password correct) hands out this token; it is NOT a session (it has no admin_id, so
// requireAdmin rejects it) and is only good for the OTP step. 10 minutes.
export const OTP_CHALLENGE_MINUTES = 10;
export const signOtpChallenge = (payload) =>
  jwt.sign({ ...payload, purpose: "admin_otp" }, secret(), { expiresIn: OTP_CHALLENGE_MINUTES * 60, algorithm: "HS256" });

export function verifyOtpChallenge(token) {
  const payload = verifyToken(token);
  if (!payload || payload.purpose !== "admin_otp" || !payload.aid) return null;
  return payload;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret(), { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

// Returns the admin session if the cookie is valid AND the admin is still active.
export async function requireAdmin(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.admin_id) return null;

  const { data: admin } = await supabaseAdmin
    .from("admins")
    .select("id, username, full_name, is_active, password_changed_at")
    .eq("id", payload.admin_id)
    .maybeSingle();

  if (!admin || !admin.is_active) return null;
  // changing the password signs out every login that was issued before the change
  if (admin.password_changed_at && (payload.iat || 0) * 1000 < new Date(admin.password_changed_at).getTime() - 1000) return null;
  return { admin_id: admin.id, username: admin.username, full_name: admin.full_name };
}

// Returns the college session if the cookie is valid AND the college is still active.
export async function requireCollege(request) {
  const token = request.cookies.get(COLLEGE_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.college_id) return null;

  const { data: college } = await supabaseAdmin
    .from("colleges")
    .select("id, college_name, username, is_active")
    .eq("id", payload.college_id)
    .maybeSingle();

  if (!college || !college.is_active) return null;
  return { college_id: college.id, college_name: college.college_name, username: college.username };
}

// A real hash so an unknown user costs the same time as a wrong password.
let dummyHash;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("not-a-real-password", 10));

// Verifies credentials. Returns { role, token, cookieName, user } or null.
// Same null result for "unknown user", "inactive" and "wrong password".
export async function authenticate({ role, identifier, password }) {
  const username = String(identifier || "").trim().toLowerCase();
  const isBoard = role === "board";
  const table = isBoard ? "admins" : "colleges";
  const cols = isBoard ? "id, username, password_hash, full_name, is_active, otp_required" : "id, college_name, username, password_hash, is_active";

  const { data: row, error } = await supabaseAdmin.from(table).select(cols).eq("username", username).maybeSingle();
  if (error) throw new Error("auth lookup failed");

  const ok = await bcrypt.compare(String(password || ""), row?.password_hash || getDummyHash());
  if (!row || !row.is_active || !ok) return null;

  if (isBoard) {
    return {
      role,
      cookieName: ADMIN_COOKIE_NAME,
      token: signAdminToken({ admin_id: row.id, username: row.username }),
      // only an explicit false skips the e-mailed code (anything else, or a missing value, keeps it on)
      user: { id: row.id, username: row.username, full_name: row.full_name, otpRequired: row.otp_required !== false },
    };
  }
  return {
    role,
    cookieName: COLLEGE_COOKIE_NAME,
    token: signCollegeToken({ college_id: row.id, username: row.username }),
    user: { id: row.id, college_name: row.college_name, username: row.username },
  };
}
