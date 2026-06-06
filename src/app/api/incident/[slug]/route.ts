import { NextResponse } from 'next/server'
import { KELP_DAO_DATA } from '@/data/kelp-dao'
import { ZCASH_ORCHARD_DATA } from '@/data/zcash-orchard'
import type { IncidentData } from '@/data/types'

const INCIDENTS: Record<string, IncidentData> = {
  'kelp-dao': KELP_DAO_DATA,
  'zcash-orchard': ZCASH_ORCHARD_DATA,
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = INCIDENTS[slug]
  if (!data) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
