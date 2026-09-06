# Media verification and delegated website permissions

Implemented 5 September 2026.

## Image failure and responsibility

The automatic validator searched for short executable signatures anywhere in file bytes. The `MZ` signature occurred inside 109 of the 113 image files under `public`; compressed image bytes are not executable headers. The check now tests executable signatures at the file header. MIME/extension/signature matching, size limits, accessibility validation, and existing active-content checks remain enabled.

Uploads also preserve the processed bytes across cloud adapter cleanup. Internal verification updates no longer carry the upload file back into Payload or leak the trusted context into the outer request. Replacement files return to pending and are checked again. Failed records can be retried by saving them; local storage and temporary upload files are supported, and failures have a read-only verification message.

The server performs verification. **Uploaded By** records the original uploader. A content approver decides whether the article or section using that image goes live. Uploading an image alone does not publish website content.

## User controls

In **Users**, Admins can create users and change Admin, Teacher, and Parent roles and active status. Principal accounts remain under Principal control.

For a Teacher, choose **Website content access → Custom staff permissions**, then select **edit**, **remove**, and/or **approve** using the friendly field labels. Editing alone applies to drafts; removal allows deleting content and unused images; approval allows publication-state changes. An approval-only account cannot rewrite content. Select edit and approve together to edit live content. Existing role defaults remain available; no custom grants means no website content access.

The permissions apply across website content, and do not grant user administration or admission access. Parent/inactive accounts stay excluded. Permission changes are audited and staff cannot escalate their own account. Payload's installed JWT strategy reloads users from the database for authenticated requests, so persisted grants and revocations are used on subsequent requests.

## Verification

- 133 unit tests and eight property tests passed, including real-image regression, ownership forgery, same-row verification, local retries, grant isolation, revocation, and administrator role changes.
- The PostgreSQL/Payload integration scenario passed with the actual collections and access hooks: native image upload, resized asset creation, replacement without duplication, immutable uploader metadata, Admin user creation/promotion, draft-only editing, approval-only publishing, revocation, deletion, and Principal protection. An already-issued login token immediately observed newly granted and revoked permissions; persisted audit records retained the grant changes.
- TypeScript passed. ESLint passed with no errors and eight existing warnings. Payload types and import map regenerated.
- Integration ran against a disposable PostgreSQL container at port 55439 using generated test schemas. It did not use the application's DATABASE_URL, existing users, admissions, SMTP, or Blob store.
- The suite runs outside Next.js, so cache-invalidation hooks log expected warnings about the missing Next request context. This check does not claim production cache or hosted Blob transport validation.

## Running the database regression

Start an isolated database (the following credentials are disposable test values):

```powershell
docker run --detach --name frontend-cms-permissions-test --publish 127.0.0.1:55439:5432 --env POSTGRES_USER=cms_test --env POSTGRES_PASSWORD=local-isolated-test-only --env POSTGRES_DB=cms_permissions_test postgres:17-alpine
$env:RUN_DATABASE_TESTS = 'true'
npm run test:integration
docker rm --force --volumes frontend-cms-permissions-test
```

The test deliberately ignores DATABASE_URL and creates a fresh schema on each run. Apply the project's normal schema update before deploying the new user-permission and verification-message fields to production. Development Payload schema push handles these additions when running the local app.
