import { DRIFT_PROTOCOL_DATA } from "./drift-protocol"
import { KELP_DAO_DATA } from "./kelp-dao"
import { ZCASH_ORCHARD_DATA } from "./zcash-orchard"
import { INCIDENTS } from "./incidents"
import type { IncidentData, IncidentSummary, TrackedWallet } from "./types"

export const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  arbitrum: 42161,
  base: 8453,
  optimism: 10,
  polygon: 137,
  unichain: 130,
}

export const EVM_CHAIN_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  arbitrum: "Arbitrum",
  base: "Base",
  optimism: "Optimism",
  polygon: "Polygon",
  unichain: "Unichain",
}

export const EVM_EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  base: "https://basescan.org/tx/",
  optimism: "https://optimistic.etherscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  unichain: "https://uniscan.xyz/tx/",
}

export const EVM_ADDRESS_EXPLORERS: Record<string, string> = {
  ethereum: "https://etherscan.io/address/",
  arbitrum: "https://arbiscan.io/address/",
  base: "https://basescan.org/address/",
  optimism: "https://optimistic.etherscan.io/address/",
  polygon: "https://polygonscan.com/address/",
  unichain: "https://uniscan.xyz/address/",
}

export const APPROVAL_SCAN_CHAINS = ["ethereum", "arbitrum"] as const

const INCIDENT_DATA: Record<string, IncidentData> = {
  "kelp-dao": KELP_DAO_DATA,
  "zcash-orchard": ZCASH_ORCHARD_DATA,
  "drift-protocol": DRIFT_PROTOCOL_DATA,
}

const SUMMARY_BY_SLUG = new Map(INCIDENTS.map((incident) => [incident.slug, incident]))

export interface ExposureWatchAddress {
  address: string
  normalizedAddress: string
  chain: string
  chainId: number
  incidentSlug: string
  incidentName: string
  incidentDate: string
  label: string
  role: string
  severity: "critical" | "elevated" | "context"
  confidence: "seed" | "curated" | "verified"
  sourceLabel: string
  notes: string
  tags: string[]
}

function normalizeAddress(address: string) {
  return address.toLowerCase()
}

export function isEvmAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

export function isSupportedEvmChain(chain: string) {
  return Boolean(EVM_CHAIN_IDS[chain.toLowerCase()])
}

function roleSeverity(role?: string): ExposureWatchAddress["severity"] {
  if (role === "attacker") return "critical"
  if (role === "victim") return "context"
  return "elevated"
}

function toWatchAddress(
  slug: string,
  incident: IncidentSummary,
  wallet: TrackedWallet
): ExposureWatchAddress | null {
  const chain = wallet.chain.toLowerCase()
  if (!isSupportedEvmChain(chain) || !isEvmAddress(wallet.address)) return null

  const role = wallet.role ?? "watchlist"
  return {
    address: wallet.address,
    normalizedAddress: normalizeAddress(wallet.address),
    chain,
    chainId: EVM_CHAIN_IDS[chain],
    incidentSlug: slug,
    incidentName: incident.name,
    incidentDate: incident.date,
    label: wallet.label ?? "Indexed exploit address",
    role,
    severity: roleSeverity(role),
    confidence: "seed",
    sourceLabel: "HackTrail incident dataset",
    notes:
      role === "attacker"
        ? "Indexed as an incident-related attacker address. Replace seed records with sourced forensic addresses as the dataset matures."
        : "Indexed as an incident-related protocol or victim address for context matching.",
    tags: incident.tags,
  }
}

export function getExposureWatchlist() {
  const watchlist = new Map<string, ExposureWatchAddress>()

  for (const [slug, data] of Object.entries(INCIDENT_DATA)) {
    const incident = SUMMARY_BY_SLUG.get(slug)
    if (!incident) continue

    for (const wallet of data.tracked_wallets) {
      const watchAddress = toWatchAddress(slug, incident, wallet)
      if (!watchAddress) continue
      watchlist.set(`${watchAddress.chain}:${watchAddress.normalizedAddress}`, watchAddress)
    }
  }

  return Array.from(watchlist.values()).sort((a, b) => {
    const byDate = new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
    if (byDate !== 0) return byDate
    return a.label.localeCompare(b.label)
  })
}

export function getExposureCoverage() {
  const watchlist = getExposureWatchlist()
  const coveredSlugs = new Set(watchlist.map((item) => item.incidentSlug))
  const chains = [...new Set(watchlist.map((item) => item.chain))]
  const approvalChains = [...new Set([...chains, ...APPROVAL_SCAN_CHAINS])]

  return {
    watchlistCount: watchlist.length,
    chainCount: chains.length,
    chains: chains.map((chain) => EVM_CHAIN_LABELS[chain] ?? chain),
    approvalChains: approvalChains.map((chain) => EVM_CHAIN_LABELS[chain] ?? chain),
    verifiedCount: watchlist.filter((item) => item.confidence === "verified").length,
    seededCount: watchlist.filter((item) => item.confidence === "seed").length,
    coveredIncidents: INCIDENTS.filter((incident) => coveredSlugs.has(incident.slug)),
    limitedIncidents: INCIDENTS.filter((incident) => !coveredSlugs.has(incident.slug)),
  }
}
