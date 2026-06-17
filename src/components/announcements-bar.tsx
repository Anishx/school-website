"use client";

const announcements = [
  "Admissions Open for 2025-26 Academic Year",
  "Annual Day Celebrations on March 15th",
  "Smart Classrooms Now Live in All Grades",
  "Brighter Minds Program Starting Next Month",
  "Sports Championships — State Level Qualifiers",
];

export function AnnouncementsBar() {
  return (
    <div className="overflow-hidden bg-teal-900 py-1.5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...announcements, ...announcements].map((text, i) => (
          <span key={i} className="mx-4 inline-flex items-center text-xs font-medium text-white/90">
            <span className="mr-3 inline-block h-1.5 w-1.5 shrink-0 bg-yellow-500" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
