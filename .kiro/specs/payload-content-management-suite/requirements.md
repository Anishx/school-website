# Requirements Document

## Introduction

This specification defines the requirements for completing website management through the existing Payload CMS 3.88.0 and Next.js 16.2.7 integration. The feature extends the verified PostgreSQL-backed admissions and user foundations into a least-privilege content management suite for admissions, users, website copy, media, reusable forms, editorial updates, documents, and galleries.

The feature must preserve the current public website design and existing content while replacing hard-coded content sources incrementally. SMTP credentials, Payload secrets, database credentials, and other transport secrets remain environment-configured and must not be stored or displayed in Payload. Production behavior must fail closed when mandatory security configuration is absent. Deployment, commits, and secret rotation are outside this specification.

## Glossary

- **Management_Suite**: The complete Payload-backed website-management feature defined by this specification.
- **Payload_Admin_UI**: The authenticated Payload administration interface.
- **Public_Website**: The unauthenticated Next.js website, including `/apply`, news/resources, and gallery routes.
- **Admission_Service**: The collection and request handling that validate and store Apply Now submissions.
- **User_Service**: Payload authentication, user records, role assignment, and authorization enforcement.
- **Content_Service**: The CMS records used to manage page text, descriptions, and reusable website copy.
- **Media_Library**: The CMS-managed image and document upload collection.
- **Form_Service**: The definitions and stored submissions for contact, feedback, and event-registration forms.
- **Publication_Service**: The workflow that controls draft, immediate publication, scheduled publication, and public visibility.
- **Document_Service**: The CMS records for circulars, holiday lists, newsletters, and related downloadable files.
- **Gallery_Service**: The CMS records for albums and ordered gallery images.
- **Notification_Service**: The email-notification behavior that uses environment-configured SMTP transport.
- **Notification_Settings**: Non-secret recipient addresses and notification enablement values editable in the Payload_Admin_UI.
- **Audit_Log**: An append-only administrative history containing actor, action, target, timestamp, and non-secret outcome metadata.
- **Principal**: The highest-privilege role authorized to administer users, role assignments, security-sensitive settings, all content, and all submissions.
- **Admin**: A website-management role authorized to manage content, forms, submissions, notification recipients, documents, galleries, and publication without administering Principal accounts.
- **Teacher**: A content-contributor role authorized to create and update assigned draft content and media without publication, user-management, notification-setting, or submission-data privileges.
- **Parent**: An authenticated end-user role without Payload_Admin_UI or website-management privileges.
- **Published_Content**: A CMS record whose status is `published`, whose publication time is not in the future, and whose optional expiration time has not passed.
- **Legacy_Content**: Existing hard-coded text, JSON data, and public image references present before this feature.
- **Legacy_Fallback**: Existing public content displayed when no valid Published_Content replacement is available.
- **Structured_Validation_Error**: A response containing a stable field identifier and a user-safe error message without stack traces or secrets.
- **Public_Create_Endpoint**: A narrowly permitted unauthenticated create operation for admissions or an enabled public form.
- **Sensitive_Data**: Admission, contact, feedback, registration, identity, address, phone, email, and authentication data.
- **Production_Mode**: Application execution with `NODE_ENV=production`.
- **CMS**: A content management system; in this specification, the existing Payload installation.
- **PostgreSQL**: The configured relational database used by Payload for managed records.
- **SMTP_Transport**: The environment-configured email delivery connection used by the Notification_Service.
- **REST_API**: Payload's HTTP resource interface for collection operations.
- **GraphQL_API**: Payload's query interface for collection operations.
- **Local_API**: Server-side Payload operations invoked inside the application process.
- **MIME_Type**: The media-format identifier submitted for and detected from an uploaded file.
- **MiB**: A binary size unit equal to 1,048,576 bytes.
- **UTC**: Coordinated Universal Time used for stored timestamps.
- **ARIA_Live_Region**: An accessibility region that announces dynamic status changes to assistive technology.
- **WCAG_2_2_AA**: Web Content Accessibility Guidelines version 2.2 conformance level AA.
- **PDF**: Portable Document Format used for managed downloadable documents.
- **Safe_Failure**: Denial of an operation without returning protected records, Sensitive_Data, or secrets when a security decision cannot complete.

## Verified Capability Classification

