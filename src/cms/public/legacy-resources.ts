import type { DocumentDTO, EditorialDTO } from './dto';
import eventsData from '../../data/events.json';

export const legacyNews: EditorialDTO[] = eventsData.map((event) => ({
  id: event.id,
  kind: "news",
  title: event.title,
  slug: event.id,
  summary: event.body,
  body: event.body,
  date: event.date,
  category: event.category,
  featured: event.featured,
  image: { src: event.image, alt: event.title },
  placements: ["resource-news", "homepage-news"],
}));

export const legacyAnnouncements: EditorialDTO[] = [
  ["Admissions Open for 2025-26 Academic Year", "2025-06-01"],
  ["CBSE Transition — Academic Continuity Update", "2025-05-15"],
  ["New Smart Classrooms Inaugurated", "2025-04-20"],
  ["Parent-Teacher Meeting Schedule Released", "2025-04-10"],
].map(([title, date], index) => ({ id: `legacy-announcement-${index}`, kind: "announcement", title, message: title, date, priority: 0, placements: ["resource-announcements"] }));

export const legacyDownloads: DocumentDTO[] = [
  ["Admission Form 2026-27", "https://drive.google.com/file/d/1KIwwqlBwgSkowrojed8ah5-ptV6zA3Vj/view?usp=sharing"],
  ["School Handbook", "https://drive.google.com/file/d/1a_4tnoai3UDgONZXB1tiLBYfSqO0oLA2/view?usp=sharing"],
  ["Fee Structure Document", "https://drive.google.com/file/d/1X1ICvaiOGiyELmTJkxbplkervrpFaWIR/view?usp=drive_link"],
  ["Transport Route Map", "https://drive.google.com/file/d/1MVwR2-uWqU9l-ooO9y2hHrSFR4CzZhmf/view?usp=sharing"],
  ["Academic Calendar 2026-27", "https://drive.google.com/file/d/1r_7rhnhTr_CgCREBr6xuzBU9kedOmIPw/view?usp=drive_link"],
].map(([title, href], index) => ({ id: `legacy-download-${index}`, title, href, type: "general_download", displayOrder: index, placements: ["downloads"] }));
