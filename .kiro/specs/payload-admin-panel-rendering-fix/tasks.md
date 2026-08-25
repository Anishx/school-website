# Implementation Plan: Payload Admin Panel Rendering Fix

## Overview

This plan applies the official Next.js route-group root-layout architecture, Payload CSS and generated import-map ownership, admissions regression correction, automated validation, and browser verification. Every implementation step is limited to coding or testing work.

### Execution Rules

- Execute tasks in dependency order; do not implement deployment, commits, secrets, database credential changes, or unrelated redesign.
- Run all commands from `C:\Users\Aneesh\Documents\Code\github\frontend`.
- The admin rendering defect is already established; do not add a separate exploratory expected-failure task.
- Use existing environment configuration. Never write credential values into source, tests, logs, or this spec.
- Start `npm run dev` manually for browser checks; do not run a development server or watcher as a blocking task command.

## Tasks

- [x] 1. Establish independent route-group root layouts
  - **Depends on:** None
  - **Files:** delete `src/app/layout.tsx`; modify `src/app/(frontend)/layout.tsx`
  - Move the `Metadata` import and existing title/description export from `src/app/layout.tsx` into `src/app/(frontend)/layout.tsx`.
  - Change `src/app/(frontend)/layout.tsx` from a `<div>` wrapper to the complete public root document with `<html lang="en" suppressHydrationWarning>` and one `<body suppressHydrationWarning>`.
  - Preserve `../globals.css`, Anton/Poppins font setup, the existing public layout classes, `children`, and `SiteFooter`; place the font variables and flex/min-height behavior on the body or an equivalent single inner wrapper without changing visible public design.
  - Delete `src/app/layout.tsx` only after the frontend root has all metadata and document responsibilities.
  - Confirm `src/app/(frontend)/page.tsx` remains the `/` route and no other frontend page emits `<html>` or `<body>`.
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 4.1, 4.3_

- [x] 2. Load Payload styling from the Payload root
  - **Depends on:** Task 1
  - **File:** `src/app/(payload)/layout.tsx`
  - Add `import "@payloadcms/next/css";` before `import "./custom.scss";` so Payload 3.88.0 base styles load before local overrides.
  - Keep `RootLayout`, `config`, `importMap`, and `serverFunction` wiring intact.
  - Keep Payload `RootLayout` as the only document owner for this route group; do not add manual `<html>`, `<head>`, or `<body>` elements.
  - Confirm `src/app/(payload)/custom.scss` remains loaded after the package CSS.
  - _Requirements: 1.4, 2.1, 3.1, 3.2, 3.3, 3.4_

- [x] 3. Replace the shadowing manual import map with Payload generation
  - **Depends on:** Task 2
  - **Files:** modify `package.json`; delete `src/app/(payload)/admin/importMap.ts`; generate `src/app/(payload)/admin/importMap.js`
  - Add the exact script `"generate:importmap": "payload generate:importmap"` under `package.json` `scripts`.
  - Delete the hand-written `src/app/(payload)/admin/importMap.ts` that exports `{}`; do not hand-edit a replacement map.
  - Run `npm run generate:importmap`; verify Payload reports `src/app/(payload)/admin/importMap.js` as the output and the file includes the entries required by `src/payload.config.ts` (currently including the Payload `CollectionCards` entry).
  - Run `npm run generate:importmap` a second time and confirm it is idempotent (no unexpected content churn).
  - Confirm extensionless imports in `src/app/(payload)/layout.tsx`, `src/app/(payload)/admin/serverFunction.ts`, `src/app/(payload)/admin/[[...segments]]/page.tsx`, and `src/app/(payload)/admin/[[...segments]]/not-found.tsx` resolve the generated `.js` module; update those paths only if diagnostics/build prove an explicit `.js` suffix is required.
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 6.2_
- [x] 4. Correct the public admissions request mapping
  - **Depends on:** Task 1
  - **File:** `src/app/(frontend)/apply/page.tsx`
  - In `handleSubmit`, replace the request key `parentPhone` with `contactNumber` while retaining `form.contactNumber` as its value.
  - Compare every other request key in the same object with the `admissions` fields in `src/payload.config.ts`; correct only demonstrated naming/type mismatches and leave form labels, styling, and success/error UX unchanged.
  - Verify the final request includes required `studentName`, `grade`, `dateOfBirth`, `gender`, `fatherName`, `motherName`, `contactNumber`, and `address` keys.
  - _Bug_Condition: the public form currently emits `parentPhone`, which cannot satisfy required collection field `contactNumber`._
  - _Expected_Behavior: a schema-valid public request uses collection field names and can be created anonymously._
  - _Preservation: invalid payload validation and unrelated form behavior remain unchanged._
  - _Requirements: 5.1, 5.4_

