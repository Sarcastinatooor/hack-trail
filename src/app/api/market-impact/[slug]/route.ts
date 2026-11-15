import { MARKET_POOLS, MARKET_COVERAGE } from '@/data/market-pools'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'
import { marketKey, normalizeIdentifier, parsePool, parseCandles, numeric, change } from '@/utils/market-impact'
import { history } from '@/server/market-history'

export const maxDuration = 60

async function provider(path: string) {
  const key = process.env.COINGECKO_ONCHAIN_API_KEY
  const plan = process.env.COINGECKO_ONCHAIN_PLAN === 'pro' ? 'pro' : 'demo'
  const root = key ? `https://${plan === 'pro' ? 'pro-api' : 'api'}.coingecko.com/api/v3/onchain` : 'https://api.geckoterminal.com/api/v2'
  const headers: Record<string, string> = key ? { [`x-cg-${plan}-api-key`]: key } : {}
  const response = await fetch(`${root}${path}`, { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`)
  const date = new Date(response.headers.get('date') ?? Date.now())
  return { body: await response.json(), observedAt: Number.isFinite(date.getTime()) ? date : new Date() }
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const configs = MARKET_POOLS[slug]
  const incident = INCIDENT_DATA_BY_SLUG[slug]?.incident
  if (!configs || !incident) return Response.json({ error: 'Incident not found' }, { status: 404 })
  const selection = new URL(request.url).searchParams.get('pool')
  const selected = selection ? configs.find(c => marketKey(c) === selection) : configs[0]
  if (selection && !selected) return Response.json({ error: 'Pool not configured for this incident' }, { status: 400 })
  const pools = []
  // Fetch only the selected, allowlisted market to bound public API load and latency.
  for (const candidate of selected ? [selected] : []) {
    const config = { ...candidate, incidentTs: incident.start_ts }
    const key = marketKey(config)
    let readings = await history(key)
    let status = 'unavailable'
    let unavailableReason: string | null = null
    let reading = readings?.at(-1) ?? null
    try {
      const response = await provider(`/networks/${config.network}/pools/${encodeURIComponent(config.pool)}`)
      reading = parsePool(config, response.body, response.observedAt)
      readings = await history(key, reading)
      status = Date.now() - Date.parse(reading.observedAt) > 600000 ? 'stale' : 'available'
    } catch (error) {
      if (reading) status = 'stale'
      unavailableReason = error instanceof Error && error.message.startsWith('Provider HTTP ')
        ? error.message === 'Provider HTTP 429' ? 'Provider rate limit reached. Retry after the provider cooldown.' : 'Provider rejected the request or does not cover this pool.'
        : 'Provider timed out or returned data that could not be validated.'
    }
    const previous = readings?.filter(r => reading && r.observedAt < reading.observedAt).at(-1) ?? null
    let candles: number[][] = []
    let risk = null
    let riskObservedAt = null
    let candleStatus = 'unavailable'
    let candleObservedAt = null
    try {
      // A fixed incident window, never substitute today's candles for historical data.
      if (config.createdAt && Date.parse(config.createdAt) / 1000 > config.incidentTs) {
        candleStatus = 'pool-created-after-incident'
      } else {
        const response = await provider(`/networks/${config.network}/pools/${encodeURIComponent(config.pool)}/ohlcv/hour?aggregate=1&limit=72&currency=usd&token=${encodeURIComponent(config.token)}&before_timestamp=${config.incidentTs + 172800}`)
        candles = parseCandles(response.body).filter(row => row[0] >= config.incidentTs - 86400 && row[0] <= config.incidentTs + 172800)
        candleObservedAt = response.observedAt.toISOString()
        candleStatus = candles.length ? 'available' : 'unavailable'
      }
    } catch { /* Missing history remains unavailable. */ }
    try {
      const { body, observedAt } = await provider(`/networks/${config.network}/tokens/${encodeURIComponent(config.token)}/info`)
      const a = body?.data?.attributes
      if (typeof a?.address !== 'string' || normalizeIdentifier(config.network, a.address) !== normalizeIdentifier(config.network, config.token)) throw new Error('Token mismatch')
      const flag = (value: unknown) => value === 'yes' || value === 'no' ? value : 'unavailable'
      risk = { gtScore: numeric(a.gt_score), top10: numeric(a.holders?.distribution_percentage?.top_10), developer: numeric(a.developer_holding_percentage), mint: flag(a.mint_authority), freeze: flag(a.freeze_authority) }
      riskObservedAt = observedAt.toISOString()
    } catch { /* Unavailable risk data never becomes a safe verdict. */ }
    pools.push({ ...config, key, status, unavailableReason, reading, previousAt: previous?.observedAt ?? null,
      changes: { liquidity: change(reading?.liquidity ?? null, previous?.liquidity ?? null), price: change(reading?.price ?? null, previous?.price ?? null), volume24h: change(reading?.volume24h ?? null, previous?.volume24h ?? null) },
      history: readings ?? [], persistence: readings === null ? 'unavailable' : 'enabled', candles, candleStatus, candleObservedAt, risk, riskObservedAt,
      identitySource: config.source,
      source: process.env.COINGECKO_ONCHAIN_API_KEY ? 'CoinGecko Onchain' : 'GeckoTerminal',
    })
  }
  return Response.json({ pools, coverage: MARKET_COVERAGE[slug] }, { headers: { 'Cache-Control': 'no-store' } })
}
