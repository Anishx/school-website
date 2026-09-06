import fc from 'fast-check'
import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { canAccessCollectionRecord } from '../../src/access/collectionAccess'
import { createMediaCollection } from '../../src/collections/Media'
import {
  checkMediaDeletion,
  MEDIA_REFERENCE_SOURCES,
  type MediaReferenceKind,
  type MediaReferenceSummary,
} from '../../src/cms/media/references'
import type { AccessSubject, PrincipalID, SupportedRole } from '../../src/access/roles'

// Feature: payload-cms-expansion, Property 12: Referenced assets cannot be deleted
// **Validates: Requirements 6.9, 6.11, 12.9**

const MEDIA_ID = 'media-under-test'

type ReferenceSource = (typeof MEDIA_REFERENCE_SOURCES)[number]
type ActorKind = SupportedRole | 'legacy-staff' | 'unauthenticated'
type RelationShape = 'scalar' | 'object'

type GraphEntry = Readonly<{
  source: ReferenceSource
  relationShape: RelationShape
  referencedPaths: readonly boolean[]
}>

type GeneratedCase = Readonly<{
  actorKind: ActorKind
  active: boolean
  ownsAsset: boolean
  graph: readonly GraphEntry[]
}>

const actorKindArbitrary = fc.constantFrom<ActorKind>(
  'principal', 'admin', 'teacher', 'parent', 'legacy-staff', 'unauthenticated',
)

const graphEntryArbitrary: fc.Arbitrary<GraphEntry> = fc
  .constantFrom<ReferenceSource>(...MEDIA_REFERENCE_SOURCES)
  .chain((source) => fc.record({
    source: fc.constant(source),
    relationShape: fc.constantFrom<RelationShape>('scalar', 'object'),
    referencedPaths: fc.array(fc.boolean(), {
      minLength: source.paths.length,
      maxLength: source.paths.length,
    }),
  }))

const deletionCaseArbitrary: fc.Arbitrary<GeneratedCase> = fc.record({
  actorKind: actorKindArbitrary,
  active: fc.boolean(),
  ownsAsset: fc.boolean(),
  graph: fc.array(graphEntryArbitrary, { maxLength: 18 }),
})

function actorFor(actorKind: ActorKind, active: boolean): AccessSubject {
  if (actorKind === 'unauthenticated') return null
  return {
    id: `actor-${actorKind}`,
    role: actorKind === 'legacy-staff' ? 'staff' : actorKind,
    active,
  }
}

function relation(id: PrincipalID, shape: RelationShape): PrincipalID | Readonly<{ id: PrincipalID }> {
  return shape === 'object' ? { id } : id
}

function setPath(record: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split('.')
  let current = record

  for (const [index, segment] of segments.entries()) {
    if (index === segments.length - 1) {
      current[segment] = value
      return
    }

    const existing = current[segment]
    if (Array.isArray(existing) && existing[0] && typeof existing[0] === 'object') {
      current = existing[0] as Record<string, unknown>
      continue
    }
    if (existing && typeof existing === 'object') {
      current = existing as Record<string, unknown>
      continue
    }

    const next: Record<string, unknown> = {}
    current[segment] = ['blocks', 'fields', 'images'].includes(segment) ? [next] : next
    current = next
  }
}

