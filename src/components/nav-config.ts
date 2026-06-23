import {
  BookOpen,
  Users,
  MapPin,
  GraduationCap,
  Lightbulb,
  Globe,
  HeartHandshake,
  Calendar,
  HelpCircle,
  FileText,
  Download,
  Star,
  BookOpenCheck,
  Microscope,
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
    compact: [
      { title: "Know Us", href: "/#about", description: "Learn about Apollo Vidhyalayam", icon: GraduationCap },
      { title: "Book a Campus Tour", href: "/contact", description: "Schedule a visit to our school", icon: MapPin },
      { title: "Mandatory Public Disclosure", href: "/mandatory-public-disclosure", description: "Regulatory documents", icon: FileText },
    ],
  },
  {
    title: "Academics",
    compact: [
      { title: "Our Programs", href: "/programs", description: "Pre-Primary to Std. X curriculum", icon: BookOpen },
      { title: "Academic Support", href: "/programs#support", description: "Bridge courses, coaching & more", icon: BookOpenCheck },
    ],
  },
  {
    title: "Student Life",
    href: "/student-life",
  },
  {
    title: "Gallery",
    href: "/gallery",
  },
  {
    title: "Admissions",
    compact: [
      { title: "Apply Now", href: "#", description: "Start your admission process", icon: HeartHandshake },
      { title: "Book Campus Visit", href: "#", description: "Schedule a visit to our school", icon: MapPin },
      { title: "FAQ", href: "#", description: "Common parent questions", icon: HelpCircle },
      { title: "Download Fee Structure", href: "#", description: "Fee details as PDF", icon: Download },
    ],
  },
  {
    title: "Contact",
    href: "/contact",
  },
];
