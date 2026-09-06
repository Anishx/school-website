import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'
import { env } from '@/cms/config/env'
import { PUBLICATION_COLLECTIONS, reconcilePublications } from '@/cms/publication/reconcile'

export async function POST(request: Request) {
  const supplied = request.headers.get('authorization')
  if (!env.SCHEDULER_SECRET || supplied !== `Bearer ${env.SCHEDULER_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const payload = await getPayload({ config })
  const results = await Promise.all(PUBLICATION_COLLECTIONS.map(async (collection) => ({
    collection,
    ...(await reconcilePublications(payload, collection)),
  })))
  return NextResponse.json({ results })
}
