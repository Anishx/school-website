# Design Document

## Overview

This design covers the implementation of content updates to the Apollo Vidhyalayam school website. The changes involve removing obsolete pages/sections (Programs page, Fee Structure, Circulars tab, Newsletter tab), updating admission age criteria (+1 year for all grades), and replacing the required documents list. All changes are limited to the Next.js frontend — no backend or API changes are needed.

## Architecture

The website is a Next.js App Router application using the `(frontend)` route group. Content is defined as static data arrays within page components and a centralized navigation configuration. The architecture for these changes follows the existing pattern:

```
src/
├── components/
│   └── nav-config.ts          # Central navigation configuration
├── app/(frontend)/
│   ├── admissions/page.tsx    # Admissions page (modify)
│   ├── news-events/page.tsx   # Resources page (modify)
│   └── programs/page.tsx      # Programs page (delete)
└── components/
    └── programs-list-section.tsx  # Programs support component (delete)
```

### Change Strategy

All changes are **subtractive or data-replacement** — no new components, routes, or architectural patterns are introduced.

## Components and Interfaces

### Navigation Config (`src/components/nav-config.ts`)

**Changes:**
- Remove `{ title: "Programs", href: "/programs" }` from the Admissions dropdown `compact` array
- Remove `{ title: "Fee Structure", href: "/admissions#fee-structure" }` from the Admissions dropdown `compact` array
- Remove `{ title: "Circulars", href: "/news-events?tab=circulars" }` from the Resources dropdown `compact` array
- Remove `{ title: "Newsletter", href: "/news-events?tab=newsletter" }` from the Resources dropdown `compact` array

**Result — Admissions dropdown:**
```typescript
{
  title: "Admissions",
  compact: [
    { title: "Why Us", href: "/why-us" },
    { title: "Admission Process", href: "/admissions" },
  ],
}
```

**Result — Resources dropdown:**
```typescript
{
  title: "Resources",
  compact: [
    { title: "Latest News", href: "/news-events?tab=latest" },
    { title: "Announcements", href: "/news-events?tab=announcements" },
    { title: "Holiday List", href: "/news-events?tab=holidays" },
    { title: "Downloads", href: "/news-events?tab=downloads" },
  ],
}
```

### Resources Page (`src/app/(frontend)/news-events/page.tsx`)

**Changes:**
- Remove "Circulars" and "Newsletter" from the `tabList` array
- Remove corresponding entries from the `tabMap` object
- Remove `CircularsTab` and `NewsletterTab` component functions
- Update tab index references so remaining tabs map correctly:
  - `0` → Latest News
  - `1` → Announcements
  - `2` → Holiday List
  - `3` → Downloads
- Update the `tabMap` object:
  ```typescript
  const tabMap: Record<string, number> = {
    latest: 0,
    announcements: 1,
    holidays: 2,
    downloads: 3,
  };
  ```
- Fallback behavior: any unrecognized `tab` param (including the now-removed `circulars` and `newsletter`) defaults to index `0` (Latest News) — this is already handled by the existing logic `tabParam && tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0`

### Admissions Page (`src/app/(frontend)/admissions/page.tsx`)

**Changes:**

1. **Remove Fee Structure section** — Delete the `feeStructure` data array and the entire `<section>` rendering fee category cards.

2. **Update age criteria** — Replace the `ageCriteria` array with +1 year values:
   ```typescript
   const ageCriteria = [
     { class: "Pre-LKG", age: "3+ years" },
     { class: "LKG", age: "4+ years" },
     { class: "UKG", age: "5+ years" },
     { class: "Grade I", age: "6+ years" },
     { class: "Grade II", age: "7+ years" },
     { class: "Grade III", age: "8+ years" },
     { class: "Grade IV", age: "9+ years" },
     { class: "Grade V", age: "10+ years" },
     { class: "Grade VI", age: "11+ years" },
     { class: "Grade VII", age: "12+ years" },
     { class: "Grade VIII", age: "13+ years" },
     { class: "Grade IX", age: "14+ years" },
     { class: "Grade X", age: "15+ years" },
   ];
   ```

