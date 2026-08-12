import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { CtaBar } from "@/components/cta-bar";
import { WelcomeSection } from "@/components/welcome-section";
import { AcademicProgrammesSection } from "@/components/academic-programmes-section";
import { HighlightsGrid } from "@/components/highlights-grid";
import { NewsEventsSection } from "@/components/news-events-section";
import { ContactSection } from "@/components/contact-section";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <WelcomeSection />
      <AcademicProgrammesSection />
      <HighlightsGrid />
      <NewsEventsSection />
      <ContactSection />
      <CtaBar />
    </>
  );
}
