import type { CalendarDTO, ContentSource } from "./dto";
import { contentForSource } from "./content-source";

type Row = { label: string; value: string; emphasis?: boolean };

const termBreaks: Row[] = [
  { label: "Dasara Holidays", value: "October 10th – 20th, 2026" },
  { label: "Pongal Holidays", value: "January 9th – 17th, 2027" },
  { label: "School Reopen (2027–2028)", value: "June 12th, 2027" },
];

const examTimetable: Row[] = [
  { label: "Formative Assessment 1", value: "July 27th, 2026" },
  { label: "Formative Assessment 2", value: "September 28th, 2026" },
  { label: "Summative Assessment 1", value: "November 2nd, 2026" },
  { label: "Formative Assessment 3", value: "December 28th, 2026" },
  { label: "Formative Assessment 4", value: "February 15th, 2027" },
  { label: "Summative Assessment 2", value: "April 13th, 2027" },
];

const orientationClassX: Row[] = [
  { label: "Grade X – PTM 1", value: "June 1st, 2026" },
  { label: "Grade X – PTM 2", value: "October 8th, 2026" },
  { label: "Grade X – PTM 3", value: "January 2nd, 2027" },
];

const reportMeetings: Row[] = [
  { label: "KG to Grade IX – PTM 1", value: "October 8th, 2026" },
  { label: "KG to Grade IX – PTM 2", value: "January 8th, 2027" },
  { label: "KG to Grade IX – PTM 3", value: "April 23rd, 2027" },
];

const specialDays = [
  { name: "Father's Day", date: "June 20th, 2026" },
  { name: "Grandparents' Day", date: "January 25th, 2027" },
  { name: "Dasara Celebration", date: "October 7th, 2026" },
  { name: "Women's Day", date: "March 8th, 2027" },
];

const dailySchedule: Row[] = [
  { label: "09:00 – 09:20 AM", value: "Assembly" },
  { label: "09:20 – 10:00 AM", value: "1st Period" },
  { label: "10:00 – 10:40 AM", value: "2nd Period" },
  { label: "10:40 – 10:50 AM", value: "Break", emphasis: true },
  { label: "10:50 – 11:30 AM", value: "3rd Period" },
  { label: "11:30 AM – 12:10 PM", value: "4th Period" },
  { label: "12:10 – 12:50 PM", value: "5th Period" },
  { label: "12:50 – 01:20 PM", value: "Lunch Break", emphasis: true },
  { label: "01:20 – 02:00 PM", value: "6th Period" },
  { label: "02:00 – 02:40 PM", value: "7th Period" },
  { label: "02:40 – 02:50 PM", value: "Break", emphasis: true },
  { label: "02:50 – 03:30 PM", value: "8th Period" },
  { label: "03:30 – 04:10 PM", value: "9th Period" },
];

const publicHolidays: Row[] = [
  { label: "26th June, 2026", value: "Moharam" },
  { label: "26th August, 2026", value: "Milad-un-Nabi" },
  { label: "28th August, 2026", value: "Varalakshmi Vratam" },
  { label: "4th September, 2026", value: "Krishna Jayanti" },
  { label: "14th September, 2026", value: "Vinaya Chaviti" },
  { label: "2nd October, 2026", value: "Gandhi Jayanti" },
  { label: "20th October, 2026", value: "Vijaya Dasami" },
  { label: "9th November, 2026", value: "Diwali" },
  { label: "25th December, 2026", value: "Christmas" },
  { label: "15th January, 2027", value: "Sankranthi" },
  { label: "26th January, 2027", value: "Republic Day" },
  { label: "6th March, 2027", value: "Maha Shivratri" },
  { label: "26th March, 2027", value: "Good Friday" },
  { label: "7th April, 2027", value: "Ugadi" },
];

/** Yellow sub-heading used above each table group. */
export function calendarContent(data: CalendarDTO | null | undefined, source: ContentSource) {
  const rowsForSource = (legacy: readonly Row[], managed: readonly Row[] = []) =>
    contentForSource(source, legacy, managed, (row) => row.label);
  const visibleTermBreaks = rowsForSource(termBreaks, data?.termBreaks);
  const visibleAssessments = rowsForSource(examTimetable, data?.assessments);
  const visibleGradeXMeetings = rowsForSource(orientationClassX, data?.gradeXMeetings);
  const visibleReportMeetings = rowsForSource(reportMeetings, data?.reportMeetings);
  const visibleSpecialDays = rowsForSource(specialDays.map((day) => ({ label: day.name, value: day.date })), data?.specialDays)
    .map((row) => ({ name: row.label, date: row.value }));
  const visibleDailySchedule = rowsForSource(dailySchedule, data?.dailySchedule);
  const visiblePublicHolidays = rowsForSource(publicHolidays, data?.publicHolidays);
  return { visibleTermBreaks, visibleAssessments, visibleGradeXMeetings, visibleReportMeetings, visibleSpecialDays, visibleDailySchedule, visiblePublicHolidays };
}
