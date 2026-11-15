import type { Reading } from '../utils/market-impact'

// Shared Redis REST storage survives Vercel cold starts. No ephemeral fallback.
export async function history(key: string, reading?: Reading): Promise<Reading[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  const redisKey = `market:v1:${key}`
  const bucket = reading ? Math.floor(Date.parse(reading.observedAt) / 300000) : 0
  const script = "if redis.call('SET',KEYS[2],'1','NX','EX',600) then redis.call('LPUSH',KEYS[1],ARGV[1]); redis.call('LTRIM',KEYS[1],0,2015); redis.call('EXPIRE',KEYS[1],2592000); end; return redis.call('LRANGE',KEYS[1],0,2015)"
  const command = reading ? ['EVAL', script, 2, redisKey, `${redisKey}:${bucket}`, JSON.stringify(reading)] : ['LRANGE', redisKey, 0, 2015]
  try {
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), cache: 'no-store', signal: AbortSignal.timeout(4000) })
    if (!response.ok) return null
    const result = await response.json()
    if (!Array.isArray(result.result)) return null
    return result.result.map((row: string) => JSON.parse(row) as Reading)
      .filter((r: Reading) => Number.isFinite(Date.parse(r.observedAt)))
      .sort((a: Reading, b: Reading) => Date.parse(a.observedAt) - Date.parse(b.observedAt))
  } catch { return null }
}
