import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ClipboardList,
  PenLine,
  Users,
  BadgeCheck,
  Check,
  ArrowRight,
  Download,
  type LucideIcon,
} from "lucide-react";

const APPLY_HREF = "/apply";
const DOWNLOADS_HREF = "/news-events?tab=downloads";
const PHONE_DISPLAY = "+91 81227 61667";
const PHONE_HREF = "tel:+918122761667";

type Step = {
  number: string;
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
  accent: "teal" | "yellow";
};

const steps: Step[] = [
  {
    number: "01",
    title: "Eligibility",
    description: "Verify age criteria and class-wise eligibility requirements for your child.",
    meta: "",
    icon: ShieldCheck,
    accent: "teal",
  },
  {
    number: "02",
    title: "Registration",
    description: "Complete the online or offline registration form with student and parent details.",
    meta: "",
    icon: ClipboardList,
    accent: "teal",
  },
  {
    number: "03",
    title: "Entrance Assessment",
    description: "Students undergo a grade-appropriate assessment to evaluate foundational skills.",
    meta: "",
    icon: PenLine,
    accent: "teal",
  },
  {
    number: "04",
    title: "Interview",
    description: "A brief interaction with the student and parents to understand learning needs.",
    meta: "",
    icon: Users,
    accent: "teal",
  },
  {
    number: "05",
    title: "Admission Confirmation",
    description: "Upon selection, complete fee payment and documentation to confirm admission.",
    meta: "",
    icon: BadgeCheck,
    accent: "yellow",
  },
];

const ageCriteria = [
  { class: "Pre-LKG", age: "3+ years", stage: "Pre-Primary" },
  { class: "LKG", age: "4+ years", stage: "Pre-Primary" },
  { class: "UKG", age: "5+ years", stage: "Pre-Primary" },
  { class: "Grade I", age: "6+ years", stage: "Primary" },
  { class: "Grade II", age: "7+ years", stage: "Primary" },
  { class: "Grade III", age: "8+ years", stage: "Primary" },
  { class: "Grade IV", age: "9+ years", stage: "Primary" },
  { class: "Grade V", age: "10+ years", stage: "Primary" },
  { class: "Grade VI", age: "11+ years", stage: "Middle School" },
  { class: "Grade VII", age: "12+ years", stage: "Middle School" },
  { class: "Grade VIII", age: "13+ years", stage: "Middle School" },
  { class: "Grade IX", age: "14+ years", stage: "Secondary" },
  { class: "Grade X", age: "15+ years", stage: "Secondary" },
];

const documents = [
  { name: "Birth Certificate", note: "Municipal / panchayat issued" },
  { name: "Transfer Certificate", note: "Grade I onwards only" },
  { name: "Aadhaar Card (Student & Parents)", note: "Student and both parents" },
  { name: "Mark Sheet", note: "Last completed academic year" },
  { name: "4 Photographs", note: "Passport size, recent" },
  { name: "Mother's Bank Passbook", note: "First page with account details" },
  { name: "Caste Certificate", note: "If applicable" },
];

