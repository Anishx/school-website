import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/*
  4×4 grid layout:
  
  Row 1: [img-A      ] [color-1    ] [img-B               ]
  Row 2: [img-A      ] [color-2    ] [img-B               ]
  Row 3: [img-C               ] [color-3    ] [color-4    ]
  Row 4: [img-C               ] [color-5    ] [img-D      ]
*/

type TileBase = {
  title: string;
  subtext: string;
};

type ColorTile = TileBase & {
  type: "color";
  color: string;
};

type ImageTile = TileBase & {
  type: "image";
  image: string;
};

type Tile = (ColorTile | ImageTile) & {
  className: string;
};

const tiles: Tile[] = [
  // img-A: col 1, row 1-2
  {
    type: "image",
    title: "Clubs & Leadership Development",
    subtext: "Designed to develop confidence, communication, leadership, and teamwork.",
    image: "/images/classroom/hands-up.jpg",
    className: "col-span-1 row-span-2",
  },
  // color-1: col 2, row 1
  {
    type: "color",
    title: "Digital Learning",
    subtext: "Smart classrooms equipped with interactive boards, tablets, and the latest digital tools for immersive learning.",
    color: "bg-sky-600",
    className: "col-span-1 row-span-1",
  },
  // img-B: col 3-4, row 1-2
  {
    type: "image",
    title: "Brighter Minds Program",
    subtext: "Unlocking every child's potential.",
    image: "/images/brighter-minds/project-1.png",
    className: "col-span-2 row-span-2",
  },
  // color-2: col 2, row 2
  {
    type: "color",
    title: "Medical Pathways Program",
    subtext: "Building Future Healthcare Leaders.",
    color: "bg-rose-600",
    className: "col-span-1 row-span-1",
  },
  // img-C: col 1-2, row 3-4
  {
    type: "image",
    title: "Sports & Physical Education",
    subtext: "Excellence Beyond Academics.",
    image: "/images/sports/sports-1.jpg",
    className: "col-span-2 row-span-2",
  },
  // color-3: col 3, row 3
  {
    type: "color",
    title: "Exposure Learning",
    subtext: "Learning beyond classrooms.",
    color: "bg-teal-800",
    className: "col-span-1 row-span-1",
  },
  // color-4: col 4, row 3
  {
    type: "color",
    title: "Leadership Development",
    subtext: "Building tomorrow's leaders through student councils and mentorship.",
    color: "bg-amber-600",
    className: "col-span-1 row-span-1",
  },
  // color-5: col 3, row 4
  {
    type: "color",
    title: "Spoken English",
    subtext: "Fluency and confidence building for every student.",
    color: "bg-emerald-700",
    className: "col-span-1 row-span-1",
  },
  // img-D: col 4, row 4
  {
    type: "image",
    title: "Campus Life",
    subtext: "A vibrant environment for learning and growth.",
    image: "/images/campus/entrance.jpg",
    className: "col-span-1 row-span-1",
  },
];

export function HighlightsGrid() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="highlights-heading">
      <div className="mx-auto max-w-7xl px-6">
        <h2 id="highlights-heading" className="sr-only">School Highlights</h2>

        {/* Section header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Beyond Academics</p>
          <h3 className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Student Life
          </h3>
        </div>

        {/* Mobile: simple stack. Tablet+: 4-col grid */}
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[180px]">
          {tiles.map((tile) => (
            <div
              key={tile.title}
              className={`group relative overflow-hidden min-h-[200px] sm:min-h-0 transition-transform duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-xl ${tile.type === "color" ? tile.color : ""} ${tile.className.split(" ").map(c => `md:${c}`).join(" ")}`}
            >
              {tile.type === "image" && (
                <>
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2 backdrop-blur-sm"
                    style={{ maskImage: "linear-gradient(to top, black 40%, transparent)" }}
                  />
                </>
              )}

              <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <h3 className="text-base font-bold text-white md:text-lg">{tile.title}</h3>
                <p className="mt-1 text-xs text-white/85 md:text-sm">{tile.subtext}</p>
                <Link
                  href="/student-life"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white"
                >
                  Read More <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
