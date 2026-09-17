import type { ClubsDTO, SportsDTO, ContentSource } from "./dto";
import { contentForSource } from "./content-source";

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
  flagship?: { name: string; tagline: string; description: string; image: string };
  items: { title: string; description: string; image?: string; objectPosition?: string }[];
};

const legacyTabs: TabContent[] = [
  {
    label: "Sports",
    intro: "At Apollo Vidyalayam, sports are an integral part of education—not merely an extracurricular activity. We believe that physical activity builds confidence, resilience, teamwork, discipline, and the mental strength needed to overcome challenges both on and off the field. Guided by the philosophy of developing willpower and inner strength, our sports programme is led by dedicated and trained teachers who inspire every child to strive for excellence.",
    philosophy: "We believe every child has the potential to grow stronger—physically, mentally, and emotionally. Through regular training and active participation, students develop resilience, determination, leadership, and the confidence to face challenges with courage.",
    coaching: "All sporting activities are conducted under the guidance of our trained teachers, who focus on skill development, teamwork, discipline, and sportsmanship.",
    achievements: "Apollo Vidyalayam has consistently excelled in competitive sports, with students emerging as State-Level Volleyball Champions and regularly representing the school with distinction in Government-conducted sports tournaments, earning numerous accolades across disciplines.",
    sports: ["Athletics", "Football", "Volleyball", "Tennikoit", "Cricket"],
    items: [
      { title: "Athletics", description: "100m race champions, shot put and disc throw winners at mandal level.", image: "/images/new/shotput.jpg" },
      { title: "Football", description: "Building teamwork, agility, and strategic thinking on the field.", image: "/images/new/football-close.JPG" },
      { title: "Volleyball", description: "State-level champions showcasing coordination and competitive spirit.", image: "/images/new/volleyball.jpg" },
      { title: "Cricket", description: "India's beloved sport fostering patience, strategy, and team dynamics.", image: "/images/new/Cricket.png" },
      { title: "Kho-Kho", description: "Building speed, agility, quick reflexes, and strategic teamwork through fast-paced play.", image: "/images/new/koko-playground.jpg" },
      { title: "Badminton", description: "Enhancing agility, hand-eye coordination, focus, and competitive spirit on the court.", image: "/images/new/badminton.jpg" },
      { title: "Tennikoit", description: "Developing hand-eye coordination, reflexes, and sportsmanship.", image: "/images/new/Tennikoit.png", objectPosition: "top" },
    ],
  },
  {
    label: "Clubs & Activities",
    intro: "At Apollo Vidyalayam, learning extends beyond the classroom. Our clubs and enrichment programmes encourage students to explore their interests, discover new talents, and develop confidence, creativity, discipline, and teamwork in a fun and engaging environment.",
    flagship: {
      name: "Karadi Path",
      tagline: "Our Flagship Language Programme",
      description: "Karadi Path is Apollo Vidyalayam's flagship English language programme, building strong communication skills through storytelling, songs, role-play, and interactive activities. Rooted in the natural way children acquire language, it makes learning joyful and effective—nurturing confident, expressive, and fluent young communicators.",
      image: "/images/classroom/groupStudy.jpg",
    },
    items: [
      { title: "Art & Craft", description: "Students express their creativity through drawing, painting, craftwork, and hands-on projects that enhance imagination, fine motor skills, and artistic expression.", image: "/images/cultural/cultural-5.jpg" },
      { title: "Karate", description: "Karate helps students develop self-discipline, focus, physical fitness, confidence, and self-defence skills while instilling respect, perseverance, and mental resilience.", image: "/images/sports/sports-3.jpg" },
      { title: "Western Dance", description: "Students explore rhythm, movement, and performance through Western dance, building coordination, creativity, teamwork, and stage confidence.", image: "/images/cultural/cultural-4.jpg" },
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
      { title: "School Management Committee", description: "Students contributing to school governance and decision-making.", image: "/images/campus/SMC.jpeg" },
      { title: "Inter-House Competitions", description: "Cultural, sports, and academic events fostering healthy competition and school spirit.", image: "/images/sports/sports-1.jpg" },
    ],
  },
  {
    label: "Achievements",
    intro: "Apollo Vidyalayam students consistently demonstrate outstanding performance across academics, sports, and innovation. Our holistic approach has produced state-level champions, national competition winners, and academic toppers year after year.",
    items: [
      { title: "INSPIRE MANAK Award", description: "Recipients year after year, recognising excellence in scientific innovation and creative thinking.", image: "/images/brighter-minds/project-4.png" },
      { title: "Mandal-Level Grade 10 Toppers", description: "Toppers for seven consecutive years, reflecting sustained academic excellence.", image: "/images/classroom/studying.jpg" },
      { title: "State-Level Volleyball Champions", description: "Our students emerged as State-Level Champions in Volleyball.", image: "/images/sports/sports-2.jpg" },
      { title: "Government Sports Tournaments", description: "Consistent winners and achievers in Government-conducted Mandal and District-level sports tournaments across multiple disciplines.", image: "/images/sports/sports-4.jpg" },
      { title: "International Space Day Competition", description: "Winners competing against nearly 50 schools with the innovative project \"Emergency Oxygen Producer for Astronauts.\"", image: "/images/brighter-minds/project-1.png" },
      { title: "Best School at Mandal Level", description: "Recognised for outstanding performance across sporting disciplines and holistic student development.", image: "/images/campus/entrance.jpg" },
    ],
  },
];

export function studentLifeContent(sports: SportsDTO | null, clubs: ClubsDTO | null, sportsSource: ContentSource, clubsSource: ContentSource): TabContent[] {
    const next = [...legacyTabs];
    if (sportsSource !== "legacy" && sports) {
      const managedSports: TabContent = {
      label: sports.heading, intro: sports.introduction, philosophy: sports.philosophy,
      coaching: sports.coaching, achievements: sports.achievements, sports: [...sports.disciplines],
      items: sports.cards.map((card) => ({ title: card.title, description: card.description, image: card.image?.src, objectPosition: card.image?.objectPosition })),
      };
      next[0] = sportsSource === "append" ? {
        ...next[0],
        sports: [...new Set([...(next[0].sports ?? []), ...(managedSports.sports ?? [])])],
        items: contentForSource('append', next[0].items, managedSports.items, (item) => item.title),
      } : managedSports;
    } else if (sportsSource === "managed") next[0] = { label: "Sports", intro: "", items: [] };
    if (clubsSource !== "legacy" && clubs) {
      const managedClubs: TabContent = {
      label: clubs.heading, intro: clubs.introduction,
      flagship: clubs.flagship ? { name: clubs.flagship.name, tagline: clubs.flagship.tagline ?? "", description: clubs.flagship.description, image: clubs.flagship.image?.src ?? "/images/classroom/groupStudy.jpg" } : undefined,
      items: clubs.cards.map((card) => ({ title: card.title, description: card.description, image: card.image?.src, objectPosition: card.image?.objectPosition })),
      };
      next[1] = clubsSource === "append" ? {
        ...next[1],
        items: contentForSource('append', next[1].items, managedClubs.items, (item) => item.title),
      } : managedClubs;
    } else if (clubsSource === "managed") next[1] = { label: "Clubs & Activities", intro: "", items: [] };
    return next;
}
