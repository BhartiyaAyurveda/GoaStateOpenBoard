// SERVER-ONLY Supabase client. Never import this file from a client component.
// It uses the secret (service-role) key, which bypasses Row Level Security, so the
// key must stay in server-only env vars (never NEXT_PUBLIC_*). All access control
// is enforced by the API routes (see lib/auth.js); RLS is enabled on every table
// with no public policies, so the browser (publishable key) can read nothing.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_Secret_key || process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(url || "http://localhost", secretKey || "missing-key", {
  auth: { autoRefreshToken: false, persistSession: false },
});
