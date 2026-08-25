# Requirements Document

## Introduction

This specification defines the expansion of the existing Payload CMS installation into a secure school website management platform. The expansion builds on Payload 3.88.0, Next.js 16.2.7, Vercel-hosted PostgreSQL, the existing authenticated `users` collection, the existing structured `admissions` collection, the `/apply` page, Payload admin/API routes, and optional SMTP transport.

The feature covers admissions notifications, four-role authorization, editable website content, durable media, reusable public forms, editorial publishing, categorized documents, and CMS-managed galleries. The public website's current design, routes, protected imagery, and legacy content remain intact during incremental migration. SMTP credentials, database credentials, Payload secrets, and storage credentials remain environment-managed and are outside Payload-admin configuration.

## Glossary

- **CMS_Expansion**: The complete feature described by this requirements document.
- **Payload_Admin**: The authenticated Payload administration interface.
- **Public_Website**: The unauthenticated Next.js website, including `/apply`, `/news-events`, `/gallery`, and existing public routes.
- **Admission_Service**: The server-side behavior that validates, stores, retrieves, and manages Apply Now submissions.
- **Notification_Service**: The server-side behavior that selects recipients, sends SMTP email, and records delivery outcomes.
- **Notification_Settings**: Non-secret recipient addresses and enablement values editable through Payload_Admin.
- **User_Service**: Payload authentication and server-side authorization for user and role operations.
- **Principal**: The role with authority over users, role assignments, non-secret settings, content, and protected submissions.
- **Admin**: The role with authority over admissions, forms, submissions, content, media, documents, galleries, and publication, excluding Principal-account administration.
- **Teacher**: The role authorized to contribute assigned draft content and associated media without publishing or submission access.
- **Parent**: The authenticated role retained without a parent-facing public portal, Payload_Admin access, or website-management privileges in this feature.
- **Content_Service**: The CMS records and retrieval behavior for editable website text, descriptions, links, and calls to action.
- **Media_Library**: The Payload upload collection for reusable images and PDF documents.
- **Form_Service**: The CMS form definitions, public validation behavior, and stored form submissions.
- **Publication_Service**: The draft, scheduled, published, expired, and archived visibility workflow.
- **Document_Service**: The categorized records for circulars, holiday lists, newsletters, and general downloads.
- **Gallery_Service**: The album and ordered-image records rendered by the public gallery.
- **Published_Record**: A record with published status, a publication time not later than the current time, and no elapsed expiration time.
- **Legacy_Content**: Existing hard-coded text, JSON records, links, and public image references.
- **Legacy_Fallback**: Legacy_Content rendered when no valid Published_Record replacement is available.
- **Protected_Imagery**: Existing website imagery that must remain available and visually unchanged unless an authorized editor publishes an explicit replacement.
- **Sensitive_Data**: Admission, contact, feedback, registration, identity, address, phone, email, and authentication data.
- **Public_Create_Endpoint**: A narrowly scoped unauthenticated endpoint that permits creation without permitting record reads, updates, or deletion.
- **Audit_Record**: A non-secret record of actor, action, target, timestamp, and outcome.
- **Structured_Validation_Error**: A response containing stable field identifiers and user-safe messages without stack traces or secret values.
- **PostgreSQL**: The existing Payload database configured through the PostgreSQL adapter.
- **SMTP_Transport**: The optional Nodemailer transport whose connection values are environment-configured.
- **Durable_Storage**: Vercel Blob object storage used for all Payload-managed media images, PDF documents, and gallery images, with credentials supplied only through environment configuration.
- **Verification_Suite**: Automated checks for authorization, validation, persistence, notifications, publication, migration, fallbacks, and public rendering.
- **REST_API**: Payload's REST interface.
- **GraphQL_API**: Payload's GraphQL interface.
- **Local_API**: Payload's server-side programmatic interface.
- **UTC**: Coordinated Universal Time used for persisted timestamps.
- **MIME_Type**: The detected media format identifier for an uploaded file.
- **MiB**: 1,048,576 bytes.

