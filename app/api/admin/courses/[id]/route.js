import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["course_name", "course_name_hindi", "course_code", "duration_label", "sort_order", "category", "eligibility", "career_scope"];
  const updates = {};
  for (const key of allowed) { if (key in body) updates[key] = body[key]; }

  const id = (await params).id;

  // subjects and exam sessions point to a course by its NAME, so a rename has to carry them along
  let oldName = null;
  if (typeof updates.course_name === "string") {
    updates.course_name = updates.course_name.trim();
    if (!updates.course_name) return NextResponse.json({ error: "Course name cannot be empty." }, { status: 400 });
    const { data: current } = await supabaseAdmin.from("courses").select("course_name").eq("id", id).maybeSingle();
    if (current && current.course_name !== updates.course_name) oldName = current.course_name;
  }

  const { data, error } = await supabaseAdmin.from("courses").update(updates).eq("id", id).select().single();
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Another course already has this name." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (oldName) {
    const [a, b] = await Promise.all([
      supabaseAdmin.from("course_subjects").update({ course_name: updates.course_name }).eq("course_name", oldName),
      supabaseAdmin.from("exam_sessions").update({ course_name: updates.course_name }).eq("course_name", oldName),
    ]);
    if (a.error || b.error) {
      return NextResponse.json({ error: "Course renamed, but its subjects / exam sessions could not be updated. Please contact support." }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("courses").delete().eq("id", (await params).id);
  if (error) {
    // 23503 = still referenced (student applications etc.)
    if (error.code === "23503") {
      return NextResponse.json({ error: "This course is in use (student applications or exam data exist) and cannot be deleted." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
