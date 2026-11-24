import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// Board-only: which subjects does this student take?
// GET  -> every subject of the student's course (all years) + the ids currently ticked
// PUT  -> { subject_ids: [...] }  ticked subjects; an empty list means "all subjects" (no restriction)

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadCourseSubjects(registrationId) {
  const { data: reg, error } = await supabaseAdmin
    .from("student_registrations")
    .select("id, courses(course_name)")
    .eq("id", registrationId)
    .maybeSingle();
  if (error || !reg) return { reg: null, subjects: [] };

  const courseName = reg.courses?.course_name || "";
  if (!courseName) return { reg, subjects: [] };

  const { data: subjects } = await supabaseAdmin
    .from("course_subjects")
    .select("id, subject_name, subject_code, year_number, is_language_option")
    .eq("course_name", courseName)
    .order("year_number", { ascending: true })
    .order("created_at", { ascending: true });
  return { reg, subjects: subjects || [] };
}

export async function GET(request, { params }) {
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid registration." }, { status: 400 });

    const { reg, subjects } = await loadCourseSubjects(id);
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // separate query so a database without the column yet answers "no selection" instead of failing
    let selected = [];
    let columnMissing = false;
    const { data: sel, error: selErr } = await supabaseAdmin.from("student_registrations").select("selected_subject_ids").eq("id", id).maybeSingle();
    if (selErr) columnMissing = true;
    else if (Array.isArray(sel?.selected_subject_ids)) selected = sel.selected_subject_ids;

    return NextResponse.json({ ok: true, subjects, selected, columnMissing });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await requireAdmin(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = (await params).id;
    if (!UUID.test(id)) return NextResponse.json({ error: "Invalid registration." }, { status: 400 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const ids = body?.subject_ids;
    if (!Array.isArray(ids) || ids.length > 100 || !ids.every((v) => typeof v === "string" && UUID.test(v))) {
      return NextResponse.json({ error: "subject_ids must be a list of subject ids." }, { status: 400 });
    }

    const { reg, subjects } = await loadCourseSubjects(id);
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // never trust client ids: only subjects of this student's own course are accepted
    const allowed = new Set(subjects.map((s) => s.id));
    const clean = [...new Set(ids)].filter((v) => allowed.has(v));
    if (clean.length !== new Set(ids).size) {
      return NextResponse.json({ error: "Some subjects do not belong to this student's course." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("student_registrations")
      .update({ selected_subject_ids: clean.length ? clean : null })
      .eq("id", id);
    if (error) {
      const missing = /selected_subject_ids/.test(error.message || "");
      return NextResponse.json(
        { error: missing ? "Database update pending: run the 'selected_subject_ids' SQL from supabase/schema.sql first." : "Could not save the subjects." },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true, selected: clean });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
