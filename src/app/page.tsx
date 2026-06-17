import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { MetricsCard } from "@/components/metrics-card";
import { AboutV1Story } from "@/components/about-v1-story";
import { WhyUsSection } from "@/components/why-us-section";
import { AcademicStages } from "@/components/academic-stages";
import { AboutV2Timeline } from "@/components/about-v2-timeline";
import { ProgramsSpotlight } from "@/components/programs-spotlight";
import { AboutV3Cards } from "@/components/about-v3-cards";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <HeroSection />
      <MetricsCard />
      <AboutV1Story />
      <WhyUsSection />
      <AcademicStages />
      <AboutV2Timeline />
      <ProgramsSpotlight />
      <AboutV3Cards />
      <main className="flex-1">
        {/* To build: Activities & Clubs, Achievements, Facilities, Parent Updates, Admissions Strip, Footer */}
      </main>
    </>
  );
}
