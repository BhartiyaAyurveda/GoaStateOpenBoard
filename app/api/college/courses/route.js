import { NextResponse } from "next/server";
import { requireCollege } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const session = await requireCollege(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data, error }, { data: langs }] = await Promise.all([
    supabaseAdmin.from("courses").select("id, course_name, duration_label").order("course_name"),
    supabaseAdmin
      .from("course_subjects")
      .select("id, course_name, subject_name, subject_code, year_number")
      .eq("is_language_option", true)
      .or("year_number.eq.1,year_number.is.null")
      .order("subject_code"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // the language options of each course (English and the other subjects are compulsory)
  const byCourse = new Map();
  for (const l of langs || []) {
    const list = byCourse.get(l.course_name) || [];
    list.push({ id: l.id, name: l.subject_name, code: l.subject_code || "" });
    byCourse.set(l.course_name, list);
  }
  return NextResponse.json({ ok: true, data: (data || []).map((c) => ({ ...c, language_options: byCourse.get(c.course_name) || [] })) });
}
