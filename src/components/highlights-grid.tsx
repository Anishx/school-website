import Image from "next/image";
import Link from "next/link";

/*
  Hierarchical grid layout — 4 columns, varying row spans
  Row 1-2: [Sports (2 rows)] [STEM] [Clubs & Activities (2 rows)]  [Leadership]
  Row 3-4: [Yoga & Wellness] [Achievements (2 rows)] [Art & Culture] [Karate]
*/

type Tile = {
  title: string;
  subtext: string;
  href: string;
  type: "image" | "color";
  image?: string;
  color?: string;
  colSpan: number;
  rowSpan: number;
};

const tiles: Tile[] = [
  // Row 1-2
  { title: "Sports", subtext: "Athletics, Football, Throwball, Softball, Cricket", href: "/student-life?tab=sports", type: "image", image: "/images/sports/sports-1.jpg", colSpan: 1, rowSpan: 2 },
  { title: "STEM & Innovation", subtext: "Science fairs, AI learning, Space Day winners", href: "/student-life?tab=stem", type: "color", color: "bg-purple-700", colSpan: 1, rowSpan: 1 },
  { title: "Clubs & Activities", subtext: "Art, Karadi Path, Karate, Dance, Bharatanatyam", href: "/student-life?tab=clubs", type: "image", image: "/images/cultural/cultural-1.jpg", colSpan: 1, rowSpan: 2 },
  { title: "Leadership", subtext: "House System, Student Council, POCSO & POSH Committees", href: "/student-life?tab=leadership", type: "color", color: "bg-teal-800", colSpan: 1, rowSpan: 1 },
  // Row 2
  { title: "Digital Learning", subtext: "28 smart classrooms, AI-enabled tools from Kindergarten", href: "/why-us", type: "color", color: "bg-yellow-500", colSpan: 1, rowSpan: 1 },
  { title: "Medical Pathways", subtext: "Apollo Medical College visits and healthcare exposure", href: "/student-life?tab=stem", type: "color", color: "bg-rose-600", colSpan: 1, rowSpan: 1 },
  // Row 3-4
  { title: "Yoga & Wellness", subtext: "Daily sessions by Apollo Foundation Total Health Trainer", href: "/student-life?tab=clubs", type: "image", image: "/images/yoga/group-yoga.jpg", colSpan: 1, rowSpan: 1 },
  { title: "Achievements", subtext: "State champions, INSPIRE MANAK, 7-year mandal toppers", href: "/student-life?tab=achievements", type: "image", image: "/images/impact/impact-1.jpg", colSpan: 2, rowSpan: 2 },
  { title: "Brighter Minds", subtext: "Cognitive development, memory, and creativity activation", href: "/student-life?tab=stem", type: "color", color: "bg-emerald-700", colSpan: 1, rowSpan: 1 },
  // Row 4
  { title: "Campus Life", subtext: "Corridor learning, chess, carrom, GK corners", href: "/about-us", type: "image", image: "/images/campus/entrance.jpg", colSpan: 1, rowSpan: 1 },
  { title: "Value Education", subtext: "Life skills, media literacy, financial literacy", href: "/why-us", type: "color", color: "bg-amber-600", colSpan: 1, rowSpan: 1 },
];

export function HighlightsGrid() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="highlights-heading">
      <div className="mx-auto max-w-7xl px-6">
        <h2 id="highlights-heading" className="sr-only">Student Life</h2>

        {/* Section header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Beyond Academics</p>
          <h3 className="mt-2 font-display text-3xl uppercase text-ink-900 md:text-4xl">
            Student Life
          </h3>
          <p className="mt-3 max-w-2xl text-sm text-ink-600">
            From sports and STEM to leadership and values — discover how Apollo Vidhyalayam nurtures the complete child.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[160px]">
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className={`group relative overflow-hidden min-h-[160px] sm:min-h-0 transition-transform duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-xl ${
                tile.type === "color" ? tile.color : ""
              } md:col-span-${tile.colSpan} md:row-span-${tile.rowSpan}`}
              style={{
                gridColumn: `span ${tile.colSpan}`,
                gridRow: `span ${tile.rowSpan}`,
              }}
            >
              {tile.type === "image" && (
                <>
                  <Image
                    src={tile.image!}
                    alt={tile.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  />
                  {/* Default gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-900/85 p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="font-display text-base uppercase text-white md:text-lg">{tile.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/85">{tile.subtext}</p>
                    <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    </div>
                  </div>
                </>
              )}

              {/* Default title at bottom — hidden on hover for image tiles */}
              <div className={`relative z-10 flex h-full flex-col justify-end p-5 ${tile.type === "image" ? "transition-opacity duration-300 group-hover:opacity-0" : ""}`}>
                <h3 className="font-display flex items-center gap-1.5 text-base uppercase text-white md:text-lg">
                  {tile.title}
                  <svg className="size-4 shrink-0 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </h3>
                <p className="mt-1 text-xs text-white/85 md:text-sm">{tile.subtext}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
