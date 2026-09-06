import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  isPubliclyEligible,
  preparePublicationChange,
  publicationSystemContext,
} from '../../src/cms/publication/model'

function request(user: PayloadRequest['user'], context: PayloadRequest['context'] = {}): PayloadRequest {
  return { user, context } as PayloadRequest
}

describe('publication model', () => {
  it('only exposes published records inside their publication window', () => {
    const now = new Date('2026-09-05T12:00:00.000Z')
    expect(isPubliclyEligible({ publicationState: 'published', publishAt: '2026-09-05T11:59:59.000Z' }, now)).toBe(true)
    expect(isPubliclyEligible({ publicationState: 'scheduled', publishAt: '2026-09-05T11:00:00.000Z' }, now)).toBe(false)
    expect(isPubliclyEligible({ publicationState: 'published', publishAt: '2026-09-05T12:00:01.000Z' }, now)).toBe(false)
    expect(isPubliclyEligible({ publicationState: 'published', publishAt: '2026-09-05T11:00:00.000Z', expiresAt: now.toISOString() }, now)).toBe(false)
  })

  it('forces teacher changes to remain drafts', () => {
    const result = preparePublicationChange({
      data: { publicationState: 'published' },
      originalDoc: { publicationState: 'draft' },
      req: request({ id: 'teacher-1', role: 'teacher', active: true } as never),
      now: new Date('2026-09-05T12:00:00.000Z'),
    })
    expect(result.publicationState).toBe('draft')
  })

  it('allows the protected reconciler to publish a due schedule', () => {
    const result = preparePublicationChange({
      data: { publicationState: 'published' },
      originalDoc: { publicationState: 'scheduled', publishAt: '2026-09-05T11:00:00.000Z' },
      req: request(null, publicationSystemContext()),
      now: new Date('2026-09-05T12:00:00.000Z'),
    })
    expect(result.publicationState).toBe('published')
    expect(result.publishedAt).toBe('2026-09-05T12:00:00.000Z')
  })
})
