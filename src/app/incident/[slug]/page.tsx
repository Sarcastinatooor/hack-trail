"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { use, useState } from "react"
import { FlowSankey } from "@/components/FlowSankey"
import { ImpactChart } from "@/components/ImpactChart"
import { Boundary } from "@/components/Boundary"
import { Timeline } from "@/components/Timeline"
import { WalletTracker } from "@/components/WalletTracker"
import type { IncidentData } from "@/data/types"

const ACCENT_MAP: Record<string, string> = {
  "text-rose-300": "stat-accent-red",
  "text-amber-300": "stat-accent-amber",
  "text-sky-300": "stat-accent-cyan",
  "text-emerald-300": "stat-accent-green",
}

const COLOR_MAP: Record<string, string> = {
  "text-rose-300": "text-[#ff2255]",
  "text-amber-300": "text-[#f59e0b]",
  "text-sky-300": "text-[#00d4ff]",
  "text-emerald-300": "text-[#00ff88]",
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  const borderAccent = ACCENT_MAP[accent ?? ""] ?? "stat-accent-cyan"
  const colorCls = COLOR_MAP[accent ?? ""] ?? "text-white"
  return (
    <div className={`neon-card-static p-4 ${borderAccent}`}>
      <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={`data-value mt-1 text-xl ${colorCls}`}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-neutral-600">{sub}</div>}
    </div>
  )
}

