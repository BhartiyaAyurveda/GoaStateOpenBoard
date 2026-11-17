// SERVER-ONLY: contact details edited in the Board dashboard (Contact Info tab).
// Every page that shows a phone number, email, address or office hours reads them from here.
// Any field left empty there falls back to the official default shown below.
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";

export const CONTACT_DEFAULTS = {
  phone: "0832–2743300",
  email: "support@goaopenschool.in",
  addressLines: ["Goa State Open School,", "Panaji, Goa – 403001"],
  hoursWeekday: "Monday – Friday: 10:00 AM – 5:30 PM",
  hoursOther: "Closed on Saturday, Sunday & public holidays",
  mapQuery: "Panaji, Goa 403001",
};

const str = (v, max = 160) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// "0832–2743300" / "9876543210" / "+91 98765 43210" -> "tel:+91…"
function toTel(phone) {
  const d = String(phone || "").replace(/[^\d+]/g, "");
  if (!d) return "";
  if (d.startsWith("+")) return `tel:${d}`;
  return `tel:+91${d.length === 10 ? d : d.replace(/^0/, "")}`;
}

// digits only, with the India code added to 10-digit numbers -> https://wa.me/91…
function toWhatsApp(num) {
  let d = String(num || "").replace(/\D/g, "");
  if (d.length < 10) return "";
  if (d.length === 10) d = `91${d}`;
  return `https://wa.me/${d}`;
}

// memoised per request, so a page + Navbar + Footer cost one database read
export const getContactInfo = cache(async () => {
  let c = {};
  try {
    const { data } = await supabaseAdmin.from("system_settings").select("value").eq("key", "contact_info").maybeSingle();
    if (data?.value) c = JSON.parse(data.value) || {};
  } catch {
    /* use defaults */
  }

  // optional registration line shown under the school name in the header (only what the Board has typed in)
  const registrationNote = str(c.registrationNote, 140);
  let registrationUrl = "";
  try {
    const u = new URL(str(c.registrationUrl, 300));
    if (u.protocol === "https:" || u.protocol === "http:") registrationUrl = u.toString();
  } catch {
    /* no link */
  }

  // optional logo at the top right of the header (uploaded by the Board; empty = nothing is shown)
  const httpUrl = (v, onlyHttps = false) => {
    try {
      const u = new URL(str(v, 400));
      return u.protocol === "https:" || (!onlyHttps && u.protocol === "http:") ? u.toString() : "";
    } catch {
      return "";
    }
  };
  const headerLogoUrl = httpUrl(c.headerLogoUrl, true);
  const headerLogoAlt = str(c.headerLogoAlt, 80);
  const headerLogoLink = headerLogoUrl ? httpUrl(c.headerLogoLink) : "";

  const phone = str(c.primaryPhone, 30) || CONTACT_DEFAULTS.phone;
  const phone2 = str(c.secondaryPhone, 30);
  const whatsapp = str(c.whatsappNumber, 30);
  const email = isEmail(str(c.primaryEmail)) ? str(c.primaryEmail) : CONTACT_DEFAULTS.email;
  const admissionsEmail = isEmail(str(c.admissionsEmail)) ? str(c.admissionsEmail) : "";
  const verificationEmail = isEmail(str(c.verificationEmail)) ? str(c.verificationEmail) : "";

  const place = [str(c.city, 60), str(c.state, 60)].filter(Boolean).join(", ");
  const cityLine = [place, str(c.pincode, 10)].filter(Boolean).join(" – ");
  const addressLine1 = str(c.addressLine1, 200);
  const addressLines = addressLine1
    ? ["Goa State Open School,", addressLine1 + (cityLine ? "," : ""), cityLine].filter(Boolean)
    : CONTACT_DEFAULTS.addressLines;

  // what Google Maps should search for
  const mapQuery = addressLine1
    ? [addressLine1, place, str(c.pincode, 10), str(c.country, 60)].filter(Boolean).join(", ")
    : CONTACT_DEFAULTS.mapQuery;

  return {
    headerLogoUrl,
    headerLogoAlt,
    headerLogoLink,
    registrationNote,
    registrationUrl: registrationNote ? registrationUrl : "",
    phone,
    tel: toTel(phone) || "tel:+918322743300",
    phone2,
    tel2: toTel(phone2),
    whatsapp,
    whatsappLink: toWhatsApp(whatsapp),
    email,
    admissionsEmail,
    verificationEmail,
    addressLines,
    hoursWeekday: str(c.workingHoursWeekday) || CONTACT_DEFAULTS.hoursWeekday,
    hoursOther: str(c.workingHoursSunday) || CONTACT_DEFAULTS.hoursOther,
    mapQuery,
    mapSearchUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
    mapEmbedUrl: `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`,
  };
});
