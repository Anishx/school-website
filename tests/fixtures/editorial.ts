export type SyntheticEditorialKind = 'news' | 'event' | 'announcement'
export type SyntheticPublicationState = 'draft' | 'scheduled' | 'published' | 'expired' | 'archived'

export type SyntheticEditorialRecord = Readonly<{
  id: string
  kind: SyntheticEditorialKind
  slug: string
  title: string
  summary: string
  body: string
  publicationState: SyntheticPublicationState
  publishAt: string
  expiresAt: string | null
  startAt?: string
  endAt?: string
  location?: string
  priority?: number
}>

export function buildEditorialRecord(
  overrides: Partial<SyntheticEditorialRecord> = {},
): SyntheticEditorialRecord {
  return {
    id: 'editorial-synthetic-001', kind: 'news', slug: 'synthetic-news',
    title: 'Synthetic News Record', summary: 'Fixture-only editorial summary.',
    body: 'Fixture-only editorial body.', publicationState: 'draft',
    publishAt: '2030-01-15T10:00:00.000Z', expiresAt: null, ...overrides,
  }
}

export function buildSyntheticEvent(
  overrides: Partial<SyntheticEditorialRecord> = {},
): SyntheticEditorialRecord {
  return buildEditorialRecord({
    id: 'event-synthetic-001', kind: 'event', slug: 'synthetic-event',
    title: 'Synthetic Event', startAt: '2030-02-01T09:00:00.000Z',
    endAt: '2030-02-01T10:00:00.000Z', location: 'Fixture Hall', ...overrides,
  })
}
