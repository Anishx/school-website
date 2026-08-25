# Implementation Plan: School Website Content Updates

## Overview

Subtractive content changes to the Apollo Vidhyalayam frontend: remove obsolete navigation links, tabs, pages, and sections; update admission age criteria (+1 year); replace the required documents list. All changes are to static TypeScript data and JSX — no backend or API modifications.

## Tasks

- [x] 1. Update navigation configuration
  - [x] 1.1 Remove obsolete links from nav-config.ts
    - In `src/components/nav-config.ts`, remove `{ title: "Programs", href: "/programs" }` and `{ title: "Fee Structure", href: "/admissions#fee-structure" }` from the Admissions `compact` array
    - Remove `{ title: "Circulars", href: "/news-events?tab=circulars" }` and `{ title: "Newsletter", href: "/news-events?tab=newsletter" }` from the Resources `compact` array
    - _Requirements: 1.3, 2.3, 3.2, 4.2_

  - [ ]* 1.2 Write property test for navigation config exclusions
    - **Property 2: Navigation config excludes removed content**
    - Verify that no `compact` link in `navItems` references `/programs`, `/admissions#fee-structure`, `/news-events?tab=circulars`, or `/news-events?tab=newsletter`
    - **Validates: Requirements 1.3, 2.3, 3.2, 4.2**

- [x] 2. Update Resources (news-events) page
  - [x] 2.1 Remove Circulars and Newsletter tabs from the Resources page
    - In `src/app/(frontend)/news-events/page.tsx`, remove "Circulars" and "Newsletter" from the `tabList` array
    - Update `tabMap` to: `{ latest: 0, announcements: 1, holidays: 2, downloads: 3 }`
    - Remove the `CircularsTab` and `NewsletterTab` component functions
    - Update tab content rendering to match new indices (0=LatestNews, 1=Announcements, 2=HolidayList, 3=Downloads)
    - Ensure unrecognized `tab` params (including `circulars`, `newsletter`) default to index 0
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ]* 2.2 Write property test for tab fallback behavior
    - **Property 3: Tab fallback for unknown parameters**
    - For any string not in `{latest, announcements, holidays, downloads}`, the resolved tab index shall be 0
    - **Validates: Requirements 1.2, 2.2**

- [x] 3. Update Admissions page
  - [x] 3.1 Remove Fee Structure section from Admissions page
    - In `src/app/(frontend)/admissions/page.tsx`, delete the `feeStructure` data array
    - Delete the entire Fee Structure `<section>` block (heading, cards, and italic note)
    - _Requirements: 4.1_

  - [x] 3.2 Update admission age criteria (+1 year)
    - Replace the `ageCriteria` array with updated values: LKG=4+, UKG=5+, Grade I=6+, Grade II=7+, Grade III=8+, Grade IV=9+, Grade V=10+, Grade VI=11+, Grade VII=12+, Grade VIII=13+, Grade IX=14+, Grade X=15+
    - Ensure the array retains exactly 12 entries
    - _Requirements: 5.1, 5.2_

  - [x] 3.3 Replace required documents list
    - Replace the `documents` array with the 7 new items: Birth Certificate, Transfer Certificate, Aadhaar Card (Student & Parents), Mark Sheet, 4 Photographs, Mother's Bank Passbook, Caste Certificate
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 3.4 Write property test for age criteria consistency
    - **Property 1: Age criteria increment consistency**
    - For each entry at index `i`, verify the minimum age equals `i + 4` (LKG=4, UKG=5, ..., Grade X=15)
    - **Validates: Requirements 5.1, 5.2**

- [x] 4. Checkpoint - Verify navigation and page updates
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Delete Programs page and support component
  - [x] 5.1 Delete the Programs page and its support component
    - Delete `src/app/(frontend)/programs/page.tsx` to remove the `/programs` route
    - Delete `src/components/programs-list-section.tsx` (only imported by the Programs page)
    - Verify no other files import from these deleted files
    - _Requirements: 3.1, 3.3_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- All changes are subtractive or data-replacement — no new components or routes are introduced
- Next.js App Router automatically serves 404 for deleted routes, so no custom error handling is needed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "3.2", "3.3"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.4", "5.1"] },
    { "id": 2, "tasks": [] }
  ]
}
```