| Capability | Classification | Repository evidence |
|---|---|---|
| Payload 3.88.0 with Next.js 16.2.7 and PostgreSQL | Existing | Package versions and `postgresAdapter` are configured; `DATABASE_URL` supplies the connection. |
| SMTP transport | Partial | Nodemailer is enabled only when SMTP environment credentials exist; transport secrets remain environment-based. |
| Admissions Apply Now flow | Partial | `/apply` posts structured data to `admissions`; anonymous create is narrowly enabled; records are PostgreSQL-backed and visible in Payload. Validation, recipient administration, delivery audit, and sensitive-data controls are incomplete. |
| User authentication and management | Partial | The `users` collection has Payload authentication and `admin`/`staff` roles; the required four-role model and explicit least-privilege access rules are missing. |
| Editable page content and media library | Missing | No page-content or upload collection exists in `src/payload.config.ts`; representative pages use component literals and files under `public`. |
| Contact, feedback, and event-registration forms | Missing | No form-definition or submission collections and no corresponding Payload-backed endpoints were found. |
| News, events, and announcements workflow | Missing | News uses `src/data/events.json`; announcements are component literals; no draft or scheduled publishing collection exists. |
| Circulars, holiday lists, and newsletters | Missing | Representative resources are hard-coded placeholders without managed files, categories, or metadata. |
| Gallery management | Missing | The gallery is a hard-coded array of public image paths and requires code changes to update. |


## Requirements

### Requirement 1: Preserve and Extend the Verified Foundation

**User Story:** As a maintainer, I want the suite to extend verified Payload capabilities, so that existing records, routes, and website behavior remain stable.

#### Acceptance Criteria

1. THE Management_Suite SHALL use the existing Payload 3.88.0, Next.js 16.2.7, and PostgreSQL integration as the system of record.

2. WHEN existing user or admission records are read after the feature is introduced, THE Management_Suite SHALL return the records without requiring destructive recreation.

3. WHEN an existing public route renders before a CMS replacement record is published, THE Public_Website SHALL preserve the Legacy_Content and current visual layout.

4. IF a content migration cannot produce a valid CMS record, THEN THE Management_Suite SHALL retain the corresponding Legacy_Fallback and record a migration error without deleting source content.

5. THE Management_Suite SHALL limit scope to application source, schema migrations, content migration utilities, and verification assets.

6. THE Management_Suite SHALL keep deployment execution, source-control commits, and secret rotation outside implementation scope.

### Requirement 2: Admissions Apply Now Submission

**User Story:** As a prospective parent, I want to submit a structured admission application, so that the school can review the application in Payload.

#### Acceptance Criteria

2.1 WHEN valid Apply Now data has been persisted successfully, THE Admission_Service SHALL return a success response with a non-sensitive reference identifier for the single created PostgreSQL admission record.

2.2 THE Admission_Service SHALL collect structured student, requested-grade, birth-date, gender, parent-or-guardian, contact, address, previous-school, and document-checklist fields.

2.3 WHEN an admission record is created, THE Payload_Admin_UI SHALL display the record with submission time, workflow status, student name, requested grade, guardian name, and contact number.

2.4 WHEN required admission fields are absent or blank after trimming, THE Admission_Service SHALL reject the request with a Structured_Validation_Error for each invalid field.

2.5 IF a submitted birth date is later than the submission date, THEN THE Admission_Service SHALL reject the birth date.

2.6 IF a submitted email address does not conform to a standard email-address structure, THEN THE Admission_Service SHALL reject the email address.

2.7 IF a submitted contact number contains fewer than 7 digits or more than 15 digits after permitted separators are removed, THEN THE Admission_Service SHALL reject the contact number.

2.8 IF a submitted Aadhaar number is present and does not contain exactly 12 digits, THEN THE Admission_Service SHALL reject the Aadhaar number.

2.9 WHEN the Admission_Service stores an Aadhaar number, THE Payload_Admin_UI SHALL mask all but the final four digits outside an authorized record-detail view.

2.10 WHEN an admission request contains an unrecognized grade, gender, category, workflow status, or document-checklist value, THE Admission_Service SHALL reject the unrecognized value.

2.11 THE Admission_Service SHALL constrain each single-line text field to 200 characters and each address or narrative field to 2,000 characters.

2.12 WHEN an authorized Principal or Admin changes an admission workflow status, THE Admission_Service SHALL store the new status, actor, and change timestamp.

2.13 THE Admission_Service SHALL support `pending`, `reviewed`, `accepted`, and `rejected` workflow statuses with `pending` as the creation default.

2.14 IF the Notification_Service cannot send an admission email, THEN THE Admission_Service SHALL preserve the successfully validated admission record.

2.15 IF Payload or PostgreSQL persistence fails, THEN THE Admission_Service SHALL return a failure response without displaying submission success or issuing a reference identifier.

2.16 WHEN the Admission_Service returns submission success, THE Admission_Service SHALL have a corresponding persisted record with the `pending` workflow status visible in the Payload_Admin_UI.

