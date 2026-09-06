import { CalendarDays, Clock, PartyPopper, Info } from "lucide-react";
import type { CalendarDTO, ContentSource } from "@/cms/public/dto";
import { contentForSource } from "@/cms/public/content-source";

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
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-600">
      {children}
    </h4>
  );
}

/** Two-column data table matching the school calendar layout. */
function DataTable({
  rows,
  headers,
  labelClassName = "font-semibold text-ink-900",
}: {
  rows: readonly Row[];
  headers?: [string, string];
  labelClassName?: string;
}) {
  return (
    <div className="overflow-hidden border border-line-200">
      <table className="w-full text-left text-sm">
        {headers && (
          <thead>
            <tr className="bg-teal-900">
              <th className="w-1/2 px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                {headers[0]}
              </th>
              <th className="w-1/2 border-l border-white/20 px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                {headers[1]}
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.label}-${row.value}`}
              className={`border-t border-line-200 first:border-t-0 ${
                row.emphasis ? "bg-yellow-600/[0.12]" : "odd:bg-canvas-50"
              }`}
            >
              <td
                className={`w-1/2 px-5 py-3 ${
                  row.emphasis ? "font-bold text-ink-900" : labelClassName
                }`}
              >
                {row.label}
              </td>
              <td
                className={`w-1/2 border-l border-line-200 px-5 py-3 ${
                  row.emphasis ? "font-bold text-ink-900" : "text-ink-700"
                }`}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Teal section heading with icon. */
function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center bg-teal-800/10">
        <Icon className="size-[18px] text-teal-800" strokeWidth={1.8} />
      </span>
      <h3 className="font-display text-xl uppercase text-teal-800 md:text-2xl">{children}</h3>
    </div>
  );
}

export function SchoolCalendarTab({ data, source = 'legacy' }: { data?: CalendarDTO | null; source?: ContentSource }) {
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
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">
        {source === 'managed' ? data?.heading ?? "School Calendar" : "School Calendar"}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-ink-600">
        {(source === 'managed' && data?.introduction) || "Academic year 2026–27 — term breaks, examinations, parent meetings, the daily timetable and public holidays."}
      </p>

      {/* ============ IMPORTANT DATES TO REMEMBER ============ */}
      <div className="mt-12">
        <SectionHeading icon={CalendarDays}>Important Dates to Remember</SectionHeading>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {/* Terms and term breaks */}
          <div>
            <GroupLabel>Terms and Term Breaks</GroupLabel>
            <div className="mt-3">
              <DataTable rows={visibleTermBreaks} />
            </div>
          </div>

          {/* Examination timetable */}
          <div>
            <GroupLabel>Examination Timetable for Classes I to X</GroupLabel>
            <div className="mt-3">
              <DataTable
                rows={visibleAssessments}
                headers={["Exam", "Date"]}
                labelClassName="text-ink-900"
              />
            </div>
          </div>

          {/* Orientation meeting — Class X */}
          <div>
            <GroupLabel>Orientation Meeting for Parents (Class X)</GroupLabel>
            <div className="mt-3">
              <DataTable rows={visibleGradeXMeetings} />
            </div>
          </div>

          {/* Report meeting — KG to Class IX */}
          <div>
            <GroupLabel>Report Meeting for Parents (KG to Class IX)</GroupLabel>
            <div className="mt-3">
              <DataTable rows={visibleReportMeetings} />
            </div>
          </div>
        </div>

        {/* Special days for parents */}
        <div className="mt-10">
          <GroupLabel>Special Days for Parents</GroupLabel>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-700">
            We invite the family members of our students to Apollo Vidhyalayam on these special
            occasions for a day of celebration and connection:
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleSpecialDays.map((day) => (
              <div
                key={day.name}
                className="border border-line-200 bg-canvas-50 px-5 py-5 text-center"
              >
                <PartyPopper className="mx-auto size-5 text-yellow-600" strokeWidth={1.8} />
                <p className="mt-3 text-sm font-bold uppercase tracking-wide text-ink-900">
                  {day.name}
                </p>
                <p className="mt-1 text-xs text-ink-700">{day.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ DAILY SCHEDULE ============ */}
      <div className="mt-16">
        <SectionHeading icon={Clock}>Daily Schedule</SectionHeading>
        <div className="mt-8 max-w-3xl">
          <DataTable
            rows={visibleDailySchedule}
            headers={["Time", "KG to Class X"]}
            labelClassName="text-ink-700"
          />
        </div>
      </div>

      {/* ============ PUBLIC HOLIDAYS ============ */}
      <div className="mt-16">
        <SectionHeading icon={CalendarDays}>Public Holidays | 2026 &ndash; 2027</SectionHeading>
        <div className="mt-8 max-w-3xl">
          <DataTable
            rows={visiblePublicHolidays}
            headers={["Date", "Holiday"]}
            labelClassName="text-ink-700"
          />

          {/* Footnote */}
          <div className="mt-4 flex gap-3 bg-yellow-600/[0.14]">
            <span aria-hidden="true" className="w-1 shrink-0 bg-yellow-600" />
            <p className="flex items-start gap-2 py-3 pr-4 text-xs font-semibold text-ink-900">
              <Info className="mt-px size-4 shrink-0 text-yellow-600" />
              School will also be closed on days declared as holidays by the Government of Andhra
              Pradesh.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