- [x] 5. Add repeatable route and browser regression coverage
  - **Depends on:** Tasks 1, 2, 3, and 4
  - **Files:** modify `package.json` and `package-lock.json`; create `playwright.config.ts`, `tests/payload-admin-rendering.spec.ts`, and `tests/admissions-post.spec.ts`
  - Install exact dev dependency `@playwright/test@1.51.1` so both package manifests record a pinned version; add `"test:e2e": "playwright test"` and `"test:e2e:chromium": "playwright test --project=chromium"` scripts.
  - Configure `playwright.config.ts` with a Chromium project and `baseURL` from `PLAYWRIGHT_BASE_URL`, defaulting to `http://127.0.0.1:3000`; do not embed or log credentials and do not configure an automatically blocking dev-server process.
  - In `tests/payload-admin-rendering.spec.ts`, request `/admin/login` and `/admin/create-first-user`; accept only the documented existing-user redirect for the latter, otherwise inspect the rendered first-user form.
  - For each rendered admin page, assert one `html`, one `body`, no browser console/page errors containing nested-document or hydration-mismatch indicators, and loaded CSS rules/computed styles that distinguish Payload controls from unstyled native controls.
  - Add authenticated dashboard and admissions collection-form checks using only runtime-provided `PAYLOAD_TEST_ADMIN_EMAIL` and `PAYLOAD_TEST_ADMIN_PASSWORD`; exercise a navigation item, dropdown, select, form field, and action button without placing credential values in the repository.
  - Add public smoke cases for `/`, `/apply`, and `/admissions`; assert successful rendering plus visible public content/footer and verify fonts/global classes are applied.
  - In `tests/admissions-post.spec.ts`, use Playwright's request context without cookies to post a synthetic, schema-valid payload to `/api/admissions`; include `contactNumber`, omit `parentPhone`, assert a successful create status/body, and record only non-sensitive test identifiers.
  - Add an invalid anonymous POST case missing one required field and assert a validation failure rather than creation.
  - Install the Chromium test browser once with `npx playwright install chromium` if it is not already present; this is a local test prerequisite, not an application runtime dependency.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 5.4, 6.5, 6.6, 6.7_

- [x] 6. Resolve an admissions access mismatch only if the anonymous regression proves one
  - **Depends on:** Task 5's unauthenticated POST test
  - **File:** conditionally modify `src/payload.config.ts`; update `tests/admissions-post.spec.ts`
  - Run only the admissions POST test against the fixed mapping and classify any failure from status/body as schema validation, authorization, infrastructure, or another cause.
  - If the valid request succeeds, make no access-control change and mark this task complete with the successful response status.
  - If the valid request receives an authorization failure, add the narrow `admissions` collection access rule required to allow anonymous `create`; do not change users access or admissions read/update/delete behavior.
  - Add assertions proving anonymous valid create succeeds and invalid create remains rejected. If an access rule was changed, add checks demonstrating unrelated collection operations were not made public by that change.
  - Re-run `tests/admissions-post.spec.ts` after any edit and retain the response classification in the test output without logging submitted personal data or environment values.
  - _Requirements: 3.3, 5.2, 5.3, 5.4_
