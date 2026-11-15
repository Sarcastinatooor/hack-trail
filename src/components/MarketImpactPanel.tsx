"use client"

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { MARKET_POOLS, MARKET_COVERAGE, type MarketPool } from '@/data/market-pools'
import { marketKey, type Reading } from '@/utils/market-impact'
import { ImpactChart } from './ImpactChart'

interface PoolResult extends MarketPool {
  key: string
  status: string
  unavailableReason: string | null
  source: string
  identitySource: string
  persistence: string
  reading: Reading | null
  previousAt: string | null
  changes: Record<string, number | null>
  history: Reading[]
  candles: number[][]
  candleStatus: string
  candleObservedAt: string | null
  riskObservedAt: string | null
  risk: { gtScore: number | null; top10: number | null; developer: number | null; mint: string; freeze: string } | null
}
const number = (value: number | null | undefined, usd = false) => value == null ? 'Unavailable' : new Intl.NumberFormat('en-US', { ...(usd ? { style: 'currency', currency: 'USD' } : {}), maximumSignificantDigits: 5 }).format(value)
const time = (value: string) => new Date(value).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

export function MarketImpactPanel({ slug, onEvidence }: { slug: string; onEvidence?: () => void }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  const configs = MARKET_POOLS[slug] ?? []
  const [selection, setSelection] = useState('')
  const selected = configs.find(c => marketKey(c) === selection) ?? configs[0]
  const selectedKey = selected ? marketKey(selected) : ''
  const supported = configs.length > 0
  const { data, error, isLoading, isFetching, refetch } = useQuery<{ pools: PoolResult[] }>({
    queryKey: ['market-impact', slug, selectedKey], enabled: supported,
    queryFn: async () => {
      const response = await fetch(`/api/market-impact/${slug}?pool=${encodeURIComponent(selectedKey)}`)
      if (!response.ok) throw new Error('Market data unavailable')
      return response.json()
    }, staleTime: 300000, refetchInterval: 300000, retry: 1,
  })
  return <section className="mb-8 min-w-0 space-y-5 border-b border-white/10 pb-8" aria-label="Pool market impact">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold">Pool market impact</h2><p className="mt-1 text-xs text-neutral-400">Market context, not attribution of attacker trades</p></div>
      {supported && <button className="rounded border border-white/15 px-3 py-2 text-xs text-emerald-400 disabled:opacity-50" disabled={isFetching} onClick={() => refetch()}>{isFetching ? 'Refreshing...' : 'Refresh readings'}</button>}
    </div>
    <p className="text-xs leading-relaxed text-neutral-400">{MARKET_COVERAGE[slug]?.note ?? 'No reviewed market mapping yet.'}</p>
    {!supported && <p className="text-sm text-amber-300">Pool market data not supported for this incident.</p>}
    {supported && <label className="block min-w-0 text-xs text-neutral-400">Market / network / pool
      <select aria-label="Market pool" value={selectedKey} onChange={event => setSelection(event.target.value)} className="mt-2 block w-full min-w-0 rounded border border-white/15 bg-neutral-950 p-3 text-sm text-neutral-200">
        {configs.map(config => <option key={marketKey(config)} value={marketKey(config)}>{config.network} · {config.label} · {config.pool.slice(0, 8)}...{config.pool.slice(-4)}</option>)}
      </select>
    </label>}
    {isLoading && <p role="status" className="text-sm text-neutral-400">Loading pool readings...</p>}
    {error && <p role="alert" className="text-sm text-amber-300">Market data unavailable. Retry using Refresh readings.</p>}
    {data?.pools.map(pool => {
      const r = pool.reading
      const outdated = !!r && (now - Date.parse(r.observedAt) > 600000 || !!error)
      return <div key={pool.key} className="min-w-0 space-y-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3"><h3 className="font-medium">{pool.label}</h3><span className="text-xs uppercase text-amber-300">{outdated ? 'stale' : pool.status}</span></div>
          {pool.unavailableReason && <p className="text-xs text-amber-300">{pool.unavailableReason}</p>}
          <p className="text-xs text-neutral-400">{pool.network} · {pool.source} · {r ? `Observed ${time(r.observedAt)}` : 'No successful reading'} · Provider cache up to 5 minutes</p>
          {pool.verifiedAt && <p className="text-xs text-neutral-500">Pool membership verified {time(pool.verifiedAt)}{pool.createdAt ? ` · Created ${time(pool.createdAt)}` : ' · Creation date unavailable'}</p>}
          <div className="grid gap-1 break-all font-mono text-[11px] text-neutral-500"><span>Token: {pool.token}</span><span>Pool: {pool.pool}</span></div>
          <div className="flex flex-wrap gap-4 text-xs text-cyan-400"><a href={`https://www.geckoterminal.com/${pool.network}/pools/${encodeURIComponent(pool.pool)}`} target="_blank" rel="noreferrer">Inspect pool ↗</a><a href="https://www.geckoterminal.com/rug-checker" target="_blank" rel="noreferrer">Open Rug Checker ↗</a><a href={pool.identitySource} target="_blank" rel="noreferrer">Pool identity source ↗</a></div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-5 lg:grid-cols-5">
          {([
            ['Pool liquidity', r?.liquidity, true, 'liquidity'], ['Token price', r?.price, true, 'price'],
            ['Pool volume · 24h', r?.volume24h, true, 'volume24h'], ['Token buys · 24h', r?.buys24h, false, 'buys'], ['Token sells · 24h', r?.sells24h, false, 'sells'],
          ] as const).map(([label, value, usd, key]) => <div key={key} className="min-w-0"><p className="text-xs text-neutral-400">{label}</p><p className="mt-2 break-words font-mono text-lg">{number(value, usd)}</p>{pool.changes[key] != null && <p className="mt-1 text-xs text-neutral-400">{pool.changes[key]!.toFixed(2)}% vs prior reading</p>}</div>)}
        </div>
        <p className="text-xs text-neutral-400">{pool.persistence === 'enabled' ? pool.previousAt ? `Comparison reading: ${time(pool.previousAt)}. Rolling 24h volume changes are not incremental traded volume.` : 'First saved reading. Comparisons appear after the next five-minute observation.' : 'History storage unavailable. Current readings are not being retained and changes cannot be calculated.'} Readings refresh while this panel is open; this is not a continuous background monitor.</p>
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-white/10 p-4"><h4 className="text-sm">Incident window · hourly OHLCV (USD)</h4>
            {pool.candles.length ? <ReactECharts style={{ height: 300, width: '100%' }} opts={{ renderer: 'svg' }} option={{
              useUTC: true, animation: false,
              tooltip: { trigger: 'axis', confine: true, renderMode: 'richText', backgroundColor: '#101014', borderColor: '#ffffff25', textStyle: { color: '#ddd', fontSize: 11 },
                formatter: (items: { seriesName: string; dataIndex: number }[]) => {
                  const item = items[0]
                  const c = item && pool.candles[item.dataIndex]
                  if (!c) return ''
                  return `${new Date(c[0] * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC\nOpen ${number(c[1], true)}\nHigh ${number(c[2], true)}\nLow ${number(c[3], true)}\nClose ${number(c[4], true)}\nVolume ${number(c[5], true)}`
                },
              },
              grid: [{ left: 65, right: 16, top: 20, height: 165 }, { left: 65, right: 16, top: 205, height: 45 }],
              xAxis: [0, 1].map(i => ({ type: 'category', gridIndex: i, data: pool.candles.map(c => new Date(c[0] * 1000).toISOString().slice(5, 16).replace('T', ' ')), axisLabel: { show: i === 1, hideOverlap: true, color: '#888' } })),
              yAxis: [0, 1].map(i => ({ scale: true, gridIndex: i, splitNumber: 3, axisLabel: { color: '#888', formatter: (v: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumSignificantDigits: 3 }).format(v) }, splitLine: { lineStyle: { color: '#ffffff0a' } } })),
              series: [{ name: 'OHLC USD', type: 'candlestick', data: pool.candles.map(c => [c[1], c[4], c[3], c[2]]), itemStyle: { color: '#00ff9d', color0: '#ff3366', borderColor: '#00ff9d', borderColor0: '#ff3366' } }, { name: 'Volume USD', type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: pool.candles.map(c => c[5]), itemStyle: { color: '#00d4ff' } }],
            }} /> : <p className="py-10 text-sm text-neutral-400">{pool.candleStatus === 'pool-created-after-incident' ? 'This pool was created after the incident. It can provide current context, not incident-time history. Try another pool.' : 'Incident-window OHLCV unavailable. Provider coverage or plan limits may restrict this history.'}</p>}
            {pool.candleObservedAt && <p className="text-xs text-neutral-500">History response observed {time(pool.candleObservedAt)} · Gaps are not filled.</p>}
          </div>
          <div className="min-w-0">{pool.history.filter(h => h.liquidity !== null).length > 1 ? <ImpactChart title="Observed pool liquidity" data={pool.history.filter(h => h.liquidity !== null).map(h => ({ ts: Date.parse(h.observedAt) / 1000, value: h.liquidity! }))} highlightIncident={false} subtitle="Saved observations, not reconstructed incident history" /> : <div className="rounded-lg border border-white/10 p-4"><h4 className="text-sm">Observed pool liquidity</h4><p className="py-10 text-sm text-neutral-400">Not enough saved readings for a liquidity trend.</p></div>}</div>
        </div>
        <div><h4 className="mb-3 text-sm">Token-risk indicators</h4><div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[["GT score / 100", number(pool.risk?.gtScore)], ['Top 10 holders %', number(pool.risk?.top10)], ['Developer holdings %', number(pool.risk?.developer)], ['Mint authority', pool.risk?.mint ?? 'unavailable'], ['Freeze authority', pool.risk?.freeze ?? 'unavailable']].map(([label, value]) => <div key={label}><p className="text-xs text-neutral-400">{label}</p><p className="mt-1 text-sm">{value}</p></div>)}
        </div><p className="mt-3 text-xs text-neutral-500">{pool.riskObservedAt ? `Risk response observed ${time(pool.riskObservedAt)}. ` : ''}Missing fields are unknown, not safe. These API indicators are not the complete Rug Checker report.</p></div>
        <p className="text-xs leading-relaxed text-neutral-400">This is one contextual pool, not total token liquidity or a confirmed attacker swap venue. A dollar-liquidity decline can reflect price changes, swaps, or pool migration, not necessarily LP withdrawal. Buy/sell counts include all traders. {onEvidence && <button className="text-cyan-400 underline" onClick={onEvidence}>Review fund-flow evidence</button>}</p>
      </div>
    })}
  </section>
}
