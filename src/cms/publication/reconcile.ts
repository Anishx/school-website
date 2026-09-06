import type { Payload } from 'payload'

import { publicationSystemContext } from './model'

export const PUBLICATION_COLLECTIONS = ['content-sections', 'editorial', 'documents'] as const
export type PublicationCollection = (typeof PUBLICATION_COLLECTIONS)[number]

export type ReconcileSummary = Readonly<{ published: number; expired: number }>

export async function reconcilePublications(
  payload: Payload,
  collection: PublicationCollection,
  now = new Date(),
): Promise<ReconcileSummary> {
  const instant = now.toISOString()
  let published = 0
  let expired = 0
  while (true) {
    const due = await payload.find({
      collection,
      overrideAccess: true,
      depth: 0,
      limit: 100,
      pagination: false,
      where: {
        or: [
          { and: [{ publicationState: { equals: 'scheduled' } }, { publishAt: { less_than_equal: instant } }] },
          { and: [{ publicationState: { equals: 'published' } }, { expiresAt: { less_than_equal: instant } }] },
        ],
      },
    })
    if (due.docs.length === 0) break
    for (const doc of due.docs) {
      const state = doc.publicationState === 'scheduled' ? 'published' : 'expired'
      await payload.update({
        collection,
        id: doc.id,
        overrideAccess: true,
        context: publicationSystemContext(),
        data: { publicationState: state },
      })
      if (state === 'published') published += 1
      else expired += 1
    }
  }
  return { published, expired }
}
