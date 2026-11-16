import Link from "next/link";
import LegalPage, { Bullets, PolicySection, ReviewNote } from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Use | Goa Open School",
  description: "Terms of use for the Goa Open School website.",
};

export default function TermsOfUsePage() {
  return (
    <LegalPage
      current="terms"
      title="Terms of Use"
      intro="By using this website you agree to the following terms."
    >
      <PolicySection n="1" heading="Acceptance of terms">
        <p>
          By accessing or using the Goa Open School website you agree to these Terms of Use, the{" "}
          <Link href="/privacy-policy" className="font-bold text-brand underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link href="/disclaimer" className="font-bold text-brand underline underline-offset-2">
            Disclaimer
          </Link>
          . If you do not agree, please do not use the website.
        </p>
      </PolicySection>

      <PolicySection n="2" heading="Permitted use">
        <p>The website may be used to read information and to use its services (forms, Enrollment Card, Admit Card, Result) for your own lawful purposes. You must provide correct details.</p>
      </PolicySection>

      <PolicySection n="3" heading="Prohibited use">
        <Bullets
          items={[
            "Trying to view another person's record, or to guess enrollment numbers, dates of birth, IDs or passwords.",
            "Bypassing or interfering with the verification, rate limits or any other security feature.",
            "Using automated tools (bots, scrapers) to collect data or to send repeated requests.",
            "Uploading or sending harmful, false, abusive or unlawful material through the forms.",
            "Attempting to gain unauthorised access to the website, its servers or its login areas.",
          ]}
        />
        <p>Misuse may lead to blocking of access and action under the applicable law.</p>
      </PolicySection>

      <PolicySection n="4" heading="Login accounts">
        <p>
          Board and College login credentials are issued to authorised users only. You are responsible for keeping them confidential
          and for all activity under your account. Report any suspected misuse immediately.
        </p>
      </PolicySection>

      <PolicySection n="5" heading="Content and ownership">
        <p>
          The content of this website belongs to Goa Open School / Government of Goa unless stated otherwise. State Emblem and other
          national symbols are protected and may be used only as permitted by law. You may print or download forms and documents for
          personal, non-commercial use; you may not alter them or present them as your own.
        </p>
      </PolicySection>

      <PolicySection n="6" heading="Availability">
        <p>The website is provided on an &ldquo;as available&rdquo; basis. Services may be interrupted for maintenance or for reasons beyond our control.</p>
      </PolicySection>

      <PolicySection n="7" heading="Changes to these terms">
        <p>These terms may be revised at any time. Continued use of the website after a change means that you accept the revised terms.</p>
      </PolicySection>

      <PolicySection n="8" heading="Governing law">
        <p>These terms are governed by the laws of India. Any dispute is subject to the jurisdiction of the competent courts in Goa.</p>
      </PolicySection>

      <ReviewNote />
    </LegalPage>
  );
}
