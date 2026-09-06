import { existsSync } from 'node:fs'
import path from 'node:path'

import { getPayload, type Payload, type Where } from 'payload'

import config from '@payload-config'
import events from '../../data/events.json'
import { publicationSystemContext } from '../publication/model'
import { LEGACY_ASSET_REFERENCES, LEGACY_BASELINE, LEGACY_MANIFEST_VERSION, sourceFingerprint } from './legacy-manifest'

type SeedSummary = { wouldCreate: number; created: number; unchanged: number; conflicts: number; duplicates: number; failed: number }

const source = LEGACY_MANIFEST_VERSION
const hash = sourceFingerprint
const context = publicationSystemContext()
const applyChanges = process.argv.includes('--apply')
const compareDatabase = process.argv.includes('--compare')

const row = (label: string, value: string, emphasis = false) => ({ label, value, emphasis })
const card = (itemKey: string, title: string, description: string, legacyImagePath: string, objectPosition = 'center') => ({ itemKey, title, description, legacyImagePath, alt: title, objectPosition })

const contentSections = [
  {
    key: 'resources.school-calendar', heading: 'School Calendar',
    introduction: 'Academic year 2026–27 — term breaks, examinations, parent meetings, the daily timetable and public holidays.',
    calendar: {
      academicYear: '2026–27',
      termBreaks: [row('Dasara Holidays', 'October 10th – 20th, 2026'), row('Pongal Holidays', 'January 9th – 17th, 2027'), row('School Reopen (2027–2028)', 'June 12th, 2027')],
      assessments: [row('Formative Assessment 1', 'July 27th, 2026'), row('Formative Assessment 2', 'September 28th, 2026'), row('Summative Assessment 1', 'November 2nd, 2026'), row('Formative Assessment 3', 'December 28th, 2026'), row('Formative Assessment 4', 'February 15th, 2027'), row('Summative Assessment 2', 'April 13th, 2027')],
      gradeXMeetings: [row('Grade X – PTM 1', 'June 1st, 2026'), row('Grade X – PTM 2', 'October 8th, 2026'), row('Grade X – PTM 3', 'January 2nd, 2027')],
      reportMeetings: [row('KG to Grade IX – PTM 1', 'October 8th, 2026'), row('KG to Grade IX – PTM 2', 'January 8th, 2027'), row('KG to Grade IX – PTM 3', 'April 23rd, 2027')],
      specialDays: [row("Father's Day", 'June 20th, 2026'), row("Grandparents' Day", 'January 25th, 2027'), row('Dasara Celebration', 'October 7th, 2026'), row("Women's Day", 'March 8th, 2027')],
      dailySchedule: [row('09:00 – 09:20 AM', 'Assembly'), row('09:20 – 10:00 AM', '1st Period'), row('10:00 – 10:40 AM', '2nd Period'), row('10:40 – 10:50 AM', 'Break', true), row('10:50 – 11:30 AM', '3rd Period'), row('11:30 AM – 12:10 PM', '4th Period'), row('12:10 – 12:50 PM', '5th Period'), row('12:50 – 01:20 PM', 'Lunch Break', true), row('01:20 – 02:00 PM', '6th Period'), row('02:00 – 02:40 PM', '7th Period'), row('02:40 – 02:50 PM', 'Break', true), row('02:50 – 03:30 PM', '8th Period'), row('03:30 – 04:10 PM', '9th Period')],
      publicHolidays: [row('26th June, 2026', 'Moharam'), row('26th August, 2026', 'Milad-un-Nabi'), row('28th August, 2026', 'Varalakshmi Vratam'), row('4th September, 2026', 'Krishna Jayanti'), row('14th September, 2026', 'Vinaya Chaviti'), row('2nd October, 2026', 'Gandhi Jayanti'), row('20th October, 2026', 'Vijaya Dasami'), row('9th November, 2026', 'Diwali'), row('25th December, 2026', 'Christmas'), row('15th January, 2027', 'Sankranthi'), row('26th January, 2027', 'Republic Day'), row('6th March, 2027', 'Maha Shivratri'), row('26th March, 2027', 'Good Friday'), row('7th April, 2027', 'Ugadi')],
    },
  },
  {
    key: 'student-life.sports', heading: 'Sports',
    introduction: 'At Apollo Vidyalayam, sports are an integral part of education—not merely an extracurricular activity. We believe that physical activity builds confidence, resilience, teamwork, discipline, and the mental strength needed to overcome challenges both on and off the field. Guided by the philosophy of developing willpower and inner strength, our sports programme is led by dedicated and trained teachers who inspire every child to strive for excellence.',
    sports: {
      philosophy: 'We believe every child has the potential to grow stronger—physically, mentally, and emotionally. Through regular training and active participation, students develop resilience, determination, leadership, and the confidence to face challenges with courage.',
      coaching: 'All sporting activities are conducted under the guidance of our trained teachers, who focus on skill development, teamwork, discipline, and sportsmanship.',
      achievements: 'Apollo Vidyalayam has consistently excelled in competitive sports, with students emerging as State-Level Volleyball Champions and regularly representing the school with distinction in Government-conducted sports tournaments, earning numerous accolades across disciplines.',
      disciplines: ['Athletics', 'Football', 'Volleyball', 'Tennikoit', 'Cricket'].map((name) => ({ name })),
      cards: [
        card('athletics', 'Athletics', '100m race champions, shot put and disc throw winners at mandal level.', '/images/new/shotput.jpg'),
        card('football', 'Football', 'Building teamwork, agility, and strategic thinking on the field.', '/images/new/football-close.jpg'),
        card('volleyball', 'Volleyball', 'State-level champions showcasing coordination and competitive spirit.', '/images/new/volleyball.jpg'),
        card('cricket', 'Cricket', "India's beloved sport fostering patience, strategy, and team dynamics.", '/images/new/Cricket.png'),
        card('ko-ko', 'Ko-Ko', 'Building speed, agility, quick reflexes, and strategic teamwork through fast-paced play.', '/images/new/koko-playground.jpg'),
        card('badminton', 'Badminton', 'Enhancing agility, hand-eye coordination, focus, and competitive spirit on the court.', '/images/new/badminton.jpg'),
        card('tennikoit', 'Tennikoit', 'Developing hand-eye coordination, reflexes, and sportsmanship.', '/images/new/Tennikoit.png', 'top'),
      ],
    },
  },
  {
    key: 'student-life.clubs', heading: 'Clubs & Activities',
    introduction: 'At Apollo Vidyalayam, learning extends beyond the classroom. Our clubs and enrichment programmes encourage students to explore their interests, discover new talents, and develop confidence, creativity, discipline, and teamwork in a fun and engaging environment.',
    clubs: {
      flagship: { name: 'Karadi Path', tagline: 'Our Flagship Language Programme', description: "Karadi Path is Apollo Vidyalayam's flagship English language programme, building strong communication skills through storytelling, songs, role-play, and interactive activities. Rooted in the natural way children acquire language, it makes learning joyful and effective—nurturing confident, expressive, and fluent young communicators.", legacyImagePath: '/images/classroom/groupStudy.jpg', alt: 'Karadi Path language programme' },
      cards: [
        card('art-craft', 'Art & Craft', 'Students express their creativity through drawing, painting, craftwork, and hands-on projects that enhance imagination, fine motor skills, and artistic expression.', '/images/cultural/cultural-5.jpg'),
        card('karate', 'Karate', 'Karate helps students develop self-discipline, focus, physical fitness, confidence, and self-defence skills while instilling respect, perseverance, and mental resilience.', '/images/sports/sports-3.jpg'),
        card('western-dance', 'Western Dance', 'Students explore rhythm, movement, and performance through Western dance, building coordination, creativity, teamwork, and stage confidence.', '/images/cultural/cultural-4.jpg'),
        card('bharatanatyam', 'Bharatanatyam', 'Through the classical art of Bharatanatyam, students learn grace, discipline, cultural appreciation, and artistic expression while strengthening concentration and confidence.', '/images/cultural/cultural-3.jpg'),
      ],
    },
  },
  {
    key: 'site.contact', heading: 'Visit Apollo Vidhyalayam',
    contact: {
      eyebrow: 'Get In Touch', description: "We'd love to hear from you. Reach out or visit us on campus.",
      address: 'Apollo Vidhyalayam, Jonnagurukula Road, Aragonda — 517129, Chittoor District, Andhra Pradesh',
      phoneDisplay: '+91 81227 61667', phoneHref: 'tel:+918122761667', admissionsEmail: 'admissions@apollovidhyalayam.com', principalEmail: 'principal@apollovidhyalayam.com',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.5!2d79.59!3d17.97!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDU4JzEyLjAiTiA3OcKwMzUnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000',
      mapTitle: 'Apollo Vidhyalayam Location', visitTitle: 'Schedule a Campus Tour', visitDescription: 'Visit us in person — open every weekday.', ctaLabel: 'Call to arrange a visit', ctaHref: 'tel:+918122761667',
    },
  },
]

