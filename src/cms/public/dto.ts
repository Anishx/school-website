export type PublicImageDTO = Readonly<{
  src: string
  alt: string
  objectPosition?: string
}>

export type EditorialDTO = Readonly<{
  id: string
  kind: 'news' | 'event' | 'announcement'
  title: string
  slug?: string
  summary?: string
  body?: string
  bodyRichText?: Readonly<Record<string, unknown>>
  message?: string
  date: string
  category?: string
  featured?: boolean
  priority?: number
  displayOrder?: number
  link?: string
  image?: PublicImageDTO
  placements: readonly string[]
}>

export type ContentSource = 'legacy' | 'append' | 'managed'
export type WebsiteSettingsDTO = Readonly<{
  announcementBar: Readonly<{
    enabled: boolean
    speed: 'slow' | 'normal' | 'fast'
    theme: 'teal' | 'navy' | 'maroon'
  }>
  contentSources: Readonly<{
    resourcesNews: ContentSource
    resourcesAnnouncements: ContentSource
    resourcesDownloads: ContentSource
    schoolCalendar: ContentSource
    mandatoryDisclosure: ContentSource
    sports: ContentSource
    clubs: ContentSource
    contact: ContentSource
    homepageNews: ContentSource
  }>
}>

export type AnnouncementBarDTO = Readonly<{
  enabled: boolean
  speed: 'slow' | 'normal' | 'fast'
  theme: 'teal' | 'navy' | 'maroon'
  messages: readonly Readonly<{ id: string; text: string; link?: string }>[]
}>

export type DocumentDTO = Readonly<{
  id: string
  title: string
  type: string
  category?: string
  academicYear?: string
  effectiveDate?: string
  description?: string
  href: string
  displayOrder: number
  placements: readonly string[]
}>

export type CalendarRowDTO = Readonly<{ label: string; value: string; emphasis?: boolean }>
export type CalendarDTO = Readonly<{
  heading: string
  introduction: string
  academicYear?: string
  termBreaks: readonly CalendarRowDTO[]
  assessments: readonly CalendarRowDTO[]
  gradeXMeetings: readonly CalendarRowDTO[]
  reportMeetings: readonly CalendarRowDTO[]
  specialDays: readonly CalendarRowDTO[]
  dailySchedule: readonly CalendarRowDTO[]
  publicHolidays: readonly CalendarRowDTO[]
}>

export type StudentLifeCardDTO = Readonly<{
  key: string
  title: string
  description: string
  image?: PublicImageDTO
}>

export type SportsDTO = Readonly<{
  heading: string
  introduction: string
  philosophy?: string
  coaching?: string
  achievements?: string
  disciplines: readonly string[]
  cards: readonly StudentLifeCardDTO[]
}>

export type ClubsDTO = Readonly<{
  heading: string
  introduction: string
  flagship?: Readonly<{ name: string; tagline?: string; description: string; image?: PublicImageDTO }>
  cards: readonly StudentLifeCardDTO[]
}>

export type ContactDTO = Readonly<{
  eyebrow: string
  heading: string
  description: string
  address: string
  phoneDisplay: string
  phoneHref: string
  admissionsEmail: string
  principalEmail: string
  mapEmbedUrl: string
  mapTitle: string
  visitTitle: string
  visitDescription: string
  ctaLabel: string
  ctaHref: string
}>