## Existing Implementation Audit
| Requested capability | Classification | Repository evidence |
|---|---|---|
| Structured Apply Now admissions in PostgreSQL and Payload_Admin | **Implemented** | `/apply` posts structured fields to `/api/admissions`; `admissions` uses Payload's PostgreSQL adapter and is visible in Payload_Admin; regression tests cover anonymous create and protected private operations. |
| Admission SMTP notifications with admin-editable recipient | **Partial** | An `afterChange` hook sends optional SMTP email to an environment recipient with a hard-coded fallback; no Payload-managed recipient setting, delivery audit, retry, or recipient access control exists. |
| Payload-authenticated Principal, Admin, Teacher, and Parent roles | **Partial** | Payload authentication exists, but roles are limited to `admin` and `staff`; no required four-role model or explicit least-privilege authorization matrix exists. |
| Editable website copy and media library | **Missing** | Payload registers only `users` and `admissions`; public components contain text literals and use files under `public`; no upload collection exists. |
| Reusable contact, feedback, and event-registration forms | **Missing** | No form-definition or form-submission collection exists; the visible contact section is static contact information rather than a submission form. |
| Managed news, events, announcements, and scheduling | **Missing** | News is imported from `src/data/events.json`; announcements are component arrays; no publication workflow or scheduled visibility model exists. |
| Categorized circular, holiday, newsletter, and download documents | **Missing** | Resource tabs use hard-coded arrays and placeholder links; no managed file records, metadata, filtering, or publication controls exist. |
| CMS-managed public gallery | **Missing** | `/gallery` maps a hard-coded public-image array; changing organization or images requires source changes. |

## Requirements

### Requirement 1: Preserve and Extend the Existing Foundation

**User Story:** As a maintainer, I want the CMS expansion to preserve verified behavior, so that the website can migrate without regressions or destructive recreation.

#### Acceptance Criteria

1.1 THE CMS_Expansion SHALL use Payload exactly at version 3.88.0, Next.js 16.2.7, PostgreSQL, Payload_Admin, REST_API, GraphQL_API, Local_API, and SMTP_Transport integrations.

1.2 WHEN existing admission or user records are read after schema migration, THE CMS_Expansion SHALL return the records without destructive recreation.

1.3 WHEN a public route has no valid Published_Record replacement, THE Public_Website SHALL render the corresponding Legacy_Fallback.

1.4 IF a CMS content read fails, THEN THE Public_Website SHALL render the corresponding Legacy_Fallback and record a sanitized operational error.

1.5 WHEN Legacy_Content is migrated successfully, THE Public_Website SHALL preserve the existing route path, component structure, responsive behavior, typography, spacing, colors, links, and visible wording.

1.6 IF a Legacy_Content item cannot be migrated, THEN THE CMS_Expansion SHALL retain the source item and record a sanitized migration failure.

1.7 THE CMS_Expansion SHALL preserve Protected_Imagery until an authorized Admin or Principal publishes an explicit replacement.

1.8 THE CMS_Expansion SHALL limit delivery scope to source code, database migrations, content migration utilities, and automated verification assets.

1.9 THE CMS_Expansion SHALL exclude deployment execution, source-control commits, source-control pushes, and secret rotation from delivery scope.

### Requirement 2: Structured Admissions Persistence and Review

**User Story:** As a prospective parent, I want to submit an Apply Now application, so that school staff can review a structured record in Payload_Admin.

#### Acceptance Criteria

2.1 WHEN valid Apply Now data is submitted, THE Admission_Service SHALL create exactly one PostgreSQL admission record.

2.2 THE Admission_Service SHALL collect structured student name, requested grade, birth date, gender, guardian details, contact details, address, previous-school details, and document-checklist values.

