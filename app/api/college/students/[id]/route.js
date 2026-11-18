import { NextResponse } from "next/server";
import { requireCollege } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request, { params }) {
  const session = await requireCollege(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("student_registrations")
    .select(`*, courses(id, course_name, duration_label), colleges(id, college_name, city, state)`)
    .eq("id", (await params).id)
    .eq("college_id", session.college_id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: queries } = await supabaseAdmin
    .from("registration_queries")
    .select("*")
    .eq("registration_id", (await params).id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, data, queries: queries || [] });
}

const RESUBMIT_FIELDS = [
  "candidate_name", "father_name", "mother_name", "dob", "gender", "category",
  "aadhar_no", "phone", "email", "address", "city", "state", "pincode",
  "photo_url", "eighth_marksheet_url", "tenth_marksheet_url", "twelfth_marksheet_url",
];

export async function PATCH(request, { params }) {
  const session = await requireCollege(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify student belongs to this college
  const { data: existing } = await supabaseAdmin
    .from("student_registrations")
    .select("id, college_id, status")
    .eq("id", (await params).id)
    .eq("college_id", session.college_id)
    .maybeSingle();

  if (!existing) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  const body = await request.json();

  if (body.resubmit) {
    if (existing.status !== "query_raised") {
      return NextResponse.json({ error: "Only applications with a raised query can be resubmitted." }, { status: 400 });
    }
    const updates = { status: "submitted" };
    for (const key of RESUBMIT_FIELDS) {
      if (key in body) updates[key] = body[key] === "" ? null : body[key];
    }
    const { data, error } = await supabaseAdmin
      .from("student_registrations").update(updates).eq("id", (await params).id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin
      .from("registration_queries")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("registration_id", (await params).id)
      .eq("status", "open");

    return NextResponse.json({ ok: true, data });
  }

  // Roll numbers, enrollment numbers and result metadata are controlled by the Board only.
  return NextResponse.json({ error: "Roll and enrollment numbers are allotted by the Board." }, { status: 403 });
}