### Requirement 3: Configurable Admission Notifications

**User Story:** As an administrator, I want to configure admission notification recipients in Payload, so that notifications reach the correct school staff without exposing SMTP credentials.

#### Acceptance Criteria

3.1 WHEN an admission record is created, THE Notification_Service SHALL select the first valid recipient from the admission-specific Notification_Settings recipient, the global Notification_Settings recipient, and the `ADMISSION_NOTIFICATION_EMAIL` environment fallback in that order.

3.2 WHEN an authorized Principal or Admin updates an admission-specific or global recipient, THE Notification_Settings SHALL validate the recipient as an email address before saving the value.

3.3 THE Payload_Admin_UI SHALL expose notification recipient addresses and enablement controls without exposing SMTP host credentials, SMTP usernames, SMTP passwords, Payload secrets, or database credentials.

3.4 THE Notification_Service SHALL obtain SMTP host, port, security mode, username, password, sender address, and sender name exclusively from environment configuration.

3.5 IF no valid notification recipient is available, THEN THE Notification_Service SHALL mark the admission notification as `not_configured` and keep the admission submission successful.

3.6 IF SMTP transport is unavailable or email delivery fails, THEN THE Notification_Service SHALL mark the notification as `failed`, store a sanitized failure reason, and keep the admission submission successful.

3.7 WHEN an admission notification is sent successfully, THE Notification_Service SHALL store the recipient, attempt timestamp, and `sent` outcome on notification audit metadata.

3.8 THE Notification_Service SHALL exclude passwords, secrets, Aadhaar numbers, full postal addresses, and uploaded file contents from admission notification messages.

3.9 WHEN an authorized Principal or Admin requests a retry for a `failed` admission notification, THE Notification_Service SHALL create a new auditable delivery attempt without creating a duplicate admission record.

3.10 WHEN an admission record is created successfully, THE Public_Website SHALL display submission success independently of notification outcome.

### Requirement 4: Secure Authentication and Least-Privilege Roles

**User Story:** As a Principal, I want secure user management with explicit roles, so that each user receives only the permissions required for school duties.

#### Acceptance Criteria

4.1 THE User_Service SHALL support exactly the roles Principal, Admin, Teacher, and Parent for active user assignments.

4.2 WHEN a legacy `staff` user is encountered, THE User_Service SHALL deny privileged actions until a Principal assigns one of the supported roles.

4.3 THE User_Service SHALL authorize a Principal to manage users, supported role assignments, security-sensitive non-secret settings, all managed content, all submissions, and all Audit_Log records.

4.4 THE User_Service SHALL authorize an Admin to manage website content, media, forms, submissions, notification recipients, documents, galleries, and publication workflows.

4.5 WHEN an Admin attempts to create, modify, delete, disable, or assign a Principal account, THE User_Service SHALL deny the operation.

4.6 THE User_Service SHALL authorize a Teacher to create and update assigned draft content, assigned draft events, assigned draft documents, and associated media.

4.7 WHEN a Teacher attempts to publish content, access submission records, manage users, manage forms, manage Notification_Settings, or read Audit_Log records, THE User_Service SHALL deny the operation.

4.8 WHEN a Parent requests Payload_Admin_UI access or a website-management operation, THE User_Service SHALL deny the request.

4.9 WHEN an unauthenticated requester attempts an administrative operation, THE User_Service SHALL require Payload authentication before evaluating role permissions.

4.10 IF a user role is absent, inactive, or unrecognized, THEN THE User_Service SHALL deny every administrative operation.

4.11 WHEN any caller requests a protected operation through the REST_API, GraphQL_API, Local_API, or Payload_Admin_UI, THE User_Service SHALL enforce the same server-side authorization rule.

4.12 IF an account records 5 failed login attempts within 15 minutes, THEN THE User_Service SHALL block further login attempts for that account for 15 minutes.

4.13 WHEN authentication fails, THE User_Service SHALL return a generic failure message that does not disclose account existence.

4.14 WHILE the Management_Suite runs in Production_Mode, THE User_Service SHALL issue authentication cookies with `Secure`, `HttpOnly`, and `SameSite=Lax` or stricter attributes.

4.15 WHEN a new password is set, THE User_Service SHALL require at least 12 characters.

4.16 WHEN a Principal changes another user's role or active state, THE Audit_Log SHALL record the actor, target user identifier, changed field names, and timestamp without recording password data.

4.17 WHEN no user records exist and the first Payload account is created, THE User_Service SHALL assign the Principal role to that account.

4.18 IF a user-management operation would leave zero active Principal accounts, THEN THE User_Service SHALL deny the operation.