2.3 WHEN an admission record is created, THE Admission_Service SHALL assign `pending` status and a UTC submission timestamp.

2.4 WHEN an admission record is created, THE Payload_Admin SHALL display student name, requested grade, guardian name, contact number, submission time, and workflow status.

2.5 WHEN a required admission value is absent or blank after trimming, THE Admission_Service SHALL reject the request with a Structured_Validation_Error for the affected field.

2.6 IF an admission birth date is later than the submission date, THEN THE Admission_Service SHALL reject the birth date.

2.7 IF an admission email address has an invalid email structure, THEN THE Admission_Service SHALL reject the email address.

2.8 IF an admission contact number contains fewer than 7 digits or more than 15 digits after permitted separators are removed, THEN THE Admission_Service SHALL reject the contact number.

2.9 IF a provided Aadhaar number does not contain exactly 12 digits, THEN THE Admission_Service SHALL reject the Aadhaar number.

2.10 WHEN the Admission_Service stores an Aadhaar number, THE Payload_Admin SHALL mask all but the final four digits in collection lists.

2.11 WHEN an admission request contains an unsupported grade, gender, category, workflow status, or document-checklist value, THE Admission_Service SHALL reject the unsupported value.

2.12 THE Admission_Service SHALL limit single-line admission values to 200 characters and narrative admission values to 2,000 characters.

2.13 WHEN an authorized Principal or Admin changes an admission status, THE Admission_Service SHALL store the new status, actor identifier, and UTC change timestamp.

2.14 THE Admission_Service SHALL support `pending`, `reviewed`, `accepted`, and `rejected` statuses.

2.15 WHEN admission persistence succeeds, THE Public_Website SHALL return a non-sensitive reference identifier and submission-success state.

2.16 IF admission persistence fails, THEN THE Public_Website SHALL display a failure state without returning a reference identifier.

2.17 WHEN an anonymous caller creates an admission, THE Admission_Service SHALL return only the reference identifier and public submission outcome.

2.18 WHEN an anonymous caller requests admission reads, updates, or deletions, THE Admission_Service SHALL deny the request without returning Sensitive_Data.

### Requirement 3: Configurable Admission Email Notifications

**User Story:** As an administrator, I want to configure admission recipients in Payload_Admin, so that admissions reach current staff without exposing SMTP credentials.

#### Acceptance Criteria

3.1 WHEN an admission record is created, THE Notification_Service SHALL select the first valid address from the admission-specific Notification_Settings recipient and the environment admission-recipient fallback.

3.2 WHEN a Principal or Admin changes the admission recipient, THE Notification_Settings SHALL validate the value as an email address before saving.

3.3 THE Payload_Admin SHALL expose notification recipient addresses and enablement controls without exposing SMTP host credentials, SMTP usernames, SMTP passwords, Payload secrets, database credentials, or storage credentials.

3.4 THE Notification_Service SHALL obtain SMTP host, port, security mode, username, password, sender address, and sender name exclusively from environment configuration.

3.5 WHERE admission notifications are disabled, THE Notification_Service SHALL record a `disabled` delivery outcome without contacting the SMTP_Transport.

3.6 IF no valid admission recipient is available, THEN THE Notification_Service SHALL record a `not_configured` delivery outcome and preserve the admission record.

3.7 IF SMTP delivery fails, THEN THE Notification_Service SHALL record a `failed` outcome with a sanitized reason and preserve the admission record.

3.8 WHEN SMTP delivery succeeds, THE Notification_Service SHALL record the recipient, attempt time, and `sent` outcome.

3.9 THE Notification_Service SHALL exclude passwords, secrets, Aadhaar numbers, full postal addresses, and uploaded file contents from admission email bodies.

3.10 WHEN a Principal or Admin retries a failed admission notification, THE Notification_Service SHALL create a new Audit_Record without creating a duplicate admission.

