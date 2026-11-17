import NavbarClient from "./NavbarClient";
import { getContactInfo } from "@/lib/site-settings";

// Server wrapper: hands the phone number from the dashboard (Contact Info) to the interactive navbar.
export default async function Navbar() {
  const contact = await getContactInfo();
  return <NavbarClient phone={contact.phone} tel={contact.tel} />;
}