const resourceAnnouncements = [
  ['Admissions Open for 2025-26 Academic Year', '2025-06-01'],
  ['CBSE Transition — Academic Continuity Update', '2025-05-15'],
  ['New Smart Classrooms Inaugurated', '2025-04-20'],
  ['Parent-Teacher Meeting Schedule Released', '2025-04-10'],
]
const tickerAnnouncements = ['Admissions Open for 2025-26 Academic Year', 'Annual Day Celebrations on March 15th', 'Smart Classrooms Now Live in All Grades', 'Brighter Minds Program Starting Next Month', 'Sports Championships — State Level Qualifiers']
const downloads = [
  ['Admission Form 2026-27', 'https://drive.google.com/file/d/1KIwwqlBwgSkowrojed8ah5-ptV6zA3Vj/view?usp=sharing'],
  ['School Handbook', 'https://drive.google.com/file/d/1a_4tnoai3UDgONZXB1tiLBYfSqO0oLA2/view?usp=sharing'],
  ['Fee Structure Document', 'https://drive.google.com/file/d/1X1ICvaiOGiyELmTJkxbplkervrpFaWIR/view?usp=drive_link'],
  ['Transport Route Map', 'https://drive.google.com/file/d/1MVwR2-uWqU9l-ooO9y2hHrSFR4CzZhmf/view?usp=sharing'],
  ['Academic Calendar 2026-27', 'https://drive.google.com/file/d/1r_7rhnhTr_CgCREBr6xuzBU9kedOmIPw/view?usp=drive_link'],
  ['School Brochure', ''],
]
const disclosures = ['Recognition Certificate', 'Society Registration', 'NOC Certificate', 'Fire Safety Certificate', 'Land Certificate', 'Building Safety Certificate', 'Water and Sanitary Certificate', 'PTA', 'Public Disclosure', 'SMC', "Fee's Structure", 'Academic Calendar', 'Self Certificate', 'Mandatory Disclosure', 'Water Test Report', 'GHMC Commissioner Letter', 'Affiliation Letter']

