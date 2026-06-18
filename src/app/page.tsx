import Link from "next/link"
import { INCIDENTS } from "@/data/incidents"
import type { IncidentSummary } from "@/data/types"

function fmtUsd(n: number) {
  if (!isFinite(n) || n === 0) return "$0"
  const abs = Math.abs(n)
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "border-[#627eea]/30 text-[#627eea]",
  Arbitrum: "border-[#28a0f0]/30 text-[#28a0f0]",
  Bitcoin: "border-[#f7931a]/30 text-[#f7931a]",
  "BNB Chain": "border-[#f3ba2f]/30 text-[#f3ba2f]",
  BSC: "border-[#f3ba2f]/30 text-[#f3ba2f]",
  Unichain: "border-[#ff007a]/30 text-[#ff007a]",
  Solana: "border-[#9945ff]/30 text-[#9945ff]",
  Polygon: "border-[#8247e5]/30 text-[#8247e5]",
  Ronin: "border-[#1273ea]/30 text-[#1273ea]",
  Fantom: "border-[#13b5ec]/30 text-[#13b5ec]",
  Avalanche: "border-[#e84142]/30 text-[#e84142]",
  Sui: "border-[#4da2ff]/30 text-[#4da2ff]",
  Mixin: "border-[#00a8ff]/30 text-[#00a8ff]",
  Harmony: "border-[#00aee9]/30 text-[#00aee9]",
  Moonbeam: "border-[#b83f99]/30 text-[#b83f99]",
  Moonriver: "border-[#f2b705]/30 text-[#f2b705]",
  Evmos: "border-[#ed4e33]/30 text-[#ed4e33]",
  Milkomeda: "border-[#00d4ff]/30 text-[#00d4ff]",
  Zcash: "border-[#f4b728]/30 text-[#f4b728]",
}

function ChainBadge({ chain }: { chain: string }) {
  const cls = CHAIN_COLORS[chain] ?? "border-white/10 text-neutral-400"
  return (
    <span className={`text-[10px] mono px-1.5 py-0.5 rounded border bg-white/[0.02] ${cls}`}>
      {chain}
    </span>
  )
}

function IncidentCard({ i, index }: { i: IncidentSummary; index: number }) {
  const clickable = i.status === "full"
  const isVulnerability = i.loss_usd === 0
  const metricValue = (i.loss_label ?? fmtUsd(i.loss_usd)).replace("price crash", "crash")
  const metricSize = metricValue.length > 14 ? "text-[1.35rem]" : "text-2xl"

  const glowClass = isVulnerability ? "neon-card-cyan" : i.status === "stub" ? "" : "neon-card"

  const inner = (
    <div
      className={`neon-card ${glowClass} flex h-full min-h-[280px] flex-col p-5 animate-slide-up ${
        !clickable ? "opacity-50 cursor-default" : "cursor-pointer"
      }`}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      {/* Header row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="mono text-[10px] tracking-wider text-neutral-500 uppercase">
          {i.date_label}
        </div>
        <span
          className={`text-[9px] mono px-2 py-0.5 rounded-md ${
            i.status === "full"
              ? "badge-active"
              : i.status === "ongoing"
              ? "badge-critical"
              : "badge-pending"
          }`}
        >
          {i.status === "full" ? "● FULL TRAIL" : i.status === "ongoing" ? "● ONGOING" : "○ PENDING"}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-4 min-h-[44px] text-base font-semibold text-white leading-snug line-clamp-2">
        {i.name}
      </h3>

      {/* Loss amount */}
      <div className="mb-4 grid min-h-[68px] grid-cols-[minmax(0,1fr)_minmax(7rem,8rem)] items-end gap-4">
        <div className="min-w-0">
          <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">
            {i.loss_usd > 0 ? "Total Loss" : "Impact"}
          </div>
          <div className={`data-value leading-tight ${metricSize} ${isVulnerability ? "text-[#00d4ff]" : "text-[#ff2255]"}`}>
            {metricValue}
          </div>
        </div>
        <div className="text-right">
          <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">Vector</div>
          <div className="text-[11px] text-neutral-400 leading-tight line-clamp-3">{i.attack_vector}</div>
        </div>
      </div>

      {/* Summary */}
      <p className="mb-4 min-h-[40px] text-xs text-neutral-500 leading-relaxed line-clamp-2">
        {i.short_summary}
      </p>

      {/* Chain badges */}
      <div className="mb-4 flex min-h-[26px] flex-wrap content-start gap-1.5">
        {i.chains.map((c) => (
          <ChainBadge key={c} chain={c} />
        ))}
      </div>

      {/* Bottom: tags + attribution */}
      <div className="mt-auto flex min-h-[32px] items-center justify-between gap-3 border-t border-white/[0.04] pt-2">
        <div className="flex min-w-0 flex-wrap gap-1">
          {i.tags.slice(0, 3).map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] text-neutral-600 mono">
              {t}
            </span>
          ))}
          {i.tags.length > 3 && (
            <span className="text-[9px] text-neutral-600 mono">+{i.tags.length - 3}</span>
          )}
        </div>
        {i.attribution && (
          <div className="max-w-[120px] shrink-0 truncate text-[9px] text-neutral-600 mono">
            {i.attribution}
          </div>
        )}
      </div>
    </div>
  )

  if (!clickable) return inner
  return <Link href={`/incident/${i.slug}`}>{inner}</Link>
}

export default function HomePage() {
  const latestIncidents = [...INCIDENTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestIncidents.map((i, idx) => (
            <IncidentCard key={i.id} i={i} index={idx} />
          ))}
        </div>
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
