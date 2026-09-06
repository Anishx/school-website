import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { getContact, getWebsiteSettings } from "@/cms/public/loaders";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
      <path d="M2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Gallery", href: "/gallery" },
  { name: "Admissions", href: "/admissions" },
  { name: "Contact Us", href: "/#contact" },
];

const aboutLinks = [
  { name: "Know Us", href: "/about-us" },
  { name: "Leadership", href: "/leadership" },
  { name: "Why Us", href: "/why-us" },
  { name: "Gallery", href: "/gallery" },
];

const resourceLinks = [
  { name: "Latest News", href: "/news-events?tab=latest" },
  { name: "Announcements", href: "/news-events?tab=announcements" },
  { name: "School Calendar", href: "/news-events?tab=calendar" },
  { name: "Downloads", href: "/news-events?tab=downloads" },
];

const portalLinks = [
  { name: "Parent Login", href: "#" },
  { name: "Teacher Login", href: "#" },
];

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

const footerLinkClass =
  "text-sm text-white/60 transition-colors hover:text-white";

export async function SiteFooter() {
  const [contact, settings] = await Promise.all([getContact(), getWebsiteSettings()]);
  const showContact = settings.contentSources.contact === "legacy" || contact !== null;
  return (
    <footer className="bg-teal-900 text-white">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-12 md:pt-14">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4 xl:col-span-3">
            <Link href="/" className="inline-flex min-w-0 items-center gap-3">
              <Image
                src="/apollo-logo-white.png"
                alt="Apollo Vidhyalayam"
                width={1200}
                height={326}
                className="h-14 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              Committed to transforming education through strong academics,
              technology-enabled learning, and holistic student development.
            </p>
            <div className="mt-4 flex gap-3" aria-label="Social media links">
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
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:col-span-8 xl:col-span-9 xl:grid-cols-6">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Quick Links</h3>
              <ul className="mt-3 space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">About Us</h3>
              <ul className="mt-3 space-y-2">
                {aboutLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Resources</h3>
              <ul className="mt-3 space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Portals</h3>
              <ul className="mt-3 space-y-2">
                {portalLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={footerLinkClass}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {showContact && <div className="min-w-0 sm:col-span-2 xl:col-span-2">
              <h3 className="text-sm font-semibold text-white">Contact</h3>
              <ul className="mt-3 space-y-2.5">
                <li className="flex min-w-0 items-start gap-2 text-sm text-white/60">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/40" />
                  <span className="min-w-0">
                    {contact?.address ?? "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh"}
                  </span>
                </li>
                <li className="min-w-0">
                  <a
                    href={contact?.phoneHref ?? "tel:+918122761667"}
                    className="flex min-w-0 items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <Phone className="size-4 shrink-0 text-white/40" />
                    <span className="min-w-0">{contact?.phoneDisplay ?? "+91 81227 61667"}</span>
                  </a>
                </li>
                <li className="min-w-0">
                  <a
                    href={`mailto:${contact?.principalEmail ?? "principal@apollovidhyalayam.com"}`}
                    className="flex min-w-0 items-start gap-2 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    <Mail className="mt-0.5 size-4 shrink-0 text-white/40" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {contact?.principalEmail ?? "principal@apollovidhyalayam.com"}
                    </span>
                  </a>
                </li>
              </ul>
            </div>}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Apollo Vidhyalayam. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#privacy"
              className="text-xs text-white/50 transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="#terms"
              className="text-xs text-white/50 transition-colors hover:text-white"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
