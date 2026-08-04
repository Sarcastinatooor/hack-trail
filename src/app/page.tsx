import Link from "next/link"
import { IncidentExplorer, type IncidentExplorerItem } from "@/components/IncidentExplorer"
import { INCIDENT_DATA_BY_SLUG } from "@/data/all-incident-data"
import { INCIDENTS } from "@/data/incidents"

function fmtUsd(n: number) {
  if (!isFinite(n) || n === 0) return "$0"
  const abs = Math.abs(n)
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

export default function HomePage() {
  const latestIncidents = [...INCIDENTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const explorerIncidents: IncidentExplorerItem[] = latestIncidents.map((incident) => {
    const trail = INCIDENT_DATA_BY_SLUG[incident.slug]
    const eventCount = trail?.timeline.length ?? 0
    const hopCount = trail?.hops.length ?? 0
    const walletCount = trail?.tracked_wallets.length ?? 0

    return {
      ...incident,
      eventCount,
      hopCount,
      walletCount,
      evidenceCount: eventCount + hopCount + walletCount,
    }
  })
  const totalLoss = INCIDENTS.reduce((s, i) => s + i.loss_usd, 0)
  const fullTrails = INCIDENTS.filter((i) => i.status === "full").length
  const chains = [...new Set(INCIDENTS.flatMap((i) => i.chains))]

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[300px] bg-[#00ff88]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[250px] bg-[#00d4ff]/[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            {/* Left: headline */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-[#00ff88]/40" />
                <span className="mono text-[10px] tracking-[0.2em] text-[#00ff88] uppercase">
                  Intelligence Platform
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Crypto Exploit{" "}
                <span className="gradient-text-green">Trail Mapper</span>
              </h1>
              <p className="mt-3 text-sm text-neutral-500 max-w-lg leading-relaxed">
                Open a hack to see a chronological journey, USD-weighted fund flows,
                live wallet balances, and protocol damage — all driven by real on-chain data.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/intelligence"
                  className="rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10 px-4 py-2.5 mono text-xs text-[#00ff88] transition-colors hover:bg-[#00ff88]/15"
                >
                  Check Wallet Exposure
                </Link>
                <Link
                  href="/reports"
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 mono text-xs text-neutral-400 transition-colors hover:border-[#00d4ff]/20 hover:text-[#00d4ff]"
                >
                  Safety Playbooks
                </Link>
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="flex gap-3 flex-wrap">
              <div className="neon-card-static px-4 py-3 stat-accent-green">
                <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">Tracked</div>
                <div className="data-value text-xl text-white mt-0.5">{INCIDENTS.length}</div>
                <div className="text-[10px] text-neutral-600 mono">{fullTrails} full trails</div>
              </div>
              <div className="neon-card-static px-4 py-3 stat-accent-red">
                <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">Value at Risk</div>
                <div className="data-value text-xl text-[#ff2255] mt-0.5">{fmtUsd(totalLoss)}</div>
                <div className="text-[10px] text-neutral-600 mono">confirmed losses</div>
              </div>
              <div className="neon-card-static px-4 py-3 stat-accent-cyan">
                <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">Chains</div>
                <div className="data-value text-xl text-white mt-0.5">{chains.length}</div>
                <div className="text-[10px] text-neutral-600 mono">networks affected</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider glow */}
        <div className="glow-line-green mx-auto max-w-[1400px]" />
      </div>

      {/* ─── Incident Grid ─── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            <span className="mono text-xs text-neutral-400 tracking-wider uppercase">
              Mapped Incidents
            </span>
          </div>
          <div className="mono text-[10px] text-neutral-600">
            {INCIDENTS.length} total · {fullTrails} mapped
          </div>
        </div>

        <IncidentExplorer incidents={explorerIncidents} />
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.04] mt-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[11px] text-neutral-600 mono">
            <span>© 2026 HackTrail</span>
            <span className="text-neutral-700">·</span>
            <span>Open-source crypto exploit intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Sarcastinatooor/hack-trail"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-neutral-600 hover:text-[#00ff88] mono transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
