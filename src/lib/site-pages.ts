export type SiteEntry = {
  title: string;
  href: string;
  description: string;
  category: string;
  keywords?: string;
};

export const sitePages: SiteEntry[] = [
  { title: 'Home', href: '/', category: 'School', description: 'Welcome to Apollo Vidhyalayam in Aragonda, Chittoor. Discover our school, academics and community.', keywords: 'education Andhra Pradesh rural primary secondary' },
  { title: 'About Us', href: '/about-us', category: 'School', description: 'Learn about our history, vision, mission and approach to education.', keywords: 'know us values' },
  { title: 'Leadership', href: '/leadership', category: 'School', description: 'Meet the leaders guiding Apollo Vidhyalayam.', keywords: 'principal chairman' },
  { title: 'Our Management', href: '/our-management', category: 'School', description: 'Meet our school management and the Apollo Foundation.', keywords: 'trust board' },
  { title: 'Why Us', href: '/why-us', category: 'Admissions', description: 'Explore our academic programmes, facilities and holistic approach to learning.', keywords: 'CBSE curriculum smart classrooms library laboratories brighter minds' },
  { title: 'Admissions', href: '/admissions', category: 'Admissions', description: 'Find admission requirements, eligibility and the application process.', keywords: 'enrolment enrollment fees documents' },
  { title: 'Apply Now', href: '/apply', category: 'Admissions', description: 'Complete an application for admission to Apollo Vidhyalayam.', keywords: 'admission form register' },
  { title: 'Student Life', href: '/student-life', category: 'Student Life', description: 'Discover sports, clubs, STEM activities, leadership programmes and achievements.' },
  { title: 'Sports', href: '/student-life?tab=sports', category: 'Student Life', description: 'Explore sports and physical education at our school.', keywords: 'cricket volleyball basketball chess carrom playground athletics' },
  { title: 'Clubs & Activities', href: '/student-life?tab=clubs', category: 'Student Life', description: 'Explore creative activities and school clubs.', keywords: 'music dance art' },
  { title: 'STEM Activities', href: '/student-life?tab=stem', category: 'Student Life', description: 'Discover science, technology, engineering and mathematics activities.' },
  { title: 'Leadership Programmes', href: '/student-life?tab=leadership', category: 'Student Life', description: 'Develop confidence, responsibility and student leadership skills.' },
  { title: 'Achievements', href: '/student-life?tab=achievements', category: 'Student Life', description: 'Celebrate our students’ achievements and successes.', keywords: 'awards results' },
  { title: 'Gallery', href: '/gallery', category: 'School', description: 'Browse photographs of our campus, students and school activities.', keywords: 'photos pictures' },
  { title: 'Future Vision', href: '/future-vision', category: 'School', description: 'Learn about our vision for the future of the school.' },
  { title: 'News & Events', href: '/news-events', category: 'Resources', description: 'Read the latest school news and events.' },
  { title: 'Announcements', href: '/news-events?tab=announcements', category: 'Resources', description: 'Read school announcements, notices and updates.' },
  { title: 'School Calendar', href: '/news-events?tab=calendar', category: 'Resources', description: 'View the academic calendar, holidays, assessments and meeting schedules.' },
  { title: 'Downloads', href: '/news-events?tab=downloads', category: 'Resources', description: 'Find admission forms, the school handbook, fee structure and transport route map.' },
  { title: 'Mandatory Public Disclosure', href: '/mandatory-public-disclosure', category: 'Resources', description: 'Access school information, certificates, affiliation details and mandatory documents.', keywords: 'CBSE safety recognition NOC staff committee' },
  { title: 'Contact Us', href: '/#contact', category: 'School', description: 'Find our address, telephone number and email to contact Apollo Vidhyalayam.', keywords: 'location Aragonda Chittoor principal' },
];

export function searchEntries(entries: readonly SiteEntry[], query: string): SiteEntry[] {
  const normalized = query.trim().toLocaleLowerCase().slice(0, 200);
  const terms = normalized.split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return entries.map((entry, index) => {
    const title = entry.title.toLocaleLowerCase();
    const haystack = `${title} ${entry.description} ${entry.category} ${entry.keywords ?? ''}`.toLocaleLowerCase();
    const score = terms.every((term) => haystack.includes(term))
      ? 1 + (title === normalized ? 100 : 0) + (title.includes(normalized) ? 20 : 0) + terms.filter((term) => title.includes(term)).length * 5
      : 0;
    return { entry, score, index };
  }).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);
}
