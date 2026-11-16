import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length: 12 }, () => chars[randomInt(chars.length)]).join("");
}

export async function POST(request, { params }) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const newPassword = body.password || generatePassword();

  const password_hash = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabaseAdmin
    .from("colleges")
    .update({ password_hash })
    .eq("id", (await params).id)
    .select("id, college_name, username, is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, college: data, password: newPassword });
}
