import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { CtaBar } from "@/components/cta-bar";
import { WelcomeSection } from "@/components/welcome-section";
import { AcademicProgrammesSection } from "@/components/academic-programmes-section";
import { HighlightsGrid } from "@/components/highlights-grid";
import { NewsEventsSection } from "@/components/news-events-section";
import { ContactSection } from "@/components/contact-section";
import { getEditorial, getWebsiteSettings } from "@/cms/public/loaders";
import { contentForSource } from "@/cms/public/content-source";
import eventsData from "@/data/events.json";

export default async function Home() {
  const [editorial, settings] = await Promise.all([getEditorial(), getWebsiteSettings()]);
  const news = editorial
    .filter((item) => item.kind === "news" && item.placements.includes("resource-news") && item.placements.includes("homepage-news") && item.slug && item.image)
    .map((item) => ({
      id: item.slug!,
      title: item.title,
      date: item.date,
      category: item.category ?? "News",
      featured: item.featured ?? false,
      image: item.image!.src,
    }));
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <WelcomeSection />
      <AcademicProgrammesSection />
      <HighlightsGrid />
      <NewsEventsSection items={contentForSource(
        settings.contentSources.homepageNews,
        eventsData,
        news,
        (item) => item.id,
      )} />
      <ContactSection />
      <CtaBar />
    </>
  );
}
