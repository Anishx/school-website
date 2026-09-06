import { getClubs, getSports, getWebsiteSettings } from "@/cms/public/loaders";
import { SiteHeader } from "@/components/site-header";
import { StudentLifeClient } from "@/components/student-life-client";

export default async function StudentLifePage() {
  const [settings, sports, clubs] = await Promise.all([getWebsiteSettings(), getSports(), getClubs()]);
  return (
    <>
      <SiteHeader />
      <StudentLifeClient
        sports={sports}
        clubs={clubs}
        sportsSource={settings.contentSources.sports}
        clubsSource={settings.contentSources.clubs}
      />
    </>
  );
}
