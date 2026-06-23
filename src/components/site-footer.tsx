import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  Image as ImageIcon,
  HeartHandshake,
  Phone,
  FileText,
  Rocket,
  Newspaper,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";

const footerColumns = [
  {
    title: "Academics",
    links: [
      { name: "Our Programs", href: "/programs", icon: BookOpen },
      { name: "Academic Support", href: "/programs#support", icon: GraduationCap },
      { name: "Student Life", href: "/student-life", icon: Users },
      { name: "Gallery", href: "/gallery", icon: ImageIcon },
    ],
  },
  {
    title: "Admissions",
    links: [
      { name: "Apply Now", href: "#", icon: HeartHandshake },
      { name: "Book Campus Visit", href: "#", icon: MapPin },
      { name: "Download Fee Structure", href: "#", icon: FileText },
    ],
  },
  {
    title: "School",
    links: [
      { name: "About Us", href: "/#about", icon: GraduationCap },
      { name: "Future Vision", href: "/future-vision", icon: Rocket },
      { name: "News & Events", href: "/news-events", icon: Newspaper },
      { name: "Mandatory Disclosure", href: "/mandatory-public-disclosure", icon: FileText },
    ],
  },
  {
    title: "Contact",
    links: [
      { name: "Contact Us", href: "/contact", icon: Phone },
      { name: "Campus Address", href: "#", icon: MapPin },
      { name: "Email Us", href: "#", icon: Mail },
      { name: "School Hours", href: "#", icon: Clock },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-teal-900 text-white">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 md:pt-20">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-white">
                <span className="text-base font-bold text-teal-900">A</span>
              </div>
              <div>
                <p className="font-display text-base font-bold text-white">Apollo Vidhyalayam</p>
                <p className="text-xs text-white/60">Rural • Quality • Aspiration</p>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Committed to transforming education through strong academics, technology-enabled learning, and holistic student development.
            </p>
            <div className="mt-6 flex gap-3 text-sm text-white/60">
              <span>Facebook</span>
              <span>•</span>
              <span>Instagram</span>
              <span>•</span>
              <span>YouTube</span>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:col-span-8">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                        >
                          <Icon className="size-3.5 shrink-0 text-white/40 transition-colors group-hover:text-white/80" />
                          {link.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-white/10 pt-6">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Apollo Vidhyalayam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
