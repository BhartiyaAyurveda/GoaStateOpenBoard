// SERVER-ONLY: social media profiles managed in Board dashboard > Social Media Links.
// Only profiles that are switched ON and have a usable https:// link are shown on the website.
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";

// platforms the dashboard knows about; `profile` builds a link from a bare handle
const PLATFORMS = {
  twitter: { name: "Twitter / X", profile: (h) => `https://x.com/${h}` },
  instagram: { name: "Instagram", profile: (h) => `https://www.instagram.com/${h}` },
  youtube: { name: "YouTube", profile: (h) => `https://www.youtube.com/@${h}` },
  linkedin: { name: "LinkedIn", profile: (h) => `https://www.linkedin.com/company/${h}` },
  facebook: { name: "Facebook", profile: (h) => `https://www.facebook.com/${h}` },
  whatsapp: { name: "WhatsApp", profile: null }, // a channel needs its full link
  telegram: { name: "Telegram", profile: (h) => `https://t.me/${h}` },
};

const cleanHandle = (v) => String(v ?? "").trim().replace(/^@+/, "").replace(/[^\w.-]/g, "").slice(0, 60);
const cleanUrl = (v) => {
  const u = String(v ?? "").trim().slice(0, 300);
  return /^https:\/\/[^\s]+$/i.test(u) ? u : "";
};

export function sanitizeSocials(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const platform = PLATFORMS[item?.id];
    if (!platform || seen.has(item.id) || item.enabled !== true) continue;
    let url = cleanUrl(item.url);
    if (!url && platform.profile) {
      const handle = cleanHandle(item.handle);
      if (handle) url = platform.profile(handle);
    }
    if (!url) continue;
    seen.add(item.id);
    out.push({ id: item.id, name: platform.name, url });
  }
  return out;
}

// memoised per request (the footer and a page can both ask)
export const getSocialLinks = cache(async () => {
  try {
    const { data } = await supabaseAdmin.from("system_settings").select("value").eq("key", "social_links").maybeSingle();
    return sanitizeSocials(data?.value ? JSON.parse(data.value) : []);
  } catch {
    return [];
  }
});
