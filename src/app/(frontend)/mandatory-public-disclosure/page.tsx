import { SiteHeader } from "@/components/site-header";
import { FileText } from "lucide-react";
import { getDocuments, getWebsiteSettings } from "@/cms/public/loaders";
import { contentForSource } from "@/cms/public/content-source";

type Document = {
  title: string;
  href: string;
};

const documents: Document[] = [
  { title: "Recognition Certificate", href: "#" },
  { title: "Society Registration", href: "#" },
  { title: "NOC Certificate", href: "#" },
  { title: "Fire Safety Certificate", href: "#" },
  { title: "Land Certificate", href: "#" },
  { title: "Building Safety Certificate", href: "#" },
  { title: "Water and Sanitary Certificate", href: "#" },
  { title: "PTA", href: "#" },
  { title: "Public Disclosure", href: "#" },
  { title: "SMC", href: "#" },
  { title: "Fee's Structure", href: "#" },
  { title: "Academic Calendar", href: "#" },
  { title: "Self Certificate", href: "#" },
  { title: "Mandatory Disclosure", href: "#" },
  { title: "Water Test Report", href: "#" },
  { title: "GHMC Commissioner Letter", href: "#" },
  { title: "Affiliation Letter", href: "#" },
];

export default async function MandatoryPublicDisclosurePage() {
  const [allDocuments, settings] = await Promise.all([getDocuments(), getWebsiteSettings()]);
  const managed = allDocuments.filter((item) => item.placements.includes("mandatory-disclosure"));
  const visibleDocuments = contentForSource(settings.contentSources.mandatoryDisclosure, documents, managed, (item) => item.title);
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Transparency</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Mandatory Public Disclosure
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              All mandatory documents and information as required by regulatory authorities, available for public viewing.
            </p>
          </div>
        </section>

        {/* Documents Table */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Table Header */}
            <div className="overflow-hidden border border-line-200">
              {/* Title bar */}
              <div className="bg-teal-800 px-6 py-3 text-center">
                <span className="text-sm font-semibold uppercase tracking-wide text-white">
                  Documents and Information
                </span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[60px_1fr_140px] items-center bg-sky-600 px-4 py-2.5 md:grid-cols-[80px_1fr_160px]">
                <span className="text-xs font-bold uppercase text-white">Sl No.</span>
                <span className="text-xs font-bold uppercase text-white">Document / Information</span>
                <span className="text-center text-xs font-bold uppercase text-white">Action</span>
              </div>

              {/* Rows */}
              {visibleDocuments.map((doc, index) => (
                <div
                  key={doc.title}
                  className={`grid grid-cols-[60px_1fr_140px] items-center px-4 py-3 md:grid-cols-[80px_1fr_160px] ${
                    index % 2 === 0 ? "bg-white" : "bg-canvas-50"
                  }`}
                >
                  <span className="text-sm text-ink-600">{index + 1}</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <FileText className="size-4 shrink-0 text-ink-400" />
                    {doc.title}
                  </span>
                  <div className="text-center">
                    {doc.href !== "#" ? <a href={doc.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700">View Document</a> : <span className="text-xs font-medium text-ink-500">Not available yet</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
