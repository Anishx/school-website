'use client';

import { useState } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";

type TabContent = {
  label: string;
  intro?: string;
  philosophy?: string;
  coaching?: string;
  achievements?: string;
  sports?: string[];
  houses?: { name: string; color: string; value: string }[];
  houseDescription?: string;
  leadershipDescription?: string;
  items: { title: string; description: string; image?: string }[];
};

const tabs: TabContent[] = [
  {
    label: "Sports",
    intro: "At Apollo Vidyalayam, sports are an integral part of education—not merely an extracurricular activity. We believe that physical activity builds confidence, resilience, teamwork, discipline, and the mental strength needed to overcome challenges both on and off the field. Guided by the philosophy of developing willpower and inner strength, our sports programme is led by dedicated and trained teachers who inspire every child to strive for excellence.",
    philosophy: "We believe every child has the potential to grow stronger—physically, mentally, and emotionally. Through regular training and active participation, students develop resilience, determination, leadership, and the confidence to face challenges with courage.",
    coaching: "All sporting activities are conducted under the guidance of our trained teachers, who focus on skill development, teamwork, discipline, and sportsmanship.",
    achievements: "Apollo Vidyalayam has consistently excelled in competitive sports, with students emerging as State-Level Throwball Champions and regularly representing the school with distinction in Government-conducted sports tournaments, earning numerous accolades across disciplines.",
    sports: ["Athletics", "Football", "Throwball", "Softball", "Cricket"],
    items: [
      { title: "Athletics", description: "100m race champions, shot put and disc throw winners at mandal level.", image: "/images/sports/sports-1.jpg" },
      { title: "Football", description: "Building teamwork, agility, and strategic thinking on the field.", image: "/images/sports/sports-2.jpg" },
      { title: "Throwball", description: "State-level champions showcasing coordination and competitive spirit.", image: "/images/sports/sports-3.jpg" },
      { title: "Softball", description: "Developing hand-eye coordination, reflexes, and sportsmanship.", image: "/images/sports/sports-4.jpg" },
      { title: "Cricket", description: "India's beloved sport fostering patience, strategy, and team dynamics.", image: "/images/sports/badminton.jpg" },
    ],
  },
  {
    label: "Clubs & Activities",
    intro: "At Apollo Vidyalayam, learning extends beyond the classroom. Our clubs and enrichment programmes encourage students to explore their interests, discover new talents, and develop confidence, creativity, discipline, and teamwork in a fun and engaging environment.",
    items: [
      { title: "Art & Craft", description: "Students express their creativity through drawing, painting, craftwork, and hands-on projects that enhance imagination, fine motor skills, and artistic expression.", image: "/images/cultural/cultural-1.jpg" },
      { title: "Karadi Path", description: "Our Karadi Path programme builds strong English language and communication skills through storytelling, songs, role-play, and interactive activities, making language learning enjoyable and effective.", image: "/images/classroom/reading.jpg" },
      { title: "Karate", description: "Karate helps students develop self-discipline, focus, physical fitness, confidence, and self-defence skills while instilling respect, perseverance, and mental resilience.", image: "/images/sports/sports-3.jpg" },
      { title: "Western Dance", description: "Students explore rhythm, movement, and performance through Western dance, building coordination, creativity, teamwork, and stage confidence.", image: "/images/cultural/cultural-2.jpg" },
      { title: "Bharatanatyam", description: "Through the classical art of Bharatanatyam, students learn grace, discipline, cultural appreciation, and artistic expression while strengthening concentration and confidence.", image: "/images/cultural/cultural-3.jpg" },
    ],
  },
  {
    label: "STEM Activities",
    intro: "At Apollo Vidyalayam, STEM (Science, Technology, Engineering, and Mathematics) education goes far beyond the classroom. We encourage students to question, explore, experiment, and innovate through hands-on learning experiences that connect academic concepts with real-world applications.\n\nA unique advantage for our students is the opportunity to participate in annual educational visits to Apollo Medical College, where they gain first-hand exposure to advanced medical technologies, laboratories, healthcare professionals, and scientific research. These immersive experiences inspire curiosity, broaden career aspirations, and provide rural students with opportunities rarely available at the school level.\n\nOur commitment to experiential learning has also earned national recognition. Apollo Vidyalayam emerged winners at the International Space Day Competition, competing against nearly 50 schools. The winning student project, \"Emergency Oxygen Producer for Astronauts,\" demonstrated creativity, scientific thinking, and practical problem-solving—showcasing the innovative spirit nurtured within our classrooms.",
    items: [
      { title: "Experiential STEM Learning", description: "Hands-on projects, experiments, and inquiry-based learning that foster innovation and critical thinking.", image: "/images/brighter-minds/project-1.png" },
      { title: "Annual Educational Visits", description: "Exposure to advanced healthcare and scientific environments through visits to Apollo Medical College.", image: "/images/educational-tour/tour-1.png" },
      { title: "National Recognition", description: "Winners of the International Space Day Competition among nearly 50 participating schools.", image: "/images/brighter-minds/project-2.png" },
      { title: "Student Innovation", description: "Award-winning project — \"Emergency Oxygen Producer for Astronauts\" demonstrating creativity and scientific problem-solving.", image: "/images/brighter-minds/project-3.png" },
    ],
  },
  {
    label: "Leadership Programmes",
    intro: "At Apollo Vidyalayam, leadership is cultivated through meaningful opportunities that encourage students to take initiative, inspire others, and contribute positively to the school community. Through our structured House System and student-led councils, every learner is encouraged to develop confidence, responsibility, teamwork, and a spirit of service.",
    houses: [
      { name: "Chetana", color: "bg-orange-500", value: "Awareness & Understanding" },
      { name: "Nirvana", color: "bg-emerald-500", value: "Peace & Happiness" },
      { name: "Prarthana", color: "bg-blue-600", value: "Prayer & Surrender" },
      { name: "Sadhana", color: "bg-red-600", value: "Discipline & Accomplishment" },
    ],
    houseDescription: "Throughout the academic year, the four houses participate in a variety of inter-house competitions, cultural programmes, sports events, and community initiatives, fostering healthy competition, collaboration, leadership, and school spirit.",
    leadershipDescription: "Leadership at Apollo Vidyalayam begins with responsibility. Each house is represented by a House Captain and Vice Captain, elected by their peers to lead their teams and uphold the values of their house. The student body is further represented by the School Captain and School Vice Captain, who serve as role models and work closely with teachers in promoting discipline, participation, and student engagement.\n\nStudents also take active roles in a range of leadership platforms, including the Student Council, POCSO Awareness Committee, POSH Awareness Committee, and the School Management Committee (SMC). Through these initiatives, students gain first-hand experience in teamwork, communication, decision-making, and civic responsibility while contributing to a safe, inclusive, and supportive school environment.",
    items: [
      { title: "House System", description: "Four houses — Chetana, Nirvana, Prarthana, Sadhana — each representing a core value.", image: "/images/campus/student-day.jpg" },
      { title: "Student Council", description: "School Captain, Vice Captain, and house leaders elected by peers.", image: "/images/campus/kids-camera.jpg" },
      { title: "POCSO Awareness Committee", description: "Student-led safety awareness and peer support.", image: "/images/classroom/teacher.jpg" },
      { title: "POSH Awareness Committee", description: "Promoting respectful and inclusive behaviour across campus.", image: "/images/classroom/girls-class.jpg" },
      { title: "School Management Committee", description: "Students contributing to school governance and decision-making.", image: "/images/campus/walking.jpg" },
      { title: "Inter-House Competitions", description: "Cultural, sports, and academic events fostering healthy competition and school spirit.", image: "/images/sports/sports-1.jpg" },
    ],
  },
  {
    label: "Achievements",
    intro: "Apollo Vidyalayam students consistently demonstrate outstanding performance across academics, sports, and innovation. Our holistic approach has produced state-level champions, national competition winners, and academic toppers year after year.",
    items: [
      { title: "INSPIRE MANAK Award", description: "Recipients year after year, recognising excellence in scientific innovation and creative thinking.", image: "/images/brighter-minds/project-4.png" },
      { title: "Mandal-Level Grade 10 Toppers", description: "Toppers for seven consecutive years, reflecting sustained academic excellence.", image: "/images/classroom/studying.jpg" },
      { title: "State-Level Throwball Champions", description: "Our students emerged as State-Level Champions in Throwball.", image: "/images/sports/sports-2.jpg" },
      { title: "Government Sports Tournaments", description: "Consistent winners and achievers in Government-conducted Mandal and District-level sports tournaments across multiple disciplines.", image: "/images/sports/sports-4.jpg" },
      { title: "International Space Day Competition", description: "Winners competing against nearly 50 schools with the innovative project \"Emergency Oxygen Producer for Astronauts.\"", image: "/images/brighter-minds/project-1.png" },
      { title: "Best School at Mandal Level", description: "Recognised for outstanding performance across sporting disciplines and holistic student development.", image: "/images/campus/entrance.jpg" },
    ],
  },
];

