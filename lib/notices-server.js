// SERVER-ONLY: notices published from the Board dashboard (Announcements tab).
// The database is the single source of truth for the public Notices page, the
// homepage notice board and the dashboard. (Initial notices: scripts/seed-announcements.mjs.)
import { supabaseAdmin } from "@/lib/supabase";
import { NOTICE_CATEGORIES } from "@/lib/notices";

const NEW_DAYS = 14;

// only https:// links (uploaded files) or same-site paths (e.g. /result, /forms/x.pdf)
function safeHref(u) {
  return typeof u === "string" && (/^https:\/\//.test(u) || /^\/(?!\/)/.test(u)) ? u : undefined;
}

export async function getNotices() {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("id, title, category, attachment_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];

    return data.map((a) => {
      const date = new Date(a.created_at).toISOString().slice(0, 10);
      const isNew = Date.now() - new Date(a.created_at).getTime() < NEW_DAYS * 86400000;
      return {
        text: a.title,
        date,
        cat: NOTICE_CATEGORIES.includes(a.category) ? a.category : "General",
        isNew,
        href: safeHref(a.attachment_url),
      };
    });
  } catch {
    return [];
  }
}