4.19 WHEN a Principal creates, disables, reactivates, or deletes a non-Principal user account, THE User_Service SHALL enforce the requested lifecycle operation and record the outcome in the Audit_Log.


### Requirement 5: Non-Developer Page Content Management

**User Story:** As an administrator, I want to edit website text and descriptions in Payload, so that routine content changes do not require source-code changes.

#### Acceptance Criteria

5.1 THE Content_Service SHALL provide stable page and section identifiers for CMS-managed headings, descriptions, rich text, calls to action, and announcement copy.

5.2 WHEN a Principal, Admin, or authorized Teacher edits a draft content record, THE Payload_Admin_UI SHALL provide labeled plain-text or rich-text fields without requiring HTML or source-code editing.

5.3 WHEN a Published_Content record exists for a page section, THE Public_Website SHALL render the CMS value in the existing page component and visual design.

5.4 WHEN no valid Published_Content record exists for a page section, THE Public_Website SHALL render the corresponding Legacy_Fallback.

5.5 IF a CMS read fails during public rendering, THEN THE Public_Website SHALL render the corresponding Legacy_Fallback and record a sanitized operational error.

5.6 WHEN Legacy_Content is migrated, THE Content_Service SHALL create CMS records with stable identifiers and text equivalent to the pre-migration public content.

5.7 WHEN migrated CMS content is first published, THE Public_Website SHALL preserve the pre-migration wording, links, image references, route paths, component structure, responsive behavior, typography classes, spacing classes, and color classes.

5.8 WHEN an authorized user previews draft page content, THE Content_Service SHALL restrict the preview response to authenticated users with access to that content.

5.9 THE Content_Service SHALL constrain headings to 160 characters, summaries to 500 characters, button labels to 80 characters, and plain-text descriptions to 5,000 characters.

5.10 IF a managed link uses a protocol other than `https`, `http`, `mailto`, `tel`, or a site-relative path, THEN THE Content_Service SHALL reject the link.

### Requirement 6: Managed Media Library

**User Story:** As a content editor, I want a shared media library for images and documents, so that assets can be reused safely across managed content.

#### Acceptance Criteria

6.1 THE Media_Library SHALL store a title, original filename, MIME type, byte size, upload timestamp, uploader, category, and optional caption for each asset.

6.2 WHEN an image is uploaded, THE Media_Library SHALL accept only JPEG, PNG, or WebP files no larger than 10 MiB.

6.3 WHEN a document is uploaded, THE Media_Library SHALL accept only PDF files no larger than 20 MiB.

6.4 IF an upload's extension, declared MIME type, and detected file signature do not identify the same permitted format, THEN THE Media_Library SHALL reject the upload.

6.5 IF an uploaded file is executable, script-capable, password-protected, or outside the permitted formats, THEN THE Media_Library SHALL reject the upload with a Structured_Validation_Error.

6.6 WHEN a non-decorative image is saved, THE Media_Library SHALL require alternative text between 1 and 250 characters.

6.7 WHEN an image is explicitly marked decorative, THE Media_Library SHALL store an empty alternative-text value and a decorative flag.

6.8 WHEN the Public_Website renders a managed image, THE Public_Website SHALL use the stored alternative text or an empty alternative attribute for a decorative image.

6.9 WHEN an authenticated Teacher uploads media, THE Media_Library SHALL restrict subsequent update and deletion of the asset to the uploader, an Admin, or a Principal.

6.10 WHEN an unauthenticated requester attempts to upload, update, or delete media, THE Media_Library SHALL deny the operation.

6.11 IF an authorized user attempts to delete media referenced by Published_Content, THEN THE Media_Library SHALL block deletion and identify the referencing records.

6.12 WHEN a public visitor requests media, THE Media_Library SHALL expose only assets referenced by Published_Content or explicitly marked public.

6.13 WHILE the Media_Library runs in Production_Mode, THE Media_Library SHALL store uploaded file bytes in durable storage that survives application process restarts and keeps storage credentials outside managed records.

### Requirement 7: Reusable Public Forms and Stored Submissions

**User Story:** As an administrator, I want reusable contact, feedback, and event-registration forms, so that I can configure fields and notification behavior without code changes.

#### Acceptance Criteria

7.1 THE Form_Service SHALL support form definitions of type `contact`, `feedback`, and `event_registration`.

7.2 THE Form_Service SHALL support labeled text, textarea, email, phone, select, radio, checkbox, consent, and date fields with administrator-defined required status and option values.

7.3 WHEN an Admin or Principal changes a form definition, THE Form_Service SHALL validate unique field identifiers, non-empty labels, supported field types, and option values before saving the definition.

