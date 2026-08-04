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
      { src: "https://picsum.photos/seed/photo1/600/400", alt: "School life" },
      { src: "https://picsum.photos/seed/photo2/600/400", alt: "Classroom moments" },
      { src: "https://picsum.photos/seed/photo3/600/400", alt: "Students together" },
      { src: "https://picsum.photos/seed/photo4/600/400", alt: "Learning in progress" },
      { src: "https://picsum.photos/seed/photo5/600/400", alt: "School activities" },
    ],
  },
  {
    title: "Video Gallery",
    images: [
      { src: "https://picsum.photos/seed/video1/600/400", alt: "School video" },
      { src: "https://picsum.photos/seed/video2/600/400", alt: "Event recording" },
      { src: "https://picsum.photos/seed/video3/600/400", alt: "Campus tour" },
      { src: "https://picsum.photos/seed/video4/600/400", alt: "Student performance" },
      { src: "https://picsum.photos/seed/video5/600/400", alt: "Documentary" },
    ],
  },
  {
    title: "Campus Gallery",
    images: [
      { src: "https://picsum.photos/seed/campus1/600/400", alt: "School building" },
      { src: "https://picsum.photos/seed/campus2/600/400", alt: "Smart classroom" },
      { src: "https://picsum.photos/seed/campus3/600/400", alt: "Library" },
      { src: "https://picsum.photos/seed/campus4/600/400", alt: "Science lab" },
      { src: "https://picsum.photos/seed/campus5/600/400", alt: "Playground" },
    ],
  },
  {
    title: "Events Gallery",
    images: [
      { src: "https://picsum.photos/seed/events1/600/400", alt: "Annual day" },
      { src: "https://picsum.photos/seed/events2/600/400", alt: "Cultural event" },
      { src: "https://picsum.photos/seed/events3/600/400", alt: "Celebration" },
      { src: "https://picsum.photos/seed/events4/600/400", alt: "Prize ceremony" },
      { src: "https://picsum.photos/seed/events5/600/400", alt: "School function" },
    ],
  },
  {
    title: "Sports Gallery",
    images: [
      { src: "https://picsum.photos/seed/sportsg1/600/400", alt: "Cricket match" },
      { src: "https://picsum.photos/seed/sportsg2/600/400", alt: "Athletics" },
      { src: "https://picsum.photos/seed/sportsg3/600/400", alt: "Throwball" },
      { src: "https://picsum.photos/seed/sportsg4/600/400", alt: "Football" },
      { src: "https://picsum.photos/seed/sportsg5/600/400", alt: "Sports day" },
    ],
  },
  {
    title: "Academic Activities",
    images: [
      { src: "https://picsum.photos/seed/academic1/600/400", alt: "Science fair" },
      { src: "https://picsum.photos/seed/academic2/600/400", alt: "Project work" },
      { src: "https://picsum.photos/seed/academic3/600/400", alt: "Lab experiment" },
      { src: "https://picsum.photos/seed/academic4/600/400", alt: "Group study" },
      { src: "https://picsum.photos/seed/academic5/600/400", alt: "Presentation" },
    ],
  },
];

const eventsCategories: GalleryCategory[] = [
  {
    title: "Sports Day",
    images: [
      { src: "https://picsum.photos/seed/sportsday1/600/400", alt: "Sports day opening" },
      { src: "https://picsum.photos/seed/sportsday2/600/400", alt: "Races" },
      { src: "https://picsum.photos/seed/sportsday3/600/400", alt: "Prize distribution" },
    ],
  },
  {
    title: "Annual Day",
    images: [
      { src: "https://picsum.photos/seed/annualday1/600/400", alt: "Annual day performance" },
      { src: "https://picsum.photos/seed/annualday2/600/400", alt: "Stage show" },
      { src: "https://picsum.photos/seed/annualday3/600/400", alt: "Awards" },
    ],
  },
  {
    title: "Science Fair",
    images: [
      { src: "https://picsum.photos/seed/sciencefair1/600/400", alt: "Projects" },
      { src: "https://picsum.photos/seed/sciencefair2/600/400", alt: "Experiments" },
      { src: "https://picsum.photos/seed/sciencefair3/600/400", alt: "Innovation" },
    ],
  },
  {
    title: "Investiture Ceremony",
    images: [
      { src: "https://picsum.photos/seed/investiture1/600/400", alt: "Badge ceremony" },
      { src: "https://picsum.photos/seed/investiture2/600/400", alt: "Student leaders" },
      { src: "https://picsum.photos/seed/investiture3/600/400", alt: "Oath taking" },
    ],
  },
  {
    title: "International Yoga Day",
    images: [
      { src: "https://picsum.photos/seed/yogaday1/600/400", alt: "Yoga session" },
      { src: "https://picsum.photos/seed/yogaday2/600/400", alt: "Group yoga" },
      { src: "https://picsum.photos/seed/yogaday3/600/400", alt: "Meditation" },
    ],
  },
  {
    title: "International Chess Day",
    images: [
      { src: "https://picsum.photos/seed/chessday1/600/400", alt: "Chess tournament" },
      { src: "https://picsum.photos/seed/chessday2/600/400", alt: "Chess match" },
      { src: "https://picsum.photos/seed/chessday3/600/400", alt: "Winners" },
    ],
  },
  {
    title: "Independence Day",
    images: [
      { src: "https://picsum.photos/seed/indday1/600/400", alt: "Flag hoisting" },
      { src: "https://picsum.photos/seed/indday2/600/400", alt: "Patriotic songs" },
      { src: "https://picsum.photos/seed/indday3/600/400", alt: "March past" },
    ],
  },
  {
    title: "Republic Day",
    images: [
      { src: "https://picsum.photos/seed/repday1/600/400", alt: "Republic day celebrations" },
      { src: "https://picsum.photos/seed/repday2/600/400", alt: "Parade" },
      { src: "https://picsum.photos/seed/repday3/600/400", alt: "Cultural programme" },
    ],
  },
  {
    title: "Teacher's Day",
    images: [
      { src: "https://picsum.photos/seed/teacherday1/600/400", alt: "Felicitation" },
      { src: "https://picsum.photos/seed/teacherday2/600/400", alt: "Celebrations" },
      { src: "https://picsum.photos/seed/teacherday3/600/400", alt: "Student performances" },
    ],
  },
  {
    title: "Children's Day",
    images: [
      { src: "https://picsum.photos/seed/childday1/600/400", alt: "Fun activities" },
      { src: "https://picsum.photos/seed/childday2/600/400", alt: "Games" },
      { src: "https://picsum.photos/seed/childday3/600/400", alt: "Celebrations" },
    ],
  },
  {
    title: "Community Service",
    images: [
      { src: "https://picsum.photos/seed/community1/600/400", alt: "Outreach" },
      { src: "https://picsum.photos/seed/community2/600/400", alt: "Village service" },
      { src: "https://picsum.photos/seed/community3/600/400", alt: "Helping hands" },
    ],
  },
  {
    title: "Field Visits",
    images: [
      { src: "https://picsum.photos/seed/fieldvisit1/600/400", alt: "Educational trip" },
      { src: "https://picsum.photos/seed/fieldvisit2/600/400", alt: "Nature walk" },
      { src: "https://picsum.photos/seed/fieldvisit3/600/400", alt: "Museum visit" },
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
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition md:text-sm ${
                    activeTab === idx
                      ? "rounded-full bg-yellow-500 text-ink-900"
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
