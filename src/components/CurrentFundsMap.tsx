"use client"

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type Holding = { contract: string | null; symbol: string; amount: number; usd: number | null }
type Wallet = { address: string; chain: string; label?: string; role?: string; holdings: Holding[]; checked_at: string | null; status: string; total_usd: number | null }
const usd = (value: number | null) => value === null ? 'Unpriced' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value)

export function CurrentFundsMap({ slug }: { slug: string }) {
  const [group, setGroup] = useState('attacker')
  const [selected, setSelected] = useState<string | null>(null)
  const { data, isPending, isFetching, error, refetch } = useQuery<{ data: Wallet[] }>({
    queryKey: ['current-funds', slug],
    queryFn: async () => { const response = await fetch(`/api/funds/${slug}`, { cache: 'no-store' }); if (!response.ok) throw new Error('Holdings unavailable'); return response.json() },
    refetchInterval: 60_000,
  })
  const wallets = (data?.data ?? []).filter((w) => group === 'all' || (group === 'attacker' ? w.role?.startsWith('attacker') : !w.role?.startsWith('attacker')))
  const available = wallets.filter((w) => w.status === 'available')
  const total = available.reduce((sum, w) => sum + (w.total_usd ?? 0), 0)
  const wallet = wallets.find((w) => w.address === selected) ?? wallets[0]
  return <section className="min-w-0 space-y-4" aria-label="Current funds map">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-base font-semibold text-neutral-200">Current Funds Map</h2><p className="mt-1 text-xs text-neutral-500">Ethereum balances · refreshes every minute · priced holdings only</p></div>
      <button onClick={() => refetch()} disabled={isFetching} className="rounded border border-white/10 px-3 py-2 text-xs text-emerald-400 disabled:opacity-50">{isFetching ? 'Checking…' : 'Refresh holdings'}</button>
    </header>
    <div className="flex flex-wrap gap-2" aria-label="Wallet group">{[['attacker','Attacker wallets'],['infrastructure','Victim / infrastructure'],['all','All tracked']].map(([key,label]) => <button key={key} aria-pressed={group === key} onClick={() => { setGroup(key); setSelected(null) }} className={`rounded border px-3 py-2 text-xs ${group === key ? 'border-emerald-400/40 text-emerald-300' : 'border-white/10 text-neutral-500'}`}>{label}</button>)}</div>
    {slug === 'binance-hot-wallet-2026' && <div className="grid gap-3 sm:grid-cols-3">
      {[['Frozen · reported snapshot','~$2.7B','TRM, Oct 30 00:30 UTC. Frozen balances can remain in attacker wallets.'],['Movable / pledged','Not reconciled','Wallet balances alone cannot establish transferability or lending collateral.'],['Returned / recovered','Not established','Frozen value is not counted as returned funds.']].map(([label,value,note]) => <div key={label} className="rounded border border-white/10 p-3"><p className="text-xs text-neutral-500">{label}</p><p className="mt-2 text-lg text-neutral-200">{value}</p><p className="mt-2 text-xs leading-relaxed text-neutral-500">{note}</p></div>)}
    </div>}
    {isPending ? <div className="h-40 animate-pulse rounded bg-white/5" /> : error ? <p className="p-4 text-sm text-amber-300">Holdings could not load. Use Refresh holdings to retry.</p> : <>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-y border-white/10 py-4"><strong className="text-3xl tabular-nums text-neutral-100">{available.length ? usd(total) : 'Unavailable'}</strong><span className="text-xs text-neutral-500">Priced balances across {available.length}/{wallets.length} wallets · excludes unsupported chains and unpriced tokens</span></div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-2">{wallets.map((w) => <button key={w.address} onClick={() => setSelected(w.address)} aria-pressed={wallet?.address === w.address} className={`w-full rounded border p-3 text-left ${wallet?.address === w.address ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-white/10'}`}><div className="flex flex-wrap justify-between gap-2 text-sm"><span>{w.label}</span><span className="tabular-nums">{w.status === 'available' ? usd(w.total_usd) : w.status}</span></div><div className="mt-2 break-all font-mono text-[10px] text-neutral-500">{w.address}</div></button>)}</div>
        {wallet && <div className="min-w-0 rounded border border-white/10 p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-sm text-neutral-200">{wallet.label}</h3><a href={`https://etherscan.io/address/${wallet.address}`} target="_blank" rel="noreferrer" className="text-xs text-emerald-400">Open explorer ↗</a></div><p className="my-2 text-[11px] text-neutral-500">{wallet.checked_at ? `Checked ${new Date(wallet.checked_at).toLocaleString()}` : 'No successful balance check'}</p><p className="mb-4 text-xs text-amber-300/80">Transferability, lending positions, and recovery status are unverified by this balance feed. Frozen tokens may still appear in holdings.</p>
          {wallet.status === 'available' ? <div className="max-h-96 overflow-auto"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#0a0a0a] text-neutral-500"><tr><th className="py-2">Asset</th><th className="text-right">Quantity</th><th className="text-right">USD</th></tr></thead><tbody>{wallet.holdings.filter((h) => h.usd !== null).map((h) => <tr key={h.contract ?? 'native'} className="border-t border-white/5"><td className="py-3">{h.contract ? <a className="text-emerald-300" href={`https://etherscan.io/token/${h.contract}?a=${wallet.address}`} target="_blank" rel="noreferrer">{h.symbol} ↗</a> : h.symbol}</td><td className="text-right tabular-nums">{h.amount.toLocaleString(undefined,{maximumFractionDigits:4})}</td><td className="text-right tabular-nums">{usd(h.usd)}</td></tr>)}</tbody></table><p className="mt-3 text-xs text-neutral-500">{wallet.holdings.filter((h) => h.usd === null).length} unpriced assets excluded from USD totals.</p></div> : <p className="py-6 text-sm text-neutral-500">{wallet.status === 'unsupported' ? 'Balance tracking is not yet supported on this chain.' : 'Explorer unavailable. Retry with Refresh holdings.'}</p>}</div>}
      </div>
    </>}
  </section>
}
