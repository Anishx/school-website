import { createHash } from 'node:crypto'

import events from '../../data/events.json'

export const LEGACY_MANIFEST_VERSION = 'editable-content-v2'

export function sourceFingerprint(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export const LEGACY_ASSET_REFERENCES = Object.freeze([
  ...events.map((event) => event.image),
  '/images/new/shotput.jpg', '/images/new/football-close.jpg', '/images/new/volleyball.jpg',
  '/images/new/Cricket.png', '/images/new/koko-playground.jpg', '/images/new/badminton.jpg',
  '/images/new/Tennikoit.png', '/images/classroom/groupStudy.jpg', '/images/cultural/cultural-5.jpg',
  '/images/sports/sports-3.jpg', '/images/cultural/cultural-4.jpg', '/images/cultural/cultural-3.jpg',
].filter((value, index, all) => all.indexOf(value) === index))

export const LEGACY_BASELINE = Object.freeze({
  articles: 8,
  contentSections: 4,
  resourceAnnouncements: 4,
  announcementBarMessages: 5,
  uniqueAnnouncements: 8,
  workingExternalDownloads: 5,
  missingBrochure: 1,
  disclosurePlaceholders: 17,
  assets: LEGACY_ASSET_REFERENCES.length,
  knownOmissions: Object.freeze([
    'School Brochure has no source file or URL.',
    'All 17 mandatory-disclosure rows are placeholders without approved files, dates, or links.',
  ]),
})

export type MigrationRecord = Readonly<{
  migrationId: string
  collection: 'content-sections' | 'editorial' | 'documents'
  sourceLocation: string
  fingerprint: string
  targetKey: string
  normalizedContent: Readonly<Record<string, unknown>>
}>

export function migrationRecord(input: Omit<MigrationRecord, 'fingerprint'>): MigrationRecord {
  return Object.freeze({ ...input, fingerprint: sourceFingerprint(input.normalizedContent) })
}
