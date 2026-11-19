// Structured data (schema.org JSON-LD) for search engines. Server component: nothing runs in the browser.
// "<" is escaped so that no value can ever close the script tag.
export default function JsonLd({ data }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
