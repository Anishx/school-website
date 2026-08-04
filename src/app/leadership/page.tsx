import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { User } from "lucide-react";

type Leader = {
  name: string;
  title: string;
  organization: string;
};

const founders: Leader[] = [
  { name: "Dr. Prathap C Reddy", title: "Founder", organization: "Apollo Hospitals Enterprise Limited (AHEL)" },
  { name: "Dr. Preetha Reddy", title: "Executive Vice Chairperson", organization: "AHEL" },
  { name: "Dr. Suneeta Reddy", title: "Managing Director", organization: "AHEL" },
  { name: "Ms. Shobana Kamineni", title: "Promoter Director", organization: "AHEL and Executive Chairperson for Apollo HealthCo, Apollo Pharmacies and Apollo 24|7" },
  { name: "Dr. Sangita Reddy", title: "Joint Managing Director", organization: "AHEL" },
];

const governed: Leader[] = [
  { name: "Ms. Upasana Kamineni Konidela", title: "Vice Chairperson", organization: "Apollo Foundation" },
];

const managed: Leader[] = [
  { name: "Mr. Prem Anand S", title: "Chief Executive Officer", organization: "Apollo Foundation - Total Health" },
];

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <div className="flex flex-col items-center text-center border border-line-200 bg-white p-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-canvas-100">
        <User className="size-10 text-teal-800" />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink-900">{leader.name}</h3>
      <p className="mt-1 text-sm font-semibold text-teal-800">{leader.title}</p>
      <p className="mt-1 text-xs text-ink-600">{leader.organization}</p>
    </div>
  );
}

export default function LeadershipPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Management</p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Our Leadership
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Guided by visionary leaders committed to transforming education and healthcare across India.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Founders</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {founders.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* Governed By */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Governed By</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {governed.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* Managed By */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Managed By</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {managed.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