function buildGraph(graph: readonly GraphEntry[]): Readonly<{
  collections: Record<string, unknown>
  records: Record<string, readonly Record<string, unknown>[]>
  summaries: readonly MediaReferenceSummary[]
}> {
  const collections: Record<string, unknown> = {}
  const records: Record<string, Record<string, unknown>[]> = {}
  const summaries: MediaReferenceSummary[] = []

  for (const source of MEDIA_REFERENCE_SOURCES) {
    collections[source.collection] = {}
    records[source.collection] = []
  }

  for (const [index, entry] of graph.entries()) {
    const recordId = `${entry.source.kind}-record-${index}`
    const record: Record<string, unknown> = { id: recordId }
    const matchingPaths = entry.source.paths.filter((path, pathIndex) => entry.referencedPaths[pathIndex])

    for (const [pathIndex, path] of entry.source.paths.entries()) {
      setPath(record, path, relation(
        entry.referencedPaths[pathIndex] ? MEDIA_ID : `other-media-${index}-${pathIndex}`,
        entry.relationShape,
      ))
    }

    records[entry.source.collection].push(record)
    if (matchingPaths.length > 0) {
      summaries.push({
        collection: entry.source.collection,
        kind: entry.source.kind,
        recordId,
        paths: matchingPaths,
      })
    }
  }

  return { collections, records, summaries }
}

function requestFor(
  user: AccessSubject,
  graph: ReturnType<typeof buildGraph>,
): PayloadRequest {
  return {
    context: {},
    user,
    payload: {
      collections: graph.collections,
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: graph.records[collection] ?? [],
        totalPages: 1,
      })),
    },
  } as unknown as PayloadRequest
}

function canDelete(user: AccessSubject, ownsAsset: boolean): boolean {
  const actorId = typeof user?.id === 'string' ? user.id : 'unowned-actor'
  return canAccessCollectionRecord({
    user,
    resource: 'media',
    operation: 'delete',
    record: { uploadedBy: ownsAsset ? actorId : 'another-uploader' },
  })
}

function canReceiveReferenceSummary(actorKind: ActorKind, active: boolean): boolean {
  return active && (actorKind === 'principal' || actorKind === 'admin')
}

async function attemptDeletion(input: Readonly<{
  user: AccessSubject
  ownsAsset: boolean
  request: PayloadRequest
}>): Promise<Readonly<{
  metadataDeleted: boolean
  bytesDeleted: boolean
  denied: boolean
}>> {
  let metadataDeleted = false
  let bytesDeleted = false
  if (!canDelete(input.user, input.ownsAsset)) {
    return { metadataDeleted, bytesDeleted, denied: true }
  }

  try {
    await createMediaCollection().hooks?.beforeDelete?.[0]?.({
      id: MEDIA_ID,
      req: input.request,
    } as never)
  } catch {
    return { metadataDeleted, bytesDeleted, denied: true }
  }

  metadataDeleted = true
  bytesDeleted = true
  return { metadataDeleted, bytesDeleted, denied: false }
}

describe('media relationship-safe deletion property', () => {
  it('returns every manager-visible reference and preserves metadata and bytes for every denied deletion', async () => {
    await fc.assert(
      fc.asyncProperty(deletionCaseArbitrary, async ({ actorKind, active, ownsAsset, graph: entries }) => {
        const graph = buildGraph(entries)
        const user = actorFor(actorKind, active)
        const request = requestFor(user, graph)
        const expectedReferences = canReceiveReferenceSummary(actorKind, active)
          ? graph.summaries
          : []
        const expectedAllowed = graph.summaries.length === 0

        const check = await checkMediaDeletion(MEDIA_ID, request)
        const byRecord = (left: MediaReferenceSummary, right: MediaReferenceSummary) =>
          String(left.recordId).localeCompare(String(right.recordId))
        expect({ ...check, references: [...check.references].sort(byRecord) }).toEqual({
          allowed: expectedAllowed,
          references: [...expectedReferences].sort(byRecord),
        })

        const deletion = await attemptDeletion({ user, ownsAsset, request })
        const shouldSucceed = canDelete(user, ownsAsset) && expectedAllowed
        expect(deletion.denied).toBe(!shouldSucceed)
        expect(deletion.metadataDeleted).toBe(shouldSucceed)
        expect(deletion.bytesDeleted).toBe(shouldSucceed)
        if (!shouldSucceed) {
          expect(deletion.metadataDeleted).toBe(false)
          expect(deletion.bytesDeleted).toBe(false)
        }
      }),
      { numRuns: 150 },
    )
  })
})
