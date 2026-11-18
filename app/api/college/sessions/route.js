import { NextResponse } from "next/server";
import { requireCollege } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// The academic sessions a college can pick when registering a student (managed by the Board in
// Exam Management > Exam Sessions). Newest first; `active` is the session the Board has marked Active.
export async function GET(request) {
  const session = await requireCollege(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("exam_sessions")
    .select("session_name, academic_session, is_active");
  if (error) return NextResponse.json({ error: "Could not load sessions." }, { status: 500 });

  const names = new Set();
  let active = null;
  for (const s of data || []) {
    const name = (s.academic_session || s.session_name || "").trim();
    if (!name) continue;
    names.add(name);
    if (s.is_active && !active) active = name;
  }
  const sessions = [...names].sort((a, b) => b.localeCompare(a));
  return NextResponse.json({ ok: true, sessions, active }, { headers: { "Cache-Control": "no-store" } });
}
