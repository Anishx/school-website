"use client";

import { SiteHeader } from "@/components/site-header";
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

const categories: GalleryCategory[] = [
  {
    title: "Academic Excellence",
    images: [
      { src: "https://picsum.photos/seed/academic1/600/400", alt: "Students studying" },
      { src: "https://picsum.photos/seed/academic2/600/400", alt: "Classroom learning" },
      { src: "https://picsum.photos/seed/academic3/600/400", alt: "Board results celebration" },
      { src: "https://picsum.photos/seed/academic4/600/400", alt: "Science project" },
      { src: "https://picsum.photos/seed/academic5/600/400", alt: "Math competition" },
    ],
  },
  {
    title: "Smart Classrooms",
    images: [
      { src: "https://picsum.photos/seed/smart1/600/400", alt: "Digital board" },
      { src: "https://picsum.photos/seed/smart2/600/400", alt: "Technology in class" },
      { src: "https://picsum.photos/seed/smart3/600/400", alt: "Interactive learning" },
      { src: "https://picsum.photos/seed/smart4/600/400", alt: "Computer lab" },
      { src: "https://picsum.photos/seed/smart5/600/400", alt: "Digital tools" },
    ],
  },
  {
    title: "Medical Pathways",
    images: [
      { src: "https://picsum.photos/seed/medical1/600/400", alt: "Hospital visit" },
      { src: "https://picsum.photos/seed/medical2/600/400", alt: "Lab exposure" },
      { src: "https://picsum.photos/seed/medical3/600/400", alt: "Health camp" },
      { src: "https://picsum.photos/seed/medical4/600/400", alt: "Doctor interaction" },
      { src: "https://picsum.photos/seed/medical5/600/400", alt: "Career session" },
    ],
  },
  {
    title: "Sports Activities",
    images: [
      { src: "https://picsum.photos/seed/sports1/600/400", alt: "Cricket match" },
      { src: "https://picsum.photos/seed/sports2/600/400", alt: "Athletics" },
      { src: "https://picsum.photos/seed/sports3/600/400", alt: "Kabaddi" },
      { src: "https://picsum.photos/seed/sports4/600/400", alt: "Volleyball" },
      { src: "https://picsum.photos/seed/sports5/600/400", alt: "Sports day" },
    ],
  },
  {
    title: "Cultural Events",
    images: [
      { src: "https://picsum.photos/seed/cultural1/600/400", alt: "Dance performance" },
      { src: "https://picsum.photos/seed/cultural2/600/400", alt: "Annual day" },
      { src: "https://picsum.photos/seed/cultural3/600/400", alt: "Music event" },
      { src: "https://picsum.photos/seed/cultural4/600/400", alt: "Drama" },
      { src: "https://picsum.photos/seed/cultural5/600/400", alt: "Art exhibition" },
    ],
  },
  {
    title: "Educational Tours",
    images: [
      { src: "https://picsum.photos/seed/tours1/600/400", alt: "Field trip" },
      { src: "https://picsum.photos/seed/tours2/600/400", alt: "Museum visit" },
      { src: "https://picsum.photos/seed/tours3/600/400", alt: "Nature walk" },
      { src: "https://picsum.photos/seed/tours4/600/400", alt: "Industry visit" },
      { src: "https://picsum.photos/seed/tours5/600/400", alt: "Heritage site" },
    ],
  },
  {
    title: "Student Leadership",
    images: [
      { src: "https://picsum.photos/seed/leader1/600/400", alt: "Student council" },
      { src: "https://picsum.photos/seed/leader2/600/400", alt: "Elections" },
      { src: "https://picsum.photos/seed/leader3/600/400", alt: "Monitor duties" },
      { src: "https://picsum.photos/seed/leader4/600/400", alt: "Assembly" },
      { src: "https://picsum.photos/seed/leader5/600/400", alt: "Debate" },
    ],
  },
  {
    title: "Brighter Minds Program",
    images: [
      { src: "https://picsum.photos/seed/brighter1/600/400", alt: "Brain training" },
      { src: "https://picsum.photos/seed/brighter2/600/400", alt: "Concentration exercise" },
      { src: "https://picsum.photos/seed/brighter3/600/400", alt: "Memory session" },
      { src: "https://picsum.photos/seed/brighter4/600/400", alt: "Creative thinking" },
      { src: "https://picsum.photos/seed/brighter5/600/400", alt: "Group activity" },
    ],
  },
  {
    title: "Community Events",
    images: [
      { src: "https://picsum.photos/seed/community1/600/400", alt: "Parent meeting" },
      { src: "https://picsum.photos/seed/community2/600/400", alt: "Village outreach" },
      { src: "https://picsum.photos/seed/community3/600/400", alt: "Health camp" },
      { src: "https://picsum.photos/seed/community4/600/400", alt: "Tree planting" },
      { src: "https://picsum.photos/seed/community5/600/400", alt: "Celebration" },
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

  // Auto-scroll
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
        <h2 className="font-display text-xl font-bold text-ink-900 md:text-2xl">
          {category.title}
        </h2>
        <div className="flex shrink-0 gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            className="h-8 w-8"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            className="h-8 w-8"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{ dragFree: true, align: "start" }}
      >
        <CarouselContent className="-ml-3">
          {category.images.map((image) => (
            <CarouselItem
              key={image.src}
              className="basis-[280px] pl-3 md:basis-[320px] lg:basis-[360px]"
            >
              <div className="group relative aspect-[3/2] overflow-hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="360px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="text-sm font-semibold text-white">{category.title}</span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Life at Apollo Vidhyalayam</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Gallery
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Moments captured across academics, sports, culture, and community.
            </p>
          </div>
        </section>

        {/* Gallery Sections */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {categories.map((category) => (
              <GalleryRow key={category.title} category={category} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
