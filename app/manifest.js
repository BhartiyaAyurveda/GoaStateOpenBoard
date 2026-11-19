import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Web app manifest: the name and icon when the site is added to a phone's home screen.
export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: "GSOS",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#082a63",
    lang: "en-IN",
    icons: [{ src: "/icon.png", type: "image/png", sizes: "any" }],
  };
}
