"use client";

import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

type GalleryCategory = {
  title: string;
  images: { src: string; alt: string }[];
};

const schoolCategories: GalleryCategory[] = [
  {
    title: "Photo Gallery",
    images: [
      { src: "/images/campus/entrance.jpg", alt: "School entrance" },
      { src: "/images/classroom/classroom.jpg", alt: "Classroom moments" },
      { src: "/images/campus/walking.jpg", alt: "Students walking" },
      { src: "/images/classroom/reading.jpg", alt: "Reading time" },
      { src: "/images/campus/kids-camera.jpg", alt: "School activities" },
    ],
  },
  {
    title: "Video Gallery",
    images: [
      { src: "/images/cultural/cultural-1.jpg", alt: "Cultural performance" },
      { src: "/images/cultural/cultural-2.jpg", alt: "Event recording" },
      { src: "/images/educational-tour/tour-1.png", alt: "Campus tour" },
      { src: "/images/cultural/cultural-3.jpg", alt: "Student performance" },
      { src: "/images/cultural/cultural-4.jpg", alt: "School event" },
    ],
  },
  {
    title: "Campus Gallery",
    images: [
      { src: "/images/campus/entrance.jpg", alt: "School building" },
      { src: "/images/computer/computer-class.jpg", alt: "Smart classroom" },
      { src: "/images/classroom/studying.jpg", alt: "Library" },
      { src: "/images/medical/test-tube.jpg", alt: "Science lab" },
      { src: "/images/campus/playground.jpg", alt: "Playground" },
    ],
  },
  {
    title: "Events Gallery",
    images: [
      { src: "/images/cultural/cultural-1.jpg", alt: "Annual day" },
      { src: "/images/cultural/cultural-2.jpg", alt: "Cultural event" },
      { src: "/images/campus/student-day.jpg", alt: "Celebration" },
      { src: "/images/cultural/cultural-3.jpg", alt: "Prize ceremony" },
      { src: "/images/cultural/cultural-4.jpg", alt: "School function" },
    ],
  },
  {
    title: "Sports Gallery",
    images: [
      { src: "/images/sports/sports-1.jpg", alt: "Cricket match" },
      { src: "/images/sports/sports-2.jpg", alt: "Athletics" },
      { src: "/images/sports/sports-3.jpg", alt: "Throwball" },
      { src: "/images/sports/sports-4.jpg", alt: "Football" },
      { src: "/images/sports/badminton.jpg", alt: "Sports day" },
    ],
  },
  {
    title: "Academic Activities",
    images: [
      { src: "/images/brighter-minds/project-1.png", alt: "Science fair" },
      { src: "/images/brighter-minds/project-2.png", alt: "Project work" },
      { src: "/images/about/microscope.jpg", alt: "Lab experiment" },
      { src: "/images/classroom/hands-up.jpg", alt: "Group study" },
      { src: "/images/brighter-minds/project-3.png", alt: "Presentation" },
    ],
  },
];

