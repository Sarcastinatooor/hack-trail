"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react"
import type { IncidentStatus, IncidentSummary } from "@/data/types"

export interface IncidentExplorerItem extends IncidentSummary {
  evidenceCount: number
  eventCount: number
  hopCount: number
  walletCount: number
}

type LossFilter = "all" | "none" | "under-10m" | "10m-100m" | "over-100m"

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "border-[#627eea]/30 text-[#8196ef]",
  Arbitrum: "border-[#28a0f0]/30 text-[#58b7f5]",
  Bitcoin: "border-[#f7931a]/30 text-[#f7a744]",
  "BNB Chain": "border-[#f3ba2f]/30 text-[#f3c756]",
  BSC: "border-[#f3ba2f]/30 text-[#f3c756]",
  Unichain: "border-[#ff007a]/30 text-[#ff4b9c]",
  Solana: "border-[#9945ff]/30 text-[#b577ff]",
  Polygon: "border-[#8247e5]/30 text-[#a174ec]",
  Ronin: "border-[#1273ea]/30 text-[#4a94ef]",
  Fantom: "border-[#13b5ec]/30 text-[#4ac8f2]",
  Avalanche: "border-[#e84142]/30 text-[#ed6d6e]",
  Sui: "border-[#4da2ff]/30 text-[#75b7ff]",
  Mixin: "border-[#00a8ff]/30 text-[#42bfff]",
  Harmony: "border-[#00aee9]/30 text-[#43c5ef]",
  Moonbeam: "border-[#b83f99]/30 text-[#cc70b6]",
  Moonriver: "border-[#f2b705]/30 text-[#f4ca45]",
  Evmos: "border-[#ed4e33]/30 text-[#f07866]",
  Milkomeda: "border-[#00d4ff]/30 text-[#42dfff]",
  Zcash: "border-[#f4b728]/30 text-[#f5ca5b]",
  RISE: "border-[#00ff88]/30 text-[#00ff88]",
  HyperEVM: "border-[#00ff88]/30 text-[#00ff88]",
  "Hyperliquid L1": "border-[#00d4ff]/30 text-[#42dfff]",
}

const VECTOR_ORDER = [
  "Bridge / Cross-chain",
  "Keys / Permissions",
  "Oracle / Market",
  "Governance",
  "Protocol Logic",
  "Custody / Operations",
] as const

