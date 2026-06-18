import { NextResponse } from 'next/server'
import { KELP_DAO_DATA } from '@/data/kelp-dao'
import { ZCASH_ORCHARD_DATA } from '@/data/zcash-orchard'
import { DRIFT_PROTOCOL_DATA } from '@/data/drift-protocol'
import type { IncidentData, Hop } from '@/data/types'

const INCIDENTS: Record<string, IncidentData> = {
  'kelp-dao': KELP_DAO_DATA,
  'zcash-orchard': ZCASH_ORCHARD_DATA,
  'drift-protocol': DRIFT_PROTOCOL_DATA,
}

function buildSankey(hops: Hop[]) {
  const nodesMap = new Map<string, { name: string; kind: string }>()
  const links: Array<{
    source: string
    target: string
    value: number
    asset?: string
    chain?: string
    phase?: string
    step?: number
    summary?: string
  }> = []

  for (const hop of hops) {
    const fromName = hop.from.label
    const toName = hop.to.label
    if (!nodesMap.has(fromName)) {
      nodesMap.set(fromName, { name: fromName, kind: hop.from.kind })
    }
    if (!nodesMap.has(toName)) {
      nodesMap.set(toName, { name: toName, kind: hop.to.kind })
    }
    // Only add links with USD value > 0 for meaningful Sankey
    if (hop.usd > 0) {
      links.push({
        source: fromName,
        target: toName,
        value: hop.usd,
        asset: hop.asset,
        chain: hop.chain,
        phase: hop.phase,
        step: hop.step,
        summary: hop.summary,
      })
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    links,
  }
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
  return NextResponse.json(buildSankey(data.hops))
}
