import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const singleKey = searchParams.get("key");

    // only these settings are public; never let a caller read an arbitrary system_settings key
    const PUBLIC_KEYS = ["contact_info", "social_links", "homepage_content", "hero_images"];
    if (singleKey && !PUBLIC_KEYS.includes(singleKey)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const keys = singleKey ? [singleKey] : PUBLIC_KEYS;

    const { data, error } = await supabaseAdmin
      .from("system_settings")
      .select("key, value")
      .in("key", keys);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const map = {};
    for (const row of data || []) {
      try { map[row.key] = JSON.parse(row.value); } catch { map[row.key] = row.value; }
    }

    const homepage = map.homepage_content || null;
    const heroImages = Array.isArray(map.hero_images) ? map.hero_images : null;

    // Inject DB hero images into homepage when no custom slides are configured
    const homepageWithHero = homepage
      ? { ...homepage, _heroImages: heroImages }
      : heroImages
        ? { _heroImages: heroImages }
        : null;

    return NextResponse.json({
      ok:       true,
      contact:  map.contact_info      || null,
      socials:  map.social_links      || null,
      homepage: homepageWithHero,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
