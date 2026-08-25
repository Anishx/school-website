# Payload Admin Panel Rendering Fix Design

## Overview

The fix separates the public website and Payload application into two Next.js root layouts. `src/app/layout.tsx` is removed; `src/app/(frontend)/layout.tsx` becomes a complete public root document, while `src/app/(payload)/layout.tsx` remains a complete Payload root through `@payloadcms/next/layouts` `RootLayout`. This follows the multiple-root-layout behavior documented by the installed Next.js 16.2.7 package and eliminates nested `<html>/<body>` output.

The Payload root will load the stylesheet exported by the installed `@payloadcms/next` 3.88.0 package. Payload's installed CLI will own `src/app/(payload)/admin/importMap.js`; the manually empty `importMap.ts` will be removed so extensionless consumers cannot resolve the wrong map. The public admissions request mapping will be corrected and its unauthenticated create behavior regression-tested.

No deployment, source-control, secret, database credential, or unrelated design work is part of this design.

## Glossary

- **Bug_Condition (C)**: An admin request is rendered through both `src/app/layout.tsx` and Payload `RootLayout`, or it lacks Payload's base CSS/generated component map.
- **Property (P)**: Admin routes have one document owner, hydrate without layout errors, load Payload styling, and retain functional controls.
- **Preservation**: Public routes, Payload API mounts, custom admin overrides, metadata, fonts, footer behavior, and invalid-admissions validation remain unchanged.
- **Frontend_Root**: `src/app/(frontend)/layout.tsx` after it becomes a document-level root layout.
- **Payload_Root**: `src/app/(payload)/layout.tsx`, which delegates document-level markup to Payload `RootLayout`.
- **Generated_Import_Map**: `src/app/(payload)/admin/importMap.js` generated from `src/payload.config.ts`.
- **Admissions_POST**: Anonymous `POST /api/admissions` from `src/app/(frontend)/apply/page.tsx`.

## Bug Details

### Bug Condition

Browser logs and the supplied screenshot already establish the defect; implementation does not require a separate exploratory test phase.

**Formal Specification:**

```text
FUNCTION isBugCondition(request, renderedPage)
  INPUT: request of type RouteRequest
  INPUT: renderedPage of type RenderedDocument
  OUTPUT: boolean

  RETURN request.path STARTS_WITH "/admin"
         AND (
           renderedPage.htmlElementCount > 1
           OR renderedPage.bodyElementCount > 1
           OR renderedPage.console CONTAINS layoutHydrationMismatch
           OR NOT renderedPage.stylesheets CONTAINS Payload_CSS
           OR renderedPage.importMapSource = "manual-empty-map"
         )
END FUNCTION
```

### Confirmed Manifestations

- `/admin/create-first-user` displays native-looking inputs, an oversized/broken select, incorrect vertical spacing, and a distant Create button.
- Browser diagnostics report an `<html>` nested under `<body>` and a hydration mismatch.
- `src/app/layout.tsx` emits `<html>/<body>` around `src/app/(payload)/layout.tsx`; Payload `RootLayout` also emits the document.
- `src/app/(payload)/admin/importMap.ts` exports `{}` while the CLI-generated `importMap.js` contains Payload component entries.
- `/apply` posts `parentPhone`, but `src/payload.config.ts` requires `contactNumber`.
## Expected Behavior

### Expected-Behavior Function

```text
FUNCTION expectedBehavior(request, renderedPage, response)
  INPUT: request of type RouteRequest
  INPUT: renderedPage of type RenderedDocument
  INPUT: response of type RouteResponse
  OUTPUT: boolean

  IF request.path STARTS_WITH "/admin" THEN
    RETURN renderedPage.htmlElementCount = 1
           AND renderedPage.bodyElementCount = 1
           AND renderedPage.stylesheets CONTAINS Payload_CSS
           AND renderedPage.console EXCLUDES layoutHydrationMismatch
           AND allVisibleAdminControlsAreStyledAndOperable(renderedPage)
  END IF

  IF request.method = "POST" AND request.path = "/api/admissions" THEN
    RETURN request.isAuthenticated = false
           AND request.body.contactNumber IS VALID
           AND response.indicatesCreatedRecord = true
  END IF

  RETURN behaviorMatchesBaseline(request, renderedPage, response)
END FUNCTION
```

### Preservation Requirements

**Unchanged behaviors:**

- `src/app/(frontend)/page.tsx` continues to own `/`, and public routes retain `src/app/globals.css`, metadata, Anton/Poppins variables, layout classes, children, and `SiteFooter`.
- `src/app/(payload)/api/[...slug]/route.ts` and `src/app/(payload)/api/graphql/route.ts` continue to expose the existing Payload handlers.
- `src/app/(payload)/custom.scss` remains available for intentional admin overrides and loads after Payload's base stylesheet.
- Invalid admissions payloads remain rejected by the collection schema.
- Access for admissions read/update/delete and all unrelated collections is not broadened.
- Existing page content and public visual design are not changed.