3.11 WHEN admission persistence succeeds, THE Public_Website SHALL display submission success independently of notification outcome.
### Requirement 4: Payload Authentication and Least-Privilege Authorization

**User Story:** As a Principal, I want explicit role permissions, so that each authenticated user receives only the access required for school duties.

#### Acceptance Criteria

4.1 THE User_Service SHALL support exactly the active roles Principal, Admin, Teacher, and Parent.

4.2 WHEN a legacy `staff` role is encountered, THE User_Service SHALL deny privileged operations until a Principal assigns a supported role.

4.3 THE User_Service SHALL authorize a Principal to manage users, role assignments, Notification_Settings, all managed content, all submissions, and Audit_Record access.

4.4 THE User_Service SHALL authorize an Admin to manage admissions, forms, form submissions, Notification_Settings, content, media, documents, galleries, and publication workflows.

4.5 WHEN an Admin attempts to create, modify, disable, delete, or assign a Principal account, THE User_Service SHALL deny the operation.

4.6 THE User_Service SHALL authorize a Teacher to create and update assigned draft content, assigned draft editorial records, assigned draft documents, assigned draft galleries, and associated media.

4.7 WHEN a Teacher attempts to publish, access admissions, access form submissions, manage users, manage form definitions, manage Notification_Settings, or read Audit_Record data, THE User_Service SHALL deny the operation.

4.8 WHEN a Parent requests Payload_Admin access or a website-management operation, THE User_Service SHALL deny the request.

4.9 WHEN an unauthenticated caller requests an administrative operation, THE User_Service SHALL deny the request before returning protected data.

4.10 IF a user role is absent, inactive, or unsupported, THEN THE User_Service SHALL deny every administrative operation.

4.11 WHEN a protected operation is requested through Payload_Admin, REST_API, GraphQL_API, or Local_API, THE User_Service SHALL enforce the same server-side authorization rule.

4.12 WHEN the first Payload user is created in an empty user collection, THE User_Service SHALL assign the Principal role.

4.13 IF a user-management operation would leave zero active Principal accounts, THEN THE User_Service SHALL deny the operation.

4.14 WHEN a Principal changes a user role or active state, THE User_Service SHALL create an Audit_Record without password data.

4.15 WHEN authentication fails, THE User_Service SHALL return a generic message that does not disclose account existence.

4.16 WHEN a password is created or reset, THE User_Service SHALL require at least 12 characters.

4.17 WHILE the CMS_Expansion runs in production, THE User_Service SHALL issue authentication cookies with `Secure`, `HttpOnly`, and `SameSite=Lax` or stricter attributes.

### Requirement 5: Non-Developer Website Content Editing

**User Story:** As a content editor, I want to edit relevant website copy in Payload_Admin, so that routine updates do not require source-code changes.

#### Acceptance Criteria

5.1 THE Content_Service SHALL provide stable page and section identifiers for managed headings, descriptions, rich text, announcements, links, and calls to action.

5.2 WHEN a Principal, Admin, or authorized Teacher edits a draft record, THE Payload_Admin SHALL provide labeled plain-text or rich-text fields without requiring HTML or source-code editing.

5.3 WHEN a Published_Record exists for a managed section, THE Public_Website SHALL render the CMS value within the existing public component design.

5.4 WHEN no valid Published_Record exists for a managed section, THE Public_Website SHALL render the corresponding Legacy_Fallback.

5.5 WHEN Legacy_Content is migrated, THE Content_Service SHALL create records with stable identifiers and equivalent text, links, and image references.

5.6 WHEN migrated content is first published, THE Public_Website SHALL preserve the pre-migration component layout and responsive behavior.

5.7 WHEN an authorized user requests draft preview, THE Content_Service SHALL return the draft only after server-side authorization.

5.8 THE Content_Service SHALL limit headings to 160 characters, summaries to 500 characters, button labels to 80 characters, and plain-text descriptions to 5,000 characters.

