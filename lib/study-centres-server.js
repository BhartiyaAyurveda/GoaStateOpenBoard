// SERVER-ONLY: study centres managed in Board dashboard > Study Centres.
// Only active centres that are switched on for the website (show_on_website) are returned, and every value is cleaned before it reaches the page.
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";

const txt = (v, max = 200) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");

// "0832–2743300" / "+91 98765 43210" -> "tel:…" (digits and a leading + only)
function toTel(phone) {
  const d = String(phone || "").replace(/[^\d+]/g, "");
  if (!d) return "";
  return d.startsWith("+") ? `tel:${d}` : `tel:+91${d.length === 10 ? d : d.replace(/^0/, "")}`;
}

// only http(s) links are ever rendered as links
function safeUrl(v) {
  const s = txt(v, 300);
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
}

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const getStudyCentres = cache(async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from("affiliated_institutes")
      .select("id, name, address, city, state, type, code, phone, email, website")
      .eq("is_active", true)
      .eq("show_on_website", true)
      .order("sort_order")
      .order("name");
    if (error || !data) return [];
    return data.map((c) => {
      const email = txt(c.email, 120);
      return {
        id: c.id,
        name: txt(c.name, 160),
        code: txt(c.code, 30),
        type: txt(c.type, 120),
        address: txt(c.address, 240),
        city: txt(c.city, 80),
        state: txt(c.state, 80),
        phone: txt(c.phone, 30),
        tel: toTel(c.phone),
        email: isEmail(email) ? email : "",
        website: safeUrl(c.website),
      };
    });
  } catch {
    return [];
  }
});