- [ ] 7. Run generated-asset, diagnostics, lint, build, and automated regression gates
  - **Depends on:** Tasks 1 through 6
  - **Files checked:** `src/app/(frontend)/layout.tsx`, `src/app/(frontend)/apply/page.tsx`, `src/app/(payload)/layout.tsx`, `src/app/(payload)/admin/importMap.js`, `src/app/(payload)/admin/serverFunction.ts`, `src/app/(payload)/admin/[[...segments]]/page.tsx`, `src/app/(payload)/admin/[[...segments]]/not-found.tsx`, `src/payload.config.ts` if changed, `package.json`, `package-lock.json`, `playwright.config.ts`, and `tests/*.spec.ts`
  - Run `npm run generate:importmap` and inspect the generated diff before other gates.
  - Run IDE diagnostics on every changed source/config/test file and resolve all new type, import-resolution, stylesheet, JSON, and Next.js route errors.
  - Run `npm run lint` and fix all failures introduced by this work.
  - Run `npm run build` with the existing local environment; do not alter secret values or database credentials to force success.
  - With `npm run dev` started manually in a separate terminal, run `npm run test:e2e:chromium` as a single non-watch execution.
  - If authenticated test environment variables are unavailable, run unauthenticated route/API cases and record authenticated browser coverage as pending for Task 8 rather than adding credentials to files.
  - _Requirements: 2.4, 2.5, 2.6, 5.2, 6.1, 6.2, 6.3, 6.4, 6.6, 6.7_

- [ ] 8. Complete browser verification of admin and public routes
  - **Depends on:** Task 7 passes and `npm run dev` is running manually
  - **Files:** no source changes expected; if a defect is found, modify only the exact source/test file associated with the failed requirement and repeat Task 7
  - Open `/admin/login`; verify Payload typography, spacing, inputs, and buttons, then confirm the DOM has one `html` and one `body` and the console has no nested-document or hydration errors.
  - Open `/admin/create-first-user`; when available, verify the full form, role dropdown/select, and Create button styling/interaction. If an admin already exists, verify the expected redirect and repeat the control inspection on `/admin/login`.
  - Sign in using locally supplied credentials that are never copied into source or evidence; inspect the dashboard and an admissions collection form, then exercise navigation, dropdowns, selects, inputs, and action buttons.
  - Open `/`, `/apply`, and `/admissions`; verify existing global styling, Anton/Poppins usage, metadata, content, navigation, and footer remain intact.
  - Submit one synthetic valid `/apply` payload without an authenticated admin session and verify the success UI plus successful `POST /api/admissions`; submit or invoke one invalid payload and verify validation failure.
  - Record a concise verification matrix containing route, status/redirect, document counts, control/style outcome, console outcome, and admissions response class. Do not include credentials, tokens, cookies, secret values, database URLs, or personal data.
  - If any check fails, return to the owning task: Task 1 for document ownership/public root, Task 2 for CSS, Task 3 for import resolution, Task 4 for field mapping, Task 6 for demonstrated access failure, or Task 5 for test defects.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.2, 5.3, 6.5, 6.6, 6.7_

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2", "4"] },
    { "wave": 3, "tasks": ["3"] },
    { "wave": 4, "tasks": ["5"] },
    { "wave": 5, "tasks": ["6"] },
    { "wave": 6, "tasks": ["7"] },
    { "wave": 7, "tasks": ["8"] }
  ]
}
```

- Task 4 may proceed in parallel with Tasks 2-3 after Task 1.
- Task 6 changes `src/payload.config.ts` only when Task 5 proves authorization is the failure cause.
- Task 8 requires a manually started local server after Task 7 passes.

## Notes

- Use the installed Next.js 16.2.7 and Payload 3.88.0 APIs and generated artifacts.
- Write no exploration test for the already-established admin rendering bug.
- Keep all evidence free of credentials, tokens, cookies, personal data, database URLs, and secret values.
- Do not add deployment, commit, database credential, or unrelated redesign work.