**Scope:** Inputs outside admin document composition, Payload asset loading, import-map resolution, and the demonstrated admissions submission mismatch must remain unaffected.

## Hypothesized Root Cause

The first three causes are confirmed by repository and installed-package inspection; the access branch remains conditional on regression results.

1. **Competing document owners (confirmed)**
   - `src/app/layout.tsx` is a root layout and emits `<html>/<body>`.
   - `src/app/(payload)/layout.tsx` invokes Payload `RootLayout`, which emits its own document.
   - The installed Next.js 16.2.7 docs specify omitting the top-level layout when route-group layouts must each be roots.

2. **Missing Payload base stylesheet (confirmed)**
   - The Payload layout imports only `custom.scss`, which is effectively empty.
   - Installed `@payloadcms/next` 3.88.0 exports its production stylesheet at `@payloadcms/next/css`.

3. **Shadowed generated import map (confirmed)**
   - Payload 3.88.0's `payload generate:importmap` defaults to `src/app/(payload)/admin/importMap.js`.
   - Extensionless imports coexist with `importMap.ts`; resolver preference can select the manually empty TypeScript module instead of generated JavaScript.

4. **Admissions field mapping mismatch (confirmed)**
   - The form sends `parentPhone`; the collection requires `contactNumber`.

5. **Admissions access mismatch (conditional)**
   - The anonymous request must be tested after correcting field mapping.
   - Access code is changed only if the response demonstrates an authorization failure; any change is limited to anonymous create and must not broaden other operations.

## Correctness Properties

Property 1: Bug Condition - Single Admin Document and Styled Payload UI

_For any_ sampled Admin_Route, the fixed application SHALL render exactly one `<html>` and one `<body>`, load Payload_CSS, omit nested-document/layout hydration errors, and present visible Payload fields, selects, dropdowns, and buttons as styled, operable controls.

**Validates: Requirements 1.1, 1.2, 1.4, 1.6, 2.1, 3.1, 3.2, 3.3, 3.4**

Property 2: Preservation - Public Route-Group Behavior

_For any_ representative Frontend_Root route outside the bug condition, the fixed application SHALL preserve public global styling, fonts, metadata, content, footer behavior, and successful route rendering.

**Validates: Requirements 1.3, 1.5, 4.1, 4.2, 4.3**

Property 3: Generated Import Map - Deterministic Payload Resolution

_For any_ Payload admin component referenced by the current config, running `npm run generate:importmap` SHALL produce the corresponding entry in `src/app/(payload)/admin/importMap.js`, and every import-map consumer SHALL resolve that generated module rather than a hand-authored empty map.

**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

Property 4: Admissions Regression - Anonymous Valid Create

_For any_ complete admissions input satisfying the collection schema, the `/apply` mapping SHALL use collection field names and an unauthenticated `POST /api/admissions` SHALL create the record; inputs outside the schema SHALL remain rejected, and unrelated access SHALL remain unchanged.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

## Fix Implementation

### 1. Route Architecture

**Delete:** `src/app/layout.tsx`

**Modify:** `src/app/(frontend)/layout.tsx`

- Move the `Metadata` export from the deleted file into this layout.
- Keep `../globals.css`, Anton/Poppins configuration, children, and `SiteFooter`.
- Return `<html lang="en" suppressHydrationWarning>` and one `<body>` carrying the public font/layout classes.
- Do not add document tags to any nested public page.

**Modify:** `src/app/(payload)/layout.tsx`

- Continue returning Payload `RootLayout` directly.
- Do not add manual `<html>`, `<head>`, or `<body>` elements.
- Import `@payloadcms/next/css` before `./custom.scss`.

### 2. Import-Map Ownership

**Delete:** `src/app/(payload)/admin/importMap.ts`

**Modify:** `package.json`

- Add `"generate:importmap": "payload generate:importmap"` to `scripts`.

**Generate:** `src/app/(payload)/admin/importMap.js`

- Run `npm run generate:importmap` after deleting the shadowing `.ts` file.
- Treat generated JavaScript as the sole import-map artifact.
- Confirm existing extensionless imports in the Payload layout, server function, page, and not-found modules resolve it.

### 3. Admissions Mapping and Access

**Modify:** `src/app/(frontend)/apply/page.tsx`

- Change the request key from `parentPhone` to `contactNumber`; retain `form.contactNumber` as the value.
- Keep the remaining mapped fields and form UX unchanged unless a test demonstrates another schema mismatch.

**Conditionally modify:** `src/payload.config.ts`

