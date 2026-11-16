import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NOTICE_CATEGORIES } from "@/lib/notices";

export async function PATCH(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const allowed = ["title", "title_hi", "content", "content_hi", "is_published", "attachment_url", "attachment_name", "category"];
  const updates = { updated_at: new Date().toISOString() };
  for (const key of allowed) { if (key in body) updates[key] = body[key]; }
  if ("category" in updates && !NOTICE_CATEGORIES.includes(updates.category)) updates.category = "General";

  const { data, error } = await supabaseAdmin
    .from("announcements").update(updates).eq("id", (await params).id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("announcements").delete().eq("id", (await params).id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
