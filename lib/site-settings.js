// SERVER-ONLY: contact details edited in the Board dashboard (Contact Info tab).
// Any field left empty there falls back to the official default shown below.
import { supabaseAdmin } from "@/lib/supabase";

const DEFAULTS = {
  phone: "0832–2743300",
  email: "support@goaopenschool.in",
  addressLines: ["Goa Open School,", "Directorate of Education,", "Panaji, Goa – 403001"],
  hoursWeekday: "Monday – Friday: 10:00 AM – 5:30 PM",
  hoursOther: "Closed on Saturday, Sunday & public holidays",
};

const str = (v, max = 160) => (typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max) : "");

export async function getContactInfo() {
  let c = {};
  try {
    const { data } = await supabaseAdmin.from("system_settings").select("value").eq("key", "contact_info").maybeSingle();
    if (data?.value) c = JSON.parse(data.value) || {};
  } catch {
    /* use defaults */
  }

  const phone = str(c.primaryPhone, 30) || DEFAULTS.phone;
  const digits = phone.replace(/[^\d+]/g, "");
  const tel = digits ? `tel:${digits.startsWith("+") ? digits : digits.length === 10 ? `+91${digits}` : `+91${digits.replace(/^0/, "")}`}` : "";
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(c.primaryEmail)) ? str(c.primaryEmail) : DEFAULTS.email;

  const place = [str(c.city, 60), str(c.state, 60)].filter(Boolean).join(", ");
  const cityLine = [place, str(c.pincode, 10)].filter(Boolean).join(" – ");
  const addressLines = str(c.addressLine1, 200)
    ? ["Goa Open School,", str(c.addressLine1, 200) + (cityLine ? "," : ""), cityLine].filter(Boolean)
    : DEFAULTS.addressLines;

  return {
    phone,
    tel: tel || "tel:+918322743300",
    email,
    addressLines,
    hoursWeekday: str(c.workingHoursWeekday) || DEFAULTS.hoursWeekday,
    hoursOther: str(c.workingHoursSunday) || DEFAULTS.hoursOther,
  };
}
