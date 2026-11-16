// SERVER-ONLY: notices published from the Board dashboard (Announcements tab).
// Falls back to the sample notices until the first announcement is published.
import { supabaseAdmin } from "@/lib/supabase";
import { NOTICE_CATEGORIES, SAMPLE_NOTICES } from "@/lib/notices";

const NEW_DAYS = 14;

export async function getNotices() {
  try {
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("id, title, category, attachment_url, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data || data.length === 0) return SAMPLE_NOTICES;

    return data.map((a) => {
      const date = new Date(a.created_at).toISOString().slice(0, 10);
      const isNew = Date.now() - new Date(a.created_at).getTime() < NEW_DAYS * 86400000;
      const href = typeof a.attachment_url === "string" && /^https:\/\//.test(a.attachment_url) ? a.attachment_url : undefined;
      return {
        text: a.title,
        date,
        cat: NOTICE_CATEGORIES.includes(a.category) ? a.category : "General",
        isNew,
        href,
      };
    });
  } catch {
    return SAMPLE_NOTICES;
  }
}
