import { NextResponse } from 'next/server'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'
import type { Hop } from '@/data/types'

function buildSankey(hops: Hop[]) {
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

  // Only build links from hops with actual USD value
  for (const hop of hops) {
    if (hop.usd > 0) {
      links.push({
        source: hop.from.label,
        target: hop.to.label,
        value: hop.usd,
        asset: hop.asset,
        chain: hop.chain,
        phase: hop.phase,
        step: hop.step,
        summary: hop.summary,
      })
    }
  }

  // Only include nodes that actually appear in links (no orphans)
  const linkedNames = new Set<string>()
  for (const l of links) {
    linkedNames.add(l.source)
    linkedNames.add(l.target)
  }

  const nodesMap = new Map<string, { name: string; kind: string }>()
  for (const hop of hops) {
    if (linkedNames.has(hop.from.label) && !nodesMap.has(hop.from.label)) {
      nodesMap.set(hop.from.label, { name: hop.from.label, kind: hop.from.kind })
    }
    if (linkedNames.has(hop.to.label) && !nodesMap.has(hop.to.label)) {
      nodesMap.set(hop.to.label, { name: hop.to.label, kind: hop.to.kind })
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
  const data = INCIDENT_DATA_BY_SLUG[slug]
  if (!data) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }
  return NextResponse.json(buildSankey(data.hops))
}
