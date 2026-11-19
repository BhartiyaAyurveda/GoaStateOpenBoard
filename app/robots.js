import { SITE_URL } from "@/lib/site";

// robots.txt: the public pages are open to search engines; the logins, dashboards and the API are not.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/super-admin", "/college/", "/board-login", "/college-login", "/maintenance"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
