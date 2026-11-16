import { Clock, ExternalLink, Headphones, Mail, MapPin, MapPinned, MessageSquareText, Phone } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { getContactInfo } from "@/lib/site-settings";

export const metadata = {
  title: "Contact Us | Goa Open School",
  description: "Contact Goa Open School, Directorate of Education, Government of Goa – address, phone, email and enquiry form.",
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
  const details = [
    { icon: MapPin, label: "Address", value: contact.addressLines },
    { icon: Phone, label: "Phone", value: [contact.phone], href: contact.tel },
    { icon: Mail, label: "Email", value: [contact.email], href: `mailto:${contact.email}` },
    { icon: Clock, label: "Office Hours", value: [contact.hoursWeekday, contact.hoursOther] },
  ];
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
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#c9daf2] bg-[#e9f1fc] text-navy">
                      <Icon size={20} strokeWidth={1.7} />
                    </span>
                    <div className="text-[14.5px] font-medium leading-snug text-ink">
                      <p className="mb-0.5 text-[13px] font-bold uppercase tracking-wider text-[#5b6b8c]">{label}</p>
                      {value.map((line) =>
                        href ? (
                          <a key={line} href={href} className="block font-semibold hover:text-brand">
                            {line}
                          </a>
                        ) : (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ),
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto border-t border-dashed border-[#9db7e0] px-5 py-4">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Panaji%2C+Goa+403001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[38px] items-center gap-2 rounded bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
                >
                  <MapPin size={15} /> Get Directions <ExternalLink size={13} />
                </a>
              </div>
            </Panel>
          </div>
        </div>

        <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-6 sm:px-6 lg:pb-14">
          <Panel icon={MapPinned} title="Find Us on Map">
            <iframe
              title="Goa Open School location map"
              src="https://www.google.com/maps?q=Panaji%2C+Goa+403001&output=embed"
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
