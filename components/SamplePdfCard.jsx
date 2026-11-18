import { Download, Eye, FileText } from "lucide-react";

// "See a sample" box on the Admit Card / Result / Enrollment Card pages.
// The sample PDFs (dummy data only) are in /public/samples.
// Change SAMPLES_VERSION whenever the PDFs in /public/samples are replaced: browsers keep a PDF with the same
// address in their cache, so without a new "?v=" they would keep showing the old sample.
const SAMPLES_VERSION = "20261119d";

export default function SamplePdfCard({ title, file, note }) {
  const href = `/samples/${file}?v=${SAMPLES_VERSION}`;
  return (
    <section className="card-shadow overflow-hidden rounded-lg bg-white print:hidden">
      <div className="flex h-[56px] items-center gap-2 bg-gradient-to-r from-[#dfeafa] to-[#eef4fc] px-5">
        <FileText size={24} strokeWidth={1.8} className="text-navy" />
        <h2 className="text-[21px] font-bold leading-none tracking-tight text-ink">Sample</h2>
      </div>
      <div className="space-y-3 px-5 py-4">
        <p className="text-[14px] font-medium leading-snug text-ink">
          {note || `See what the ${title} looks like before you download yours.`} The sample contains dummy data only.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[42px] items-center gap-2 rounded bg-navy px-5 text-[14px] font-bold text-white hover:bg-brand"
          >
            <Eye size={16} /> View sample {title}
          </a>
          <a
            href={href}
            download
            className="inline-flex h-[42px] items-center gap-2 rounded border border-navy bg-white px-4 text-[14px] font-bold text-ink hover:bg-navy hover:text-white"
          >
            <Download size={16} /> PDF
          </a>
        </div>
      </div>
    </section>
  );
}
