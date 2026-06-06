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

function FlowTab({ slug }: { slug: string }) {
  const { data, isLoading } = useQuery<FlowResp>({
    queryKey: ["flow", slug],
    queryFn: () => fetch(`/api/flow/${slug}`).then((r) => r.json()),
  })
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
                  Tracked Wallets
                </span>
              </div>
              <WalletTracker slug={slug} />
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