3. **Replace documents list** — Replace the `documents` array with the 7 new items:
   ```typescript
   const documents = [
     "Birth Certificate",
     "Transfer Certificate",
     "Aadhaar Card (Student & Parents)",
     "Mark Sheet",
     "4 Photographs",
     "Mother's Bank Passbook",
     "Caste Certificate",
   ];
   ```

### Programs Page & Component Deletion

**Files to delete:**
- `src/app/(frontend)/programs/page.tsx` — Removes the `/programs` route entirely. Next.js will serve a 404 for any request to `/programs`.
- `src/components/programs-list-section.tsx` — Only imported by the Programs page; no other references exist in the codebase.

### Interfaces

No new interfaces or API contracts are introduced. All changes operate on existing static TypeScript data structures:

- `navItems: NavItem[]` — Navigation configuration array (existing type)
- `ageCriteria: { class: string; age: string }[]` — Inline data array (no named type)
- `documents: string[]` — Simple string array
- `tabList: string[]` — Tab label array
- `tabMap: Record<string, number>` — URL param to tab index mapping

## Data Models

No database or external data source changes. All data is hardcoded in component files:

| Data | Current | Updated |
|------|---------|---------|
| Age criteria | 12 entries (3+ to 14+) | 12 entries (4+ to 15+) |
| Documents | 5 items | 7 items |
| Tab list | 6 tabs | 4 tabs |
| Nav — Admissions | 4 links | 2 links |
| Nav — Resources | 6 links | 4 links |

## Error Handling

- **Invalid tab params**: The existing fallback logic (`tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0`) handles removed tab names gracefully by defaulting to tab 0 (Latest News). No additional error handling needed.
- **Removed route (`/programs`)**: Next.js App Router automatically returns a 404 for routes without a matching `page.tsx`. No custom error handling required.
- **Broken internal links**: The navigation config changes ensure no internal links point to removed content. The `#fee-structure` anchor link is removed from nav config.

## Testing Strategy

This feature is primarily a content removal and data update task. Testing focuses on verifying the absence of removed content, correctness of updated data, and proper fallback behavior.

**Unit tests (example-based):**
- Verify the navigation config does not contain links to removed pages/sections
- Verify the Resources page renders exactly 4 tabs (Latest News, Announcements, Holiday List, Downloads)
- Verify the Admissions page does not render a Fee Structure section
- Verify the required documents list contains exactly 7 items in the correct order
- Verify the age criteria array has exactly 12 entries with correct values
- Verify old documents are not present in the rendered output

**Integration/smoke tests:**
- Verify `/programs` route returns 404
- Verify removed tab params (`circulars`, `newsletter`) default to the first tab

**Property-based tests:**
- Validate age criteria values follow the expected formula across all entries
- Validate no navigation link references any removed route
- Validate tab fallback behavior for arbitrary unknown tab parameter strings

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Age criteria increment consistency

*For any* grade entry in the admission age criteria array at index `i`, the minimum age value shall equal `i + 4` (yielding LKG=4+, UKG=5+, Grade I=6+, ... Grade X=15+), ensuring the +1 year increment was applied uniformly across all 12 grades.

**Validates: Requirements 5.1, 5.2**

### Property 2: Navigation config excludes removed content

*For any* navigation item in the `navItems` configuration, no `compact` link shall reference the paths `/programs`, `/admissions#fee-structure`, `/news-events?tab=circulars`, or `/news-events?tab=newsletter`.

**Validates: Requirements 1.3, 2.3, 3.2, 4.2**

### Property 3: Tab fallback for unknown parameters

*For any* string value passed as the `tab` query parameter that is not in the set `{latest, announcements, holidays, downloads}`, the Resources page shall resolve to tab index 0 (Latest News).

**Validates: Requirements 1.2, 2.2**
