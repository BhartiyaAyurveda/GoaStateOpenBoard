import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const STATUSES = ["pending", "submitted", "under_review", "query_raised", "approved", "rejected"];

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  // keep characters that could change the PostgREST filter out of the search term
  const search = (searchParams.get("search") || "").replace(/[,()%*\\]/g, " ").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from("student_registrations")
    .select(`
      id, enrollment_no, roll_no, candidate_name, father_name, dob, gender,
      phone, email, status, created_at, session_label, academic_session,
      courses(course_name),
      colleges(college_name, city, state)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`candidate_name.ilike.%${search}%,roll_no.ilike.%${search}%,enrollment_no.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ?counts=1 -> number of applications per status across ALL applications (for the dashboard cards)
  let counts;
  if (searchParams.get("counts") === "1") {
    const results = await Promise.all(
      STATUSES.map((st) =>
        supabaseAdmin.from("student_registrations").select("id", { count: "exact", head: true }).eq("status", st),
      ),
    );
    counts = Object.fromEntries(STATUSES.map((st, i) => [st, results[i].count || 0]));
  }

  return NextResponse.json({ ok: true, data, total: count, page, limit, ...(counts ? { counts } : {}) });
}
