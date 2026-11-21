import type { Hop } from '@/data/types'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 })

export function FundRoute({ hops }: { hops: Hop[] }) {
  const stages = [...hops].sort((a, b) => a.step - b.step)
  return <section aria-label="Fund route" className="mx-auto max-w-5xl">
    <header className="mb-5 flex items-baseline justify-between gap-3 border-b border-white/15 pb-4">
      <h2 className="text-xl font-semibold">Fund route</h2>
      <span className="font-mono text-xs text-neutral-400">{stages.length} {stages.length === 1 ? 'stage' : 'stages'}</span>
    </header>
    {!stages.length && <p className="text-sm text-neutral-400">No fund movements have been documented yet.</p>}
    <ol className="space-y-0">{stages.map((h, i) => <li key={h.step} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 sm:gap-5">
      {i < stages.length - 1 && <span aria-hidden className="absolute bottom-0 left-4 top-8 border-l border-emerald-400/30" />}
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/45 bg-neutral-950 font-mono text-xs text-emerald-300">{String(i + 1).padStart(2, '0')}</span>
      <div className="min-w-0 border-b border-white/10 pb-4 pt-1 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <h3 className="font-medium capitalize text-cyan-300">{h.phase.replaceAll('-', ' ')}</h3>
          <span className="font-mono text-neutral-400">{h.chain}</span>
        </div>
        <div className="my-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-semibold leading-snug [overflow-wrap:anywhere]">
          <span>{h.from.label}</span><span className="text-emerald-400" aria-label="to">→</span><span>{h.to.label}</span>
        </div>
        <p className="text-sm text-neutral-300 [overflow-wrap:anywhere]">{h.asset}{h.usd > 0 && <span className="ml-2 font-mono text-neutral-100">{usd.format(h.usd)}</span>}</p>
        <details className="mt-2">
          <summary className="w-fit cursor-pointer py-1 text-xs text-neutral-400 hover:text-white focus-visible:outline-cyan-400">Details{h.evidence ? ' and evidence' : ''}</summary>
          <div className="mt-2 max-w-prose space-y-2 border-l border-white/20 pl-3 text-sm leading-relaxed text-neutral-300 [overflow-wrap:anywhere]">
            <p>{h.summary}</p>
            {h.amount != null && <p>Recorded quantity: {h.amount.toLocaleString('en-US', { maximumFractionDigits: 12 })} · {h.asset}</p>}
            {[['From', h.from.address], ['To', h.to.address]].map(([label, address]) => address && <p key={label} className="font-mono text-xs">{label}: {address}</p>)}
            {h.evidence && <><a className="text-cyan-300 underline" href={h.evidence.url} target="_blank" rel="noreferrer">{h.evidence.label}</a><p>{h.evidence.scope}</p>{h.evidence.transaction && <p className="font-mono text-xs">{h.evidence.transaction}</p>}</>}
          </div>
        </details>
      </div>
    </li>)}</ol>
  </section>
}