function fmtUsd(n: number) {
  if (!Number.isFinite(n) || n === 0) return "$0"
  const abs = Math.abs(n)
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(n >= 100e6 ? 0 : 1)}M`
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function vectorGroup(incident: IncidentExplorerItem) {
  const signal = `${incident.attack_vector} ${incident.tags.join(" ")}`.toLowerCase()
  if (/bridge|cross-chain|message|dvn|guardian|validator/.test(signal)) return "Bridge / Cross-chain"
  if (/key|signer|multisig|phish|permission|admin|access-control|approval/.test(signal)) return "Keys / Permissions"
  if (/oracle|price|market|collateral|depeg|liquidity|perps/.test(signal)) return "Oracle / Market"
  if (/governance|voting|quorum|proposal/.test(signal)) return "Governance"
  if (/custody|exchange|cloud|database|hot-wallet|front-end/.test(signal)) return "Custody / Operations"
  return "Protocol Logic"
}

function matchesLoss(incident: IncidentExplorerItem, filter: LossFilter) {
  if (filter === "none") return incident.loss_usd === 0
  if (filter === "under-10m") return incident.loss_usd > 0 && incident.loss_usd < 10_000_000
  if (filter === "10m-100m") return incident.loss_usd >= 10_000_000 && incident.loss_usd < 100_000_000
  if (filter === "over-100m") return incident.loss_usd >= 100_000_000
  return true
}

function ChainBadge({ chain }: { chain: string }) {
  const color = CHAIN_COLORS[chain] ?? "border-white/10 text-neutral-400"
  return (
    <span className={`rounded border bg-white/[0.02] px-1.5 py-0.5 mono text-[9px] ${color}`}>
      {chain}
    </span>
  )
}

function StatusBadge({ status, latest }: { status: IncidentStatus; latest: boolean }) {
  if (status === "ongoing") {
    return <span className="badge-critical rounded-md px-2 py-1 mono text-[9px]">● ONGOING</span>
  }
  if (latest) {
    return <span className="badge-active rounded-md px-2 py-1 mono text-[9px]">● LATEST INTEL</span>
  }
  if (status === "full") {
    return <span className="incident-status-mapped rounded-md px-2 py-1 mono text-[9px]">● FULL TRAIL</span>
  }
  return <span className="badge-pending rounded-md px-2 py-1 mono text-[9px]">○ PENDING</span>
}

function IncidentCard({
  incident,
  index,
  latest,
  onPreview,
}: {
  incident: IncidentExplorerItem
  index: number
  latest: boolean
  onPreview: (incident: IncidentExplorerItem) => void
}) {
  const isVulnerability = incident.loss_usd === 0
  const metric = (incident.loss_label ?? fmtUsd(incident.loss_usd)).replace("price crash", "crash")
  const metricSize = metric.length > 19 ? "text-[1.15rem]" : metric.length > 13 ? "text-[1.35rem]" : "text-[1.6rem]"
  const delay = `${Math.min(index, 6) * 45}ms`

  function moveSpotlight(event: ReactPointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
  }

  return (
    <article
      className={`incident-intel-card incident-card-enter ${latest ? "incident-card-latest" : ""}`}
      style={{ "--card-delay": delay } as CSSProperties}
      onPointerMove={moveSpotlight}
    >
      <Link href={`/incident/${incident.slug}`} className="incident-card-main" aria-label={`Open ${incident.name}`}>
        <div className="relative z-[1] flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">Reported</div>
              <div className="mt-1 mono text-[10px] uppercase tracking-wider text-neutral-400">
                {incident.date_label}
              </div>
            </div>
            <StatusBadge status={incident.status} latest={latest} />
          </div>

          <div className="mt-4 min-h-[65px]">
            <div className="mono text-[9px] uppercase tracking-[0.16em] text-[#00ff88]/65">
              {incident.victim}
            </div>
            <h3 className="mt-1.5 line-clamp-2 text-[17px] font-semibold leading-[1.35] text-white">
              {incident.name}
            </h3>
          </div>

          <div className="mt-4 grid min-h-[78px] grid-cols-[minmax(0,1.05fr)_minmax(7rem,0.95fr)] gap-4 border-y border-white/[0.045] py-3.5">
            <div className="min-w-0 self-center">
              <div className="mono text-[9px] uppercase tracking-[0.14em] text-neutral-600">
                {isVulnerability ? "Potential impact" : "Value affected"}
              </div>
              <div className={`data-value mt-1 break-words leading-[1.2] ${metricSize} ${isVulnerability ? "text-[#00d4ff]" : "text-[#ff315d]"}`}>
                {metric}
              </div>
            </div>
            <div className="min-w-0 self-center border-l border-white/[0.05] pl-4">
              <div className="mono text-[9px] uppercase tracking-[0.14em] text-neutral-600">Attack vector</div>
              <div className="mt-1 line-clamp-3 text-[11px] leading-[1.45] text-neutral-400">
                {incident.attack_vector}
              </div>
            </div>
          </div>

          <p className="mt-3 min-h-[54px] line-clamp-3 text-xs leading-[1.55] text-neutral-500">
            {incident.short_summary}
          </p>

          <div className="mt-3 flex min-h-[22px] flex-wrap content-start gap-1.5">
            {incident.chains.slice(0, 3).map((chain) => <ChainBadge key={chain} chain={chain} />)}
            {incident.chains.length > 3 && (
              <span className="px-1 py-0.5 mono text-[9px] text-neutral-600">+{incident.chains.length - 3}</span>
            )}
          </div>

          <div className="mt-auto flex min-h-[37px] items-center justify-between gap-3 pt-4">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${incident.walletCount > 0 ? "bg-[#00ff88]" : "bg-neutral-700"}`} />
              <span className="mono text-[9px] uppercase tracking-wider text-neutral-600">
                {incident.walletCount > 0 ? "Exposure check ready" : "Context coverage"}
              </span>
            </div>
            <span className="mono text-[9px] text-neutral-600">{incident.evidenceCount} evidence points</span>
          </div>
        </div>
      </Link>

      <div className="relative z-[2] flex items-center justify-between gap-3 border-t border-white/[0.05] px-5 py-3">
        <div className="flex items-center gap-3 mono text-[9px] text-neutral-600">
          <span>{incident.eventCount} EVENTS</span>
          <span>{incident.hopCount} HOPS</span>
          <span>{incident.walletCount} ADDRS</span>
        </div>
        <button
          type="button"
          onClick={() => onPreview(incident)}
          className="incident-preview-button rounded-md border border-white/[0.08] bg-white/[0.025] px-2.5 py-1.5 mono text-[9px] uppercase tracking-wider text-neutral-400"
          aria-label={`Quick preview ${incident.name}`}
        >
          Quick view <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  )
}

