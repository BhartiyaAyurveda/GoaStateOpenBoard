import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

// Public: the Secretary's signature image printed on the result marksheet.
// Only this one setting is exposed; the Board changes it in the dashboard (Signature).
export async function GET() {
  try {
    const { data } = await supabaseAdmin.from("system_settings").select("value").eq("key", "secretary_signature").maybeSingle();
    let url = "";
    try {
      const parsed = JSON.parse(data?.value || "{}");
      if (typeof parsed?.url === "string" && /^https:\/\//i.test(parsed.url)) url = parsed.url;
    } catch {
      /* not set / invalid: no signature */
    }
    return NextResponse.json({ ok: true, url });
  } catch {
    return NextResponse.json({ ok: true, url: "" });
  }
}
