import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";

type Leader = {
  name: string;
  title: string;
  organization: string;
  image: string;
};

const governed: Leader[] = [
   {
    name: "Dr. Preetha Reddy",
    title: "Executive Vice Chairperson",
    organization: "AHEL",
    image: "/images/leadership/executive-vice-chairperson.jpeg",
  },
  {
    name: "Dr. Suneeta Reddy",
    title: "Managing Director",
    organization: "AHEL",
    image: "/images/leadership/managing-director.jpeg",
  },
  {
    name: "Ms. Shobana Kamineni",
    title: "Promoter Director",
    organization: "AHEL and Executive Chairperson for Apollo HealthCo, Apollo Pharmacies and Apollo 24|7",
    image: "/images/leadership/promoter-director.jpeg",
  },
  {
    name: "Dr. Sangita Reddy",
    title: "Joint Managing Director",
    organization: "AHEL",
    image: "/images/leadership/joint-managing-director.jpeg",
  },
  
  // {
  //   name: "Mr. Prem Anand S",
  //   title: "Chief Executive Officer",
  //   organization: "Apollo Foundation - Total Health",
  //   image: "/images/leadership/ceo.jpeg",
  // },
];

const managed: Leader[] = [
  {
    name: "Ms. Upasana Kamineni Konidela",
    title: "Vice Chairperson",
    organization: "Apollo Foundation",
    image: "/images/leadership/vice-chairperson.jpeg",
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

        {/* Founder & Chairman */}
        <section className="bg-teal-900 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Founder &amp; Chairman</h2>

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Photo */}
              <div className="lg:col-span-4">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src="/images/leadership/chairman.jpeg"
                    alt="Dr. Prathap C. Reddy"
                    fill
                    quality={90}
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="font-display text-lg uppercase text-white md:text-xl">
                      Dr. Prathap C. Reddy
                    </h3>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="lg:col-span-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
                  A Message from our Founder Chairman
                </p>

                <div className="mt-6 space-y-4 text-base leading-relaxed text-white/85">
                  <p>
                    Education is one of the most powerful forces for transforming lives and building a better future.
                  </p>
                  <p>
                    I believe every child deserves the opportunity to learn, discover their potential, think creatively and dream without limits. Education must go beyond the classroom&mdash;it must nurture knowledge, curiosity, values, compassion and a sense of responsibility towards society.
                  </p>
                  <p>
                    As technology and innovation reshape our world, our greatest responsibility is to prepare young minds not only to succeed, but to use their knowledge to make a meaningful difference.
                  </p>
                  <p>
                    When we invest in the education of a child, we invest in the future of our nation.
                  </p>
                </div>

                <div className="mt-8 border-l-4 border-yellow-500 pl-4">
                  <p className="font-display text-lg uppercase text-white">Dr. Prathap C. Reddy</p>
                  <p className="mt-1 text-sm text-white/70">Founder Chairman, Apollo Hospitals Group</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governed By */}
        <section className="bg-teal-800 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Our Patrons</h2>
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
            <h2 className="font-display text-2xl uppercase text-white md:text-3xl">Governed By</h2>
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
