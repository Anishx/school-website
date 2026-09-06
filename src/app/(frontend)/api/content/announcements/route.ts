import { NextResponse } from 'next/server'

import { getAnnouncementBar } from '@/cms/public/loaders'

export async function GET() {
  return NextResponse.json(await getAnnouncementBar())
}