- First test anonymous create after correcting mapping.
- If and only if the endpoint returns an access denial, add the narrow collection access rule needed for anonymous `create`.
- Do not broaden read, update, delete, user collection, or unrelated collection access.

### 4. Regression Test Assets

**Modify:** `package.json` and `package-lock.json` only if automated browser tooling is adopted.

**Create:** `playwright.config.ts`, `tests/payload-admin-rendering.spec.ts`, and `tests/admissions-post.spec.ts` if Playwright is added.

- Pin any new test package to an exact version and record it in both package manifests.
- Configure tests against a caller-supplied local `baseURL`; do not embed credentials, secrets, or database URLs.
- Keep first-user/authenticated checks state-aware: test the create-first-user UI when available, otherwise verify its expected redirect and exercise login/authenticated views using locally supplied credentials outside source control.
## Testing Strategy

### Validation Approach

The bug condition is already established by supplied evidence, so testing begins with fix implementation followed by deterministic regression checks. Validation combines static structure checks, route/API tests, production diagnostics, and browser inspection. No task is an exploratory bug-discovery test.

### Unit and Contract Tests

- Verify the frontend request builder emits `contactNumber` and never emits `parentPhone`.
- Verify a complete admissions payload matches required collection fields.
- Verify invalid payloads still receive a validation response.
- Verify route-layout source structure has no `src/app/layout.tsx`, the frontend root emits one document, and the Payload root delegates document ownership.

### Property-Based Tests

Property-based testing is optional because the confirmed rendering defect is structural and the repository has no current PBT framework. If the chosen test harness already supports generated cases without adding disproportionate tooling:

- Generate valid admissions values and assert the request mapping always uses collection keys (Property 4).
- Generate invalid required-field omissions and assert they remain rejected (Property 4 preservation).
- Do not add a PBT dependency solely for this deterministic layout fix.

### Integration Tests

- Request `/`, `/apply`, another frontend route, `/admin/login`, and `/admin/create-first-user`; assert expected status/redirect behavior.
- Exercise `POST /api/admissions` without an authentication cookie using a unique valid test payload; assert record creation and capture the returned ID/status without logging personal or secret data.
- Exercise an invalid anonymous admissions request and assert schema rejection.
- Confirm `/api/admissions` remains mounted through the Payload REST handler.

### Browser Tests

- On `/admin/login`, inspect computed styling and interaction for inputs and buttons.
- On `/admin/create-first-user`, inspect name/email/password/role controls and Create button when available; otherwise verify the existing-user redirect and document/console invariants.
- On an authenticated dashboard and admissions collection form, exercise navigation, a dropdown, a select, form fields, and action buttons.
- For every admin route, assert `document.querySelectorAll('html').length === 1` and `document.querySelectorAll('body').length === 1`.
- Capture console errors and fail verification on nested document markup or hydration mismatch messages.
- Smoke-test `/`, `/apply`, and another public route for fonts, global styles, metadata, content, and footer.

### Static and Build Gates

Run in this order from the repository root:

1. `npm run generate:importmap`
2. IDE diagnostics for every changed file
3. `npm run lint`
4. `npm run build`
5. Single-run automated route/browser tests, if added
6. Local browser verification against a manually started application server

Development servers and watchers are not run as blocking validation commands. Start the local server manually with `npm run dev` when browser verification is performed.

## Dependency and Change Matrix

| Change or check | Exact paths | Depends on |
|---|---|---|
| Frontend document root | Delete `src/app/layout.tsx`; modify `src/app/(frontend)/layout.tsx` | None |
| Payload CSS/document ownership | Modify `src/app/(payload)/layout.tsx` | Frontend document root |
| Generated import map | Delete `src/app/(payload)/admin/importMap.ts`; modify `package.json`; generate `src/app/(payload)/admin/importMap.js` | Payload config remains loadable |
| Import-map consumers | `src/app/(payload)/layout.tsx`, `src/app/(payload)/admin/serverFunction.ts`, `src/app/(payload)/admin/[[...segments]]/page.tsx`, `src/app/(payload)/admin/[[...segments]]/not-found.tsx` | Generated import map |
| Admissions mapping | Modify `src/app/(frontend)/apply/page.tsx` | None |
| Conditional admissions access | Modify `src/payload.config.ts` only after anonymous POST result | Admissions mapping and API test |
| Automated tests, if introduced | `playwright.config.ts`, `tests/payload-admin-rendering.spec.ts`, `tests/admissions-post.spec.ts`, `package.json`, `package-lock.json` | Route, CSS, import-map, admissions fixes |
| Diagnostics/lint/build | All changed files | All implementation changes |
| Browser verification | Listed frontend/admin routes | Successful build and a manually started local server |