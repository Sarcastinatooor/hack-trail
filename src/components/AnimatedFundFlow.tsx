"use client"

interface Link {
  source: string
  target: string
  value: number
  asset?: string
  chain?: string
  phase?: string
  step?: number
  summary?: string
}

function money(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`
  return `$${(value / 1_000).toFixed(0)}K`
}

export function AnimatedFundFlow({ links }: { links: Link[] }) {
  return (
    <div className="neon-card-static overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.05] p-4">
        <div>
          <div className="flex items-center gap-2 mono text-xs uppercase tracking-wider text-neutral-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff2255]" />
            Live fund trace
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
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#ff2255] to-transparent" style={{ animation: `flowPulse 2.4s ${index * 180}ms linear infinite` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`@keyframes flowPulse { from { transform: translateX(-120%); } to { transform: translateX(420%); } }`}</style>
    </div>
  )
}
