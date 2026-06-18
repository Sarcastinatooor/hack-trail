import { NextResponse } from 'next/server'
import { KELP_DAO_DATA } from '@/data/kelp-dao'
import { ZCASH_ORCHARD_DATA } from '@/data/zcash-orchard'
import { DRIFT_PROTOCOL_DATA } from '@/data/drift-protocol'
import type { IncidentData, TrackedWallet } from '@/data/types'

const INCIDENTS: Record<string, IncidentData> = {
  'kelp-dao': KELP_DAO_DATA,
  'zcash-orchard': ZCASH_ORCHARD_DATA,
  'drift-protocol': DRIFT_PROTOCOL_DATA,
}

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  optimism: 10,
  polygon: 137,
}

async function getEthBalance(address: string, chain: string): Promise<number> {
  const chainId = CHAIN_IDS[chain.toLowerCase()]
  if (!chainId) return 0
  const apiKey = process.env.ETHERSCAN_API_KEY || ''
  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    const json = await res.json()
    if (json.status === '1') {
      return parseFloat(json.result) / 1e18
    }
    return 0
  } catch {
    return 0
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

  const wallets = data.tracked_wallets
  if (!wallets.length) {
    return NextResponse.json({ data: [], note: 'No tracked wallets for this incident (shielded/private chain)' })
  }

  const results = await Promise.all(
    wallets.map(async (w: TrackedWallet) => {
      const balance = await getEthBalance(w.address, w.chain)
      return {
        address: w.address,
        chain: w.chain,
        label: w.label,
        role: w.role,
        balance_eth: balance,
        total_usd: 0, // Would need price * balance
      }
    })
  )

  return NextResponse.json({ data: results })
}
