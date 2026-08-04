import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { DigitalLearningCarousel } from "@/components/digital-learning-carousel";
import Image from "next/image";
import {
  GraduationCap,
  Shield,
  Users,
  Trophy,
  Monitor,
  Heart,
  Dumbbell,
  Flag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type WhyUsItem = {
  title: string;
  icon: LucideIcon;
  description: string;
  bullets?: string[];
};

const reasons: WhyUsItem[] = [
  {
    title: "Holistic Development",
    icon: Heart,
    description:
      "At Apollo Vidhyalayam, education extends beyond academics. We nurture the intellectual, physical, emotional, and social development of every child through a balanced learning environment that encourages curiosity, creativity, confidence, and compassion. Our students are empowered to become well-rounded individuals who are prepared for both higher education and life.",
  },
  {
    title: "Academic Excellence",
    icon: GraduationCap,
    description:
      "Apollo Vidhyalayam is committed to providing a strong academic foundation through engaging classroom experiences, structured learning methodologies, and continuous assessment. As the school transitions to the CBSE curriculum, students benefit from a future-ready education that develops conceptual understanding, analytical thinking, and problem-solving skills while maintaining high academic standards.",
  },
  {
    title: "Leadership Opportunities",
    icon: Flag,
    description:
      "We believe every child has the potential to lead. At Apollo Vidhyalayam, students are encouraged to take initiative, work collaboratively, and develop decision-making skills through student councils, classroom responsibilities, cultural programmes, sports, and community activities. These experiences help build confidence, accountability, and resilience from an early age.",
  },
  {
    title: "Safe Campus",
    icon: Shield,
    description:
      "A child\u2019s well-being is our highest priority. Apollo Vidhyalayam provides a secure, inclusive, and nurturing campus where students feel safe, respected, and encouraged to learn. Our supportive environment enables every child to grow with confidence while fostering positive relationships between students, teachers, and parents.",
  },
  {
    title: "Experienced Faculty",
    icon: Users,
    description:
      "The strength of Apollo Vidhyalayam lies in its dedicated team of educators who are committed to bringing out the best in every learner. Our teachers combine subject expertise with individual attention, creating engaging classrooms where students are encouraged to ask questions, think independently, and achieve their full potential.",
  },
  {
    title: "Sports & Co-curricular Activities",
    icon: Dumbbell,
    description:
      "Learning is enriched through participation beyond the classroom. Apollo Vidhyalayam offers students opportunities to excel in sports, cultural activities, arts, and clubs that promote teamwork, discipline, creativity, and perseverance. These experiences help students discover their interests while building confidence and essential life skills.",
  },
];

export default function WhyUsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Why Apollo Vidhyalayam?
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              At Apollo Vidhyalayam, we believe every child deserves an education that inspires curiosity, builds confidence, and prepares them for a successful future. Our holistic approach combines academic excellence, character development, leadership opportunities, and a nurturing learning environment, ensuring students grow into responsible, compassionate, and future-ready individuals.
            </p>
          </div>
        </section>

        {/* Learning Philosophy — colorful cards */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Learning Philosophy</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* Learning */}
              <div className="relative overflow-hidden bg-yellow-500 p-8 min-h-[280px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-purple-700 opacity-40" viewBox="0 0 48 48" fill="currentColor"><path d="M24 4l2 8h-4l2-8zm0 36l-2-8h4l-2 8zm-20-20l8 2v-4l-8 2zm40 0l-8-2v4l8-2zm-6.3-13.7l-5.7 5.7 2.8 2.8 5.7-5.7-2.8-2.8zm-27.4 27.4l5.7-5.7-2.8-2.8-5.7 5.7 2.8 2.8zm0-27.4l2.8 2.8 5.7-5.7-2.8-2.8-5.7 5.7zm27.4 27.4l-2.8-2.8-5.7 5.7 2.8 2.8 5.7-5.7z"/></svg>
                <p className="font-display text-3xl uppercase text-ink-900 md:text-4xl">Learning</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/85">
                  We foster a culture of curiosity, inquiry, and academic excellence, encouraging students to think critically, explore confidently, and develop a lifelong love for learning.
                </p>
              </div>

              {/* Leading */}
              <div className="relative overflow-hidden bg-teal-800 p-8 min-h-[280px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-yellow-400 opacity-40" viewBox="0 0 48 48" fill="currentColor"><path d="M14 8h20v6l-10 14-10-14V8z"/></svg>
                <p className="font-display text-3xl uppercase text-white md:text-4xl">Leading</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Leadership begins with character. Through responsibility, collaboration, discipline, and service, we empower students to lead with confidence, empathy, and integrity in every aspect of life.
                </p>
              </div>

              {/* Excelling */}
              <div className="relative overflow-hidden bg-purple-700 p-8 min-h-[280px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-emerald-400 opacity-40" viewBox="0 0 48 48" fill="currentColor"><polygon points="24,2 30,18 48,18 34,28 38,44 24,34 10,44 14,28 0,18 18,18"/></svg>
                <p className="font-display text-3xl uppercase text-white md:text-4xl">Excelling</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Excellence is not just about achieving high grades—it&apos;s about striving to become the best version of oneself. We encourage every student to pursue excellence in academics, sports, the arts, and personal growth, celebrating effort, resilience, and continuous improvement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Alternating image + text sections */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6 space-y-20">
            <div className="flex flex-col gap-10 md:flex-row md:items-center">
              <div className="md:w-1/2">
                <h3 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Holistic Learning Experience</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600 md:text-base">Education at Apollo Vidhyalayam goes beyond textbooks. We focus on developing every aspect of a child&apos;s growth through a balanced learning environment that encourages intellectual curiosity, creativity, emotional well-being, and social responsibility.</p>
                <p className="mt-4 text-sm font-semibold text-ink-800">Students benefit from:</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />A balanced approach to academic, physical, emotional, and social development</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Individual attention that nurtures every learner&apos;s unique strengths</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Values-based education that builds confidence, empathy, and resilience</li>
                </ul>
              </div>
              <div className="relative aspect-[4/3] md:w-1/2">
                <Image src="/images/yoga/group-yoga.jpg" alt="Holistic Learning" fill className="object-cover" sizes="50vw" />
              </div>
            </div>

            <div className="flex flex-col gap-10 md:flex-row-reverse md:items-center">
              <div className="md:w-1/2">
                <h3 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Academic Excellence &amp; Future-Ready Learning</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600 md:text-base">Our evolving CBSE curriculum combines strong academic foundations with innovative teaching methodologies to help students become independent thinkers and lifelong learners.</p>
                <p className="mt-4 text-sm font-semibold text-ink-800">Our academic approach includes:</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Concept-based learning aligned with the CBSE curriculum</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Interactive classrooms and technology-enabled teaching</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Continuous assessment to strengthen understanding and critical thinking</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Digital learning tools that prepare students for an evolving world</li>
                </ul>
              </div>
              <div className="relative aspect-[4/3] md:w-1/2">
                <Image src="/images/computer/computer-class.jpg" alt="Academic Excellence" fill className="object-cover" sizes="50vw" />
              </div>
            </div>

            <div className="flex flex-col gap-10 md:flex-row md:items-center">
              <div className="md:w-1/2">
                <h3 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Leadership, Sports &amp; Co-Curricular Excellence</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600 md:text-base">We believe learning happens everywhere. Through leadership opportunities, sports, arts, and cultural activities, students develop confidence, teamwork, creativity, and essential life skills.</p>
                <p className="mt-4 text-sm font-semibold text-ink-800">Students have opportunities to:</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Take on leadership roles through student councils and classroom responsibilities</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Participate in sports, arts, cultural programmes, and clubs</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Develop teamwork, communication, discipline, and problem-solving skills</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Discover passions beyond academics</li>
                </ul>
              </div>
              <div className="relative aspect-[4/3] md:w-1/2">
                <Image src="/images/sports/sports-1.jpg" alt="Leadership and Sports" fill className="object-cover" sizes="50vw" />
              </div>
            </div>

            <div className="flex flex-col gap-10 md:flex-row-reverse md:items-center">
              <div className="md:w-1/2">
                <h3 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">A Safe Campus with Dedicated Educators</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600 md:text-base">A supportive environment is essential for meaningful learning. Apollo Vidhyalayam provides a secure campus where experienced educators inspire students to achieve their full potential while fostering strong partnerships with families.</p>
                <p className="mt-4 text-sm font-semibold text-ink-800">Families can expect:</p>
                <ul className="mt-3 space-y-2 text-sm text-ink-600">
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />A safe, inclusive, and nurturing learning environment</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Experienced and passionate teachers committed to student success</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Personalized guidance that encourages confidence and independent thinking</li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-800" />Strong collaboration between students, teachers, and parents</li>
                </ul>
              </div>
              <div className="relative aspect-[4/3] md:w-1/2">
                <Image src="/images/campus/entrance.jpg" alt="Safe Campus" fill className="object-cover" sizes="50vw" />
              </div>
            </div>
          </div>
        </section>

        {/* Reasons grid */}
        {/* <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="border border-line-200 p-6">
                    <div className="flex h-12 w-12 items-center justify-center bg-teal-800 text-white">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-4 font-display text-lg uppercase text-ink-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section> */}

        {/* Digital Learning — ISB-style carousel with overlapping card */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <DigitalLearningCarousel />
          </div>
        </section>

        {/* Value-based Education */}
        {/* <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex h-12 w-12 items-center justify-center bg-yellow-500 text-ink-900">
              <Trophy className="size-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl uppercase text-ink-900 md:text-3xl">Value-based Education</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
              At Apollo Vidyalayam, we believe that academics alone do not build a complete individual. Character lies at the heart of our educational philosophy, and every student is nurtured to grow into a responsible, compassionate, and ethical citizen. Guided by the values of integrity, discipline, respect, empathy, and social responsibility, we integrate value-based learning into everyday school life. Alongside academic excellence, students are equipped with essential life competencies that prepare them to navigate the challenges of an ever-evolving world with confidence and wisdom.
            </p>

            <h3 className="mt-10 text-base font-bold text-ink-900">Our value-based learning includes:</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="border-l-4 border-teal-800 bg-canvas-50 p-5">
                <h4 className="font-display text-sm uppercase text-ink-900">Life Skills</h4>
                <p className="mt-2 text-sm text-ink-600">
                  Building confidence, communication, decision-making, emotional resilience, and problem-solving abilities.
                </p>
              </div>
              <div className="border-l-4 border-purple-700 bg-canvas-50 p-5">
                <h4 className="font-display text-sm uppercase text-ink-900">Media Literacy</h4>
                <p className="mt-2 text-sm text-ink-600">
                  Helping students become responsible digital citizens by developing critical thinking, ethical online behaviour, and the ability to evaluate information.
                </p>
              </div>
              <div className="border-l-4 border-yellow-600 bg-canvas-50 p-5">
                <h4 className="font-display text-sm uppercase text-ink-900">Financial Literacy</h4>
                <p className="mt-2 text-sm text-ink-600">
                  Introducing students to the fundamentals of money management, saving, budgeting, and responsible financial decision-making.
                </p>
              </div>
            </div>

            <p className="mt-8 max-w-3xl text-sm leading-relaxed text-ink-600 md:text-base">
              By combining strong values with practical life skills, Apollo Vidyalayam empowers students to succeed not only in academics, but also as thoughtful leaders and responsible contributors to society.
            </p>
          </div>
        </section> */}

      </main>
    </>
  );
}
