import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: courses, error }, { data: subs }] = await Promise.all([
    supabaseAdmin.from("courses").select("*").order("sort_order"),
    supabaseAdmin.from("course_subjects").select("id, course_name, subject_code, subject_name, theory_max, practical_max"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // subjects are stored per course name; attach them for the dashboard
  const data = (courses || []).map((c) => ({ ...c, subjects: (subs || []).filter((s) => s.course_name === c.course_name) }));
  return NextResponse.json({ ok: true, data });
}

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { course_name, course_name_hindi, course_code, duration_label, sort_order, category, eligibility, career_scope } = body;
  if (!course_name) return NextResponse.json({ error: "course_name required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("courses")
    .insert({ course_name, course_name_hindi: course_name_hindi || null, course_code: course_code || null, duration_label, sort_order: sort_order || 0, category: category || "secondary", eligibility: eligibility || null, career_scope: career_scope || null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Course name already exists" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