5.9 IF a managed link uses a protocol other than `https`, `http`, `mailto`, `tel`, or a site-relative path, THEN THE Content_Service SHALL reject the link.

5.10 WHEN a Principal or Admin publishes a content change, THE Public_Website SHALL make the updated Published_Record visible within 60 seconds.

### Requirement 6: Reusable and Durable Media Library

**User Story:** As a content editor, I want a shared media library, so that images and documents can be reused safely across managed content.

#### Acceptance Criteria

6.1 THE Media_Library SHALL store title, original filename, MIME_Type, byte size, upload time, uploader, category, alternative text, decorative status, and optional caption metadata.

6.2 WHEN an image is uploaded, THE Media_Library SHALL accept JPEG, PNG, or WebP files no larger than 10 MiB.

6.3 WHEN a document is uploaded, THE Media_Library SHALL accept PDF files no larger than 20 MiB.

6.4 IF an upload extension, declared MIME_Type, and detected signature do not identify the same permitted format, THEN THE Media_Library SHALL reject the upload.

6.5 IF an upload is executable, script-capable, password-protected, or outside the permitted formats, THEN THE Media_Library SHALL reject the upload with a Structured_Validation_Error.

6.6 WHEN a non-decorative image is saved, THE Media_Library SHALL require alternative text between 1 and 250 characters.

6.7 WHEN an image is marked decorative, THE Media_Library SHALL store an empty alternative-text value and the decorative status.

6.8 WHEN the Public_Website renders a managed image, THE Public_Website SHALL use the stored alternative text or an empty alternative attribute for a decorative image.

6.9 WHEN a Teacher uploads an asset, THE Media_Library SHALL restrict update and deletion to the uploader, an Admin, or a Principal.

6.10 WHEN an unauthenticated caller requests media creation, update, or deletion, THE Media_Library SHALL deny the operation.

6.11 IF an asset is referenced by a Published_Record, THEN THE Media_Library SHALL block asset deletion and identify the referencing records to an authorized caller.

6.12 WHEN a public caller requests media metadata, THE Media_Library SHALL return only metadata required to render a Published_Record.

6.13 WHILE the CMS_Expansion runs on Vercel, THE Media_Library SHALL store uploaded bytes in Durable_Storage.

6.14 THE Media_Library SHALL keep Durable_Storage credentials exclusively in environment configuration.

### Requirement 7: Reusable Forms and Stored Submissions

**User Story:** As an administrator, I want reusable public forms, so that contact, feedback, and event registration can be managed without code changes.

#### Acceptance Criteria

7.1 THE Form_Service SHALL support form types `contact`, `feedback`, and `event_registration`.

7.2 THE Form_Service SHALL support text, textarea, email, phone, select, radio, checkbox, consent, and date fields with configurable labels, required status, and option values.

7.3 WHEN a Principal or Admin saves a form definition, THE Form_Service SHALL validate unique field identifiers, non-empty labels, supported field types, and non-empty option values.

7.4 WHEN a visitor submits an enabled Published_Record form, THE Form_Service SHALL validate values against the server-stored form definition before creating exactly one PostgreSQL submission record.

7.5 IF a submitted form is disabled, unpublished, not yet published, expired, or unknown, THEN THE Form_Service SHALL reject the request without creating a submission.

7.6 WHEN form values fail validation, THE Form_Service SHALL return Structured_Validation_Error entries mapped to the invalid field identifiers.

7.7 WHEN form persistence succeeds, THE Form_Service SHALL return a non-sensitive reference identifier without returning another submission or administrative field.

7.8 WHEN a submission is viewed in Payload_Admin, THE Form_Service SHALL display form type, form title, submission time, submitted values, review status, and notification outcome.

7.9 WHEN a contact or feedback submission is created, THE Form_Service SHALL assign `new` review status.

7.10 WHEN an event-registration form has a capacity, THE Form_Service SHALL reject registrations after accepted registrations reach the capacity.