function lexicalParagraph(value: string) {
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, textFormat: 0, textStyle: '', children: [{ type: 'text', format: 0, style: '', mode: 'normal', detail: 0, version: 1, text: value }] }] } }
}

async function findOne(payload: Payload, collection: 'content-sections' | 'editorial' | 'documents', where: Where) {
  const result = await payload.find({ collection, where, overrideAccess: true, limit: 1, pagination: false })
  return result.docs[0] as unknown as Record<string, unknown> | undefined
}

async function createIfMissing(payload: Payload, collection: 'content-sections' | 'editorial' | 'documents', migrationId: string, legacyWhere: Where, data: Record<string, unknown>, summary: SeedSummary) {
  try {
    const fingerprint = hash(data)
    const owned = await findOne(payload, collection, { migrationId: { equals: migrationId } })
    if (owned) {
      if (owned.migrationFingerprint === fingerprint) summary.unchanged += 1
      else summary.conflicts += 1
      return
    }
    if (await findOne(payload, collection, legacyWhere)) { summary.duplicates += 1; return }
    if (!applyChanges) { summary.wouldCreate += 1; return }
    await payload.create({ collection, overrideAccess: true, context, data: { ...data, publicationState: 'draft', migrationId, migrationSource: source, migrationFingerprint: fingerprint } as never })
    summary.created += 1
  } catch (error) {
    summary.failed += 1
    console.error(`Failed to seed ${collection}: ${String(data.key ?? data.publicPathKey ?? data.title)}`)
    if (process.env.SEED_VERBOSE === 'true') console.error(error)
  }
}