7.4 WHEN a visitor submits an enabled Published_Content form, THE Form_Service SHALL validate the request against the server-stored form definition before creating one PostgreSQL submission record.

7.5 IF a visitor submits a form that is disabled, unpublished, not yet published, expired, or unknown, THEN THE Form_Service SHALL reject the submission without creating a record.

7.6 WHEN a form submission fails validation, THE Form_Service SHALL return Structured_Validation_Error entries mapped to the invalid field identifiers.

7.7 WHEN a form submission succeeds, THE Form_Service SHALL return a non-sensitive reference identifier without returning other submissions or administrative fields.

7.8 WHEN a stored form submission is viewed in the Payload_Admin_UI, THE Form_Service SHALL display the form type, form title, submission time, submission values, notification outcome, and review status.

7.9 WHEN a contact or feedback submission is created, THE Form_Service SHALL set the review status to `new`.

7.10 WHEN an event-registration form has a configured capacity, THE Form_Service SHALL reject registrations after the number of accepted registrations reaches the configured capacity.

7.11 WHEN an event-registration form has a configured closing time, THE Form_Service SHALL reject registrations received after the closing time.

7.12 WHEN a form submission is created, THE Notification_Service SHALL select the first valid recipient from the form-specific Notification_Settings recipient, the global Notification_Settings recipient, and the `FORM_NOTIFICATION_EMAIL` environment fallback in that order.

7.13 WHERE notifications are disabled for a form, THE Notification_Service SHALL mark the submission notification as `disabled` without attempting delivery.

7.14 IF no valid form notification recipient is available, THEN THE Notification_Service SHALL mark the notification as `not_configured` and keep the form submission successful.

7.15 IF form notification delivery fails, THEN THE Notification_Service SHALL mark the notification as `failed`, store a sanitized failure reason, and keep the form submission successful.

7.16 WHEN an authorized Principal or Admin retries a failed form notification, THE Notification_Service SHALL create a new auditable attempt without creating a duplicate form submission.

7.17 IF one client address submits more than 10 public form requests within 10 minutes, THEN THE Form_Service SHALL reject additional requests from that address until the 10-minute window ends.

7.18 THE Form_Service SHALL exclude passwords, secrets, and file contents from email notification bodies.

7.19 WHEN a public form accepts consent, THE Form_Service SHALL store the consent label, consent value, and submission timestamp with the submission.

7.20 THE Form_Service SHALL limit submitted single-line values to 200 characters and submitted textarea values to 5,000 characters unless a form definition sets a smaller limit.

7.21 WHEN simultaneous event-registration requests target a configured capacity, THE Form_Service SHALL enforce the capacity atomically so accepted registrations do not exceed the configured capacity.

7.22 WHEN a form definition requires consent, THE Form_Service SHALL reject a submission unless the consent value is affirmative.


### Requirement 8: News, Events, and Announcements

**User Story:** As a website administrator, I want managed editorial records, so that news, events, and announcements can be created, reviewed, and published without code changes.

#### Acceptance Criteria

8.1 THE Publication_Service SHALL provide separate managed record types for news, events, and announcements.

8.2 THE Publication_Service SHALL require every news record to contain a title, unique slug, summary, body, publication status, and publication time.

8.3 THE Publication_Service SHALL require every event record to contain a title, unique slug, summary, body, start time, end time, venue or online-location value, publication status, and publication time.

8.4 IF an event end time precedes the event start time, THEN THE Publication_Service SHALL reject the event record.

8.5 THE Publication_Service SHALL require every announcement record to contain a title, message, priority, publication status, and publication time.

8.6 WHEN a Principal or Admin creates, reads, updates, or archives a news, event, or announcement record, THE Publication_Service SHALL authorize the operation.

8.7 WHEN an authorized Teacher creates or updates an assigned news, event, or announcement record, THE Publication_Service SHALL retain the record as a draft.

8.8 WHEN the Public_Website lists news, THE Public_Website SHALL order Published_Content news by publication time descending.

8.9 WHEN the Public_Website lists upcoming events, THE Public_Website SHALL order Published_Content events by start time ascending.

8.10 WHEN the Public_Website lists past events, THE Public_Website SHALL order Published_Content events by start time descending.

8.11 WHEN the Public_Website renders announcements, THE Public_Website SHALL order Published_Content announcements by priority descending and publication time descending.

8.12 IF two editorial records request the same slug within the same record type, THEN THE Publication_Service SHALL reject the later conflicting slug.

8.13 WHEN Legacy_Content from `src/data/events.json` or hard-coded announcement arrays is migrated, THE Publication_Service SHALL preserve titles, dates, categories, descriptions, links, and available image references.

