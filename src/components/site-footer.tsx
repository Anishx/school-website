import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

const quickLinks = [
  { name: "Admissions", href: "/admissions" },
  { name: "Academics", href: "/#academics" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/#contact" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width={20} height={20} x={2} y={2} rx={5} ry={5} />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1={17.5} x2={17.51} y1={6.5} y2={6.5} />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width={4} height={12} x={2} y={9} />
      <circle cx={4} cy={4} r={2} />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/apollofoundation/?hl=en",
    icon: InstagramIcon,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/apollo-fnd/?originalSubdomain=in",
    icon: LinkedinIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/aplapollofoundation/",
    icon: FacebookIcon,
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
              <Image
                src="/apollo-logo-white.png"
                alt="Apollo Vidhyalayam"
                width={96}
                height={96}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Committed to transforming education through strong academics,
              technology-enabled learning, and holistic student development.
            </p>
            {/* Social links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-8">
            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white">Quick Links</h3>
              <ul className="mt-4 space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="text-sm font-semibold text-white">About Us</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/about-us" className="text-sm text-white/60 transition-colors hover:text-white">Know Us</Link></li>
                <li><Link href="/leadership" className="text-sm text-white/60 transition-colors hover:text-white">Leadership</Link></li>
                <li><Link href="/why-us" className="text-sm text-white/60 transition-colors hover:text-white">Why Us</Link></li>
                <li><Link href="/gallery" className="text-sm text-white/60 transition-colors hover:text-white">Gallery</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-4 space-y-3">
                <li><Link href="/news-events?tab=latest" className="text-sm text-white/60 transition-colors hover:text-white">Latest News</Link></li>
                <li><Link href="/news-events?tab=announcements" className="text-sm text-white/60 transition-colors hover:text-white">Announcements</Link></li>
                <li><Link href="/news-events?tab=calendar" className="text-sm text-white/60 transition-colors hover:text-white">School Calendar</Link></li>
                <li><Link href="/news-events?tab=downloads" className="text-sm text-white/60 transition-colors hover:text-white">Downloads</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2 text-sm text-white/60">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
                  <span>
                    Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129,
                    Chittoor District, Andhra Pradesh
                  </span>
                </li>
                <li>
                  <a
                    href="tel:+918122761667"
                    className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <Phone className="size-4 shrink-0 text-white/40" />
                    +91 81227 61667
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:principal@apollovidhyalayam.com"
                    className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <Mail className="size-4 shrink-0 text-white/40" />
                    principal@apollovidhyalayam.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Apollo Vidhyalayam. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#privacy" className="text-xs text-white/50 transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="#terms" className="text-xs text-white/50 transition-colors hover:text-white">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
