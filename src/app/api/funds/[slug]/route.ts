import { NextResponse } from 'next/server'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const incident = INCIDENT_DATA_BY_SLUG[slug]
  if (!incident) return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  const data = await Promise.all(incident.tracked_wallets.map(async (wallet) => {
    const base = { ...wallet, holdings: [] as Array<{ contract: string | null; symbol: string; amount: number; usd: number | null }>, checked_at: null as string | null, status: 'unsupported', total_usd: null as number | null }
    if (wallet.chain !== 'ethereum') return base
    try {
      const [account, tokens] = await Promise.all([
        fetch(`https://eth.blockscout.com/api/v2/addresses/${wallet.address}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
        fetch(`https://eth.blockscout.com/api/v2/addresses/${wallet.address}/token-balances`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
      ])
      if (!account.ok || !tokens.ok) throw new Error('Explorer unavailable')
      const [address, balances] = await Promise.all([account.json(), tokens.json()])
      if (!Array.isArray(balances) || !/^\d+$/.test(address.coin_balance ?? '')) throw new Error('Invalid explorer response')
      const native = Number(address.coin_balance) / 1e18
      const price = Number(address.exchange_rate)
      const holdings: typeof base.holdings = balances.filter((entry) => entry.token?.type === 'ERC-20' && entry.token?.reputation !== 'scam').map((entry) => {
        const amount = Number(entry.value) / 10 ** Number(entry.token.decimals)
        const rate = Number(entry.token.exchange_rate)
        return { contract: entry.token.address_hash as string, symbol: String(entry.token.symbol || 'Unknown'), amount, usd: entry.token.exchange_rate && Number.isFinite(rate) ? amount * rate : null }
      }).filter((entry) => Number.isFinite(entry.amount) && entry.amount > 0)
      holdings.push({ contract: null, symbol: 'ETH', amount: native, usd: address.exchange_rate && Number.isFinite(price) ? native * price : null })
      holdings.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1))
      return { ...base, holdings, checked_at: new Date().toISOString(), status: 'available', total_usd: holdings.some((h) => h.usd !== null) ? holdings.reduce((sum, h) => sum + (h.usd ?? 0), 0) : null }
    } catch {
      return { ...base, status: 'unavailable' }
    }
  }))
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-store' } })
}