export default function AdmissionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ============ 1. HERO ============ */}
        <section className="relative overflow-hidden bg-teal-900 py-14 md:py-16">
          {/* Diagonal line pattern */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 58px, #FFFFFF 58px 59.5px)",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
              <div className="max-w-2xl">
                <Breadcrumb />
                <div className="h-1 w-12 bg-yellow-600" />
                <p className="mt-5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-yellow-500">
                  Admissions Open · Academic Year 2026&ndash;27
                </p>
                <h1 className="font-display mt-5 text-4xl uppercase text-white md:text-5xl lg:text-[56px] lg:leading-[1.05]">
                  Admission Process
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-[14.5px]">
                  Five clear steps from enquiry to enrolment. Everything you need &mdash; age
                  criteria, documents and timelines &mdash; is laid out below so you can apply with
                  confidence.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ============ 2. PROCESS TIMELINE ============ */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800">
              How It Works
            </p>
            <h2 className="font-display mt-3 text-2xl uppercase text-ink-900 md:text-[34px]">
              Your Path to Enrolment
            </h2>
            <p className="mt-3 text-sm text-ink-700 md:text-[14px]">
              Each step is confirmed by the admissions office before you move to the next.
            </p>

            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.number} className="relative flex flex-col">
                    {/* Connector line (desktop only) */}
                    {index < steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-7 hidden h-0.5 w-full bg-line-200 lg:block"
                      />
                    )}

                    {/* Numbered circle */}
                    <div className="relative z-10 flex justify-center">
                      <span className="flex size-14 items-center justify-center rounded-full border-2 border-teal-800 bg-white">
                        <span className="font-display text-lg text-teal-800">{step.number}</span>
                      </span>
                    </div>

                    {/* Card */}
                    <div className="relative mt-5 flex flex-1 flex-col border border-line-200 bg-white">
                      <div
                        className={`h-1 w-full ${
                          step.accent === "yellow" ? "bg-yellow-600" : "bg-teal-800"
                        }`}
                      />
                      <div className="relative flex flex-1 flex-col p-5">
                        {/* Ghost number */}
                        <span
                          aria-hidden="true"
                          className={`font-display pointer-events-none absolute right-4 top-3 text-[34px] leading-none ${
                            step.accent === "yellow"
                              ? "text-yellow-600/25"
                              : "text-teal-800/[0.16]"
                          }`}
                        >
                          {step.number}
                        </span>

                        {/* Icon tile */}
                        <span className="flex size-9 items-center justify-center bg-teal-800/10">
                          <Icon className="size-[18px] text-teal-800" strokeWidth={1.8} />
                        </span>

                        <h3 className="font-display mt-4 text-[15.5px] uppercase text-ink-900">
                          {step.title}
                        </h3>
                        <hr className="mt-3 border-line-200" />
                        <p className="mt-3 text-xs leading-relaxed text-ink-700">
                          {step.description}
                        </p>

                        
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* ============ 3. AGE CRITERIA & REQUIRED DOCUMENTS ============ */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-800">
              Before You Apply
            </p>
            <h2 className="font-display mt-3 text-2xl uppercase text-ink-900 md:text-[34px]">
              Age Criteria &amp; Required Documents
            </h2>

            <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
              {/* ---- Age Criteria card ---- */}
              <div className="border border-line-200 bg-white">
                <div className="flex items-center justify-between gap-4 bg-teal-900 px-6 py-4">
                  <h3 className="font-display text-base uppercase text-white md:text-[16.5px]">
                    Age Criteria
                  </h3>
                  <span className="shrink-0 border border-white/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
                    As on 1 June 2026
                  </span>
                </div>

                <div className="relative">
                  {/* Left accent bar */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-4 left-0 top-12 w-1 bg-teal-800"
                  />
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-line-200">
                        <th className="py-3 pl-6 pr-4 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-600">
                          Class
                        </th>
                        <th className="py-3 pr-4 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-600">
                          Minimum Age
                        </th>
                        <th className="py-3 pr-6 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink-600">
                          Stage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ageCriteria.map((row) => (
                        <tr key={row.class} className="border-b border-line-200 last:border-0">
                          <td className="py-3 pl-6 pr-4 text-sm font-semibold text-ink-900">
                            {row.class}
                          </td>
                          <td className="py-3 pr-4 text-sm text-ink-700">{row.age}</td>
                          <td className="py-3 pr-6 text-sm text-ink-600">{row.stage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ---- Required Documents card ---- */}
              <div className="flex flex-col border border-line-200 bg-white">
                <div className="flex items-center justify-between gap-4 bg-teal-900 px-6 py-4">
                  <h3 className="font-display text-base uppercase text-white md:text-[16.5px]">
                    Required Documents
                  </h3>
                  <span className="shrink-0 border border-white/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
                    {documents.length} Items · Original + Copy
                  </span>
                </div>

                <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center border-[1.4px] border-teal-800">
                        <Check className="size-3 text-teal-800" strokeWidth={2.6} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-ink-900">{doc.name}</span>
                        <span className="mt-0.5 block text-[10.5px] text-ink-600">{doc.note}</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Note bar */}
                <div className="mx-6 mb-6 mt-auto flex gap-3 bg-yellow-600/[0.14]">
                  <span aria-hidden="true" className="w-1 shrink-0 bg-yellow-600" />
                  <div className="py-3 pr-4">
                    <p className="text-[11px] font-semibold text-ink-900">
                      Originals are verified at the admissions desk and returned the same day.
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-ink-600">
                      Self-attested photocopies are retained for the school record.
                    </p>
                  </div>
                </div>

                {/* Downloads link — offline application form & reference documents */}
                <div className="border-t border-line-200 px-6 py-4">
                  <Link
                    href={DOWNLOADS_HREF}
                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-teal-800 transition-colors hover:text-ink-900"
                  >
                    <Download className="size-4" />
                    Download admission form &amp; reference documents
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <p className="mt-1.5 text-[10.5px] text-ink-600">
                    For offline applications, print the form and submit it at the school office with
                    the documents listed above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 4. CTA BAND ============ */}
        <section className="bg-teal-900 py-12 md:py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-display text-2xl uppercase text-white md:text-[30px]">
                  Ready to begin?
                </h2>
                <p className="mt-2 text-xs text-white/80 md:text-[12.5px]">
                  Admissions office open Mon &ndash; Sat, 9:00 AM &ndash; 4:00 PM
                  <span className="mx-2">·</span>
                  <a href={PHONE_HREF} className="underline-offset-2 hover:underline">
                    {PHONE_DISPLAY}
                  </a>
                </p>
              </div>

              <div className="flex flex-wrap gap-4 lg:shrink-0">
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="group h-14 gap-3 text-[11.5px] font-bold uppercase tracking-[0.12em]"
                >
                  <Link href={APPLY_HREF}>
                    Apply Now
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outlineLight"
                  size="lg"
                  className="h-14 px-8 text-[11.5px] font-bold uppercase tracking-[0.12em]"
                >
                  <a href={PHONE_HREF}>Contact Us</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
