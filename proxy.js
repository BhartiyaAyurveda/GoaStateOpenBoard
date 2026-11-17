import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 1) Dashboards: redirect to the login page unless a valid, signed session cookie
//    is present. (APIs re-check the session and that the account is still active.)
// 2) Maintenance mode: public pages redirect to /maintenance while the flag is on.

const ADMIN_COOKIE = "admin_session";
const COLLEGE_COOKIE = "college_session";

const BYPASS_MAINTENANCE = [
  /^\/super-admin/,
  /^\/college/,
  /^\/board-login/,
  /^\/college-login/,
  /^\/api\//,
  /^\/maintenance/,
  /^\/_next/,
  /^\/images/,
  /^\/favicon/,
  /^\/icon/,
  /^\/apple-icon/,
];

function validSession(token, key) {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    return Boolean(payload?.[key]);
  } catch {
    return false;
  }
}

let cache = { at: 0, on: false };
async function maintenanceOn() {
  if (Date.now() - cache.at < 30_000) return cache.on;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await fetch(`${url}/rest/v1/system_settings?key=eq.maintenance_mode&select=value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      const rows = await res.json();
      cache = { at: Date.now(), on: rows?.[0]?.value === "true" };
    }
  } catch {
    // fail open: never block the whole site because the check failed
  }
  return cache.on;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/super-admin")) {
    if (!validSession(request.cookies.get(ADMIN_COOKIE)?.value, "admin_id")) {
      return NextResponse.redirect(new URL("/board-login", request.url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/college/")) {
    if (!validSession(request.cookies.get(COLLEGE_COOKIE)?.value, "college_id")) {
      return NextResponse.redirect(new URL("/college-login", request.url));
    }
    return NextResponse.next();
  }

  if (BYPASS_MAINTENANCE.some((p) => p.test(pathname))) return NextResponse.next();
  // an admin may always browse the public site
  if (validSession(request.cookies.get(ADMIN_COOKIE)?.value, "admin_id")) return NextResponse.next();

  if (await maintenanceOn()) return NextResponse.redirect(new URL("/maintenance", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|pdf|css|js)$).*)"],
};
