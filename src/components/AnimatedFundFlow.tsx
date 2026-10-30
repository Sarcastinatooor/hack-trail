"use client"

import { useEffect, useRef, useState } from 'react'

interface Link {
  source: string
  target: string
  value: number
  asset?: string
  chain?: string
  phase?: string
  step?: number
  summary?: string
  evidence?: { url: string; label: string; transaction?: string; scope: string }
  from_address?: string
  to_address?: string
}

function money(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  return `$${(value / 1_000).toFixed(0)}K`
}

export function AnimatedFundFlow({ links }: { links: Link[] }) {
  const [selected, setSelected] = useState<Link | null>(null)
  const drawer = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (selected) drawer.current?.showModal(); else drawer.current?.close() }, [selected])
  return (
    <div className="neon-card-static overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.05] p-4">
        <div>
          <div className="flex items-center gap-2 mono text-xs uppercase tracking-wider text-neutral-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff2255]" />
            Documented fund trace
          </div>
          <div className="mt-1 text-[11px] text-neutral-600">Observed route reconstruction · tap a step for evidence</div>
        </div>
        <div className="mono text-[10px] uppercase text-[#00ff88]">Onchain sequence</div>
      </div>
      <div className="space-y-0 p-4">
        {links.map((link, index) => (
          <div key={`${link.step}-${link.source}-${link.target}`} className="relative pl-8 pb-5 last:pb-0">
            {index < links.length - 1 && <div className="absolute left-[9px] top-7 h-[calc(100%-12px)] w-px bg-gradient-to-b from-[#ff2255]/60 to-[#00d4ff]/20" />}
            <div className="absolute left-0 top-1 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-[#ff2255]/40 bg-[#0a0a0c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff2255] shadow-[0_0_10px_#ff2255]" />
            </div>
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="mono text-[9px] uppercase tracking-wider text-neutral-600">{String(link.step).padStart(2, "0")}</span>
                <span className="rounded bg-[#ff2255]/10 px-1.5 py-0.5 mono text-[9px] uppercase text-[#ff6688]">{link.phase}</span>
                <span className="ml-auto data-value text-sm text-[#ff6688]">{money(link.value)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-200">
                <span>{link.source}</span><span className="text-[#ff2255]">→</span><span>{link.target}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 mono text-[9px] uppercase text-neutral-600">
                {link.asset && <span className="rounded border border-white/[0.06] px-1.5 py-1">{link.asset}</span>}
                {link.chain && <span className="rounded border border-white/[0.06] px-1.5 py-1">{link.chain}</span>}
              </div>
              {link.summary && <div className="mt-2 text-[11px] leading-relaxed text-neutral-500">{link.summary}</div>}
              <button onClick={() => setSelected(link)} className="mt-3 rounded border border-white/10 px-3 py-2 text-xs text-emerald-300">Inspect evidence ↗</button>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#ff2255] to-transparent" style={{ animation: `flowPulse 2.4s ${index * 180}ms linear infinite` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <dialog ref={drawer} onClose={() => setSelected(null)} aria-labelledby="evidence-title" className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#0b0b0b] p-6 text-neutral-200 backdrop:bg-black/70">
        <div className="flex items-start justify-between gap-4"><h2 id="evidence-title" className="text-lg font-semibold">Transaction evidence</h2><button onClick={() => setSelected(null)} aria-label="Close evidence" className="rounded border border-white/10 px-3 py-1">×</button></div>
        {selected && <div className="mt-6 space-y-5 text-sm"><div><p className="text-neutral-500">Route</p><p className="mt-1">{selected.source} → {selected.target}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-neutral-500">Asset</p><p>{selected.asset}</p></div><div><p className="text-neutral-500">Network</p><p>{selected.chain}</p></div></div><p className="leading-relaxed text-neutral-400">{selected.summary}</p>
          {[['Source',selected.from_address],['Destination',selected.to_address]].map(([label,address]) => address && <div key={label}><p className="text-neutral-500">{label} address</p><a target="_blank" rel="noreferrer" href={`https://etherscan.io/address/${address}`} className="mt-1 block break-all font-mono text-xs text-emerald-300">{address} ↗</a></div>)}
          <div className="border-y border-white/10 py-4 text-xs leading-relaxed text-amber-300">{selected.evidence?.scope ?? 'Published incident context. A transaction hash and complete route reconciliation have not been indexed for this step. Animation illustrates the report; it is not a live transfer signal.'}</div>
          {selected.evidence?.transaction && <a href={`https://etherscan.io/tx/${selected.evidence.transaction}`} target="_blank" rel="noreferrer" className="block break-all text-xs text-emerald-300">Main sweep transaction: {selected.evidence.transaction} ↗</a>}
          <a href={selected.evidence?.url ?? 'https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history'} target="_blank" rel="noreferrer" className="block text-emerald-300">{selected.evidence?.label ?? 'Read the published investigation'} ↗</a>
        </div>}
      </dialog>
      <style jsx>{`@keyframes flowPulse { from { transform: translateX(-120%); } to { transform: translateX(420%); } } @media (prefers-reduced-motion: reduce) { div { animation: none !important; } }`}</style>
    </div>
  )
}
