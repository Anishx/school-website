import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";

type Leader = {
  name: string;
  title: string;
  organization: string;
  image: string;
};

const board: Leader[] = [
  {
    name: "Dr. Prathap C. Reddy",
    title: "Chairman",
    organization: "Apollo Hospitals Enterprise Limited (AHEL)",
    image: "/images/leadership/chairman.jpeg",
  },
  {
    name: "Mr. Poorna Chandra Reddy",
    title: "Board Member",
    organization: "Apollo Foundation",
    image: "/images/leadership/poornachandra_reddy.png",
  },
  {
    name: "Ms. Sangeetha Reddy",
    title: "Board Member",
    organization: "Apollo Foundation",
    image: "/images/leadership/joint-managing-director.jpeg",
  },
];

const correspondent: Leader[] = [
  {
    name: "Mr. Lakshmi Narayan Reddy",
    title: "School Correspondent",
    organization: "Apollo Vidhyalayam",
    image: "/images/leadership/LN_reddy.jpg",
  },
];

const management: Leader[] = [
  {
    name: "Mr. PremAnand Satgunam",
    title: "CEO – Total Health",
    organization: "Apollo Foundation",
    image: "/images/leadership/ceo.jpeg",
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

export default function OurManagementPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Our Management
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              The board, correspondent, and management team steering Apollo Vidhyalayam with vision and integrity.
            </p>
          </div>
        </section>

        {/* Our Board */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Our Board</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {board.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* School Correspondent */}
        <section className="bg-teal-800 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">School Correspondent</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {correspondent.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>

        {/* School Management */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">School Management</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {management.map((leader) => (
                <LeaderCard key={leader.name} leader={leader} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
