// SERVER-ONLY stateless "sum the numbers" challenge (like the JSOS result page).
//
// The challenge is signed with HMAC-SHA256 so the server does not need to store
// it. Set RESULT_CAPTCHA_SECRET (server-only env var, at least 32 random chars)
// in production. In development a random per-process secret is used.
// Without a secret in production the challenge is disabled (returns null).
// For stronger protection use a managed CAPTCHA (e.g. Cloudflare Turnstile).

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TTL_MS = 5 * 60 * 1000;

function getSecret() {
  const fromEnv = process.env.RESULT_CAPTCHA_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env.NODE_ENV === "production") return null;
  // stable across hot reloads in dev
  globalThis.__gosDevCaptchaSecret ??= randomBytes(32).toString("hex");
  return globalThis.__gosDevCaptchaSecret;
}

const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (secret, data) => createHmac("sha256", secret).update(data).digest("base64url");

// one-time use: remember used challenge ids until they expire
const used = new Map();
function remember(id, exp) {
  const now = Date.now();
  for (const [k, e] of used) if (e < now) used.delete(k);
  used.set(id, exp);
}

export function createChallenge() {
  const secret = getSecret();
  if (!secret) return null;
  const a = 10 + Math.floor(Math.random() * 40);
  const b = 10 + Math.floor(Math.random() * 40);
  const payload = b64(JSON.stringify({ a, b, exp: Date.now() + TTL_MS, id: randomBytes(8).toString("hex") }));
  return { question: `${a} + ${b}`, token: `${payload}.${sign(secret, payload)}` };
}

export function verifyChallenge(token, answer) {
  try {
    const secret = getSecret();
    if (!secret || typeof token !== "string" || token.length > 400) return false;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expected = sign(secret, payload);
    const ok =
      sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) return false;
    const { a, b, exp, id } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < Date.now() || used.has(id)) return false;
    if (Number(String(answer).trim()) !== a + b) return false;
    remember(id, exp);
    return true;
  } catch {
    return false;
  }
}
