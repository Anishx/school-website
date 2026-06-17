import Image from "next/image";

type Card = {
  title: string;
  description: string;
  image: string;
};

const cards: Card[] = [
  {
    title: "Our Foundation",
    description: "Built by educators and philanthropists to serve rural communities since 1999.",
    image: "https://picsum.photos/seed/foundation-hands/600/400",
  },
  {
    title: "Our Campus",
    description: "Smart classrooms, science labs, library and sports facilities on a green campus.",
    image: "https://picsum.photos/seed/school-campus-green/600/400",
  },
  {
    title: "Our Impact",
    description: "1,200+ students from 15 villages with 85% academic achievement year on year.",
    image: "https://picsum.photos/seed/kids-celebrating/600/400",
  },
];

type StatBadge = { value: string; label: string };

const badges: StatBadge[] = [
  { value: "25+", label: "Years" },
  { value: "1,200+", label: "Students" },
  { value: "80+", label: "Teachers" },
  { value: "85%", label: "Pass Rate" },
];

export function AboutV3Cards() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="about-v3-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">About Us</p>
          <h2 id="about-v3-heading" className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Education with Heart & Purpose
          </h2>
          <p className="mt-3 text-sm text-ink-600">
            A foundation-run school bringing quality, care and opportunity to every rural child.
          </p>
        </div>

        {/* 3 image cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="group relative h-[300px] overflow-hidden border border-line-200">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-base font-bold text-white">{card.title}</h3>
                <p className="mt-1 text-xs leading-snug text-white/80">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stat badges row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 border border-line-200 bg-canvas-50 px-5 py-3">
              <span className="text-xl font-bold text-teal-800">{b.value}</span>
              <span className="text-xs font-semibold text-ink-600">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
