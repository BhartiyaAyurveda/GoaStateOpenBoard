import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { HOME_DEFAULTS, HOME_SECTIONS } from "@/lib/home-defaults";
import {
  isInvalid,
  mergeHomeContent,
  readHomeOverrides,
  sanitizeHomeSection,
  writeHomeOverrides,
} from "@/lib/home-content";

export const dynamic = "force-dynamic";

// GET /api/admin/home-content -> current content, the defaults, and which sections are customised
export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content, customised } = mergeHomeContent(await readHomeOverrides());
    return NextResponse.json({ ok: true, content, defaults: HOME_DEFAULTS, customised });
  } catch (err) {
    console.error("home-content GET:", err);
    return NextResponse.json({ error: "Could not load the homepage content." }, { status: 500 });
  }
}

// PUT /api/admin/home-content   body: { section, data }   (data: null = reset the section to its default)
export async function PUT(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { section, data } = body || {};
  if (!HOME_SECTIONS.includes(section)) return NextResponse.json({ error: "Unknown section." }, { status: 400 });

  try {
    const overrides = await readHomeOverrides();
    if (data === null) {
      delete overrides[section];
    } else {
      overrides[section] = sanitizeHomeSection(section, data);
    }
    await writeHomeOverrides(overrides);

    // make the change visible on the public site straight away
    revalidatePath("/", "layout");

    const { content, customised } = mergeHomeContent(overrides);
    return NextResponse.json({ ok: true, content, customised });
  } catch (err) {
    if (isInvalid(err)) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("home-content PUT:", err);
    return NextResponse.json({ error: "Could not save the homepage content." }, { status: 500 });
  }
}
