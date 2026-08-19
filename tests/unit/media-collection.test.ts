import { ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  MEDIA_MIME_TYPES,
  MEDIA_VERIFICATION_STATUSES,
  createMediaCollection,
  prepareMediaData,
  publicMediaProjection,
  verifiedMediaWhere,
  withMediaVerificationContext,
} from '../../src/collections/Media'
import { buildUser } from '../fixtures'

const NOW = new Date('2030-01-15T10:00:00.000Z')

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

function validMedia(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: '  Assembly photograph  ',
    originalFilename: 'assembly.png',
    filename: 'stored-assembly.png',
    mimeType: 'image/png',
    filesize: 1024,
    category: '  campus life ',
    alt: '  Students at assembly  ',
    decorative: false,
    ...overrides,
  }
}

function namedFields(config: CollectionConfig): string[] {
  return config.fields.flatMap((field) => 'name' in field ? [field.name] : [])
}

describe('media collection schema and access', () => {
  it('defines required metadata, supported upload types, image-only sizes, and verification states', () => {
    const config = createMediaCollection()
    const names = namedFields(config)

    expect(names).toEqual([
      'title', 'originalFilename', 'category', 'alt', 'decorative', 'caption',
      'uploadedBy', 'uploadedAt', 'verificationStatus',
    ])
    expect(config.upload).toMatchObject({
      mimeTypes: MEDIA_MIME_TYPES,
      imageSizes: [
        { name: 'thumbnail', width: 400, height: 300 },
        { name: 'card', width: 1200, height: 900 },
      ],
      adminThumbnail: 'thumbnail',
    })
    const verificationStatus = config.fields.find(
      (field) => 'name' in field && field.name === 'verificationStatus',
    )
    expect(verificationStatus).toMatchObject({
      required: true,
      defaultValue: 'pending',
      options: MEDIA_VERIFICATION_STATUSES.map((status) => expect.objectContaining({ value: status })),
    })
  })

  it('allows public reads only for verified assets and projects only rendering metadata', async () => {
    const config = createMediaCollection()
    const anonymous = request()
    const afterRead = config.hooks?.afterRead?.[0]

    expect(await config.access?.read?.({ req: anonymous } as never)).toEqual(verifiedMediaWhere())
    expect(await afterRead?.({
      doc: { ...validMedia(), id: 'private-id', url: 'https://blob.example.test/assembly.png', verificationStatus: 'pending' },
      req: anonymous,
    } as never)).toBeNull()

    const projected = await afterRead?.({
      doc: {
        ...validMedia(), id: 'private-id', url: 'https://blob.example.test/assembly.png',
        width: 1200, height: 800, caption: '  Morning assembly  ', verificationStatus: 'verified',
        uploadedBy: 'teacher-001', uploadedAt: NOW.toISOString(), filesize: 1024,
      },
      req: anonymous,
    } as never)
    expect(projected).toEqual({
      url: 'https://blob.example.test/assembly.png',
      alt: 'Students at assembly', decorative: false,
      width: 1200, height: 800, caption: 'Morning assembly',
    })
    expect(JSON.stringify(projected)).not.toContain('private-id')
    expect(JSON.stringify(projected)).not.toContain('teacher-001')
  })

  it('enforces Teacher ownership while allowing Admin and Principal media mutation', async () => {
    const config = createMediaCollection()
    const anonymous = request()
    const teacher = request(buildUser({ id: 'teacher-001', role: 'teacher', active: true }))
    const admin = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const principal = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))

    for (const operation of ['create', 'update', 'delete'] as const) {
      expect(await config.access?.[operation]?.({ req: anonymous } as never)).toBe(false)
      expect(await config.access?.[operation]?.({ req: admin } as never)).toBe(true)
      expect(await config.access?.[operation]?.({ req: principal } as never)).toBe(true)
    }
    expect(await config.access?.create?.({ req: teacher } as never)).toBe(true)
    expect(await config.access?.update?.({ req: teacher } as never)).toEqual({
      uploadedBy: { equals: 'teacher-001' },
    })
    expect(await config.access?.delete?.({ req: teacher } as never)).toEqual({
      uploadedBy: { equals: 'teacher-001' },
    })
  })
})

describe('media metadata lifecycle', () => {
  it('normalizes metadata and stamps pending uploader/time values without trusting client ownership', () => {
    const teacher = buildUser({ id: 'teacher-001', role: 'teacher', active: true })
    const prepared = prepareMediaData({
      data: validMedia({ uploadedBy: 'attacker', uploadedAt: '2000-01-01T00:00:00.000Z', verificationStatus: 'verified' }),
      operation: 'create', req: request(teacher), now: NOW,
    })

    expect(prepared).toMatchObject({
      title: 'Assembly photograph', originalFilename: 'assembly.png', category: 'campus life',
      alt: 'Students at assembly', decorative: false,
      uploadedBy: 'teacher-001', uploadedAt: NOW.toISOString(), verificationStatus: 'pending',
    })
  })

  it('normalizes decorative image accessibility and preserves immutable ownership/status on ordinary updates', () => {
    const original = {
      ...validMedia(), uploadedBy: 'teacher-001', uploadedAt: NOW.toISOString(), verificationStatus: 'verified',
    }
    const updated = prepareMediaData({
      data: { title: 'Decorative border', decorative: true, alt: 'discarded', uploadedBy: 'attacker', verificationStatus: 'failed' },
      operation: 'update', originalDoc: original, req: request(buildUser({ id: 'teacher-001', role: 'teacher', active: true })), now: NOW,
    })

    expect(updated).toMatchObject({
      title: 'Decorative border', decorative: true, alt: '',
      uploadedBy: 'teacher-001', uploadedAt: NOW.toISOString(), verificationStatus: 'verified',
    })
  })

  it('permits only the trusted finalizer context to change verification status and rejects incomplete render metadata', () => {
    const original = {
      ...validMedia(), uploadedBy: 'teacher-001', uploadedAt: NOW.toISOString(), verificationStatus: 'pending',
    }
    const req = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    req.context = withMediaVerificationContext(req.context)

    expect(prepareMediaData({
      data: { verificationStatus: 'verified' }, operation: 'update', originalDoc: original, req, now: NOW,
    })).toMatchObject({ verificationStatus: 'verified' })
    expect(publicMediaProjection({
      verificationStatus: 'verified', url: 'https://blob.example.test/missing-alt.png', decorative: false, alt: '',
    })).toBeNull()
    expect(() => prepareMediaData({
      data: validMedia({ title: ' ' }), operation: 'create', req: request(buildUser()), now: NOW,
    })).toThrow(ValidationError)
  })
})
