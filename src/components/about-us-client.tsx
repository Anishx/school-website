"use client";

import { useState } from "react";
import Image from "next/image";
import { Breadcrumb } from "@/components/breadcrumb";

const tabs = ["Overview", "Teachers", "Infrastructure"];

export function AboutUsClient() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400"></p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">Know Us</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Building futures rooted in discipline, values, and academic excellence since 2012.
            </p>
          </div>
        </section>

        {/* Tabs bar */}
        <div className="bg-teal-900 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-center gap-2 py-4 md:gap-6">
              {tabs.map((tab, idx) => (
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

        {/* Tab content */}
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <TeachersTab />}
        {activeTab === 2 && <InfrastructureTab />}
      </main>
    </>
  );
}
function OverviewTab() {
  return (
    <>
      {/* Highlights */}
      <section className="bg-white py-16 md:py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Highlights</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="relative overflow-hidden bg-yellow-500 p-5 aspect-[1/0.7] flex flex-col justify-end">
              <svg className="absolute top-3 right-3 size-12 text-purple-700 opacity-80" viewBox="0 0 48 48" fill="currentColor"><path d="M24 4l2 8h-4l2-8zm0 36l-2-8h4l-2 8zm-20-20l8 2v-4l-8 2zm40 0l-8-2v4l8-2zm-6.3-13.7l-5.7 5.7 2.8 2.8 5.7-5.7-2.8-2.8zm-27.4 27.4l5.7-5.7-2.8-2.8-5.7 5.7 2.8 2.8zm0-27.4l2.8 2.8 5.7-5.7-2.8-2.8-5.7 5.7zm27.4 27.4l-2.8-2.8-5.7 5.7 2.8 2.8 5.7-5.7z"/></svg>
              <p className="font-display text-3xl text-ink-900 md:text-4xl">12+</p>
              <p className="mt-1 text-xs font-semibold text-ink-900">Years of Nurturing Young Minds Through Isha-Affiliated Value-Based Education</p>
            </div>
            <div className="relative overflow-hidden bg-purple-700 p-5 aspect-[1/0.7] flex flex-col justify-end">
              <svg className="absolute top-3 right-3 size-12 text-yellow-500 opacity-80" viewBox="0 0 48 48" fill="currentColor"><path d="M14 8h20v6l-10 10-10-10V8z"/></svg>
              <p className="font-display text-3xl text-white md:text-4xl">Daily</p>
              <p className="mt-1 text-xs font-semibold text-white/90">Yoga Sessions by Apollo Foundation Total Health Trainer</p>
            </div>
            <div className="relative overflow-hidden bg-emerald-500 p-5 aspect-[1/0.7] flex flex-col justify-end">
              <svg className="absolute top-3 right-3 size-12 text-purple-500 opacity-80" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="24" cy="20" r="12"/></svg>
              <p className="font-display text-3xl text-ink-900 md:text-4xl">CBSE</p>
              <p className="mt-1 text-xs font-semibold text-ink-900">Transitioning to CBSE, Strong Academic Foundation</p>
            </div>
            <div className="relative overflow-hidden bg-pink-400 p-5 aspect-[1/0.7] flex flex-col justify-end">
              <svg className="absolute top-3 right-3 size-12 text-teal-800 opacity-80" viewBox="0 0 48 48" fill="currentColor"><polygon points="24,4 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18"/></svg>
              <p className="font-display text-3xl text-ink-900 md:text-4xl">State</p>
              <p className="mt-1 text-xs font-semibold text-ink-900">Level Sports Achievers — Sporty, Brave, Disciplined</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-canvas-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Direction</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden bg-teal-800 p-8 min-h-[280px] flex flex-col justify-start">
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Our Vision</p>
              <h3 className="font-display mt-2 text-2xl uppercase text-white md:text-3xl">Vision</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-base">
                To inspire young minds to learn with purpose, live with compassion, and grow into responsible individuals who make a meaningful difference.
              </p>
            </div>
            <div className="relative overflow-hidden bg-yellow-500 p-8 min-h-[280px] flex flex-col justify-start">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-900">Our Mission</p>
              <h3 className="font-display mt-2 text-2xl uppercase text-ink-900 md:text-3xl">Mission</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-900/85 md:text-base">
                To create meaningful learning experiences that encourage every child to question, explore, create and collaborate, while nurturing empathy, integrity and a sense of responsibility.
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Principal Message */}
      <section className="bg-teal-900 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">From the Principal&apos;s Desk</p>
            <h2 className="mt-3 font-display text-2xl uppercase text-white md:text-3xl">Principal&apos;s Message</h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-white/80 md:text-base">
              <p>Every child who walks through our gates arrives with unique potential. Our responsibility is to help them discover it, nurture it, and give them the confidence to pursue their aspirations with integrity and purpose.</p>
              <p>At Apollo Vidhyalayam, learning extends far beyond textbooks. We strive to cultivate curiosity, critical thinking, resilience, and leadership while ensuring that every student feels supported, valued, and inspired to achieve their very best.</p>
              <p>I invite you to visit Apollo Vidhyalayam, interact with our students and faculty, and experience the vibrant learning environment that makes our school a place where every child is encouraged to grow, excel, and thrive.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
function TeachersTab() {
  const metrics = [
    {
      stat: "40",
      label: "Dedicated Staff",
      color: "bg-purple-700",
      description: "Committed to delivering quality education and holistic student development across all grades.",
    },
    {
      stat: "10",
      label: "Subject Specialists",
      color: "bg-emerald-500",
      description: "Expert instruction across Mathematics, English, Hindi, Sanskrit, Telugu, Social Studies, Physics, Chemistry, and Computer Science.",
    },
    {
      stat: "9",
      label: "Subjects Offered",
      color: "bg-pink-400",
      description: "Mathematics, English, Hindi, Sanskrit, Telugu, Social Studies, Physics, Chemistry, and Computer Science.",
    },
  ];

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Faculty</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
            At Apollo Vidyalayam, our greatest strength is our dedicated team of educators and support staff who are committed to nurturing every child&apos;s academic and personal growth. With a student-centric approach, our faculty creates an engaging and supportive learning environment where every learner is encouraged to reach their full potential.
          </p>

          {/* Colorful metric cards with hover reveal */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className={`${m.color} group relative overflow-hidden p-8 aspect-square flex flex-col justify-end cursor-pointer transition-all duration-500`}
              >
                {/* Decorative icon — moves up on hover */}
                <div className="absolute top-6 right-6 transition-transform duration-500 group-hover:-translate-y-4">
                  <svg className="size-14 text-white/30" viewBox="0 0 48 48" fill="currentColor">
                    <path d="M14 8h20v6l-10 14-10-14V8z" />
                  </svg>
                </div>

                {/* Content — slides up on hover to reveal description */}
                <div className="transition-transform duration-500 group-hover:-translate-y-6">
                  <p className="font-display text-5xl text-white md:text-6xl">{m.stat}<span className="text-3xl">+</span></p>
                  <p className="mt-2 text-base font-semibold text-white">{m.label}</p>
                </div>

                {/* Hidden description — revealed on hover */}
                <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">
                  <p className="text-sm leading-relaxed text-white/85">{m.description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
            Together, our experienced faculty fosters curiosity, critical thinking, confidence, and a lifelong love for learning, ensuring every student receives the guidance and support needed to succeed.
          </p>
        </div>
      </section>
    </>
  );
}
function InfrastructureTab() {
  const facilities = [
    { title: "Smart Classrooms", subtitle: "Technology-enabled learning", image: "/images/new/smartboard-class.jpg" },
    { title: "Library", subtitle: "Books & research resources", image: "/images/new/library-person.jpg" },
    { title: "Computer Lab", subtitle: "Digital literacy & applications", image: "/images/new/Computer-lab.jpg" },
    { title: "Sports Facilities", subtitle: "Athletics, football, cricket & more", image: "/images/new/playground-field.jpg" },
    { title: "Auditorium", subtitle: "Events & performances", image: "/images/new/auditorium.jpg" },
    { title: "Playground", subtitle: "Outdoor play & recreation", image: "/images/sports/sports-2.jpg" },
    { title: "Medical Room", subtitle: "First aid & health care", image: "/images/medical/health.png" },
    { title: "Transport", subtitle: "Safe & reliable travel", image: "/images/medical/test-tube.jpg" },
  ];

  const labs = [
    { title: "Physics Lab", subtitle: "Hands-on experiments", image: "/images/brighter-minds/project-1.png" },
    { title: "Chemistry Lab", subtitle: "Supervised practicals", image: "/images/medical/chemistry-lab.jpg" },
    { title: "Biology Lab", subtitle: "Specimens & models", image: "/images/about/microscope.jpg" },
    { title: "Mathematics Lab", subtitle: "Activity-based learning", image: "/images/classroom/homework.jpg" },
  ];

  const corridorSpaces = [
    { title: "Chess Corner", image: "/images/classroom/studying.jpg" },
    { title: "Carrom Corner", image: "/images/campus/kids-camera.jpg" },
    { title: "Library Corner", image: "/images/classroom/girls-class.jpg" },
    { title: "GK Corner", image: "/images/brighter-minds/project-2.png" },
    { title: "Mind Games", image: "/images/brighter-minds/project-3.png" },
  ];

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Infrastructure</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
            Learning at Apollo Vidyalayam extends far beyond the classroom. Our campus is thoughtfully designed with modern learning spaces, well-equipped facilities, and engaging environments.
          </p>

          <div className="mt-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {facilities.map((facility) => (
              <div key={facility.title} className="group relative aspect-[3/4] overflow-hidden">
                {facility.image ? (
                  <Image
                    src={facility.image}
                    alt={facility.title}
                    fill
                    quality={90}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-teal-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-base uppercase text-white md:text-lg">{facility.title}</h3>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-white/70">{facility.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Labs */}
      <section className="bg-canvas-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">Composite Science Lab</h3>
          <p className="mt-3 text-sm text-ink-600 md:text-base">
            Our well-equipped laboratories provide students with opportunities to apply classroom learning through practical experimentation and observation.
          </p>
          <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
            {labs.map((lab) => (
              <div key={lab.title} className="group relative aspect-[3/4] overflow-hidden">
                <Image
                  src={lab.image}
                  alt={lab.title}
                  fill
                  quality={90}
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h4 className="font-display text-base uppercase text-white md:text-lg">{lab.title}</h4>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-white/70">{lab.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corridor Learning */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">Corridor Learning &amp; Mind Games</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
            At Apollo Vidyalayam, learning continues beyond the classroom. Our corridors are transformed into interactive learning zones.
          </p>
          <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-5">
            {corridorSpaces.map((space) => (
              <div key={space.title} className="group relative aspect-[3/4] overflow-hidden">
                <Image
                  src={space.image}
                  alt={space.title}
                  fill
                  quality={90}
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h4 className="font-display text-sm uppercase text-white md:text-base">{space.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