### Requirement 9: Circular, Holiday List, and Newsletter Documents

**User Story:** As an administrator, I want categorized document management, so that families can find current circulars, holiday lists, and newsletters.

#### Acceptance Criteria

9.1 THE Document_Service SHALL support document types `circular`, `holiday_list`, `newsletter`, and `general_download`.

9.2 THE Document_Service SHALL require a title, document type, category, issue or effective date, academic year, publication status, publication time, and Media_Library PDF reference.

9.3 THE Document_Service SHALL support optional description, issue number, audience, expiration time, and display-order metadata.

9.4 WHEN a Principal or Admin creates, reads, updates, publishes, unpublishes, or archives a document record, THE Document_Service SHALL authorize the operation.

9.5 WHEN an authorized Teacher creates or updates an assigned document record, THE Document_Service SHALL retain the record as a draft.

9.6 WHEN a public visitor requests a document listing, THE Document_Service SHALL return only Published_Content documents and public metadata.

9.7 WHEN the Public_Website lists documents, THE Public_Website SHALL support filtering by document type, category, and academic year.

9.8 WHEN the Public_Website lists circulars or newsletters without an explicit sort selection, THE Public_Website SHALL order records by issue or effective date descending.

9.9 WHEN the Public_Website renders a holiday-list document, THE Public_Website SHALL display the academic year, effective date, description, and accessible PDF download link.

9.10 IF a document record references a missing, non-PDF, or non-public Media_Library asset, THEN THE Document_Service SHALL prevent publication of the document record.

9.11 WHEN a public visitor activates a document download link, THE Document_Service SHALL serve the referenced PDF without exposing filesystem paths, storage credentials, or administrative metadata.

### Requirement 10: Gallery Management

**User Story:** As an administrator, I want to upload and organize gallery images in Payload, so that the public gallery can change without source-code edits.

#### Acceptance Criteria

10.1 THE Gallery_Service SHALL support albums with a title, unique slug, description, cover image, category, event date, publication status, publication time, and ordered image entries.

10.2 THE Gallery_Service SHALL require each gallery image entry to reference a Media_Library image and contain display order and accessibility metadata.

10.3 WHEN a Principal or Admin creates, updates, reorders, publishes, unpublishes, or archives an album, THE Gallery_Service SHALL persist the change without requiring a source-code modification.

10.4 WHEN an authorized Teacher creates or updates an assigned album, THE Gallery_Service SHALL retain the album as a draft.

10.5 WHEN a Published_Content album is available, THE Public_Website SHALL render the album and image order from the Gallery_Service using the existing responsive gallery design.

10.6 WHEN no Published_Content album is available, THE Public_Website SHALL render the current hard-coded gallery as the Legacy_Fallback.

10.7 WHEN existing gallery images are migrated, THE Gallery_Service SHALL preserve image order, captions derived from current labels, and source image references.

10.8 IF an album contains a missing, non-image, or inaccessible Media_Library reference, THEN THE Gallery_Service SHALL prevent publication of the album.

10.9 WHEN a public visitor views a gallery image, THE Public_Website SHALL provide the image's stored alternative text and keyboard-accessible navigation for any interactive gallery viewer.

### Requirement 11: Draft, Publication, Scheduling, and Expiration

**User Story:** As an administrator, I want consistent publication controls, so that content becomes public only after approval and at the intended time.

#### Acceptance Criteria

11.1 THE Publication_Service SHALL support `draft` and `published` states for page content, news, events, announcements, documents, galleries, and public form definitions.

11.2 WHEN a record is saved as `draft`, THE Publication_Service SHALL exclude the record from unauthenticated website reads, REST responses, and GraphQL responses.

11.3 WHEN an authorized Principal or Admin publishes a record with no future publication time, THE Publication_Service SHALL make the record publicly eligible within 60 seconds.

11.4 WHEN an authorized Principal or Admin assigns a future publication time to a publishable record, THE Publication_Service SHALL keep the record publicly unavailable until that time.

11.5 WHEN a scheduled publication time is reached, THE Publication_Service SHALL make the record publicly eligible within 5 minutes without requiring another administrative edit.

11.6 WHEN a Published_Content record reaches a configured expiration time, THE Publication_Service SHALL remove the record from public eligibility within 5 minutes without deleting the record.

11.7 WHEN an authorized Principal or Admin unpublishes a record, THE Publication_Service SHALL remove the record from public eligibility within 60 seconds.

11.8 IF a publication time or expiration time is not a valid timestamp, THEN THE Publication_Service SHALL reject the schedule.