7.11 WHEN concurrent event-registration requests target a capacity, THE Form_Service SHALL enforce the capacity atomically.

7.12 WHEN an event-registration form has a closing time, THE Form_Service SHALL reject registrations received after the closing time.

7.13 WHEN a form requires consent, THE Form_Service SHALL reject a submission without affirmative consent.

7.14 WHEN affirmative consent is submitted, THE Form_Service SHALL store the consent label, consent value, and UTC submission time.

7.15 THE Form_Service SHALL limit single-line submitted values to 200 characters and textarea values to 5,000 characters unless a smaller form limit applies.

7.16 WHEN a form submission is created, THE Notification_Service SHALL select the first valid address from the form-specific Notification_Settings recipient and the environment form-recipient fallback.

7.17 WHERE notifications are disabled for a form, THE Notification_Service SHALL record a `disabled` outcome without contacting the SMTP_Transport.

7.18 IF no valid form recipient is available, THEN THE Notification_Service SHALL record a `not_configured` outcome and preserve the submission.

7.19 IF form notification delivery fails, THEN THE Notification_Service SHALL record a `failed` outcome with a sanitized reason and preserve the submission.

7.20 WHEN a Principal or Admin retries a failed form notification, THE Notification_Service SHALL create a new Audit_Record without creating a duplicate submission.

7.21 THE Notification_Service SHALL exclude passwords, secrets, and file contents from form notification bodies.

7.22 IF one client address submits more than 10 public form requests within 10 minutes, THEN THE Form_Service SHALL reject additional requests from that address until the window ends.
### Requirement 8: News, Events, Announcements, and Publication Scheduling

**User Story:** As an editor, I want managed editorial records, so that website updates can be drafted, scheduled, published, and archived without source changes.

#### Acceptance Criteria

8.1 THE Publication_Service SHALL provide managed record types for news, events, and announcements.

8.2 THE Publication_Service SHALL require each news record to contain a title, unique slug, summary, body, status, and publication time.

8.3 THE Publication_Service SHALL require each event record to contain a title, unique slug, summary, body, start time, end time, location, status, and publication time.

8.4 IF an event end time precedes the event start time, THEN THE Publication_Service SHALL reject the event.

8.5 THE Publication_Service SHALL require each announcement to contain a title, message, priority, status, and publication time.

8.6 THE Publication_Service SHALL support `draft`, `scheduled`, `published`, `expired`, and `archived` visibility states.

8.7 WHEN a scheduled record reaches the publication time, THE Publication_Service SHALL make the record publicly eligible within 60 seconds.

8.8 WHEN a published record reaches an expiration time, THE Publication_Service SHALL remove the record from public results within 60 seconds.

8.9 WHEN a Teacher creates or updates an assigned editorial record, THE Publication_Service SHALL retain the record as `draft`.

8.10 WHEN a Principal or Admin publishes, unpublishes, schedules, expires, or archives an editorial record, THE Publication_Service SHALL store the actor and UTC action time.

8.11 WHEN the Public_Website lists news, THE Public_Website SHALL order Published_Record news by publication time descending.

8.12 WHEN the Public_Website lists upcoming events, THE Public_Website SHALL order Published_Record events by start time ascending.

8.13 WHEN the Public_Website lists past events, THE Public_Website SHALL order Published_Record events by start time descending.

8.14 WHEN the Public_Website renders announcements, THE Public_Website SHALL order Published_Record announcements by priority descending and publication time descending.

8.15 IF two editorial records request the same slug within one record type, THEN THE Publication_Service SHALL reject the later slug.

8.16 WHEN `src/data/events.json` and hard-coded announcement arrays are migrated, THE Publication_Service SHALL preserve available titles, dates, categories, descriptions, links, and image references.

### Requirement 9: Categorized Document Management

