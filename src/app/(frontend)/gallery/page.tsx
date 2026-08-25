import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import Image from "next/image";

const images = [
  { src: "/images/campus/entrance.jpg", alt: "School entrance" },
  { src: "/images/classroom/classroom.jpg", alt: "Classroom moments" },
  { src: "/images/sports/sports-1.jpg", alt: "Athletics" },
  { src: "/images/cultural/cultural-1.jpg", alt: "Cultural performance" },
  { src: "/images/yoga/group-yoga.jpg", alt: "Yoga session" },
  { src: "/images/brighter-minds/project-1.png", alt: "Science fair" },
  { src: "/images/campus/walking.jpg", alt: "Students walking" },
  { src: "/images/computer/computer-class.jpg", alt: "Smart classroom" },
  { src: "/images/sports/sports-2.jpg", alt: "Throwball champions" },
  { src: "/images/educational-tour/tour-1.png", alt: "Educational trip" },
  { src: "/images/classroom/reading.jpg", alt: "Reading time" },
  { src: "/images/cultural/cultural-2.jpg", alt: "Western dance" },
  { src: "/images/impact/impact-1.jpg", alt: "Community outreach" },
  { src: "/images/campus/kids-camera.jpg", alt: "School activities" },
  { src: "/images/sports/sports-3.jpg", alt: "Football" },
  { src: "/images/classroom/hands-up.jpg", alt: "Active learning" },
  { src: "/images/brighter-minds/project-2.png", alt: "Project work" },
  { src: "/images/yoga/group-yoga-2.jpg", alt: "Group yoga" },
  { src: "/images/cultural/cultural-3.jpg", alt: "Bharatanatyam" },
  { src: "/images/campus/student-day.jpg", alt: "Student day" },
  { src: "/images/educational-tour/tour-2.png", alt: "Nature walk" },
  { src: "/images/sports/sports-4.jpg", alt: "Cricket" },
  { src: "/images/classroom/studying.jpg", alt: "Focused study" },
  { src: "/images/brighter-minds/project-3.png", alt: "Innovation" },
  { src: "/images/impact/impact-2.jpg", alt: "Village service" },
  { src: "/images/computer/boy-computer.jpg", alt: "Digital learning" },
  { src: "/images/cultural/cultural-4.jpg", alt: "School event" },
  { src: "/images/classroom/teacher.jpg", alt: "Teacher guiding" },
  { src: "/images/sports/badminton.jpg", alt: "Sports day" },
  { src: "/images/educational-tour/tour-3.png", alt: "Museum visit" },
  { src: "/images/yoga/students-yoga.jpg", alt: "Meditation" },
  { src: "/images/impact/impact-3.jpg", alt: "Helping hands" },
  { src: "/images/brighter-minds/project-4.png", alt: "Award project" },
  { src: "/images/classroom/girls-class.jpg", alt: "Group discussion" },
  { src: "/images/campus/playground.jpg", alt: "Playground" },
  { src: "/images/about/microscope.jpg", alt: "Lab experiment" },
];

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">Gallery</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Moments captured across academics, sports, culture, and community.
            </p>
          </div>
        </section>

        {/* Gallery grid */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
                <div key={image.src} className="group relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    quality={90}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <span className="text-sm font-semibold text-white">{image.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
