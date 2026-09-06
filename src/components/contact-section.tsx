import Link from "next/link";
import { MapPin, Phone, Mail, Calendar, ArrowRight } from "lucide-react";
import { getContact, getWebsiteSettings } from "@/cms/public/loaders";

const contactInfo = [
  {
    icon: MapPin,
    label: "Campus Address",
    value: "Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 81227 61667",
  },
  {
    icon: Mail,
    label: "Email",
    value: "admissions@apollovidhyalayam.com",
  },
];

export async function ContactSection() {
  const [cms, settings] = await Promise.all([getContact(), getWebsiteSettings()]);
  if (settings.contentSources.contact === "managed" && !cms) return null;
  const resolvedContactInfo = cms ? [
    { icon: MapPin, label: "Campus Address", value: cms.address },
    { icon: Phone, label: "Phone", value: cms.phoneDisplay },
    { icon: Mail, label: "Email", value: cms.admissionsEmail },
  ] : contactInfo;

  return (
    <section className="bg-white py-16 md:py-20" id="contact">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">{cms?.eyebrow ?? "Get In Touch"}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
            {cms?.heading ?? "Visit Apollo Vidhyalayam"}
          </h2>
        </div>

        {/* Card */}
        <div className="grid overflow-hidden border border-line-200 md:grid-cols-2">
          {/* Left — Map */}
          <div className="relative min-h-[300px] md:min-h-[400px]">
            <iframe
              src={cms?.mapEmbedUrl ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.5!2d79.59!3d17.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDU4JzEyLjAiTiA3OcKwMzUnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000"}
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={cms?.mapTitle ?? "Apollo Vidhyalayam Location"}
            />
          </div>

          {/* Right — Contact Info */}
          <div className="flex flex-col justify-between bg-canvas-50 p-6 md:p-8">
            <div>
              <h3 className="font-display text-xl font-bold text-ink-900 md:text-2xl">
                Contact Information
              </h3>
              <p className="mt-2 text-sm text-ink-600">
                {cms?.description ?? "We'd love to hear from you. Reach out or visit us on campus."}
              </p>

              <div className="mt-8 space-y-5">
                {resolvedContactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <Icon className="size-5 shrink-0 text-teal-800 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{item.label}</p>
                        <p className="mt-0.5 text-sm text-ink-600">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Schedule a Tour CTA */}
            <div className="mt-8 border-t border-line-200 pt-6">
              <div className="flex items-start gap-4">
                <Calendar className="size-5 shrink-0 text-teal-800 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">{cms?.visitTitle ?? "Schedule a Campus Tour"}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{cms?.visitDescription ?? "Visit us in person — open every weekday."}</p>
                  <Link
                    href={cms?.ctaHref ?? "tel:+918122761667"}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-900"
                  >
                    {cms?.ctaLabel ?? "Call to arrange a visit"}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