async function main() {
  if (!applyChanges && !compareDatabase) {
    const assets = LEGACY_ASSET_REFERENCES.map((asset) => ({
      asset,
      exists: existsSync(path.join(process.cwd(), 'public', asset.replace(/^\//, ''))),
    }))
    const missingAssets = assets.filter((asset) => !asset.exists)
    console.log(JSON.stringify({
      mode: 'source-validation', manifestVersion: source, baseline: LEGACY_BASELINE,
      plannedRecords: 4 + events.length + 8 + downloads.length + disclosures.length,
      assets: { total: assets.length, missing: missingAssets },
      valid: missingAssets.length === 0,
      next: 'Run with --compare for a database comparison, then --apply only against a backed-up, reviewed target database.',
    }, null, 2))
    if (missingAssets.length) process.exitCode = 1
    return
  }
  const payload = await getPayload({ config })
  const summary: SeedSummary = { wouldCreate: 0, created: 0, unchanged: 0, conflicts: 0, duplicates: 0, failed: 0 }
  for (const section of contentSections) await createIfMissing(payload, 'content-sections', `section:${section.key}`, { key: { equals: section.key } }, section, summary)
  for (const event of events) await createIfMissing(payload, 'editorial', `article:${event.id}`, { publicPathKey: { equals: event.id } }, {
    kind: 'news', title: event.title, slug: event.id, publicPathKey: event.id, summary: event.body.slice(0, 500), body: lexicalParagraph(event.body), displayDate: event.date, category: event.category, featured: event.featured, legacyImagePath: event.image, placements: ['resource-news', 'homepage-news'],
  }, summary)
  for (const [title, date] of resourceAnnouncements) {
    const placements = tickerAnnouncements.includes(title) ? ['resource-announcements', 'header-ticker'] : ['resource-announcements']
    await createIfMissing(payload, 'editorial', `announcement:${hash(title).slice(0, 16)}`, { title: { equals: title } }, { kind: 'announcement', title, message: title, displayDate: date, displayOrder: 0, priority: 0, placements }, summary)
  }
  for (const title of tickerAnnouncements.filter((title) => !resourceAnnouncements.some(([resourceTitle]) => resourceTitle === title))) {
    await createIfMissing(payload, 'editorial', `announcement:${hash(title).slice(0, 16)}`, { title: { equals: title } }, { kind: 'announcement', title, message: title, displayOrder: 0, priority: 0, placements: ['header-ticker'] }, summary)
  }
  for (const [title, url] of downloads) await createIfMissing(payload, 'documents', `download:${hash(title).slice(0, 16)}`, { and: [{ title: { equals: title } }, { placements: { contains: 'downloads' } }] }, { title, type: 'general_download', placements: ['downloads'], sourceType: url ? 'external' : 'upload', externalUrl: url || undefined, legacyExternalUrl: url || undefined, displayOrder: downloads.findIndex((item) => item[0] === title) }, summary)
  for (const title of disclosures) await createIfMissing(payload, 'documents', `disclosure:${hash(title).slice(0, 16)}`, { and: [{ title: { equals: title } }, { placements: { contains: 'mandatory-disclosure' } }] }, { title, type: 'mandatory_disclosure', placements: ['mandatory-disclosure'], sourceType: 'upload', displayOrder: disclosures.indexOf(title) }, summary)
  console.log(JSON.stringify({ mode: applyChanges ? 'apply' : 'database-comparison', manifestVersion: source, ...summary }))
  await payload.destroy()
  if (summary.failed > 0 || summary.conflicts > 0 || summary.duplicates > 0) process.exitCode = 1
}

await main()
