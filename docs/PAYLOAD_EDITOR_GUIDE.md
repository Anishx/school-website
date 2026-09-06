# Payload website content editor guide

This guide covers the website content managed in Payload. Sign in at `/admin` with an active Teacher, Principal, or Admin account. Teachers can prepare their own or assigned drafts by default. Administrators can give Teachers custom editing, removal, and approval permissions. Principals and Admins retain full website content access.

## Managing users and content permissions

Open **Users**, create or select an account, and save the required **Role** and **Active** status. Admins can create accounts and switch accounts between Admin, Teacher, and Parent. A Principal manages Principal accounts; the last active Principal remains protected.

For a Teacher, set **Website content access** to **Custom staff permissions** and select the required **Website permissions**:

| Permission | What it allows |
| --- | --- |
| Create and edit content / upload images | Create and edit website drafts, and upload images. Editing published content also needs approval permission. Images already referenced by content need approval permission to change; otherwise upload a new asset for review. |
| Remove content and unused images | Delete website records and unreferenced Media Library assets. It does not grant editing or approval. |
| Approve, publish, schedule, and withdraw content | Approve existing content and control its publication. Without edit permission, the user cannot rewrite its content. |

These custom rights apply across Website Sections, News & Announcements, Downloads & Disclosures, and Media Library. They do not grant user administration, admissions access, or notification configuration. Select all three for a staff content manager. With custom access and no permissions selected, the Teacher has no website content access. **Role defaults** restores the existing Teacher ownership/assignment rules. Parent and inactive accounts cannot use CMS permissions.

Permission changes are checked from the saved user on authenticated requests, and changes are recorded in access audits. Staff cannot edit their own role or permission grants.

## Where content lives

Open **Website Content** in the Payload sidebar.

| Website area | Payload collection | Record or filter |
| --- | --- | --- |
| News articles, events, and announcements | News & Announcements | Choose the website placements |
| School Calendar | Website Sections | Resources: School Calendar |
| Downloads | Downloads & Disclosures | Resources: Downloads |
| Mandatory Disclosure | Downloads & Disclosures | Mandatory Disclosure |
| Sports Disciplines | Website Sections | Sports Disciplines |
| Clubs & Activities | Website Sections | Clubs & Activities |
| Contact Us and footer | Website Sections | Contact Us |
| Announcement Bar and rollout controls | Website Settings | Announcement Bar and Website Content Sources |

The four Content Sections records use fixed keys. Edit the existing record for a key rather than creating a second copy.

## Draft, schedule, publish, and withdraw

1. Leave **Publication state** as `draft` while preparing content. Drafts may be incomplete and never appear publicly.
2. Check the preview fields, links, dates, images, document order, and placements.
3. To publish immediately, select `published`. If **Publish at** is empty, Payload records the current time.
4. To publish later, select `scheduled` and set **Publish at**. The protected publication reconciler must run on schedule for the record to become public.
5. Set **Expires at** when content should leave the site automatically.
6. To withdraw content, change it to `archived`. Use `draft` when a revised version is still being prepared.

Scheduled and published records must be complete. Payload blocks invalid date ranges, unsafe links, incomplete section data, and unverified media. Times are stored in UTC; enter and review them for the school timezone, Asia/Kolkata.

**Website Settings** records whether each migrated area still uses existing website content or uses CMS managed content. Once an administrator selects **CMS managed content**, an empty result stays empty: archiving or deleting the last item does not restore old bundled copy. Switch an area only after its imported drafts have been reviewed and published.

## Images and PDFs

Upload assets in **Media Library** before selecting them on content records. Enter only the title, category, alternative text or decorative choice, and optional caption. Original filename, uploader, upload time, and verification status are filled by the server and remain read-only.

**Uploaded By** identifies the person who originally uploaded the image; it preserves that history when an asset is replaced. It is not a human approval assignment. **Verification Status** is an automatic file check, not a decision by a school staff member. A Principal, Admin, or Teacher with approval permission decides when the article or section using an image is published.

If an existing upload shows **failed**, open the record and save it to retry verification. The **Verification Message** explains file-validation failures. If the stored file is unavailable, upload it again. Valid JPEG/PNG/WebP images are no longer rejected merely because their compressed data contains an incidental executable-header byte sequence. Replacement files are checked again before being marked verified.

- Use descriptive file names and meaningful alternative text.
- Use an image crop and object position that work on both desktop and mobile.
- Use PDF files for downloads and mandatory disclosure records.
- Wait until an upload is marked verified before publishing content that references it.
- Replace a file by uploading and verifying the new asset, updating every referencing record, and publishing those changes. Referenced media cannot be deleted safely until those references are removed.

For Downloads & Disclosures, choose **Uploaded PDF** or **External Google document**. Uploaded files must be verified. External links must use HTTPS on Google Drive or Google Docs. Mandatory disclosures also require an academic year and effective date; evergreen downloads do not. Seeded placeholders remain drafts until the school supplies approved files and dates.

## Editing each area

For News & Announcements records, choose only the placements where the item should appear. News and events need a stable slug, summary, and body. Events also need start, end, and location. Announcements need a message. Announcement Bar items may also have a site path, page anchor, or HTTPS link; lower display-order numbers appear first.

In **Website Settings**, the Announcement Bar can be hidden and its speed and approved colour theme can be changed. The bar hides automatically when it has no published messages. These settings are restricted to Principal and Admin accounts.

For the School Calendar, edit the academic year and all seven schedule groups together. Each group needs at least one row before publication. Review daily-schedule labels and emphasis after changes.

For Sports and Clubs, keep each card's `itemKey` stable when correcting its text. Add alternative text to new images. Publishing Sports requires philosophy, coaching, at least one discipline, and one card. Publishing Clubs requires the flagship name and description plus at least one activity card.

For Contact Us, update the shared record because it feeds both the contact section and footer. The phone link must begin with `tel:` and the map embed must use HTTPS. Website contact content does not change SMTP or admission-notification settings.

## Corrections and history

Collections retain document versions. For a public correction, edit the current record, review it, and publish it again. Restored versions still pass current publication, link, date, and asset validation. Use the Audit Records collection when an administrator needs to review who changed a publication state.

If a save is rejected, keep the record as a draft and follow the field-specific validation message. Ask an Admin to resolve role, ownership, media verification, or scheduler issues rather than duplicating a record.
