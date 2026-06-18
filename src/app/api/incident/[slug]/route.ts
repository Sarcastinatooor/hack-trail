import { NextResponse } from 'next/server'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = INCIDENT_DATA_BY_SLUG[slug]
  if (!data) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}
