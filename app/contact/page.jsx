import { Clock, ExternalLink, Headphones, Mail, MapPin, MapPinned, MessageCircle, MessageSquareText, Phone } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getContactInfo } from "@/lib/site-settings";
import SocialLinks from "@/components/SocialLinks";

export const metadata = {
  title: "Contact Us | Goa State Open School",
  description: "Contact Goa State Open School, Directorate of Education, Government of Goa – address, phone, email and enquiry form.",
};


function Panel({ icon: Icon, title, className = "", children }) {
  return (
    <section className={`card-shadow flex flex-col overflow-hidden rounded-lg bg-white ${className}`}>
      <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
        <Icon size={24} strokeWidth={1.8} className="text-navy" />
        <h2 className="font-serif text-[22px] font-bold leading-none tracking-tight text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export const revalidate = 60;

export default async function ContactPage() {
  const contact = await getContactInfo();
  const mail = (e) => `mailto:${e}`;
  const details = [
    { icon: MapPin, label: "Address", lines: contact.addressLines.map((text) => ({ text })) },
    {
      icon: Phone,
      label: "Phone",
      lines: [{ text: contact.phone, href: contact.tel }, contact.phone2 && { text: contact.phone2, href: contact.tel2 }].filter(Boolean),
    },
    contact.whatsappLink && {
      icon: MessageCircle,
      label: "WhatsApp",
      lines: [{ text: contact.whatsapp, href: contact.whatsappLink, external: true }],
    },
    {
      icon: Mail,
      label: "Email",
      lines: [
        { text: contact.email, href: mail(contact.email) },
        contact.admissionsEmail && { text: `Admissions: ${contact.admissionsEmail}`, href: mail(contact.admissionsEmail) },
        contact.verificationEmail && { text: `Verification: ${contact.verificationEmail}`, href: mail(contact.verificationEmail) },
      ].filter(Boolean),
    },
    { icon: Clock, label: "Office Hours", lines: [{ text: contact.hoursWeekday }, { text: contact.hoursOther }] },
  ].filter(Boolean);
  return (
    <>
      <TopBar />
      <Header />
      <Navbar />

      <main id="main-content">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 pt-10 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:pt-14">
          <Panel icon={MessageSquareText} title="Write Your Message Here">
            <ContactForm />
          </Panel>

          <div className="flex flex-col gap-6">
            <div className="card-shadow flex items-center gap-4 rounded-lg bg-gradient-to-r from-navy-deep to-[#164a9e] p-5 text-white">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <Headphones size={26} strokeWidth={1.7} />
              </span>
              <div>
                <p className="text-[13px] font-bold uppercase tracking-wider text-sky">Need help? Call us</p>
                <a href={contact.tel} className="font-serif text-[28px] font-bold leading-tight hover:text-sky">
                  {contact.phone}
                </a>
                <p className="text-[13.5px] font-medium text-white/80">{contact.hoursWeekday}</p>
              </div>
            </div>

            <Panel icon={MapPin} title="Address" className="flex-1">
              <ul className="flex-1 divide-y divide-dashed divide-[#9db7e0] px-5">
                {details.map(({ icon: Icon, label, lines }) => (
                  <li key={label} className="flex items-start gap-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <div className="min-w-0 text-[14.5px] font-medium leading-snug text-ink">
                      <p className="mb-0.5 text-[13px] font-bold uppercase tracking-wider text-[#5b6b8c]">{label}</p>
                      {lines.map(({ text, href, external }) =>
                        href ? (
                          <a
                            key={text}
                            href={href}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className="block break-words font-semibold hover:text-brand"
                          >
                            {text}
                          </a>
                        ) : (
                          <span key={text} className="block">
                            {text}
                          </span>
                        ),
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-dashed border-[#9db7e0] px-5 py-4">
                <a
                  href={contact.mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[38px] items-center gap-2 rounded bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
                >
                  <MapPin size={15} /> Get Directions <ExternalLink size={13} />
                </a>
                <SocialLinks tone="light" className="mt-5" />
              </div>
            </Panel>
          </div>
        </div>

        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-6 lg:pb-14">
          <Panel icon={MapPinned} title="Find Us on Map">
            <iframe
              title="Goa State Open School location map"
              src={contact.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups"
              allowFullScreen
              className="block h-[320px] w-full border-0 sm:h-[400px]"
            />
          </Panel>
        </div>
      </main>

      <Footer />
    </>
  );
}