function Header({ incident }: { incident: IncidentData["incident"] }) {
  const isVulnerability = incident.loss_usd === 0
  return (
    <div className="neon-card-static p-5 relative overflow-hidden">
      {/* Glow */}
      <div
        className={`absolute top-0 right-0 w-[300px] h-[150px] rounded-full blur-[80px] ${
          isVulnerability ? "bg-[#00d4ff]/[0.04]" : "bg-[#ff2255]/[0.04]"
        }`}
      />

      <div className="relative flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] mono px-2 py-0.5 rounded-md ${
                isVulnerability ? "badge-info" : "badge-critical"
              }`}
            >
              {isVulnerability ? "● VULNERABILITY" : "● ACTIVE INCIDENT"}
            </span>
            <span className="mono text-[10px] text-neutral-600">
              {new Date(incident.start_ts * 1000).toISOString().slice(0, 10)}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5">{incident.name}</h1>
          <div className="text-xs text-neutral-500 mt-1 mono">{incident.attacker_attribution}</div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {incident.chains_touched.map((c) => (
            <span
              key={c}
              className="text-[10px] mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] text-neutral-400"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-3 pt-3 border-t border-white/[0.04]">
        <p className="text-xs text-neutral-400 max-w-4xl leading-relaxed">{incident.root_cause}</p>
      </div>
    </div>
  )
}

type Tab = "journey" | "flow" | "wallets" | "impact"

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "journey", icon: "⟠", label: "Journey" },
  { id: "flow", icon: "◎", label: "Flow" },
  { id: "wallets", icon: "⬡", label: "Wallets" },
  { id: "impact", icon: "◈", label: "Impact" },
]

type FlowResp = {
  nodes: Array<{ name: string; kind: string }>
  links: Array<{
    source: string; target: string; value: number
    asset?: string; chain?: string; phase?: string; step?: number; summary?: string
  }>
}

type ImpactResp = Record<string, unknown>

function ZecFlowExplainer() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Turnstile Visualizer */}
      <div className="neon-card-static p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-[#00d4ff]/[0.02] rounded-full blur-[60px]" />
        
        <h3 className="text-sm font-semibold text-white mb-4 mono flex items-center gap-2">
          <span className="text-[#00d4ff]">◉</span> Public Accounting Boundary: The Turnstile
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center justify-center my-6">
          {/* Transparent Side */}
          <div className="neon-card p-4 text-center border-white/[0.04]">
            <div className="text-2xl mb-1">⟠</div>
            <div className="mono text-xs text-[#00d4ff] font-semibold">Public Ledger</div>
            <div className="text-[10px] text-neutral-500 mt-1">Transparent & Sapling Pools</div>
            <div className="text-[11px] text-neutral-400 mt-2 bg-white/[0.02] py-1 px-2 rounded inline-block mono">
              Rest of Chain
            </div>
          </div>

          {/* Turnstile Gate */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-full flex items-center justify-center gap-1.5">
              <div className="h-px flex-1 bg-gradient-to-r from-[#00d4ff]/20 to-[#00ff88]/60" />
              <div className="mono text-[10px] bg-white/[0.03] border border-white/[0.08] px-2.5 py-1 rounded-full text-[#00ff88] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                TURNSTILE
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#00ff88]/60 to-[#8b5cf6]/20" />
            </div>
            <div className="text-[10px] text-neutral-500 mt-2 text-center max-w-[200px] leading-tight">
              Tracks net inflows/outflows. Prevents more withdrawals than deposits.
            </div>
          </div>

          {/* Orchard Pool */}
          <div className="neon-card p-4 text-center border-white/[0.04] neon-card-purple">
            <div className="text-2xl mb-1">⚛</div>
            <div className="mono text-xs text-[#8b5cf6] font-semibold">Orchard Pool</div>
            <div className="text-[10px] text-neutral-500 mt-1">Shielded Zero-Knowledge Pool</div>
            <div className="text-[11px] text-neutral-400 mt-2 bg-white/[0.02] py-1 px-2 rounded inline-block mono">
              Shielded Balances
            </div>
          </div>
        </div>

        <div className="bg-[#ff2255]/[0.05] border border-[#ff2255]/20 rounded-lg p-4 text-xs text-neutral-400 leading-relaxed">
          <strong className="text-white mono uppercase block mb-1 text-[10px] tracking-wider text-[#ff2255]">
            ⚠️ Solvency Guardrail Rule
          </strong>
          Zcash nodes automatically reject any block that would make the public Orchard pool balance negative. 
          Even if an attacker minted infinite fake Orchard notes inside the shielded pool, they could 
          only withdraw ZEC up to the amount that honest users previously deposited.
        </div>
      </div>

      {/* Accounting Table */}
      <div className="neon-card-static p-6">
        <h3 className="text-sm font-semibold text-white mb-3 mono">
          Orchard Balance Accounting Formula
        </h3>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          The turnstile operates by tracking the public variable <code className="mono text-[#00d4ff] bg-white/[0.04] px-1 py-0.5 rounded">valueBalanceOrchard</code> on every transaction:
          <br />
          <code className="block mt-2 bg-white/[0.02] p-2.5 rounded text-center text-white mono text-xs">
            New Orchard Balance = Old Balance - valueBalanceOrchard
          </code>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-neutral-500 mono text-[10px] uppercase tracking-wider">
                <th className="pb-2">Action</th>
                <th className="pb-2">valueBalanceOrchard Value</th>
                <th className="pb-2 text-right">Effect on Orchard Pool Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-neutral-400 mono">
              <tr>
                <td className="py-3 text-white">Deposit ZEC into Orchard</td>
                <td className="py-3 text-[#ff2255]">-10 ZEC</td>
                <td className="py-3 text-[#00ff88] text-right">Goes UP (+10 ZEC)</td>
              </tr>
              <tr>
                <td className="py-3 text-white">Withdraw ZEC from Orchard</td>
                <td className="py-3 text-[#00ff88]">+10 ZEC</td>
                <td className="py-3 text-[#ff2255] text-right">Goes DOWN (-10 ZEC)</td>
              </tr>
              <tr>
                <td className="py-3 text-white">Transfer within Orchard</td>
                <td className="py-3 text-neutral-500">0 ZEC</td>
                <td className="py-3 text-neutral-500 text-right">No Change</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Line Card */}
      <div className="neon-card-static p-5 bg-[#00ff88]/[0.02] border-[#00ff88]/10">
        <div className="flex gap-3">
          <div className="text-[#00ff88] text-lg">★</div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            <strong className="text-white mono uppercase block mb-1 text-[10px] tracking-wider text-[#00ff88]">
              Bottom Line
            </strong>
            The turnstile strictly protects the total Zcash supply. It guarantees that any soundness bug 
            remains **contained** within the Orchard pool itself. The main hypothetical failure mode is 
            **Orchard pool insolvency** (where honest claimants might find themselves unable to withdraw if 
            pool funds are fully depleted by a counterfeiter), not unlimited chain-wide inflation.
          </div>
        </div>
      </div>
    </div>
  )
}

function ZecWalletsExplainer() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Address Shielding Notice */}
      <div className="neon-card-static p-5">
        <div className="flex items-start gap-3">
          <div className="text-[#00d4ff] text-lg">ℹ</div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            <strong className="text-white mono uppercase block mb-1 text-[10px] tracking-wider text-[#00d4ff]">
              Shielded Ledger Privacy
            </strong>
            Zcash uses zk-SNARKs (specifically the halo2 proving system in Orchard) to encrypt addresses and 
            transaction amounts. Because individual balances are cryptographically shielded from public view, 
            **no individual attacker EOAs or compromised wallet addresses can be publicly tracked.**
          </div>
        </div>
      </div>

      {/* Who is at risk? */}
      <div className="neon-card-static p-6">
        <h3 className="text-sm font-semibold text-white mb-4 mono flex items-center gap-2">
          <span className="text-[#ff2255]">⚡</span> Solvency Risk Distribution Matrix
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Orchard Holders */}
          <div className="neon-card p-4 border-l-2 border-l-[#ff2255] border-white/[0.04] hover:border-l-[#ff2255]">
            <span className="mono text-[10px] text-[#ff2255] font-semibold block mb-1">A. ORCHARD HOLDERS</span>
            <div className="text-sm font-semibold text-white mb-2">Direct Solvency Risk</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              If a counterfeiter created fake Orchard notes, they would compete with honest notes for the 
              same pool backing. In the worst case, honest Orchard holders could be diluted or crowded out 
              from withdrawing.
            </p>
          </div>

          {/* Sapling Holders */}
          <div className="neon-card p-4 border-l-2 border-l-[#f59e0b] border-white/[0.04] hover:border-l-[#f59e0b]">
            <span className="mono text-[10px] text-[#f59e0b] font-semibold block mb-1">B. SAPLING HOLDERS</span>
            <div className="text-sm font-semibold text-white mb-2">Indirect Spillover Risk</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              The Sapling shielded pool is cryptographically independent. The only risk is if an attacker 
              withdrew fake Orchard ZEC into public pools and then deposited them into Sapling before the 
              vulnerability was patched.
            </p>
          </div>

          {/* Transparent Holders */}
          <div className="neon-card p-4 border-l-2 border-l-[#00d4ff] border-white/[0.04] hover:border-l-[#00d4ff]">
            <span className="mono text-[10px] text-[#00d4ff] font-semibold block mb-1">C. PUBLIC HOLDERS</span>
            <div className="text-sm font-semibold text-white mb-2">Market Confidence Risk</div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              No direct theft of transparent coins is possible. The primary risks are systemic: market 
              panic, exchange deposit halts, governance fork drama, and overall protocol reputation loss.
            </p>
          </div>
        </div>
      </div>

      {/* Why a new pool starts clean */}
      <div className="neon-card-static p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[100px] bg-[#00ff88]/[0.02] rounded-full blur-[60px]" />
        
        <h3 className="text-sm font-semibold text-white mb-3 mono">
          Pool Isolation: Starting Clean under NU6.2
        </h3>
        
        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          To fix the soundness bug and preserve privacy without forcing a retroactive audit of all shielded notes, 
          the Zcash network performed an emergency pool migration:
        </p>

        <div className="space-y-3">
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-xs">
            <span className="mono text-[10px] text-neutral-500 block mb-1">STEP 1: ISOLATE OLD POOL</span>
            <p className="text-neutral-400">
              The old Orchard shielded pool is quarantined. It contains all existing shielded notes, including 
              potential hidden liabilities if the bug was ever exploited secretly.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-xs">
            <span className="mono text-[10px] text-[#00ff88] block mb-1">STEP 2: LAUNCH NEW POOL</span>
            <p className="text-neutral-400">
              The NU6.2 upgrade deploys a brand new shielded pool from scratch with a corrected halo2 circuit. 
              The new pool starts with a balance of zero, guaranteed to contain no counterfeit liabilities.
            </p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg text-xs">
            <span className="mono text-[10px] text-[#00d4ff] block mb-1">STEP 3: TURNSTILE MIGRATION</span>
            <p className="text-neutral-400">
              Users migrate their old notes to the new pool. Funds cross the turnstile boundary, isolating 
              old potential liabilities while keeping new shielded transactions secure and auditable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FlowTab({ slug }: { slug: string }) {
  const isZcashExplainer = slug === "zcash-orchard"

  const { data, isLoading } = useQuery<FlowResp>({
    queryKey: ["flow", slug],
    queryFn: () => fetch(`/api/flow/${slug}`).then((r) => r.json()),
    enabled: !isZcashExplainer,
  })

  if (isZcashExplainer) {
    return <ZecFlowExplainer />
  }

  if (isLoading)
    return <div className="h-[400px] neon-card-static animate-pulse" />
  if (!data) return null
  return <FlowSankey nodes={data.nodes} links={data.links} />
}

function ImpactTab({ slug, incidentTs, contagionEndTs }: { slug: string; incidentTs?: number; contagionEndTs?: number }) {
  const { data, isLoading } = useQuery<ImpactResp>({
    queryKey: ["impact", slug],
    queryFn: () => fetch(`/api/impact/${slug}`).then((r) => r.json()),
  })

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[300px] neon-card-static animate-pulse" />
        ))}
      </div>
    )

  if (!data) return null

  const chartKeys = Object.keys(data).filter(
    (k) => !k.endsWith("_summary") && Array.isArray(data[k])
  )

  if (!chartKeys.length) {
    return (
      <div className="neon-card-static p-8 text-center">
        <div className="text-neutral-400 text-sm">No impact data available yet</div>
        <div className="text-neutral-600 text-xs mt-1 mono">
          Live data from DefiLlama and CoinGecko will populate these charts
        </div>
      </div>
    )
  }

  const CHART_CONFIG: Record<string, { title: string; color: string; unit: string }> = {
    aave_tvl: { title: "Aave TVL", color: "#00d4ff", unit: "$" },
    kelp_tvl: { title: "Kelp DAO TVL", color: "#ff2255", unit: "$" },
    aave_fees: { title: "Aave Daily Fees", color: "#f59e0b", unit: "$" },
    eth_price: { title: "ETH Price", color: "#8b5cf6", unit: "$" },
    btc_price: { title: "BTC Price", color: "#f59e0b", unit: "$" },
    zec_price: { title: "ZEC Price", color: "#ff2255", unit: "$" },
    cumulative_loss: { title: "Cumulative Loss", color: "#ff2255", unit: "$" },
    bridge_gap: { title: "Bridge Backing Gap", color: "#ff2255", unit: "$" },
    funds_escaped: { title: "Escaped Value", color: "#f59e0b", unit: "$" },
    frozen_value: { title: "Frozen Value", color: "#00d4ff", unit: "$" },
    protocol_tvl_static: { title: "Protocol TVL", color: "#00d4ff", unit: "$" },
    top_exploiters: { title: "Top Exploiter Value", color: "#f59e0b", unit: "$" },
    attacker_profit: { title: "Attacker Profit", color: "#f59e0b", unit: "$" },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {chartKeys.map((key) => {
        const config = CHART_CONFIG[key] ?? { title: key, color: "#00d4ff", unit: "$" }
        const points = data[key] as Array<{ ts: number; value: number }>
        return (
          <Boundary key={key} label={config.title}>
            <ImpactChart
              title={config.title}
              data={points}
              color={config.color}
              unit={config.unit}
              incidentTs={incidentTs}
              contagionEndTs={contagionEndTs}
            />
          </Boundary>
        )
      })}
    </div>
  )
}

export default function IncidentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [tab, setTab] = useState<Tab>("journey")

  const { data, isLoading, error } = useQuery<IncidentData>({
    queryKey: ["incident", slug],
    queryFn: () => fetch(`/api/incident/${slug}`).then((r) => r.json()),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="pulse-dot bg-[#00ff88]" />
          <span className="mono text-xs text-neutral-500">Loading intel…</span>
        </div>
      </div>
    )
  }

  if (error || !data?.incident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff2255] text-lg font-semibold">Target not found</div>
          <Link href="/" className="text-xs text-neutral-500 hover:text-[#00ff88] mono mt-2 inline-block transition-colors">
            ← Return to command center
          </Link>
        </div>
      </div>
    )
  }

  const { incident, hops, timeline } = data

  return (
    <div className="min-h-screen">
      {/* Top glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent" />

      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11px] mono text-neutral-500 hover:text-[#00ff88] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All incidents
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            <span className="mono text-[10px] text-neutral-600 uppercase tracking-wider">
              Intel Report
            </span>
          </div>
        </div>

        {/* Header */}
        <Header incident={incident} />

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {incident.stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} accent={s.accent} />
          ))}
        </div>

        {/* Tab bar */}
        <div className="tab-bar flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn flex items-center gap-1.5 ${tab === t.id ? "tab-btn-active" : ""}`}
            >
              <span className="text-sm">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-slide-up" key={tab}>
          {tab === "journey" && (
            <div className="neon-card-static p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                <span className="mono text-xs text-neutral-400 uppercase tracking-wider">
                  Chronological Event Trail
                </span>
              </div>
              <Timeline timeline={timeline} hops={hops} />
            </div>
          )}

          {tab === "flow" && (
            <Boundary label="Flow Diagram">
              <FlowTab slug={slug} />
            </Boundary>
          )}

          {tab === "wallets" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
                <span className="mono text-xs text-neutral-400 uppercase tracking-wider">
                  {slug === "zcash-orchard" ? "Shielded Pool Solvency Risk Model" : "Tracked Wallets"}
                </span>
              </div>
              {slug === "zcash-orchard" ? (
                <ZecWalletsExplainer />
              ) : (
                <WalletTracker slug={slug} />
              )}
            </div>
          )}

          {tab === "impact" && (
            <Boundary label="Impact Charts">
              <ImpactTab
                slug={slug}
                incidentTs={incident.start_ts}
                contagionEndTs={incident.pause_ts}
              />
            </Boundary>
          )}
        </div>
      </div>
    </div>
  )
}