const eventsCategories: GalleryCategory[] = [
  {
    title: "Sports Day",
    images: [
      { src: "/images/sports/sports-1.jpg", alt: "Sports day opening" },
      { src: "/images/sports/sports-2.jpg", alt: "Races" },
      { src: "/images/sports/sports-3.jpg", alt: "Prize distribution" },
    ],
  },
  {
    title: "Annual Day",
    images: [
      { src: "/images/cultural/cultural-1.jpg", alt: "Annual day performance" },
      { src: "/images/cultural/cultural-2.jpg", alt: "Stage show" },
      { src: "/images/cultural/cultural-3.jpg", alt: "Awards" },
    ],
  },
  {
    title: "Science Fair",
    images: [
      { src: "/images/brighter-minds/project-1.png", alt: "Projects" },
      { src: "/images/brighter-minds/project-2.png", alt: "Experiments" },
      { src: "/images/brighter-minds/project-3.png", alt: "Innovation" },
    ],
  },
  {
    title: "Investiture Ceremony",
    images: [
      { src: "/images/campus/student-day.jpg", alt: "Badge ceremony" },
      { src: "/images/campus/kids-camera.jpg", alt: "Student leaders" },
      { src: "/images/campus/walking.jpg", alt: "Oath taking" },
    ],
  },
  {
    title: "International Yoga Day",
    images: [
      { src: "/images/yoga/group-yoga.jpg", alt: "Yoga session" },
      { src: "/images/yoga/group-yoga-2.jpg", alt: "Group yoga" },
      { src: "/images/yoga/students-yoga.jpg", alt: "Meditation" },
    ],
  },
  {
    title: "International Chess Day",
    images: [
      { src: "/images/classroom/studying.jpg", alt: "Chess tournament" },
      { src: "/images/classroom/hands-up.jpg", alt: "Chess match" },
      { src: "/images/campus/student-day.jpg", alt: "Winners" },
    ],
  },
  {
    title: "Independence Day",
    images: [
      { src: "/images/campus/entrance.jpg", alt: "Flag hoisting" },
      { src: "/images/cultural/cultural-4.jpg", alt: "Patriotic songs" },
      { src: "/images/campus/playground.jpg", alt: "March past" },
    ],
  },
  {
    title: "Republic Day",
    images: [
      { src: "/images/campus/bus-arrival.jpg", alt: "Republic day celebrations" },
      { src: "/images/campus/walking.jpg", alt: "Parade" },
      { src: "/images/cultural/cultural-1.jpg", alt: "Cultural programme" },
    ],
  },
  {
    title: "Teacher's Day",
    images: [
      { src: "/images/classroom/teacher.jpg", alt: "Felicitation" },
      { src: "/images/classroom/girls-class.jpg", alt: "Celebrations" },
      { src: "/images/classroom/classroom.jpg", alt: "Student performances" },
    ],
  },
  {
    title: "Children's Day",
    images: [
      { src: "/images/campus/kids-camera.jpg", alt: "Fun activities" },
      { src: "/images/sports/badminton.jpg", alt: "Games" },
      { src: "/images/campus/playground.jpg", alt: "Celebrations" },
    ],
  },
  {
    title: "Community Service",
    images: [
      { src: "/images/impact/impact-1.jpg", alt: "Outreach" },
      { src: "/images/impact/impact-2.jpg", alt: "Village service" },
      { src: "/images/impact/impact-3.jpg", alt: "Helping hands" },
    ],
  },
  {
    title: "Field Visits",
    images: [
      { src: "/images/educational-tour/tour-1.png", alt: "Educational trip" },
      { src: "/images/educational-tour/tour-2.png", alt: "Nature walk" },
      { src: "/images/educational-tour/tour-3.png", alt: "Museum visit" },
    ],
  },
];

function GalleryRow({ category }: { category: GalleryCategory }) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    return () => { api.off("select", update); };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div className="mb-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl uppercase text-ink-900 md:text-2xl">
          {category.title}
        </h2>
        <div className="flex shrink-0 gap-2">
          <Button size="icon" variant="ghost" onClick={() => api?.scrollPrev()} disabled={!canScrollPrev} className="h-8 w-8">
            <ArrowLeft className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => api?.scrollNext()} disabled={!canScrollNext} className="h-8 w-8">
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
      <Carousel setApi={setApi} opts={{ dragFree: true, align: "start" }}>
        <CarouselContent className="-ml-3">
          {category.images.map((image) => (
            <CarouselItem key={image.src} className="basis-[280px] pl-3 md:basis-[320px] lg:basis-[360px]">
              <div className="group relative aspect-[3/2] overflow-hidden">
                <Image src={image.src} alt={image.alt} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="360px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="text-sm font-semibold text-white">{image.alt}</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

const tabList = ["School", "Events"];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState(0);
  const currentCategories = activeTab === 0 ? schoolCategories : eventsCategories;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Life at Apollo Vidhyalayam</p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">Gallery</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Moments captured across academics, sports, culture, and community.
            </p>
          </div>
        </section>

        {/* Tabs bar */}
        <div className="bg-teal-900 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-center gap-2 py-4 md:gap-6">
              {tabList.map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 md:text-sm ${
                    activeTab === idx
                      ? "bg-yellow-500 text-ink-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Sections */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {currentCategories.map((category) => (
              <GalleryRow key={category.title} category={category} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
