import { NextResponse } from 'next/server'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'
import type { TrackedWallet } from '@/data/types'

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  optimism: 10,
  polygon: 137,
  unichain: 130,
}

const NATIVE_SYMBOLS: Record<string, string> = {
  ethereum: 'ETH',
  bsc: 'BNB',
  arbitrum: 'ETH',
  base: 'ETH',
  optimism: 'ETH',
  polygon: 'MATIC',
  unichain: 'ETH',
  solana: 'SOL',
  sui: 'SUI',
  bitcoin: 'BTC',
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
  const data = INCIDENT_DATA_BY_SLUG[slug]
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
        native_symbol: NATIVE_SYMBOLS[w.chain.toLowerCase()] ?? 'ETH',
        total_usd: 0, // Would need price * balance
      }
    })
  )

  return NextResponse.json({ data: results })
}