**User Story:** As an administrator, I want managed school documents, so that families can find current circulars, holiday lists, newsletters, and downloads.

#### Acceptance Criteria

9.1 THE Document_Service SHALL support document types `circular`, `holiday_list`, `newsletter`, and `general_download`.

9.2 THE Document_Service SHALL require title, type, category, issue or effective date, academic year, status, publication time, and a Media_Library PDF reference.

9.3 THE Document_Service SHALL support optional description, issue number, audience, expiration time, and display order.

9.4 WHEN a Teacher creates or updates an assigned document, THE Document_Service SHALL retain the document as `draft`.

9.5 WHEN a Principal or Admin publishes, unpublishes, schedules, expires, or archives a document, THE Document_Service SHALL store the actor and UTC action time.

9.6 WHEN a public caller requests documents, THE Document_Service SHALL return only Published_Record documents and public metadata.

9.7 WHEN the Public_Website lists documents, THE Public_Website SHALL support filtering by type, category, and academic year.

9.8 WHEN the Public_Website lists circulars or newsletters without an explicit sort, THE Public_Website SHALL order records by issue or effective date descending.

9.9 WHEN the Public_Website renders a holiday-list document, THE Public_Website SHALL display academic year, effective date, description, and an accessible PDF link.

9.10 IF a document references a missing, non-PDF, or non-public Media_Library asset, THEN THE Document_Service SHALL prevent publication.

9.11 WHEN a public caller downloads a document, THE Document_Service SHALL serve the PDF without exposing filesystem paths, storage credentials, Sensitive_Data, or administrative metadata.

9.12 WHEN hard-coded resource-tab records are migrated, THE Document_Service SHALL preserve available titles, dates, types, labels, and ordering as Legacy_Fallback values.

### Requirement 10: CMS-Managed Gallery

**User Story:** As an administrator, I want to organize gallery images in Payload_Admin, so that the public gallery can change without source-code edits.

#### Acceptance Criteria

10.1 THE Gallery_Service SHALL support albums with title, unique slug, description, cover image, category, event date, status, publication time, and ordered image entries.

10.2 THE Gallery_Service SHALL require every gallery image entry to reference a Media_Library image and contain display order and accessibility metadata.

10.3 WHEN a Teacher creates or updates an assigned gallery album, THE Gallery_Service SHALL retain the album as `draft`.

10.4 WHEN a Principal or Admin publishes, unpublishes, schedules, expires, or archives an album, THE Gallery_Service SHALL store the actor and UTC action time.

10.5 WHEN the Public_Website renders the gallery, THE Gallery_Service SHALL return only Published_Record albums and publicly eligible images.

10.6 WHEN the Public_Website renders album images, THE Public_Website SHALL order images by display order and stable record identifier.

10.7 WHEN a published album changes, THE Public_Website SHALL reflect the changed album within 60 seconds without a source-code change or application redeployment.

10.8 IF an album references a missing or non-image asset, THEN THE Gallery_Service SHALL prevent publication.

10.9 WHEN the existing hard-coded gallery array is migrated, THE Gallery_Service SHALL preserve image references, alternative text, and existing display order.

10.10 WHEN no Published_Record album is available, THE Public_Website SHALL render the existing hard-coded gallery as the Legacy_Fallback.

10.11 WHEN CMS-managed gallery content renders, THE Public_Website SHALL preserve the existing responsive grid, image aspect ratio, hover behavior, and visual styling.

### Requirement 11: Security, Privacy, and Auditability

**User Story:** As a school administrator, I want protected records and traceable changes, so that personal data and publishing operations are handled safely.

#### Acceptance Criteria

11.1 THE CMS_Expansion SHALL keep database credentials, SMTP credentials, Payload secrets, and Durable_Storage credentials outside PostgreSQL content records and client-delivered code.

11.2 WHEN server-side CMS data is passed to a client component, THE CMS_Expansion SHALL return a data-transfer object containing only fields required for public rendering.

