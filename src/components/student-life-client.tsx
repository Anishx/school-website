'use client';

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/breadcrumb";
import type { ClubsDTO, SportsDTO } from "@/cms/public/dto";
import type { ContentSource } from "@/cms/public/dto";
import { studentLifeContent } from "@/cms/public/student-life-content";
import { resolveStudentLifeTab, visibleStudentLifeTabIndices, type StudentLifeVisibility } from "@/cms/public/student-life";

export function StudentLifeClient(props: {
  visibility: StudentLifeVisibility;
  sports: SportsDTO | null;
  clubs: ClubsDTO | null;
  sportsSource: ContentSource;
  clubsSource: ContentSource;
}) {
  return (
    <Suspense fallback={null}>
      <StudentLifeContent {...props} />
    </Suspense>
  );
}

function StudentLifeContent({ sports, clubs, sportsSource, clubsSource, visibility }: {
  visibility: StudentLifeVisibility;
  sports: SportsDTO | null;
  clubs: ClubsDTO | null;
  sportsSource: ContentSource;
  clubsSource: ContentSource;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const contentTabs = useMemo(() => studentLifeContent(sports, clubs, sportsSource, clubsSource), [sports, clubs, sportsSource, clubsSource]);

  const visibleTabs = visibleStudentLifeTabIndices(visibility);
  const [selection, setSelection] = useState({ param: tabParam, index: resolveStudentLifeTab(tabParam, visibleTabs) });
  if (selection.param !== tabParam) {
    setSelection({ param: tabParam, index: resolveStudentLifeTab(tabParam, visibleTabs) });
  }
  const activeTab = selection.param === tabParam && visibleTabs.includes(selection.index)
    ? selection.index : resolveStudentLifeTab(tabParam, visibleTabs);

  return (
    <>
      <main className="flex-1">
        {/* Hero with image background + tabs */}
        <section className="relative">
          {/* Background image */}
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/hero-v2.jpg"
              alt="Student Life at Apollo Vidhyalayam"
              fill
              className="object-cover"
              sizes="100vw"
              priority
              quality={95}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(4, 125, 160, 1) 29%, rgba(4, 125, 160, 0.7) 62%, rgba(4, 125, 160, 0.33) 78%, rgba(4, 125, 160, 0) 99%)" }} />

            {/* Hero text */}
            <div className="relative z-10 flex h-full items-end">
              <div className="mx-auto w-full max-w-7xl px-6 pb-20 md:pb-24">
                <Breadcrumb />
                <h1 className="font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
                  Grow, Challenge,<br />Connect
                </h1>
              </div>
            </div>
          </div>

          {/* Tabs bar */}
          {visibleTabs.length > 0 && <div className="bg-teal-900">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex flex-wrap items-center justify-center gap-2 py-4 md:gap-6">
                {visibleTabs.map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelection({ param: tabParam, index: idx })}
                    aria-pressed={activeTab === idx}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 md:text-sm ${
                      activeTab === idx
                        ? "bg-yellow-500 text-ink-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {contentTabs[idx].label}
                  </button>
                ))}
              </div>
            </div>
          </div>}
        </section>

        {/* Tab content */}
        {activeTab >= 0 && <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">
              {contentTabs[activeTab].label}
            </h2>

            {/* Sports intro content */}
            {contentTabs[activeTab].intro && (
              <div className="mt-6 max-w-3xl space-y-5 text-sm leading-relaxed text-ink-600 md:text-base">
                <p>{contentTabs[activeTab].intro}</p>

                {contentTabs[activeTab].coaching && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Expert Coaching</h3>
                    <p className="mt-1">{contentTabs[activeTab].coaching}</p>
                  </div>
                )}

                {contentTabs[activeTab].philosophy && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Our Philosophy</h3>
                    <p className="mt-1">{contentTabs[activeTab].philosophy}</p>
                  </div>
                )}

                {contentTabs[activeTab].achievements && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Achievements</h3>
                    <p className="mt-1">{contentTabs[activeTab].achievements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sports offered grid / cards */}
            <div className="mt-10">
              {contentTabs[activeTab].sports && (
                <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">
                  Sports Disciplines
                </h3>
              )}
            </div>

            {/* Flagship programme (Clubs & Activities tab) */}
            {contentTabs[activeTab].flagship && (
              <div className="mt-10 overflow-hidden rounded-lg bg-teal-900 md:grid md:grid-cols-2">
                <div className="relative aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[320px]">
                  <Image
                    src={contentTabs[activeTab].flagship!.image}
                    alt={contentTabs[activeTab].flagship!.name}
                    fill
                    quality={90}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <span className="inline-flex w-fit items-center rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-900">
                    {contentTabs[activeTab].flagship!.tagline}
                  </span>
                  <h3 className="font-display mt-4 text-2xl uppercase text-white md:text-3xl">
                    {contentTabs[activeTab].flagship!.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
                    {contentTabs[activeTab].flagship!.description}
                  </p>
                </div>
              </div>
            )}

            {/* Houses (Leadership tab) */}
            {contentTabs[activeTab].houses && (
              <div className="mt-8">
                <h3 className="text-base font-bold text-ink-900">Our House System</h3>
                <p className="mt-2 text-sm text-ink-600">Every student is assigned to one of four houses, each representing a core value:</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {contentTabs[activeTab].houses!.map((house) => (
                    <div key={house.name} className={`${house.color} p-5 text-white`}>
                      <p className="font-display text-lg uppercase">{house.name}</p>
                      <p className="mt-1 text-sm italic text-white/85">{house.value}</p>
                    </div>
                  ))}
                </div>
                {contentTabs[activeTab].houseDescription && (
                  <p className="mt-4 text-sm leading-relaxed text-ink-600">{contentTabs[activeTab].houseDescription}</p>
                )}
                {contentTabs[activeTab].leadershipDescription && (
                  <div className="mt-6">
                    <h3 className="text-base font-bold text-ink-900">Student Leadership</h3>
                    {contentTabs[activeTab].leadershipDescription!.split("\n\n").map((para, i) => (
                      <p key={i} className="mt-2 text-sm leading-relaxed text-ink-600">{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contentTabs[activeTab].items.map((item) => (
                <div key={item.title} className="group relative overflow-hidden">
                  <div className="relative aspect-[4/3] w-full bg-canvas-100">
                    <Image
                      src={item.image || "/hero-image.jpg"}
                      alt={item.title}
                      fill
                      quality={90}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: item.objectPosition || "center" }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-900/20 to-transparent" />
                  </div>
                  {/* Default visible: title only */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-500 group-hover:opacity-0">
                    <h4 className="font-display text-base uppercase text-white">{item.title}</h4>
                  </div>
                  {/* Details expand upward and fade in, like the Our Faculty cards. */}
                  <div className="absolute bottom-0 left-0 right-0 grid grid-rows-[0fr] bg-teal-900/90 opacity-0 transition-[grid-template-rows,opacity] duration-500 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                    <div className="overflow-hidden">
                      <div className="p-4">
                        <h4 className="font-display text-sm uppercase text-white">{item.title}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-white/80">{item.description}</p>
                      </div>
                    </div>
                  </div>
                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 z-10" />
                </div>
              ))}
            </div>
          </div>
        </section>}
      </main>
    </>
  );
}
