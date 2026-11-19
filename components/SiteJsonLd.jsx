import JsonLd from "@/components/JsonLd";
import { getContactInfo } from "@/lib/site-settings";
import { getSocialLinks } from "@/lib/social-links";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_NAME_KONKANI, SITE_URL } from "@/lib/site";

// Home page only: tells search engines who the school is (name, logo, address, phone, e-mail, social profiles).
// The contact details and social links are the ones the Board keeps in the dashboard, so they stay in step.
export default async function SiteJsonLd() {
  const [contact, socials] = await Promise.all([getContactInfo(), getSocialLinks()]);

  const addressText = (contact.addressLines || []).join(" ").replace(/\s+/g, " ").trim();
  const address = addressText
    ? {
        "@type": "PostalAddress",
        streetAddress: addressText,
        addressRegion: "Goa",
        postalCode: addressText.match(/\b\d{6}\b/)?.[0],
        addressCountry: "IN",
      }
    : undefined;

  // "0832–2743300" / "98765 43210" -> "+918322743300" (the form search engines expect)
  const digits = String(contact.phone || "").replace(/[^\d+]/g, "");
  const telephone = !digits ? undefined : digits.startsWith("+") ? digits : `+91${digits.length === 10 ? digits : digits.replace(/^0/, "")}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: ["GSOS", SITE_NAME_KONKANI],
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}${OG_IMAGE}`,
    description: SITE_DESCRIPTION,
    areaServed: { "@type": "State", name: "Goa" },
    address,
    email: contact.email || undefined,
    telephone,
    contactPoint: telephone || contact.email
      ? [{ "@type": "ContactPoint", contactType: "customer support", telephone, email: contact.email || undefined, areaServed: "IN", availableLanguage: ["English", "Konkani"] }]
      : undefined,
    sameAs: socials.length ? socials.map((s) => s.url) : undefined,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  );
}
