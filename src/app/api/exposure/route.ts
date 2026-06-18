import { NextResponse } from "next/server"
import {
  EVM_CHAIN_LABELS,
  EVM_EXPLORERS,
  getExposureCoverage,
  getExposureWatchlist,
  isEvmAddress,
  type ExposureWatchAddress,
} from "@/data/exposure"

export const dynamic = "force-dynamic"

type EtherscanTx = Record<string, string>

interface ExposureMatch {
  incidentSlug: string
  incidentName: string
  incidentDate: string
  chain: string
  chainLabel: string
  watchedAddress: string
  watchedLabel: string
  watchedRole: string
  severity: ExposureWatchAddress["severity"]
  txHash: string
  timestamp: number
  direction: "incoming" | "outgoing"
  asset: string
  amount: string
  reason: string
  explorerUrl?: string
}

function sameAddress(a?: string, b?: string) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase())
}

function formatTokenAmount(value: string, decimals = "18") {
  const raw = BigInt(value || "0")
  const scale = BigInt(10) ** BigInt(Number(decimals) || 18)
  const whole = raw / scale
  const fraction = raw % scale
  const fractionText = fraction.toString().padStart(Number(decimals) || 18, "0").slice(0, 4)
  return `${whole.toString()}.${fractionText}`.replace(/\.?0+$/, "")
}

function parseEtherscanResult(json: unknown): EtherscanTx[] {
  if (!json || typeof json !== "object") return []
  const result = (json as { result?: unknown }).result
  return Array.isArray(result) ? (result as EtherscanTx[]) : []
}

async function fetchEtherscan(
  chainId: number,
  action: "txlist" | "tokentx",
  address: string,
  apiKey: string
) {
  const url = new URL("https://api.etherscan.io/v2/api")
  url.searchParams.set("chainid", String(chainId))
  url.searchParams.set("module", "account")
  url.searchParams.set("action", action)
  url.searchParams.set("address", address)
  url.searchParams.set("startblock", "0")
  url.searchParams.set("endblock", "99999999")
  url.searchParams.set("page", "1")
  url.searchParams.set("offset", "10000")
  url.searchParams.set("sort", "desc")
  url.searchParams.set("apikey", apiKey)

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Etherscan HTTP ${res.status}`)
  return parseEtherscanResult(await res.json())
}

function matchTx(
  tx: EtherscanTx,
  userAddress: string,
  targets: Map<string, ExposureWatchAddress>,
  chain: string,
  kind: "native" | "token"
): ExposureMatch | null {
  const from = tx.from?.toLowerCase()
  const to = tx.to?.toLowerCase()
  const target = targets.get(from) ?? targets.get(to)
  if (!target) return null

  const direction = sameAddress(from, userAddress) ? "outgoing" : "incoming"
  const tokenSymbol = tx.tokenSymbol || "ETH"
  const amount = kind === "token"
    ? formatTokenAmount(tx.value, tx.tokenDecimal)
    : formatTokenAmount(tx.value, "18")
  const txHash = tx.hash

  return {
    incidentSlug: target.incidentSlug,
    incidentName: target.incidentName,
    incidentDate: target.incidentDate,
    chain,
    chainLabel: EVM_CHAIN_LABELS[chain] ?? chain,
    watchedAddress: target.address,
    watchedLabel: target.label,
    watchedRole: target.role,
    severity: target.severity,
    txHash,
    timestamp: Number(tx.timeStamp) || 0,
    direction,
    asset: tokenSymbol,
    amount,
    reason:
      target.role === "attacker"
        ? "Direct interaction with an indexed attacker-controlled address"
        : "Interaction with an indexed incident-related protocol address",
    explorerUrl: txHash ? `${EVM_EXPLORERS[chain] ?? ""}${txHash}` : undefined,
  }
}

function scoreMatches(matches: ExposureMatch[]) {
  if (!matches.length) return 0
  const uniqueIncidents = new Set(matches.map((match) => match.incidentSlug)).size
  const critical = matches.filter((match) => match.severity === "critical").length
  const elevated = matches.filter((match) => match.severity === "elevated").length
  const context = matches.filter((match) => match.severity === "context").length
  return Math.min(100, critical * 42 + elevated * 26 + context * 10 + uniqueIncidents * 8)
}

export async function POST(request: Request) {
  let body: { address?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const address = body.address?.trim()
  if (!address || !isEvmAddress(address)) {
    return NextResponse.json({ error: "Enter a valid EVM address" }, { status: 400 })
  }

  const normalizedAddress = address.toLowerCase()
  const apiKey = process.env.ETHERSCAN_API_KEY || ""
  const watchlist = getExposureWatchlist()
  const coverage = getExposureCoverage()
  const chains = [...new Set(watchlist.map((item) => item.chain))]
  const matches: ExposureMatch[] = []
  const warnings: string[] = []

  await Promise.all(
    chains.map(async (chain) => {
      const chainTargets = new Map(
        watchlist
          .filter((item) => item.chain === chain)
          .map((item) => [item.normalizedAddress, item] as const)
      )
      const chainId = watchlist.find((item) => item.chain === chain)?.chainId
      if (!chainId) return

      try {
        const [nativeTxs, tokenTxs] = await Promise.all([
          fetchEtherscan(chainId, "txlist", normalizedAddress, apiKey),
          fetchEtherscan(chainId, "tokentx", normalizedAddress, apiKey),
        ])

        for (const tx of nativeTxs) {
          const match = matchTx(tx, normalizedAddress, chainTargets, chain, "native")
          if (match) matches.push(match)
        }

        for (const tx of tokenTxs) {
          const match = matchTx(tx, normalizedAddress, chainTargets, chain, "token")
          if (match) matches.push(match)
        }
      } catch (error) {
        warnings.push(`${EVM_CHAIN_LABELS[chain] ?? chain}: ${error instanceof Error ? error.message : "scan failed"}`)
      }
    })
  )

  const deduped = Array.from(
    new Map(matches.map((match) => [`${match.chain}:${match.txHash}:${match.watchedAddress}:${match.asset}`, match])).values()
  ).sort((a, b) => b.timestamp - a.timestamp)

  const score = scoreMatches(deduped)
  const status = deduped.length ? "exposure_found" : warnings.length === chains.length ? "scan_limited" : "clear"

  return NextResponse.json({
    address,
    checkedAt: new Date().toISOString(),
    status,
    score,
    summary: deduped.length
      ? `${deduped.length} interaction${deduped.length === 1 ? "" : "s"} found against indexed exploit addresses.`
      : "No direct interactions found against the currently indexed EVM exploit watchlist.",
    matches: deduped.slice(0, 30),
    warnings,
    coverage: {
      watchlistCount: coverage.watchlistCount,
      chains: coverage.chains,
      coveredIncidents: coverage.coveredIncidents.map((incident) => incident.name),
      limitedIncidents: coverage.limitedIncidents.map((incident) => incident.name),
    },
  })
}
