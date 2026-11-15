import type { MarketPool } from '../data/market-pools'

export function numeric(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null
  if (typeof value === 'string' && !value.trim()) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

export function normalizeIdentifier(network: string, value: string) {
  return ['solana', 'sui-network'].includes(network) ? value : value.toLowerCase()
}

export function marketKey(config: MarketPool) {
  const evm = ['eth', 'arbitrum', 'base', 'bsc', 'cro', 'hyperevm']
  const valid = config.network === 'solana'
    ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(config.token) && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(config.pool)
    : config.network === 'sui-network'
      ? /^0x[a-fA-F0-9]{1,64}::[A-Za-z0-9_]+::[A-Za-z0-9_]+$/.test(config.token) && /^0x[a-fA-F0-9]{64}$/.test(config.pool)
      : evm.includes(config.network) && /^0x[a-fA-F0-9]{40}$/.test(config.token) && /^0x(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/.test(config.pool)
  if (!valid) throw new Error('Invalid market identifiers')
  return `${config.network}:${normalizeIdentifier(config.network, config.token)}:${normalizeIdentifier(config.network, config.pool)}`
}

export function change(current: number | null, previous: number | null) {
  return current === null || previous === null || previous === 0 ? null : (current / previous - 1) * 100
}

export type Reading = {
  observedAt: string
  liquidity: number | null
  price: number | null
  volume24h: number | null
  buys24h: number | null
  sells24h: number | null
}

export function parsePool(config: MarketPool, body: unknown, now = new Date()): Reading {
  const data = (body as { data?: { id?: string; attributes?: Record<string, unknown>; relationships?: Record<string, { data?: { id?: string } }> } })?.data
  marketKey(config)
  const norm = (id?: string) => id ? normalizeIdentifier(config.network, id) : ''
  const id = norm(`${config.network}_${config.token}`)
  const base = norm(data?.relationships?.base_token?.data?.id) === id
  const quote = norm(data?.relationships?.quote_token?.data?.id) === id
  if (!data || norm(data.id) !== norm(`${config.network}_${config.pool}`) || (!base && !quote)) throw new Error('Pool/token mismatch')
  const a = data.attributes ?? {}
  const tx = (a.transactions as { h24?: { buys?: unknown; sells?: unknown } })?.h24
  const reading = {
    observedAt: now.toISOString(), liquidity: numeric(a.reserve_in_usd),
    price: numeric(base ? a.base_token_price_usd : a.quote_token_price_usd),
    volume24h: numeric((a.volume_usd as { h24?: unknown })?.h24),
    buys24h: numeric(base ? tx?.buys : tx?.sells), sells24h: numeric(base ? tx?.sells : tx?.buys),
  }
  if (reading.liquidity === null && reading.price === null) throw new Error('Missing pool metrics')
  return reading
}

export function parseCandles(body: unknown): number[][] {
  const rows = (body as { data?: { attributes?: { ohlcv_list?: unknown } } })?.data?.attributes?.ohlcv_list
  if (!Array.isArray(rows)) return []
  return rows.filter((row): row is number[] => Array.isArray(row) && row.length === 6 && row.every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0) && row[2] >= Math.max(row[1], row[3], row[4]) && row[3] <= Math.min(row[1], row[4])).sort((a, b) => a[0] - b[0])
}