11.9 IF an expiration time does not follow the publication time, THEN THE Publication_Service SHALL reject the expiration time.

11.10 THE Publication_Service SHALL store and compare publication timestamps in UTC and display timestamps in the configured school timezone.

11.11 WHEN an authenticated Principal, Admin, or assigned Teacher previews an accessible draft, THE Publication_Service SHALL return the draft only through an authenticated preview context.

11.12 WHEN a public request includes a draft identifier or preview parameter without valid authorization, THE Publication_Service SHALL return no draft content.

11.13 WHILE a record remains in `draft` state, THE Publication_Service SHALL prevent publication and expiration schedules from changing the record's state or public eligibility.

11.14 WHEN a Principal or Admin approves future publication, THE Publication_Service SHALL record the approval before the scheduled record can become publicly eligible.


### Requirement 12: Public Access Boundaries and Secret Protection

**User Story:** As a Principal, I want public endpoints and production configuration to fail safely, so that website management does not expose records or secrets.

#### Acceptance Criteria

12.1 THE Management_Suite SHALL permit unauthenticated creation only through the admissions Public_Create_Endpoint and enabled published form Public_Create_Endpoints.

12.2 WHEN an unauthenticated requester attempts to read, list, update, or delete an admission or form submission, THE Management_Suite SHALL deny the request.

12.3 WHEN an unauthenticated requester attempts to create, read, update, or delete users, Notification_Settings, Audit_Log records, drafts, document definitions, gallery definitions, or form definitions, THE Management_Suite SHALL deny the request.

12.4 WHEN a public create request supplies workflow status, notification recipient, notification outcome, publication status, role, owner, or audit fields, THE Management_Suite SHALL ignore or reject the protected fields and apply server-controlled values.

12.5 WHEN a Principal or Admin reads admission or form submission records, THE Management_Suite SHALL return Sensitive_Data only after server-side authorization succeeds.

12.6 WHEN rich text or visitor-provided text is rendered on the Public_Website or in an email, THE Management_Suite SHALL sanitize executable markup and unsafe URLs before rendering.

12.7 IF an admission client address submits more than 5 create requests within 10 minutes, THEN THE Admission_Service SHALL reject additional requests from that address until the 10-minute window ends.

12.8 WHILE the Management_Suite runs in Production_Mode, THE Management_Suite SHALL require a non-default Payload secret and a configured PostgreSQL connection before serving application requests.

12.9 IF Production_Mode uses the known development Payload secret or an empty Payload secret, THEN THE Management_Suite SHALL stop initialization with a sanitized configuration error.

12.10 THE Management_Suite SHALL read database credentials, SMTP transport credentials, Payload secrets, and storage credentials exclusively from environment configuration.

12.11 THE Management_Suite SHALL exclude secret values and complete Sensitive_Data values from application logs, validation responses, notification failure reasons, and Audit_Log metadata.

12.12 WHEN the Payload_Admin_UI displays Notification_Settings, THE Management_Suite SHALL omit every environment-configured secret field from the schema and response.

12.13 WHEN a public list endpoint returns Published_Content, THE Management_Suite SHALL return only fields required by the corresponding public page.

12.14 IF a public request attempts to select hidden or administrative fields, THEN THE Management_Suite SHALL omit the hidden or administrative fields from the response.

12.15 IF authentication, authorization, publication filtering, or protected-field filtering cannot complete, THEN THE Management_Suite SHALL apply Safe_Failure by denying the operation and returning no protected record, Sensitive_Data, or secret value.

### Requirement 13: Auditability and Operational Outcomes

**User Story:** As a Principal, I want an auditable history of important actions, so that content, access, and notification changes can be reviewed without exposing secrets.

#### Acceptance Criteria

13.1 WHEN an authenticated user creates, updates, publishes, unpublishes, archives, restores, or deletes a managed record, THE Audit_Log SHALL record the actor identifier, action, collection, target identifier, changed field names, outcome, and UTC timestamp.

13.2 WHEN an authenticated user reads an admission or form submission detail record, THE Audit_Log SHALL record the actor identifier, collection, target identifier, read action, and UTC timestamp.

13.3 WHEN Notification_Settings change, THE Audit_Log SHALL record the actor, changed setting names, masked recipient values, and UTC timestamp.

13.4 WHEN the Notification_Service attempts delivery, THE Audit_Log SHALL record the target record identifier, recipient address, attempt number, outcome, and UTC timestamp.

13.5 IF a notification attempt fails, THEN THE Audit_Log SHALL record a sanitized error category without SMTP credentials, message contents, stack traces, or Sensitive_Data.

