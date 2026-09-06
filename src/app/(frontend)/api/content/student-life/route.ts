import { NextResponse } from 'next/server'

import { getClubs, getSports } from '@/cms/public/loaders'

export async function GET() {
  const [sports, clubs] = await Promise.all([getSports(), getClubs()])
  return NextResponse.json({ sports, clubs })
}
