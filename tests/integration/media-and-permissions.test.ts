import { mkdtemp, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createUsersCollection } from '../../src/collections/Users'
import { createMediaCollection } from '../../src/collections/Media'
import { ContentSections } from '../../src/collections/ContentSections'
import { Editorial } from '../../src/collections/Editorial'
import { Documents } from '../../src/collections/Documents'
import { AuditRecords } from '../../src/collections/AuditRecords'
import { canManagePublication } from '../../src/access/fieldAccess'

// Intentionally never use DATABASE_URL: this suite owns a disposable local DB.
const target = 'postgres://cms_test:local-isolated-test-only@127.0.0.1:55439/cms_permissions_test'
let payload: Payload
let directory: string

beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'cms-integration-'))
  const media = createMediaCollection()
  const config = await buildConfig({
    secret: 'isolated-cms-integration-secret-only',
    admin: { user: 'users' },
    collections: [createUsersCollection(), { ...media, upload: { ...(media.upload as object), staticDir: directory } }, ContentSections, Editorial, Documents, AuditRecords],
    db: postgresAdapter({ pool: { connectionString: target }, schemaName: `cms_test_${Date.now()}`, push: true }),
    editor: lexicalEditor(), sharp,
    typescript: { autoGenerate: false },
  })
  payload = await getPayload({ config })
}, 120_000)

afterAll(async () => {
  await payload?.destroy()
  // mkdtemp returns a unique directory beneath the operating-system temp folder.
  if (directory && path.dirname(directory) === path.resolve(os.tmpdir())) await rm(directory, { recursive: true, force: true })
})

describe('real Payload upload and permission workflow', () => {
  it('uploads and verifies one image with resized assets; delegates and revokes staff access', async () => {
    const first = await payload.create({ collection: 'users', data: { email: 'principal@example.test', password: 'Isolated-Test-Password-123!', role: 'parent', active: true }, overrideAccess: false })
    const principal = await payload.findByID({ collection: 'users', id: first.id })
    expect(principal.role).toBe('principal')
    const admin = await payload.create({ collection: 'users', user: principal, overrideAccess: false, data: { email: 'admin@example.test', password: 'Isolated-Test-Password-123!', role: 'admin', active: true } })
    const staff = await payload.create({ collection: 'users', user: admin, overrideAccess: false, data: { email: 'staff@example.test', password: 'Isolated-Test-Password-123!', role: 'teacher', active: true, contentAccess: 'custom', contentPermissions: ['edit'] } })
    expect(staff.role).toBe('teacher')
    const session = await payload.login({ collection: 'users', data: { email: 'staff@example.test', password: 'Isolated-Test-Password-123!' } })
    const headers = new Headers({ Authorization: `JWT ${session.token}` })
    const image = await payload.create({ collection: 'media', user: admin, overrideAccess: false, filePath: path.resolve('public/apollo-logo-white.png'), data: { title: 'School logo', category: 'School', alt: 'School logo' } })
    expect(image.verificationStatus).toBe('verified')
    expect(image.uploadedBy).toMatchObject({ id: admin.id })
    expect(image.originalFilename).toBe('apollo-logo-white.png')
    expect((await payload.count({ collection: 'media' })).totalDocs).toBe(1)
    expect(image.sizes?.thumbnail?.filename).toBeTruthy()
    await expect(stat(path.join(directory, image.sizes!.thumbnail!.filename!))).resolves.toBeDefined()
    const reloaded = await payload.findByID({ collection: 'media', id: image.id, user: admin, overrideAccess: false })
    expect(reloaded.verificationStatus).toBe('verified')
    const replaced = await payload.update({ collection: 'media', id: image.id, user: admin, overrideAccess: false,
      filePath: path.resolve('public/apollo-logo-white.png'), data: { title: 'Replacement logo' } })
    expect(replaced.verificationStatus).toBe('verified')
    expect((await payload.count({ collection: 'media' })).totalDocs).toBe(1)
    const forgedStatus = await payload.update({ collection: 'media', id: image.id, user: admin, overrideAccess: false,
      data: { verificationStatus: 'failed', uploadedBy: staff.id, originalFilename: 'forged.exe' } })
    expect(forgedStatus.verificationStatus).toBe('verified')
    expect(forgedStatus.uploadedBy).toMatchObject({ id: admin.id })
    expect(forgedStatus.originalFilename).toBe('apollo-logo-white.png')

    const draft = await payload.create({ collection: 'editorial', user: staff, overrideAccess: false, data: { kind: 'announcement', title: 'Review me', message: 'A school announcement', placements: ['header-ticker'], publicationState: 'draft', displayOrder: 0 } })
    const attemptedPublish = await payload.update({ collection: 'editorial', id: draft.id, user: staff, overrideAccess: false, data: { publicationState: 'published' } })
    expect(attemptedPublish.publicationState).toBe('draft')
    const approver = await payload.update({ collection: 'users', id: staff.id, user: admin, overrideAccess: false, data: { contentPermissions: ['approve'] } })
    expect(canManagePublication((await payload.auth({ headers })).user)).toBe(true)
    const published = await payload.update({ collection: 'editorial', id: draft.id, user: approver, overrideAccess: false, data: { publicationState: 'published' } })
    expect(published.publicationState).toBe('published')
    await expect(payload.update({ collection: 'editorial', id: draft.id, user: approver, overrideAccess: false, data: { message: 'Unapproved rewrite' } })).rejects.toThrow()
    const revoked = await payload.update({ collection: 'users', id: staff.id, user: admin, overrideAccess: false, data: { contentPermissions: [] } })
    expect(canManagePublication((await payload.auth({ headers })).user)).toBe(false)
    await expect(payload.update({ collection: 'editorial', id: draft.id, user: revoked, overrideAccess: false, data: { publicationState: 'archived' } })).rejects.toThrow()
    const remover = await payload.update({ collection: 'users', id: staff.id, user: admin, overrideAccess: false, data: { contentPermissions: ['remove'] } })
    await payload.delete({ collection: 'editorial', id: draft.id, user: remover, overrideAccess: false })
    expect((await payload.count({ collection: 'editorial' })).totalDocs).toBe(0)
    const promoted = await payload.update({ collection: 'users', id: staff.id, user: admin, overrideAccess: false, data: { role: 'admin' } })
    expect(promoted.role).toBe('admin')
    await expect(payload.update({ collection: 'users', id: principal.id, user: admin, overrideAccess: false, data: { role: 'parent' } })).rejects.toThrow()
    const audits = await payload.find({ collection: 'audit-records', overrideAccess: true, limit: 100 })
    expect(JSON.stringify(audits.docs)).toContain('contentAccess')
  }, 120_000)
})
