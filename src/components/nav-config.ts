import {
  GraduationCap,
  Download,
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
  featured?: NavLink[];
  compact?: NavLink[];
  sidebar?: NavLink[];
};

export const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  {
    title: "About Us",
    compact: [
      { title: "Know Us", href: "/about-us", icon: GraduationCap },
      { title: "Leadership", href: "/leadership" },
      { title: "Gallery", href: "/gallery" },
      { title: "Download School Brochure", href: "#brochure", icon: Download },
    ],
  },
  {
    title: "Academics",
    compact: [
      { title: "Programs", href: "/programs" },
      { title: "Faculty", href: "#faculty" },
    ],
  },
  {
    title: "Admissions",
    compact: [
      { title: "Why Us", href: "/why-us" },
      { title: "Admission Process", href: "/admissions" },
      { title: "Fee Structure", href: "/admissions#fee-structure" },
      { title: "Apply Now", href: "#apply" },
    ],
  },
  {
    title: "Student Life",
    compact: [
      { title: "Sports", href: "/student-life?tab=sports" },
      { title: "Clubs & Activities", href: "/student-life?tab=clubs" },
      { title: "STEM Activities", href: "/student-life?tab=stem" },
      { title: "Leadership Programmes", href: "/student-life?tab=leadership" },
      { title: "Achievements", href: "/student-life?tab=achievements" },
    ],
  },
  {
    title: "Resources",
    compact: [
      { title: "Latest News", href: "/news-events?tab=latest" },
      { title: "Announcements", href: "/news-events?tab=announcements" },
      { title: "Circulars", href: "/news-events?tab=circulars" },
      { title: "Holiday List", href: "/news-events?tab=holidays" },
      { title: "Downloads", href: "/news-events?tab=downloads" },
      { title: "Newsletter", href: "/news-events?tab=newsletter" },
      { title: "Mandatory Public Disclosure", href: "/mandatory-public-disclosure" },
    ],
  },
  { title: "Contact Us", href: "#contact" },
];
