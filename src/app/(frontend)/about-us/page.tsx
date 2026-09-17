import { AboutUsClient } from "@/components/about-us-client";
import { SiteHeader } from "@/components/site-header";

export default async function AboutUsPage({ searchParams }: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === 'teachers' ? 1 : tab === 'infrastructure' ? 2 : 0;
  return <><SiteHeader /><AboutUsClient key={initialTab} initialTab={initialTab} /></>;
}
