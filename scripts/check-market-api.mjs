import assert from 'node:assert/strict'
import { MARKET_POOLS } from '../src/data/market-pools.ts'
import { marketKey } from '../src/utils/market-impact.ts'

const root = process.argv[2] ?? 'http://localhost:3015'
const representatives = new Map()
for (const [slug, pools] of Object.entries(MARKET_POOLS)) {
  for (const pool of pools) if (!representatives.has(pool.network)) representatives.set(pool.network, { slug, pool })
}
for (const [network, { slug, pool }] of representatives) {
  const response = await fetch(`${root}/api/market-impact/${slug}?pool=${encodeURIComponent(marketKey(pool))}`, { signal: AbortSignal.timeout(55000) })
  assert.equal(response.status, 200, `${network} HTTP status`)
  const body = await response.json()
  assert.equal(body.pools.length, 1)
  const result = body.pools[0]
  assert.equal(result.key, marketKey(pool))
  assert.ok(result.identitySource.startsWith('https://api.geckoterminal.com/'))
  assert.ok(['available', 'stale', 'unavailable'].includes(result.status))
  if (result.status === 'unavailable') assert.equal(result.reading, null)
  for (const candle of result.candles) assert.ok(candle[0] >= result.incidentTs - 86400 && candle[0] <= result.incidentTs + 172800)
  console.log(JSON.stringify({ network, slug, status: result.status, candles: result.candles.length, history: result.persistence, risk: result.risk?.gtScore ?? null }))
}
assert.equal((await fetch(`${root}/api/market-impact/not-an-incident`)).status, 404)
assert.equal((await fetch(`${root}/api/market-impact/moonwell-mamo?pool=untrusted`)).status, 400)
const unsupported = await (await fetch(`${root}/api/market-impact/magic-eden-nft-drain`)).json()
assert.equal(unsupported.pools.length, 0)
assert.ok(unsupported.coverage.note.includes('NFT'))
console.log('Unknown incident, untrusted pool, and unsupported incident checks passed.')
