import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";

type Leader = {
  name: string;
  title: string;
  organization: string;
  image: string;
};

const founders: Leader[] = [
  {
    name: "Dr. Prathap C Reddy",
    title: "Chairman",
    organization: "Apollo Hospitals Enterprise Limited (AHEL)",
    image: "/images/leadership/chairman.jpg",
  },
  {
    name: "Dr. Preetha Reddy",
    title: "Executive Vice Chairperson",
    organization: "AHEL",
    image: "/images/leadership/executive-vice-chairperson.webp",
  },
  {
    name: "Dr. Suneeta Reddy",
    title: "Managing Director",
    organization: "AHEL",
    image: "/images/leadership/managing-director.png",
  },
  {
    name: "Ms. Shobana Kamineni",
    title: "Promoter Director",
    organization: "AHEL and Executive Chairperson for Apollo HealthCo, Apollo Pharmacies and Apollo 24|7",
    image: "/images/leadership/promoter-director.png",
  },
  {
    name: "Dr. Sangita Reddy",
    title: "Joint Managing Director",
    organization: "AHEL",
    image: "/images/leadership/joint-managing-director.jpg",
  },
];

const governed: Leader[] = [
  {
    name: "Ms. Upasana Kamineni Konidela",
    title: "Vice Chairperson",
    organization: "Apollo Foundation",
    image: "/images/leadership/vice-chairperson.jpg",
  },
];

const managed: Leader[] = [
  {
    name: "Mr. Prem Anand S",
    title: "Chief Executive Officer",
    organization: "Apollo Foundation - Total Health",
    image: "/images/leadership/ceo.jpg",
  },
];

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <div className="group relative aspect-[3/4] overflow-hidden">
      {leader.image ? (
        <Image
          src={leader.image}
          alt={leader.name}
          fill
          quality={90}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-teal-700" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Text content at bottom */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-lg uppercase text-white md:text-xl">
          {leader.name}
        </h3>
        <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
          {leader.title}
        </p>
      </div>
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
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Our Leadership
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Guided by visionary leaders committed to transforming education and healthcare across India.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Our Founders</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {founders.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* Governed By */}
        <section className="bg-teal-800 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Governed By</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {governed.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* Managed By */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Managed By</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
