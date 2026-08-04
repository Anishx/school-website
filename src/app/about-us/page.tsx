"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import Link from "next/link";
import { Download } from "lucide-react";

const tabs = ["Overview", "Teachers", "Infrastructure", "Campus Tour"];

export default function AboutUsPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Know Our Story</p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">About Us</h1>
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
        {activeTab === 3 && <CampusTourTab />}
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
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden bg-yellow-500 p-6 aspect-square flex flex-col justify-end">
              <svg className="absolute top-4 right-4 size-16 text-purple-700 opacity-80" viewBox="0 0 48 48" fill="currentColor"><path d="M24 4l2 8h-4l2-8zm0 36l-2-8h4l-2 8zm-20-20l8 2v-4l-8 2zm40 0l-8-2v4l8-2zm-6.3-13.7l-5.7 5.7 2.8 2.8 5.7-5.7-2.8-2.8zm-27.4 27.4l5.7-5.7-2.8-2.8-5.7 5.7 2.8 2.8zm0-27.4l2.8 2.8 5.7-5.7-2.8-2.8-5.7 5.7zm27.4 27.4l-2.8-2.8-5.7 5.7 2.8 2.8 5.7-5.7z"/></svg>
              <p className="font-display text-4xl text-ink-900 md:text-5xl">12+</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">Years of Isha-Affiliated Value Education</p>
            </div>
            <div className="relative overflow-hidden bg-purple-700 p-6 aspect-square flex flex-col justify-end">
              <svg className="absolute top-4 right-4 size-16 text-yellow-500 opacity-80" viewBox="0 0 48 48" fill="currentColor"><path d="M14 8h20v6l-10 10-10-10V8z"/></svg>
              <p className="font-display text-4xl text-white md:text-5xl">Daily</p>
              <p className="mt-1 text-sm font-semibold text-white/90">Yoga Sessions by Apollo Foundation Total Health Trainer</p>
            </div>
            <div className="relative overflow-hidden bg-emerald-500 p-6 aspect-square flex flex-col justify-end">
              <svg className="absolute top-4 right-4 size-16 text-purple-500 opacity-80" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="24" cy="20" r="12"/></svg>
              <p className="font-display text-4xl text-ink-900 md:text-5xl">CBSE</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">Transitioning to CBSE, Strong Academic Foundation</p>
            </div>
            <div className="relative overflow-hidden bg-pink-400 p-6 aspect-square flex flex-col justify-end">
              <svg className="absolute top-4 right-4 size-16 text-teal-800 opacity-80" viewBox="0 0 48 48" fill="currentColor"><polygon points="24,4 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18"/></svg>
              <p className="font-display text-4xl text-ink-900 md:text-5xl">State</p>
              <p className="mt-1 text-sm font-semibold text-ink-900">Level Sports Achievers — Sporty, Brave, Disciplined</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-canvas-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Direction</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="relative overflow-hidden bg-teal-800 p-8 min-h-[280px] flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Our Vision</p>
                <h3 className="font-display mt-2 text-2xl uppercase text-white md:text-3xl">Vision</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-base">
                To nurture confident, compassionate, and future-ready learners through holistic education, empowering every child to realise their fullest potential and contribute meaningfully to society.
              </p>
            </div>
            <div className="relative overflow-hidden bg-yellow-500 p-8 min-h-[280px] flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-900">Our Mission</p>
                <h3 className="font-display mt-2 text-2xl uppercase text-ink-900 md:text-3xl">Mission</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-900/85 md:text-base">
                <li>• Deliver a balanced education that fosters academic excellence, critical thinking, and lifelong learning.</li>
                <li>• Cultivate character through discipline, integrity, empathy, and respect.</li>
                <li>• Promote physical, emotional, and intellectual well-being through sports, yoga, and co-curricular learning.</li>
                <li>• Inspire leadership, innovation, and social responsibility in every student.</li>
                <li>• Provide a safe, inclusive, and nurturing environment where every child can learn, grow, and thrive.</li>
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
            <h2 className="mt-3 font-display text-2xl uppercase text-white md:text-3xl">Vice-Principal / Principal&apos;s Message</h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-white/80 md:text-base">
              <p>Every child who walks through our gates arrives with unique potential. Our responsibility is to help them discover it, nurture it, and give them the confidence to pursue their aspirations with integrity and purpose.</p>
              <p>At Apollo Vidhyalayam, learning extends far beyond textbooks. We strive to cultivate curiosity, critical thinking, resilience, and leadership while ensuring that every student feels supported, valued, and inspired to achieve their very best.</p>
              <p>I invite you to visit Apollo Vidhyalayam, interact with our students and faculty, and experience the vibrant learning environment that makes our school a place where every child is encouraged to grow, excel, and thrive.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download Brochure */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Link
            href="#brochure"
            className="inline-flex items-center gap-2 rounded-full border-2 border-teal-800 px-6 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-800 hover:text-white"
          >
            <Download className="size-4" />
            Download School Brochure
          </Link>
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
    { title: "Smart Classrooms", description: "Our technology-enabled classrooms create an interactive learning environment where digital resources, visual aids, and engaging teaching methods make concepts easier to understand and more enjoyable to learn." },
    { title: "Library", description: "A well-stocked library nurtures a lifelong love for reading, research, and independent learning. Students have access to a wide range of books, reference materials, and age-appropriate resources that inspire curiosity and imagination." },
    { title: "Computer Lab", description: "Our computer lab introduces students to digital literacy, computer applications, and technology-enabled learning, equipping them with essential skills for an increasingly digital world." },
    { title: "Sports Facilities", description: "Apollo Vidyalayam offers dedicated spaces for athletics, football, cricket, throwball, softball, and other sporting activities, encouraging physical fitness, teamwork, discipline, and sportsmanship." },
    { title: "Auditorium", description: "The school auditorium serves as a vibrant venue for assemblies, cultural programmes, competitions, celebrations, and student performances, providing opportunities to build confidence and showcase talent." },
    { title: "Playground", description: "Our spacious playground provides students with ample opportunities for outdoor play, sports, recreation, and physical development in a safe and encouraging environment." },
    { title: "Medical Room", description: "Student health and well-being remain a priority. A dedicated medical room is available on campus to provide immediate first aid and basic medical care whenever required." },
    { title: "Transport", description: "Apollo Vidyalayam offers safe and reliable transportation services, ensuring comfortable and secure travel for students from surrounding communities." },
  ];

  const labs = [
    { title: "Physics Lab", description: "Hands-on experiments that bring scientific principles to life." },
    { title: "Chemistry Lab", description: "Safe, supervised practical sessions that encourage scientific inquiry." },
    { title: "Biology Lab", description: "Learning through real specimens, models, and interactive exploration." },
    { title: "Mathematics Lab", description: "Activity-based learning using models and teaching aids to make abstract concepts easy to understand." },
  ];

  const corridorSpaces = ["Chess Corner", "Carrom Corner", "Library Corner", "General Knowledge (GK) Corner", "Interactive Mind Games & Learning Activities"];

  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Infrastructure</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
            Learning at Apollo Vidyalayam extends far beyond the classroom. Our campus is thoughtfully designed with modern learning spaces, well-equipped facilities, and engaging environments that encourage students to explore, experiment, and grow through hands-on experiences.
          </p>

          {/* Main facilities grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility) => (
              <div key={facility.title} className="border border-line-200 p-6">
                <h3 className="text-base font-bold text-teal-800">{facility.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science Labs */}
      <section className="bg-canvas-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">Science Labs</h3>
          <p className="mt-3 text-sm text-ink-600 md:text-base">
            Our well-equipped laboratories provide students with opportunities to apply classroom learning through practical experimentation and observation. Across all laboratories, learning is interactive, experiential, and demonstration-driven, helping students develop critical thinking and scientific temper.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {labs.map((lab) => (
              <div key={lab.title} className="bg-white border border-line-200 p-5">
                <h4 className="text-sm font-bold text-teal-800">{lab.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-ink-600">{lab.description}</p>
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
            At Apollo Vidyalayam, learning continues beyond the classroom. Our corridors are transformed into interactive learning zones where students can think, play, and collaborate during their day. These thoughtfully designed spaces encourage problem-solving, strategic thinking, creativity, and social interaction—turning every walk between classes into an opportunity to learn something new.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {corridorSpaces.map((space) => (
              <span key={space} className="bg-teal-800 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                {space}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CampusTourTab() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Campus Tour</h2>
        <p className="mt-4 max-w-2xl mx-auto text-sm leading-relaxed text-ink-600 md:text-base">
          Experience our vibrant campus. Book a visit to explore our classrooms, sports facilities, yoga hall, library, and more.
        </p>
        <div className="mt-10 aspect-video w-full max-w-4xl mx-auto bg-canvas-100 border border-line-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-ink-400">Campus Tour Video</p>
            <p className="mt-2 text-sm text-ink-500">Coming soon</p>
          </div>
        </div>
        <div className="mt-8">
          <a href="#campus-visit" className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500 px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-yellow-400">
            Book a Campus Visit
          </a>
        </div>
      </div>
    </section>
  );
}
