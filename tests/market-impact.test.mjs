import test from 'node:test'
import assert from 'node:assert/strict'
import { numeric, parsePool, parseCandles, change, marketKey } from '../src/utils/market-impact.ts'
import { MARKET_POOLS, MARKET_COVERAGE } from '../src/data/market-pools.ts'
import { INCIDENTS } from '../src/data/incidents.ts'
import { history } from '../src/server/market-history.ts'

const config = MARKET_POOLS['moonwell-mamo'][0]
const fixture = () => ({ data: {
  id: `${config.network}_${config.pool}`, attributes: { reserve_in_usd: '100', base_token_price_usd: '0.01', quote_token_price_usd: '200', volume_usd: { h24: '50' }, transactions: { h24: { buys: 2, sells: 3 } } },
  relationships: { base_token: { data: { id: `${config.network}_${config.token}` } }, quote_token: { data: { id: 'base_0x0000000000000000000000000000000000000001' } } },
} })
test('missing, invalid, and negative metrics never become zero', () => {
  for (const value of [null, undefined, '', ' ', false, NaN, Infinity, -1, 'garbage']) assert.equal(numeric(value), null)
  assert.equal(numeric('0'), 0)
  assert.equal(numeric('0.012'), 0.012)
})
test('validates identifiers and pool token membership', () => {
  assert.match(marketKey(config), /^base:/)
  assert.throws(() => marketKey({ ...config, network: '../eth' }))
  assert.throws(() => parsePool({ ...config, token: '0x0000000000000000000000000000000000000000' }, fixture()))
  assert.throws(() => parsePool({ ...config, pool: '0x0000000000000000000000000000000000000000' }, fixture()))
})
test('every published incident has explicit reviewed coverage', () => {
  assert.deepEqual(Object.keys(MARKET_COVERAGE).sort(), INCIDENTS.map(i => i.slug).sort())
  for (const incident of INCIDENTS) {
    assert.ok(MARKET_COVERAGE[incident.slug].note.length > 30)
    const pools = MARKET_POOLS[incident.slug]
    assert.equal(new Set(pools.map(marketKey)).size, pools.length)
    for (const pool of pools) {
      assert.ok(pool.verifiedAt && pool.source)
      assert.ok(marketKey(pool))
    }
  }
  assert.ok(MARKET_POOLS['binance-hot-wallet-2026'].some(p => p.label.startsWith('ENA')))
  assert.equal(MARKET_POOLS['magic-eden-nft-drain'].length, 0)
})
test('Solana identifiers remain case sensitive and Sui token types are accepted', () => {
  const sol = MARKET_POOLS['bonk-dao'][0]
  assert.ok(marketKey(sol).includes(sol.token))
  assert.notEqual(marketKey(sol), marketKey({ ...sol, token: sol.token.toLowerCase() }))
  const sui = MARKET_POOLS.cetus[0]
  assert.ok(marketKey(sui).includes('::'))
})
test('parses values, preserves missing fields and quote-side orientation', () => {
  const body = fixture()
  const reading = parsePool(config, body, new Date('2026-11-15T00:00:00Z'))
  assert.equal(reading.price, 0.01)
  assert.equal(reading.buys24h, 2)
  assert.equal(reading.observedAt, '2026-11-15T00:00:00.000Z')
  delete body.data.attributes.volume_usd
  assert.equal(parsePool(config, body).volume24h, null)
  const quote = parsePool({ ...config, token: '0x0000000000000000000000000000000000000001' }, body)
  assert.equal(quote.price, 200)
  assert.equal(quote.buys24h, 3)
})
test('comparisons require valid nonzero baseline', () => {
  assert.equal(change(null, 10), null)
  assert.equal(change(10, 0), null)
  assert.equal(change(0, 10), -100)
  assert.equal(change(20, 10), 100)
})
test('candles reject malformed and impossible OHLC and preserve gaps', () => {
  const rows = [[100, 2, 4, 1, 3, 50], [200, 2, 1, 0, 3, 50], [300, 2, 4, 1, 3, null], [400, 2, 4, 1, 3, 0]]
  assert.deepEqual(parseCandles({ data: { attributes: { ohlcv_list: rows } } }), [rows[0], rows[3]])
  assert.deepEqual(parseCandles({}), [])
})
test('storage failures and missing configuration remain unavailable', async () => {
  const savedUrl = process.env.UPSTASH_REDIS_REST_URL
  const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN
  const savedFetch = globalThis.fetch
  try {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    assert.equal(await history('test'), null)
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.invalid'
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test'
    globalThis.fetch = async () => { throw new Error('offline') }
    assert.equal(await history('test'), null)
    globalThis.fetch = async () => Response.json({ error: 'denied' }, { status: 403 })
    assert.equal(await history('test'), null)
    globalThis.fetch = async () => Response.json({ result: ['invalid JSON'] })
    assert.equal(await history('test'), null)
  } finally {
    globalThis.fetch = savedFetch
    if (savedUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL
    else process.env.UPSTASH_REDIS_REST_URL = savedUrl
    if (savedToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN
    else process.env.UPSTASH_REDIS_REST_TOKEN = savedToken
  }
})
test('Vercel Redis aliases support read and write commands without mixing credentials', async () => {
  const names = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_URL', 'KV_REST_API_TOKEN']
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]))
  const originalFetch = globalThis.fetch
  try {
    for (const name of names) delete process.env[name]
    process.env.UPSTASH_REDIS_REST_URL = 'https://incomplete.invalid'
    process.env.KV_REST_API_URL = 'https://vercel-redis.invalid'
    process.env.KV_REST_API_TOKEN = 'test-only'
    const reading = parsePool(config, fixture())
    let command
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://vercel-redis.invalid')
      assert.equal(options.headers.Authorization, 'Bearer test-only')
      command = JSON.parse(options.body)
      return Response.json({ result: [JSON.stringify(reading)] })
    }
    assert.deepEqual(await history('fixture', reading), [reading])
    assert.equal(command[0], 'EVAL')
    assert.deepEqual(await history('fixture'), [reading])
    assert.equal(command[0], 'LRANGE')
  } finally {
    globalThis.fetch = originalFetch
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name]
      else process.env[name] = saved[name]
    }
  }
})
