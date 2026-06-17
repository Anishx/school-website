import {
  BookOpen,
  Users,
  Trophy,
  Microscope,
  Star,
  MapPin,
  Phone,
  GraduationCap,
  Lightbulb,
  Globe,
  HeartHandshake,
  Calendar,
  HelpCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
};

export type NavItem = {
  title: string;
  href?: string;
  featured?: NavLink[];   // large top cards (2 columns)
  compact?: NavLink[];    // small bottom cards (3 columns)
  sidebar?: NavLink[];    // right column list
};

export const navItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About Us",
    featured: [
      {
        title: "Our School",
        href: "#",
        description: "25+ years of quality education in rural communities",
        icon: GraduationCap,
        image: "https://picsum.photos/seed/school-building/400/180",
      },
      {
        title: "Vision & Mission",
        href: "#",
        description: "Building confident, capable children for the future",
        icon: Star,
        image: "https://picsum.photos/seed/kids-learning/400/180",
      },
    ],
    compact: [
      { title: "Leadership", href: "#", description: "Principal & management team", icon: Users },
      { title: "School History", href: "#", description: "Our journey since 1999", icon: BookOpen },
      { title: "Virtual Tour", href: "#", description: "Explore campus online", icon: Globe },
    ],
    sidebar: [
      { title: "Facilities", href: "#", description: "Smart classrooms, labs & library", icon: Microscope },
      { title: "School Calendar", href: "#", description: "Events & academic schedule", icon: Calendar },
      { title: "Latest Notices", href: "#", description: "Updates for parents", icon: FileText },
    ],
  },
  {
    title: "Academics",
    featured: [
      {
        title: "School Curriculum",
        href: "#",
        description: "CBSE-aligned learning from Pre-Primary to Grade 10",
        icon: BookOpen,
        image: "https://picsum.photos/seed/classroom-study/400/180",
      },
      {
        title: "Special Programs",
        href: "#",
        description: "Brighter Minds, Spoken English & Medical Pathways",
        icon: Lightbulb,
        image: "https://picsum.photos/seed/kids-experiment/400/180",
      },
    ],
    compact: [
      { title: "Pre-Primary", href: "#", description: "Foundation years", icon: Star },
      { title: "Grade 1 to 5", href: "#", description: "Primary school", icon: BookOpen },
      { title: "Grade 6 to 10", href: "#", description: "Secondary school", icon: GraduationCap },
    ],
    sidebar: [
      { title: "Brighter Minds", href: "#", description: "Brain development program", icon: Lightbulb },
      { title: "Spoken English", href: "#", description: "Fluency & confidence building", icon: Globe },
      { title: "Medical Pathways", href: "#", description: "Science track preparation", icon: Microscope },
    ],
  },
  {
    title: "Activities",
    featured: [
      {
        title: "Sports & Athletics",
        href: "#",
        description: "Cricket, athletics and mandal-level competitions",
        icon: Trophy,
        image: "https://picsum.photos/seed/kids-cricket/400/180",
      },
      {
        title: "Clubs & Arts",
        href: "#",
        description: "Storytelling, student elections, dance and music",
        icon: Star,
        image: "https://picsum.photos/seed/kids-dance/400/180",
      },
    ],
    compact: [
      { title: "Clubs", href: "#", description: "Student-led activities", icon: Users },
      { title: "Exposure Visits", href: "#", description: "Real-world learning trips", icon: MapPin },
      { title: "Competitions", href: "#", description: "Mandal & state-level events", icon: Trophy },
    ],
    sidebar: [
      { title: "Student Monitor", href: "#", description: "Leadership opportunities", icon: Star },
      { title: "Enrichment Classes", href: "#", description: "Beyond the classroom", icon: Lightbulb },
      { title: "Annual Day", href: "#", description: "Celebrations & performances", icon: Calendar },
    ],
  },
  {
    title: "Achievements",
    featured: [
      {
        title: "Academic Results",
        href: "#",
        description: "98% board pass rate with top mandal rankings",
        icon: GraduationCap,
        image: "https://picsum.photos/seed/kids-graduation/400/180",
      },
      {
        title: "Sports Awards",
        href: "#",
        description: "State-level winners in cricket and athletics",
        icon: Trophy,
        image: "https://picsum.photos/seed/trophy-kids/400/180",
      },
    ],
    compact: [
      { title: "Board Results", href: "#", description: "Year-wise performance", icon: BookOpen },
      { title: "Mandal Rankings", href: "#", description: "District top performers", icon: Star },
      { title: "Alumni Stories", href: "#", description: "Where our students go", icon: Users },
    ],
    sidebar: [],
  },
  {
    title: "Admissions",
    featured: [
      {
        title: "Enquire Now",
        href: "#",
        description: "Fill a quick form and we'll call you within 24 hours",
        icon: HeartHandshake,
        image: "https://picsum.photos/seed/school-welcome/400/180",
      },
      {
        title: "Visit Campus",
        href: "#",
        description: "See our school in person — open every weekday",
        icon: MapPin,
        image: "https://picsum.photos/seed/school-campus/400/180",
      },
    ],
    compact: [
      { title: "Process & Fees", href: "#", description: "Simple step-by-step guide", icon: FileText },
      { title: "Eligibility", href: "#", description: "Age & document checklist", icon: BookOpen },
      { title: "Scholarships", href: "#", description: "Fee concession options", icon: Star },
    ],
    sidebar: [
      { title: "Call School Office", href: "#", description: "Speak to admissions team", icon: Phone },
      { title: "FAQ", href: "#", description: "Common parent questions", icon: HelpCircle },
      { title: "School Calendar", href: "#", description: "Admission dates & events", icon: Calendar },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
  },
];
