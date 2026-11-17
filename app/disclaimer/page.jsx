import Link from "next/link";
import LegalPage, { Bullets, PolicySection, ReviewNote } from "@/components/LegalPage";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "Disclaimer | Goa State Open School",
  description: "Disclaimer for the Goa State Open School website.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      current="disclaimer"
      title="Disclaimer"
      intro="Please read this disclaimer before relying on any information on this website."
    >
      <PolicySection n="1" heading="General information">
        <p>
          This website is maintained by Goa State Open School to provide information about
          its programmes, admissions, examinations and services. Every effort is made to keep the information accurate and up to
          date, but it is provided for general information only and does not constitute legal or professional advice.
        </p>
      </PolicySection>

      <PolicySection n="2" heading="Official documents prevail">
        <p>Information shown online is for immediate convenience. In case of any difference, the official documents issued by Goa State Open School prevail.</p>
        <Bullets
          items={[
            "Results shown online are provisional. The original marksheet and certificate issued by Goa State Open School are final.",
            "Enrollment Cards and Admit Cards generated online must be checked for errors. Report any error to your Study Centre or Goa State Open School immediately.",
            "Rules, fees, dates and eligibility are as given in the Prospectus and the latest official notices.",
          ]}
        />
      </PolicySection>

      <PolicySection n="3" heading="Changes to content">
        <p>
          Content, schedules and forms may be changed, corrected or withdrawn without prior notice. Please check the{" "}
          <Link href="/notices" className="font-bold text-brand underline underline-offset-2">
            Notices
          </Link>{" "}
          page regularly for the latest updates.
        </p>
      </PolicySection>

      <PolicySection n="4" heading="External links">
        <p>
          Where this website links to other websites, the links are provided for convenience only. Goa State Open School does not control
          those websites and does not endorse their content, views or services.
        </p>
      </PolicySection>

      <PolicySection n="5" heading="Limitation of liability">
        <p>
          To the extent permitted by law, Goa State Open School is not liable for any loss or damage arising from the use of, or reliance
          on, the information on this website, or from temporary unavailability or errors of the website.
        </p>
      </PolicySection>

      <PolicySection n="6" heading="Reporting errors">
        <p>
          If you notice an error or an outdated item on this website, please inform us through the{" "}
          <Link href="/contact" className="font-bold text-brand underline underline-offset-2">
            Contact
          </Link>{" "}
          page so that it can be corrected.
        </p>
      </PolicySection>

      <ReviewNote />
    </LegalPage>
  );
}
