import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { MetricsCarousel } from "@/components/metrics-carousel";
import { AboutV1Story } from "@/components/about-v1-story";
import { HighlightsGrid } from "@/components/highlights-grid";
import { ProgramsListSection } from "@/components/programs-list-section";
import { NewsEventsSection } from "@/components/news-events-section";
import { ContactSection } from "@/components/contact-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <MetricsCarousel />
      <AboutV1Story />
      <HighlightsGrid />
      <ProgramsListSection />
      <NewsEventsSection />
      <ContactSection />
    </>
  );
}