11.3 WHEN any caller supplies form values, route parameters, query parameters, or record identifiers, THE CMS_Expansion SHALL validate the values before data access or mutation.

11.4 WHEN an authorization decision cannot complete, THE CMS_Expansion SHALL deny the operation without returning Sensitive_Data.

11.5 WHEN a Principal or Admin changes publication state, user role, admission status, notification recipient, or submission review status, THE CMS_Expansion SHALL create an Audit_Record.

11.6 THE CMS_Expansion SHALL exclude passwords, secret values, authentication tokens, and uploaded file contents from Audit_Record data.

11.7 WHEN an unauthorized caller requests a protected record by identifier, THE CMS_Expansion SHALL return no protected record fields.

11.8 WHEN a public submission endpoint returns an error, THE CMS_Expansion SHALL omit stack traces, database details, SMTP details, and secret values.

11.9 WHEN an authenticated user reads Sensitive_Data, THE CMS_Expansion SHALL limit returned fields to the fields authorized for the user's role and requested operation.

11.10 WHEN the CMS_Expansion records an operational failure, THE CMS_Expansion SHALL sanitize secret values and Sensitive_Data from the recorded message.

### Requirement 12: Migration and Automated Verification

**User Story:** As a maintainer, I want repeatable migration and verification, so that the expansion can be introduced without content loss or access-control regressions.

#### Acceptance Criteria

12.1 WHEN a migration utility runs more than once against unchanged Legacy_Content, THE CMS_Expansion SHALL produce the same managed records without duplicate content.

12.2 WHEN migration completes, THE CMS_Expansion SHALL report created, updated, skipped, and failed record counts without secret values.

12.3 IF a migration item fails validation, THEN THE CMS_Expansion SHALL continue processing independent items and retain the corresponding Legacy_Fallback.

12.4 THE Verification_Suite SHALL verify anonymous admission creation and anonymous admission read, update, and deletion denial.

12.5 THE Verification_Suite SHALL verify each Principal, Admin, Teacher, Parent, unauthenticated, missing-role, and unsupported-role permission boundary through server-side interfaces.

12.6 THE Verification_Suite SHALL verify admission and form persistence independently from SMTP delivery success.

12.7 THE Verification_Suite SHALL verify admin-configured recipient precedence, environment fallback, disabled delivery, missing configuration, failed delivery, successful delivery, and retry behavior without using production recipient addresses.

12.8 THE Verification_Suite SHALL verify draft, scheduled, published, expired, and archived visibility at publication-time boundaries.

12.9 THE Verification_Suite SHALL verify media format, MIME_Type, signature, size, alternative-text, public-read, ownership, and referenced-asset deletion rules.

12.10 THE Verification_Suite SHALL verify form-definition validation, server-side submission validation, consent, closing time, rate limit, and atomic registration capacity.

12.11 THE Verification_Suite SHALL verify document filters, document publication constraints, gallery ordering, and public data minimization.

12.12 THE Verification_Suite SHALL verify that CMS read failure and absent Published_Record conditions render Legacy_Fallback content.

12.13 THE Verification_Suite SHALL compare representative pre-migration and post-migration public routes for headings, links, image references, responsive layout, typography, spacing, and colors.

12.14 THE Verification_Suite SHALL verify that protected image files remain available after content migration.

12.15 THE Verification_Suite SHALL verify that no public API response contains SMTP credentials, database credentials, Payload secrets, storage credentials, password data, or authentication tokens.

12.16 WHEN automated verification requires email delivery, THE Verification_Suite SHALL use a test transport or mock transport rather than a production SMTP mailbox.

12.17 WHEN automated verification requires uploaded files, THE Verification_Suite SHALL use synthetic test assets rather than Protected_Imagery.

12.18 WHEN all required verification checks pass, THE Verification_Suite SHALL report the CMS_Expansion as ready for a separately authorized deployment process.