13.6 WHEN a user role or active state changes, THE Audit_Log SHALL preserve both the prior and resulting non-secret role or active-state value.

13.7 WHEN an Admin requests Audit_Log records, THE User_Service SHALL deny the request.

13.8 WHEN a Principal requests Audit_Log records, THE User_Service SHALL authorize read-only access with filtering by actor, action, collection, target identifier, outcome, and date range.

13.9 WHEN any user attempts to update or delete an Audit_Log record through an application interface, THE Management_Suite SHALL deny the operation.

13.10 THE Audit_Log SHALL retain records for at least 365 days.

13.11 WHEN an audit export is produced for a Principal, THE Audit_Log SHALL mask recipient addresses and exclude Sensitive_Data values and secret values.

### Requirement 14: Accessibility and Design Preservation

**User Story:** As a website visitor, I want accessible and visually consistent CMS-backed pages and forms, so that website-management changes do not reduce usability.

#### Acceptance Criteria

14.1 THE Public_Website SHALL preserve existing route paths, shared headers, shared footers, typography, colors, spacing, breakpoints, and component hierarchy when replacing Legacy_Content with Published_Content.

14.2 WHEN a public form field renders, THE Public_Website SHALL provide a programmatically associated visible label, required-state indication, and accessible instructions.

14.3 WHEN a public form validation error renders, THE Public_Website SHALL associate the error with the invalid field and move focus to or summarize the first invalid field.

14.4 WHEN a submission status changes to submitting, successful, or failed, THE Public_Website SHALL announce the status through an ARIA_Live_Region.

14.5 WHEN a visitor uses only a keyboard, THE Public_Website SHALL allow access to every interactive form, document, news, event, announcement, and gallery control with a visible focus indicator.

14.6 WHEN the Public_Website renders a managed document link, THE Public_Website SHALL identify the document title and PDF format in accessible link text.

14.7 WHEN the Public_Website renders CMS-managed headings, THE Public_Website SHALL preserve a sequential heading structure without skipping a level solely because of CMS content.

14.8 THE Public_Website SHALL meet WCAG_2_2_AA criteria for newly introduced or modified CMS-backed interfaces.

14.9 WHEN automated accessibility checks run against `/apply`, one reusable public form, the news/resources page, one document listing, and the gallery page, THE Public_Website SHALL produce zero critical or serious violations attributable to this feature.

14.10 WHEN viewport width is 320 CSS pixels or greater, THE Public_Website SHALL render newly introduced CMS content and controls without horizontal page scrolling caused by the feature.

### Requirement 15: Verification and Acceptance Evidence

**User Story:** As a maintainer, I want repeatable acceptance evidence, so that the suite's access, migration, publication, and fallback behavior can be verified before release.

#### Acceptance Criteria

15.1 WHEN acceptance verification runs, THE Management_Suite SHALL demonstrate the existing, partial, and missing classifications in the Verified Capability Classification against the repository baseline.

15.2 THE Management_Suite SHALL provide automated authorization tests for every combination of Principal, Admin, Teacher, Parent, and unauthenticated caller against create, read, update, delete, publish, and settings operations.

15.3 THE Management_Suite SHALL provide request-validation tests for valid inputs, missing required fields, boundary lengths, invalid enumerations, invalid contact data, future birth dates, unsafe markup, and protected-field injection.

15.4 THE Notification_Service SHALL provide tests for recipient precedence, disabled notifications, missing recipients, successful delivery, failed delivery, retry behavior, and secret redaction using a non-network test transport.

15.5 THE Publication_Service SHALL provide tests for drafts, immediate publication, future publication, expiration, unpublishing, unauthorized preview attempts, and public API filtering.

15.6 THE Media_Library SHALL provide tests for permitted formats, size boundaries, MIME-signature mismatch, executable content rejection, required alternative text, and referenced-asset deletion protection.

15.7 WHEN migration verification compares representative routes before and after CMS migration, THE Public_Website SHALL preserve text, links, image references, route paths, and visual component structure.

15.8 IF CMS content is absent, unpublished, expired, or temporarily unreadable during fallback verification, THEN THE Public_Website SHALL render the specified Legacy_Fallback.

15.9 WHEN public endpoint verification runs without authentication, THE Management_Suite SHALL create valid admissions and enabled-form submissions while denying public read, update, delete, draft, user, settings, and audit operations.

15.10 WHEN lint, type checking, schema migration checks, targeted tests, and the production build run, THE Management_Suite SHALL complete each check without feature-introduced errors.

15.11 THE verification evidence SHALL exclude deployment execution, source-control commits, secret rotation, real SMTP delivery, production credentials, and production Sensitive_Data.