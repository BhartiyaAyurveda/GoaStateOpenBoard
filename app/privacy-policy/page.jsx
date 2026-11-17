import Link from "next/link";
import LegalPage, { Bullets, PolicySection, ReviewNote } from "@/components/LegalPage";

export const revalidate = 60; // contact details (header menu, footer, help boxes) come from the dashboard

export const metadata = {
  title: "Privacy Policy | Goa State Open School",
  description: "How the Goa State Open School website handles your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      current="privacy"
      title="Privacy Policy"
      intro="How this website handles the information you give while using it."
    >
      <PolicySection n="1" heading="Information we receive">
        <p>This website asks for personal information only when you use a service that needs it:</p>
        <Bullets
          items={[
            "Contact form: your name, mobile number, email address (optional), subject and message.",
            "Enrollment Card, Admit Card and Result: your Enrollment or Acknowledgement Number and your Date of Birth.",
            "Board / College Login: your ID and password.",
          ]}
        />
      </PolicySection>

      <PolicySection n="2" heading="How the information is used">
        <Bullets
          items={[
            "Contact form details are used only to read and reply to your enquiry.",
            "Enrollment / Acknowledgement Number and Date of Birth are used only to find and show your own record, and not for any other purpose.",
            "Login details are used only to verify your identity and are never displayed back to you.",
          ]}
        />
      </PolicySection>

      <PolicySection n="3" heading="Information stored in your browser">
        <p>
          The text-size choice (A- / A / A+) is saved in your own browser so that it is remembered on your next visit. It is not sent to
          the website server. This website does not currently use advertising or tracking cookies.
        </p>
      </PolicySection>

      <PolicySection n="4" heading="Security">
        <p>
          Reasonable technical measures are used to protect your information, including server-side validation of every request, a
          verification step on lookup and login forms, and limits on repeated attempts. No method of transmission over the internet is
          completely secure, so please protect your own devices and credentials.
        </p>
      </PolicySection>

      <PolicySection n="5" heading="Sharing of information">
        <p>
          Your personal information is not sold or rented. It is shared only with the officials of Goa State Open School and the Directorate
          of Education who need it to serve you, or where disclosure is required by law.
        </p>
      </PolicySection>

      <PolicySection n="6" heading="Your responsibilities">
        <Bullets
          items={[
            "Never share your password, OTP or Acknowledgement Number with anyone. Goa State Open School never asks for them by phone, email or message.",
            "Keep your login credentials confidential and log out on shared computers.",
          ]}
        />
      </PolicySection>

      <PolicySection n="7" heading="Questions and changes">
        <p>
          For any question about your information, or to ask for a correction, please{" "}
          <Link href="/contact" className="font-bold text-brand underline underline-offset-2">
            contact us
          </Link>
          . This policy may be updated from time to time; the date at the top shows when it was last changed.
        </p>
      </PolicySection>

      <ReviewNote />
    </LegalPage>
  );
}