function PreviewDrawer({
  incident,
  onClose,
}: {
  incident: IncidentExplorerItem
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const isVulnerability = incident.loss_usd === 0

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  return (
    <div
      className="incident-overlay"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <aside className="incident-preview-drawer" role="dialog" aria-modal="true" aria-labelledby="incident-preview-title">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4 md:px-6">
          <div>
            <div className="mono text-[9px] uppercase tracking-[0.2em] text-[#00ff88]">Quick intelligence</div>
            <div className="mt-1 mono text-[10px] text-neutral-600">{incident.date_label} · {incident.chains.join(" / ")}</div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] text-lg text-neutral-400 outline-none transition-colors hover:border-white/[0.16] hover:text-white focus-visible:border-[#00ff88]/40 focus-visible:ring-1 focus-visible:ring-[#00ff88]/25"
            aria-label="Close incident preview"
          >
            ×
          </button>
        </div>

        <div className="incident-preview-scroll px-5 py-5 md:px-6">
          <StatusBadge status={incident.status} latest={false} />
          <h2 id="incident-preview-title" className="mt-3 text-2xl font-semibold leading-tight text-white">
            {incident.name}
          </h2>
          <div className="mt-2 text-xs text-neutral-500">Victim: <span className="text-neutral-300">{incident.victim}</span></div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className={`rounded-lg border p-4 ${isVulnerability ? "border-[#00d4ff]/20 bg-[#00d4ff]/[0.04]" : "border-[#ff2255]/20 bg-[#ff2255]/[0.04]"}`}>
              <div className="mono text-[9px] uppercase tracking-wider text-neutral-600">{isVulnerability ? "Impact" : "Value affected"}</div>
              <div className={`data-value mt-1 text-xl ${isVulnerability ? "text-[#00d4ff]" : "text-[#ff315d]"}`}>
                {incident.loss_label ?? fmtUsd(incident.loss_usd)}
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="mono text-[9px] uppercase tracking-wider text-neutral-600">Exposure coverage</div>
              <div className={`mt-1 text-sm font-semibold ${incident.walletCount > 0 ? "text-[#00ff88]" : "text-neutral-300"}`}>
                {incident.walletCount > 0 ? `${incident.walletCount} addresses indexed` : "Context only"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">What happened</div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">{incident.short_summary}</p>
          </div>

          <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mono text-[9px] uppercase tracking-[0.16em] text-neutral-600">Attack vector</div>
            <div className="mt-2 text-sm leading-relaxed text-neutral-300">{incident.attack_vector}</div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              [incident.eventCount, "Timeline events"],
              [incident.hopCount, "Fund-flow hops"],
              [incident.walletCount, "Tracked addresses"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="data-value text-lg text-white">{value}</div>
                <div className="mt-1 mono text-[8px] uppercase leading-tight tracking-wider text-neutral-600">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {incident.tags.map((tag) => (
              <span key={tag} className="rounded bg-white/[0.035] px-2 py-1 mono text-[9px] text-neutral-500">{tag}</span>
            ))}
          </div>

          {incident.attribution && (
            <div className="mt-6 border-l-2 border-[#f59e0b]/50 pl-3">
              <div className="mono text-[9px] uppercase tracking-wider text-neutral-600">Attribution / status</div>
              <div className="mt-1 text-xs leading-relaxed text-neutral-400">{incident.attribution}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] bg-[#08080b] p-4 md:px-6">
          <Link
            href={`/incident/${incident.slug}`}
            className="rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10 px-3 py-2.5 text-center mono text-[10px] uppercase tracking-wider text-[#00ff88] transition-colors hover:bg-[#00ff88]/15"
          >
            Open full trail
          </Link>
          <Link
            href="/intelligence"
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-center mono text-[10px] uppercase tracking-wider text-neutral-400 transition-colors hover:border-[#00d4ff]/20 hover:text-[#00d4ff]"
          >
            Check exposure
          </Link>
        </div>
      </aside>
    </div>
  )
}

function CommandPalette({
  incidents,
  onClose,
}: {
  incidents: IncidentExplorerItem[]
  onClose: () => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return incidents.slice(0, 8)
    return incidents.filter((incident) =>
      [incident.name, incident.victim, incident.attack_vector, incident.attribution, ...incident.chains, ...incident.tags]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    ).slice(0, 8)
  }, [incidents, query])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    inputRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow }
  }, [])

  function openIncident(incident: IncidentExplorerItem) {
    onClose()
    router.push(`/incident/${incident.slug}`)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setSelectedIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setSelectedIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault()
      openIncident(results[selectedIndex])
    }
  }

  return (
    <div
      className="incident-command-overlay"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section className="incident-command" role="dialog" aria-modal="true" aria-label="Find an incident">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
          <span className="text-lg text-[#00ff88]" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Find protocol, chain, vector, or actor..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-700"
            aria-label="Search incidents"
          />
          <button type="button" onClick={onClose} className="rounded border border-white/[0.08] px-2 py-1 mono text-[9px] text-neutral-500 hover:text-white">
            ESC
          </button>
        </div>

        <div className="max-h-[min(480px,65vh)] overflow-y-auto p-2">
          <div className="px-2 pb-2 pt-1 mono text-[9px] uppercase tracking-[0.16em] text-neutral-700">
            {query ? `${results.length} matching incidents` : "Recent incidents"}
          </div>
          {results.length ? results.map((incident, index) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => openIncident(incident)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${selectedIndex === index ? "bg-[#00ff88]/[0.07]" : "hover:bg-white/[0.03]"}`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${incident.status === "ongoing" ? "bg-[#ff2255]" : index === 0 && !query ? "bg-[#00ff88]" : "bg-neutral-700"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-neutral-200">{incident.name}</span>
                <span className="mt-1 block truncate mono text-[9px] text-neutral-600">
                  {incident.date_label} · {incident.chains.join(" / ")} · {vectorGroup(incident)}
                </span>
              </span>
              <span className={`data-value shrink-0 text-sm ${incident.loss_usd === 0 ? "text-[#00d4ff]" : "text-[#ff315d]"}`}>
                {incident.loss_label ?? fmtUsd(incident.loss_usd)}
              </span>
            </button>
          )) : (
            <div className="px-4 py-12 text-center">
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-600">No matching intelligence</div>
              <div className="mt-2 text-xs text-neutral-700">Try a chain, protocol, attack vector, or actor name.</div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5 mono text-[8px] uppercase tracking-wider text-neutral-700">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </section>
    </div>
  )
}

export function IncidentExplorer({ incidents }: { incidents: IncidentExplorerItem[] }) {
  const [chain, setChain] = useState("all")
  const [year, setYear] = useState("all")
  const [vector, setVector] = useState("all")
  const [status, setStatus] = useState<IncidentStatus | "all">("all")
  const [loss, setLoss] = useState<LossFilter>("all")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [preview, setPreview] = useState<IncidentExplorerItem | null>(null)

  const chains = useMemo(() => [...new Set(incidents.flatMap((incident) => incident.chains))].sort(), [incidents])
  const years = useMemo(() => [...new Set(incidents.map((incident) => incident.date.slice(0, 4)))].sort().reverse(), [incidents])

  const visibleIncidents = useMemo(() => incidents.filter((incident) => {
    if (chain !== "all" && !incident.chains.includes(chain)) return false
    if (year !== "all" && !incident.date.startsWith(year)) return false
    if (vector !== "all" && vectorGroup(incident) !== vector) return false
    if (status !== "all" && incident.status !== status) return false
    return matchesLoss(incident, loss)
  }), [chain, incidents, loss, status, vector, year])

  const activeFilters = [chain, year, vector, status, loss].filter((value) => value !== "all").length

  useEffect(() => {
    function handleGlobalKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setPreview(null)
        setCommandOpen(true)
      }
      if (event.key === "Escape") {
        setCommandOpen(false)
        setPreview(null)
      }
    }
    window.addEventListener("keydown", handleGlobalKey)
    return () => window.removeEventListener("keydown", handleGlobalKey)
  }, [])

  function resetFilters() {
    setChain("all")
    setYear("all")
    setVector("all")
    setStatus("all")
    setLoss("all")
  }

  const filterChips = [
    chain !== "all" ? { label: `Chain: ${chain}`, clear: () => setChain("all") } : null,
    year !== "all" ? { label: `Year: ${year}`, clear: () => setYear("all") } : null,
    vector !== "all" ? { label: `Vector: ${vector}`, clear: () => setVector("all") } : null,
    status !== "all" ? { label: `Status: ${status}`, clear: () => setStatus("all") } : null,
    loss !== "all" ? {
      label: `Loss: ${loss === "none" ? "No confirmed loss" : loss === "under-10m" ? "Under $10M" : loss === "10m-100m" ? "$10M–$100M" : "$100M+"}`,
      clear: () => setLoss("all"),
    } : null,
  ].filter(Boolean) as Array<{ label: string; clear: () => void }>

  return (
    <>
      <div className="incident-controls mb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className={`rounded-lg border px-3 py-2 mono text-[10px] uppercase tracking-wider transition-colors ${filtersOpen || activeFilters ? "border-[#00ff88]/25 bg-[#00ff88]/[0.08] text-[#00ff88]" : "border-white/[0.08] bg-white/[0.025] text-neutral-400 hover:border-white/[0.14] hover:text-white"}`}
              aria-expanded={filtersOpen}
            >
              Filters{activeFilters ? ` · ${activeFilters}` : ""}
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); setCommandOpen(true) }}
              className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 mono text-[10px] uppercase tracking-wider text-neutral-400 transition-colors hover:border-[#00d4ff]/20 hover:text-[#00d4ff]"
            >
              Find incident
              <kbd className="rounded border border-white/[0.08] bg-black/30 px-1.5 py-0.5 text-[8px] text-neutral-600">⌘K</kbd>
            </button>
          </div>
          <div className="mono text-[9px] uppercase tracking-wider text-neutral-600">
            Showing {visibleIncidents.length} of {incidents.length} incidents
          </div>
        </div>

        {filtersOpen && (
          <div className="incident-filter-panel mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <FilterSelect label="Chain" value={chain} onChange={setChain} options={chains} />
            <FilterSelect label="Year" value={year} onChange={setYear} options={years} />
            <FilterSelect label="Vector" value={vector} onChange={setVector} options={[...VECTOR_ORDER]} />
            <FilterSelect
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as IncidentStatus | "all")}
              options={["full", "ongoing", "stub"]}
              formatOption={(value) => value === "full" ? "Full trail" : value === "stub" ? "Pending" : "Ongoing"}
            />
            <FilterSelect
              label="Loss range"
              value={loss}
              onChange={(value) => setLoss(value as LossFilter)}
              options={["none", "under-10m", "10m-100m", "over-100m"]}
              formatOption={(value) => value === "none" ? "No confirmed loss" : value === "under-10m" ? "Under $10M" : value === "10m-100m" ? "$10M–$100M" : "$100M+"}
            />
          </div>
        )}

        {filterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {filterChips.map((chip) => (
              <button key={chip.label} type="button" onClick={chip.clear} className="rounded-full border border-[#00ff88]/15 bg-[#00ff88]/[0.05] px-2.5 py-1 mono text-[9px] text-[#00ff88]/80 hover:border-[#00ff88]/30">
                {chip.label} <span aria-hidden="true">×</span>
              </button>
            ))}
            <button type="button" onClick={resetFilters} className="px-2 py-1 mono text-[9px] uppercase tracking-wider text-neutral-600 hover:text-white">
              Clear all
            </button>
          </div>
        )}
      </div>

      {visibleIncidents.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleIncidents.map((incident, index) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              index={index}
              latest={incident.id === incidents[0]?.id}
              onPreview={setPreview}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/[0.09] bg-white/[0.015] px-5 py-16 text-center">
          <div className="mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">No incidents match these filters</div>
          <button type="button" onClick={resetFilters} className="mt-4 rounded-lg border border-[#00ff88]/20 bg-[#00ff88]/[0.07] px-4 py-2 mono text-[10px] uppercase tracking-wider text-[#00ff88]">
            Reset filters
          </button>
        </div>
      )}

      {preview && <PreviewDrawer incident={preview} onClose={() => setPreview(null)} />}
      {commandOpen && <CommandPalette incidents={incidents} onClose={() => setCommandOpen(false)} />}
    </>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  formatOption = (option) => option,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  formatOption?: (value: string) => string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block mono text-[8px] uppercase tracking-[0.16em] text-neutral-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-white/[0.08] bg-[#0a0a0d] px-2.5 mono text-[10px] text-neutral-300 outline-none transition-colors focus:border-[#00ff88]/30"
      >
        <option value="all">All</option>
        {options.map((option) => <option key={option} value={option}>{formatOption(option)}</option>)}
      </select>
    </label>
  )
}
