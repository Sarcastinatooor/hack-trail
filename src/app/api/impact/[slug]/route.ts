import { NextResponse } from 'next/server'

interface Point {
  ts: number
  value: number
}

interface Summary {
  peak: { ts: number; value: number }
  trough: { ts: number; value: number }
  latest: { ts: number; value: number }
  first: { ts: number; value: number }
  drawdown: number
}

function summarize(data: Point[]): Summary | null {
  if (!data.length) return null
  const peak = data.reduce((a, b) => (a.value > b.value ? a : b))
  const trough = data.reduce((a, b) => (a.value < b.value ? a : b))
  const drawdown = peak.value > 0 ? ((peak.value - trough.value) / peak.value) * 100 : 0
  return { peak, trough, latest: data[data.length - 1], first: data[0], drawdown }
}

async function fetchDefiLlamaTvl(protocol: string, from: number, to: number): Promise<Point[]> {
  try {
    const res = await fetch(`https://api.llama.fi/protocol/${protocol}`, { next: { revalidate: 3600 } })
    if (!res.ok) {
      console.error(`[DefiLlama] ${protocol}: HTTP ${res.status}`)
      return []
    }
    const json = await res.json()
    const tvl = json.tvl || []
    return tvl
      .map((d: { date: number; totalLiquidityUSD: number }) => ({
        ts: d.date,
        value: d.totalLiquidityUSD,
      }))
      .filter((d: Point) => d.ts >= from && d.ts <= to)
      .sort((a: Point, b: Point) => a.ts - b.ts)
  } catch (err) {
    console.error(`[DefiLlama] ${protocol}: fetch error`, err)
    return []
  }
}

async function fetchCoinGeckoPrice(coinId: string, from: number, to: number): Promise<Point[]> {
  try {
    const rawApiKey = process.env.COINGECKO_API_KEY || ''
    const apiKey = (rawApiKey && rawApiKey !== 'your_api_key_here') ? rawApiKey : ''

    let baseUrl = 'https://api.coingecko.com/api/v3'
    const headers: Record<string, string> = {}

    if (apiKey) {
      if (apiKey.startsWith('CG-')) {
        baseUrl = 'https://api.coingecko.com/api/v3'
        headers['x-cg-demo-api-key'] = apiKey
      } else {
        baseUrl = 'https://pro-api.coingecko.com/api/v3'
        headers['x-cg-pro-api-key'] = apiKey
      }
    }

    // CoinGecko free tier only allows 365 days of history.
    // Clamp `from` to max 360 days ago to avoid errors.
    const now = Math.floor(Date.now() / 1000)
    const maxFrom = now - 360 * 86400
    const clampedFrom = Math.max(from, maxFrom)
    const clampedTo = Math.min(to, now)

    if (clampedFrom >= clampedTo) {
      console.warn(`[CoinGecko] ${coinId}: date range outside 365-day window`)
      return []
    }

    const url = `${baseUrl}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${clampedFrom}&to=${clampedTo}`
    const res = await fetch(url, { headers, next: { revalidate: 3600 } })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[CoinGecko] ${coinId}: HTTP ${res.status}`, text.slice(0, 200))
      return []
    }

    const json = await res.json()

    if (json.status?.error_code) {
      console.error(`[CoinGecko] ${coinId}: API error`, json.status.error_message)
      return []
    }

    return (json.prices || []).map(([ms, val]: [number, number]) => ({
      ts: Math.floor(ms / 1000),
      value: val,
    }))
  } catch (err) {
    console.error(`[CoinGecko] ${coinId}: fetch error`, err)
    return []
  }
}

// Config per incident slug
const IMPACT_CONFIG: Record<string, {
  tvl: Array<{ key: string; protocol: string }>
  prices: Array<{ key: string; coinId: string }>
  from: number
  to: number
}> = {
  'kelp-dao': {
    tvl: [
      { key: 'aave_tvl', protocol: 'aave' },
      { key: 'kelp_tvl', protocol: 'kelp' },     // Fixed: was 'kelp-dao'
    ],
    prices: [
      { key: 'eth_price', coinId: 'ethereum' },
      { key: 'btc_price', coinId: 'bitcoin' },
    ],
    from: 1774857600, // 2026-03-30
    to: 1777276800,   // 2026-04-27
  },
  'zcash-orchard': {
    tvl: [],
    prices: [
      { key: 'zec_price', coinId: 'zcash' },
    ],
    from: 1779926400, // 2026-05-28 (Fixed: was 2025)
    to: 1780790400,   // 2026-06-07
  },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const config = IMPACT_CONFIG[slug]
  if (!config) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  const results: Record<string, unknown> = {}

  // Fetch TVL data
  await Promise.all(
    config.tvl.map(async ({ key, protocol }) => {
      const data = await fetchDefiLlamaTvl(protocol, config.from, config.to)
      results[key] = data
      results[`${key}_summary`] = summarize(data)
    })
  )

  // Fetch price data
  await Promise.all(
    config.prices.map(async ({ key, coinId }) => {
      const data = await fetchCoinGeckoPrice(coinId, config.from, config.to)
      results[key] = data
      results[`${key}_summary`] = summarize(data)
    })
  )

  return NextResponse.json(results)
}
