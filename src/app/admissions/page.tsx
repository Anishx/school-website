import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { CheckCircle, FileText } from "lucide-react";

const steps = [
  { number: "01", title: "Eligibility", description: "Verify age criteria and class-wise eligibility requirements for your child." },
  { number: "02", title: "Registration", description: "Complete the online or offline registration form with student and parent details." },
  { number: "03", title: "Entrance Assessment", description: "Students undergo a grade-appropriate assessment to evaluate foundational skills." },
  { number: "04", title: "Interview", description: "A brief interaction with the student and parents to understand learning needs." },
  { number: "05", title: "Admission Confirmation", description: "Upon selection, complete fee payment and documentation to confirm admission." },
];

const ageCriteria = [
  { class: "LKG", age: "3+ years" },
  { class: "UKG", age: "4+ years" },
  { class: "Grade I", age: "5+ years" },
  { class: "Grade II", age: "6+ years" },
  { class: "Grade III", age: "7+ years" },
  { class: "Grade IV", age: "8+ years" },
  { class: "Grade V", age: "9+ years" },
  { class: "Grade VI", age: "10+ years" },
  { class: "Grade VII", age: "11+ years" },
  { class: "Grade VIII", age: "12+ years" },
  { class: "Grade IX", age: "13+ years" },
  { class: "Grade X", age: "14+ years" },
];

const feeStructure = [
  { category: "Tuition Fee", description: "Covers academic instruction, library, and laboratory access." },
  { category: "Transport Fee", description: "Optional — based on distance and route availability." },
  { category: "Other Charges", description: "Includes uniform, books, examination fees, and co-curricular activities." },
];

const documents = [
  "Birth Certificate",
  "Aadhaar Card (Student & Parent)",
  "Transfer Certificate (TC) from previous school",
  "Passport-size Photographs (4 copies)",
  "Previous Year Report Card / Mark Sheet",
];

export default function AdmissionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Admissions
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              A simple, transparent admission process designed to welcome every child into the Apollo Vidhyalayam family.
            </p>
          </div>
        </section>

        {/* Admission Process Steps */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Admission Process</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-5">
              {steps.map((step) => (
                <div key={step.number} className="relative border border-line-200 p-5">
                  <span className="font-display text-3xl text-teal-800">{step.number}</span>
                  <h3 className="font-display mt-2 text-sm uppercase text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Age Criteria */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Age Criteria</h2>
            <p className="mt-3 text-sm text-ink-600">Class-wise eligibility based on age as on 1st June of the academic year.</p>
            <div className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ageCriteria.map((item) => (
                <div key={item.class} className="flex items-center justify-between bg-white border border-line-200 px-4 py-3">
                  <span className="text-sm font-semibold text-ink-900">{item.class}</span>
                  <span className="text-sm text-teal-800 font-bold">{item.age}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fee Structure */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Fee Structure</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {feeStructure.map((fee) => (
                <div key={fee.category} className="border border-line-200 p-6">
                  <h3 className="font-display text-base uppercase text-teal-800">{fee.category}</h3>
                  <p className="mt-2 text-sm text-ink-600">{fee.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-ink-500 italic">
              For detailed fee information, please contact the school office or visit the campus.
            </p>
          </div>
        </section>

        {/* Required Documents */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Required Documents</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div key={doc} className="flex items-center gap-3 bg-white border border-line-200 px-5 py-4">
                  <CheckCircle className="size-5 shrink-0 text-teal-800" />
                  <span className="text-sm font-medium text-ink-900">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Ready to Join?</h2>
            <p className="mt-3 text-sm text-white/80">Visit our campus or contact us to begin the admission process.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href="#apply" className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-yellow-400">
                <FileText className="size-4" />
                Apply Now
              </a>
              <a href="#contact" className="inline-flex items-center rounded-full border-2 border-white/60 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-white/10">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
