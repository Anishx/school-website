import Image from "next/image";

type Milestone = {
  year: string;
  title: string;
  description: string;
};

const milestones: Milestone[] = [
  { year: "1999", title: "Founded", description: "Started with 30 students and a vision for rural education." },
  { year: "2005", title: "First Board Batch", description: "100% pass rate in our first Grade 10 board exams." },
  { year: "2012", title: "Campus Expansion", description: "New labs, library and sports facilities opened." },
  { year: "2019", title: "Smart Classrooms", description: "Digital learning deployed across all grades." },
  { year: "2024", title: "1,200+ Students", description: "Serving families across 15 surrounding villages." },
];

export function AboutV2Timeline() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="about-v2-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Our Journey</p>
          <h2 id="about-v2-heading" className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
            25 Years of Building Futures
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            From a small classroom to a thriving campus — every milestone driven by our commitment to rural children.
          </p>
        </div>

        {/* Timeline — horizontal on desktop, vertical on mobile */}
        <div className="mt-14 relative">
          {/* Horizontal line (desktop) */}
          <div className="hidden md:block absolute top-5 left-0 right-0 h-px bg-line-200" aria-hidden="true" />

          <div className="grid gap-8 md:grid-cols-5">
            {milestones.map((m, i) => (
              <div key={m.year} className="relative flex md:flex-col items-start gap-4 md:items-center md:text-center">
                {/* Dot */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-teal-800 bg-white">
                  <span className="text-xs font-bold text-teal-800">{m.year}</span>
                </div>
                {/* Vertical connector (mobile) */}
                {i < milestones.length - 1 && (
                  <div className="absolute left-5 top-10 h-full w-px bg-line-200 md:hidden" aria-hidden="true" />
                )}
                <div className="pb-6 md:pb-0">
                  <h3 className="text-sm font-semibold text-ink-900">{m.title}</h3>
                  <p className="mt-1 text-xs text-ink-600">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder quote */}
        <div className="mt-16 flex flex-col items-center gap-6 border border-line-200 bg-canvas-50 p-8 md:flex-row md:p-10">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden">
            <Image
              src="https://picsum.photos/seed/founder-portrait/200/200"
              alt="Founder"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div>
            <blockquote className="text-sm italic leading-relaxed text-ink-700">
              &ldquo;Every child in our villages deserves the same quality of education that city children receive.
              This school is our promise to them — that geography will never limit their potential.&rdquo;
            </blockquote>
            <p className="mt-3 text-xs font-semibold text-ink-900">— Founder, School Foundation</p>
          </div>
        </div>
      </div>
    </section>
  );
}
