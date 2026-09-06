import { revalidateTag } from 'next/cache'
import type { PayloadRequest } from 'payload'

import { resolvePrincipal } from '../../access/roles'
import { writeAudit } from '../audit/writeAudit'
import { logOperationalError } from '../errors/log'
import { CMS_TAGS, sectionTag } from '../public/cache-tags'

type HookDocument = Record<string, unknown> & { id?: string | number; publicationState?: unknown }

function tagsFor(collection: string, doc: HookDocument): string[] {
  if (collection === 'content-sections') return [CMS_TAGS.sections, sectionTag(String(doc.key ?? 'unknown'))]
  if (collection === 'editorial') return [CMS_TAGS.editorial]
  if (collection === 'documents') return [CMS_TAGS.documents]
  return []
}

async function invalidate(collection: string, doc: HookDocument): Promise<void> {
  for (const tag of tagsFor(collection, doc)) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      logOperationalError(error, { event: 'cms_cache_invalidation_failed', context: { collection, tag } })
    }
  }
}

export async function afterPublishedContentChange(args: Readonly<{
  collection: 'content-sections' | 'editorial' | 'documents'
  doc: HookDocument
  previousDoc?: HookDocument
  req: PayloadRequest
}>): Promise<HookDocument> {
  await invalidate(args.collection, args.doc)

  if (args.previousDoc?.publicationState !== args.doc.publicationState && args.doc.id != null) {
    const actor = resolvePrincipal(args.req.user)
    await writeAudit({
      actor: actor ? { id: actor.id, role: actor.role } : 'system',
      action: 'publication-state-changed',
      target: { collection: args.collection, id: args.doc.id },
      timestamp: new Date().toISOString(),
      outcome: 'success',
      metadata: { from: args.previousDoc?.publicationState ?? 'draft', to: args.doc.publicationState },
    }, args.req)
  }
  return args.doc
}


export async function afterPublishedContentDelete(args: Readonly<{
  collection: 'content-sections' | 'editorial' | 'documents'
  doc: HookDocument
}>): Promise<HookDocument> {
  await invalidate(args.collection, args.doc)
  return args.doc
}

export async function afterMediaChange<T>(doc: T): Promise<T> {
  for (const tag of [CMS_TAGS.editorial, CMS_TAGS.documents, CMS_TAGS.sections]) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      logOperationalError(error, { event: 'cms_cache_invalidation_failed', context: { collection: 'media', tag } })
    }
  }
  return doc
}
