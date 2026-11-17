// SERVER-ONLY: homepage content managed from Board dashboard > Home Customization.
// Stored as one JSON document in system_settings (key "home_content"); each section that
// has not been customised falls back to HOME_DEFAULTS.
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { HOME_DEFAULTS, HOME_LIMITS, HOME_SECTIONS } from "@/lib/home-defaults";
import { HOME_ICONS } from "@/lib/home-icons";

const KEY = "home_content";

// ── validation (never trust what the browser sends) ──────────────────────────
class Invalid extends Error {}

const text = (v, max, { required = false, label = "Field" } = {}) => {
  const s = String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  if (required && !s) throw new Invalid(`${label} is required.`);
  return s;
};

// same-site paths, https links, anchors, mail/phone links — nothing that can run script
const link = (v, label = "Link") => {
  const h = String(v ?? "").trim().slice(0, 500);
  if (h === "" || h === "#") return "#";
  if (/^#[\w-]+$/.test(h)) return h;
  if (/^\/(?!\/)[^\s]*$/.test(h)) return h;
  if (/^https:\/\/[^\s]+$/i.test(h)) return h;
  if (/^(mailto:|tel:)[^\s]+$/i.test(h)) return h;
  throw new Invalid(`${label} must start with /, https://, mailto: or tel: (or be #).`);
};

// an image link: a file in /public or an https URL; empty means "use the default"
const imageLink = (v, fallback) => {
  const h = String(v ?? "").trim().slice(0, 500);
  if (!h || h === "#") return fallback;
  if (/^\/(?!\/)[^\s]*$/.test(h) || /^https:\/\/[^\s]+$/i.test(h)) return h;
  throw new Invalid("Image link must start with / or https://.");
};

const icon = (v, fallback) => (Object.prototype.hasOwnProperty.call(HOME_ICONS, v) ? v : fallback);

const list = (v, min, max, label) => {
  if (!Array.isArray(v)) throw new Invalid(`${label} must be a list.`);
  if (v.length < min) throw new Invalid(`${label}: add at least ${min} item${min === 1 ? "" : "s"}.`);
  if (v.length > max) throw new Invalid(`${label}: at most ${max} items are allowed.`);
  return v;
};

const button = (b, label) => {
  const lbl = text(b?.label, 40);
  return { label: lbl, href: lbl ? link(b?.href, `${label} link`) : "#" }; // empty label = button hidden
};

const SANITIZERS = {
  syllabus: (d) => {
    const url = link(d?.url, "Syllabus PDF link");
    if (url === "#") throw new Invalid("Upload the syllabus PDF (or paste its link).");
    return { title: text(d?.title, 80, { required: true, label: "Syllabus name" }), url };
  },
  hero: (d) => ({
    heading: text(d?.heading, 160, { required: true, label: "Heading" }),
    text: text(d?.text, 400),
    primary: button(d?.primary, "Button 1"),
    secondary: button(d?.secondary, "Button 2"),
    image: imageLink(d?.image, HOME_DEFAULTS.hero.image),
    imageMobile: imageLink(d?.imageMobile, HOME_DEFAULTS.hero.imageMobile),
    imageAlt: text(d?.imageAlt, 160) || HOME_DEFAULTS.hero.imageAlt,
  }),
  cards: (d) =>
    list(d, 1, HOME_LIMITS.cards, "Cards").map((c, i) => ({
      title: text(c?.title, 60, { required: true, label: `Card ${i + 1} title` }),
      sub: text(c?.sub, 120),
      icon: icon(c?.icon, "FileText"),
      href: link(c?.href, `Card ${i + 1} link`),
    })),
  quickLinks: (d) => ({
    items: list(d?.items, 0, HOME_LIMITS.quickLinks, "Quick links").map((q, i) => ({
      text: text(q?.text, 120, { required: true, label: `Quick link ${i + 1} text` }),
      href: link(q?.href, `Quick link ${i + 1} link`),
    })),
    note: text(d?.note, 300),
  }),
  services: (d) =>
    list(d, 1, HOME_LIMITS.services, "Services").map((s, i) => ({
      label: text(s?.label, 50, { required: true, label: `Service ${i + 1} name` }),
      icon: icon(s?.icon, "FileText"),
      href: link(s?.href, `Service ${i + 1} link`),
    })),
  stats: (d) =>
    list(d, 1, HOME_LIMITS.stats, "Statistics").map((s, i) => ({
      value: text(s?.value, 20, { required: true, label: `Statistic ${i + 1} value` }),
      label: text(s?.label, 40, { required: true, label: `Statistic ${i + 1} label` }),
      icon: icon(s?.icon, "Users"),
    })),
};

export function sanitizeHomeSection(section, data) {
  const fn = SANITIZERS[section];
  if (!fn) throw new Invalid("Unknown section.");
  return fn(data);
}

export const isInvalid = (e) => e instanceof Invalid;

// ── storage ─────────────────────────────────────────────────────────────────
export async function readHomeOverrides() {
  const { data, error } = await supabaseAdmin.from("system_settings").select("value").eq("key", KEY).maybeSingle();
  if (error) throw error;
  try {
    const parsed = JSON.parse(data?.value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeHomeOverrides(overrides) {
  const { error } = await supabaseAdmin
    .from("system_settings")
    .upsert({ key: KEY, value: JSON.stringify(overrides), updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export function mergeHomeContent(overrides) {
  const content = {};
  const customised = {};
  for (const section of HOME_SECTIONS) {
    content[section] = HOME_DEFAULTS[section];
    if (overrides && section in overrides) {
      try {
        content[section] = sanitizeHomeSection(section, overrides[section]);
        customised[section] = true;
      } catch {
        // a broken saved value must never break the homepage: use the default
      }
    }
  }
  return { content, customised };
}

// Used by the public pages (memoised per request). Falls back to the defaults on any error.
export const getHomeContent = cache(async () => {
  try {
    return mergeHomeContent(await readHomeOverrides()).content;
  } catch {
    return HOME_DEFAULTS;
  }
});
