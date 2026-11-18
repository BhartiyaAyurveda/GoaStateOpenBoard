import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["college_name", "email", "phone", "city", "state", "address", "is_active"];
  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if ("phone" in updates) {
    const phone = String(updates.phone ?? "").trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits." }, { status: 400 });
    }
    updates.phone = phone || null;
  }

  if ("password" in body && body.password) {
    updates.password_hash = await bcrypt.hash(body.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("colleges")
    .update(updates)
    .eq("id", (await params).id)
    .select("id, college_name, username, email, phone, city, state, is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;

  // a college that already has student registrations cannot be removed (it would orphan them): deactivate it instead
  const { count, error: countError } = await supabaseAdmin
    .from("student_registrations")
    .select("id", { count: "exact", head: true })
    .eq("college_id", id);
  if (countError) return NextResponse.json({ error: "Could not check the college's students." }, { status: 500 });
  if (count > 0) {
    return NextResponse.json(
      { error: `This college has ${count} student registration${count === 1 ? "" : "s"}, so it cannot be deleted. Deactivate it instead.` },
      { status: 409 },
    );
  }

  const { error } = await supabaseAdmin.from("colleges").delete().eq("id", id);
  if (error) {
    // e.g. another table still points at this college
    const inUse = error.code === "23503";
    return NextResponse.json(
      { error: inUse ? "This college is still used by other records, so it cannot be deleted. Deactivate it instead." : "Could not delete the college." },
      { status: inUse ? 409 : 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