export default function StudentLifePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero with image background + tabs */}
        <section className="relative">
          {/* Background image */}
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/hero-image.jpg"
              alt="Student Life at Apollo Vidhyalayam"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

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
          <div className="bg-teal-900">
            <div className="mx-auto max-w-7xl px-6">
              <div className="flex items-center justify-center gap-2 py-4 md:gap-6">
                {tabs.map((tab, idx) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition md:text-sm ${
                      activeTab === idx
                        ? "rounded-full bg-yellow-500 text-ink-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tab content */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">
              {tabs[activeTab].label}
            </h2>

            {/* Sports intro content */}
            {tabs[activeTab].intro && (
              <div className="mt-6 max-w-3xl space-y-5 text-sm leading-relaxed text-ink-600 md:text-base">
                <p>{tabs[activeTab].intro}</p>

                {tabs[activeTab].sports && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Sports Offered</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tabs[activeTab].sports!.map((sport) => (
                        <span key={sport} className="bg-teal-800 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tabs[activeTab].coaching && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Expert Coaching</h3>
                    <p className="mt-1">{tabs[activeTab].coaching}</p>
                  </div>
                )}

                {tabs[activeTab].philosophy && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Our Philosophy</h3>
                    <p className="mt-1">{tabs[activeTab].philosophy}</p>
                  </div>
                )}

                {tabs[activeTab].achievements && (
                  <div>
                    <h3 className="text-base font-bold text-ink-900">Achievements</h3>
                    <p className="mt-1">{tabs[activeTab].achievements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sports offered grid / cards */}
            <div className="mt-10">
              {tabs[activeTab].sports && (
                <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">
                  {tabs[activeTab].sports!.length} Sports Disciplines
                </h3>
              )}
            </div>

            {/* Houses (Leadership tab) */}
            {tabs[activeTab].houses && (
              <div className="mt-8">
                <h3 className="text-base font-bold text-ink-900">Our House System</h3>
                <p className="mt-2 text-sm text-ink-600">Every student is assigned to one of four houses, each representing a core value:</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {tabs[activeTab].houses!.map((house) => (
                    <div key={house.name} className={`${house.color} p-5 text-white`}>
                      <p className="font-display text-lg uppercase">{house.name}</p>
                      <p className="mt-1 text-sm italic text-white/85">{house.value}</p>
                    </div>
                  ))}
                </div>
                {tabs[activeTab].houseDescription && (
                  <p className="mt-4 text-sm leading-relaxed text-ink-600">{tabs[activeTab].houseDescription}</p>
                )}
                {tabs[activeTab].leadershipDescription && (
                  <div className="mt-6">
                    <h3 className="text-base font-bold text-ink-900">Student Leadership</h3>
                    {tabs[activeTab].leadershipDescription!.split("\n\n").map((para, i) => (
                      <p key={i} className="mt-2 text-sm leading-relaxed text-ink-600">{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tabs[activeTab].items.map((item) => (
                <div key={item.title} className="group relative overflow-hidden">
                  <div className="relative aspect-[4/3] w-full bg-canvas-100">
                    <Image
                      src={item.image || "/hero-image.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-display text-lg uppercase text-white">{item.title}</h4>
                  </div>
                  <div className="border border-line-200 border-t-0 p-4">
                    <p className="text-sm leading-relaxed text-ink-600">{item.description}</p>
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
