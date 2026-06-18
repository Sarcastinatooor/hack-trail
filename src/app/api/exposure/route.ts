import { NextResponse } from "next/server"
import {
  APPROVAL_SCAN_CHAINS,
  EVM_ADDRESS_EXPLORERS,
  EVM_CHAIN_IDS,
  EVM_CHAIN_LABELS,
  EVM_EXPLORERS,
  getExposureCoverage,
  getExposureWatchlist,
  isEvmAddress,
  type ExposureWatchAddress,
} from "@/data/exposure"

export const dynamic = "force-dynamic"

type EtherscanTx = Record<string, string>
type EtherscanLog = {
  address?: string
  topics?: string[]
  data?: string
  timeStamp?: string
  transactionHash?: string
  blockNumber?: string
}

const APPROVAL_TOPIC = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925"
const ZERO = BigInt(0)
const TWO = BigInt(2)
const MAX_UINT_256 = (TWO ** BigInt(256)) - BigInt(1)

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

interface ApprovalAlert {
  chain: string
  chainLabel: string
  tokenAddress: string
  spenderAddress: string
  spenderLabel: string
  spenderRole?: string
  incidentSlug?: string
  incidentName?: string
  severity: "critical" | "elevated" | "context"
  txHash: string
  timestamp: number
  allowanceRaw: string
  allowanceLabel: string
  reason: string
  revokeUrl: string
  explorerUrl?: string
  tokenExplorerUrl?: string
  spenderExplorerUrl?: string
}

function sameAddress(a?: string, b?: string) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase())
}

function parseNumberish(value?: string) {
  if (!value) return 0
  if (value.startsWith("0x")) return Number.parseInt(value, 16) || 0
  return Number(value) || 0
}

function topicForAddress(address: string) {
  return `0x${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`
}

function addressFromTopic(topic?: string) {
  if (!topic || topic.length < 66) return ""
  return `0x${topic.slice(-40)}`.toLowerCase()
}

function parseHexBigInt(value?: string) {
  try {
    if (!value || value === "0x") return ZERO
    return BigInt(value)
  } catch {
    return ZERO
  }
}

function formatTokenAmount(value: string, decimals = "18") {
  const raw = BigInt(value || "0")
  const scale = BigInt(10) ** BigInt(Number(decimals) || 18)
  const whole = raw / scale
  const fraction = raw % scale
  const fractionText = fraction.toString().padStart(Number(decimals) || 18, "0").slice(0, 4)
  return `${whole.toString()}.${fractionText}`.replace(/\.?0+$/, "")
}

function formatApprovalValue(raw: bigint) {
  if (raw === ZERO) return "Revoked / zero"
  if (raw > MAX_UINT_256 / TWO) return "Unlimited"
  const text = raw.toString()
  if (text.length > 12) return `${text.slice(0, 6)}...${text.slice(-4)} raw`
  return `${text} raw`
}

function parseEtherscanResult(json: unknown): EtherscanTx[] {
  if (!json || typeof json !== "object") return []
  const result = (json as { result?: unknown }).result
  return Array.isArray(result) ? (result as EtherscanTx[]) : []
}

function parseEtherscanLogs(json: unknown): EtherscanLog[] {
  if (!json || typeof json !== "object") return []
  const result = (json as { result?: unknown }).result
  return Array.isArray(result) ? (result as EtherscanLog[]) : []
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

async function fetchApprovalLogs(chainId: number, ownerAddress: string, apiKey: string) {
  const url = new URL("https://api.etherscan.io/v2/api")
  url.searchParams.set("chainid", String(chainId))
  url.searchParams.set("module", "logs")
  url.searchParams.set("action", "getLogs")
  url.searchParams.set("fromBlock", "0")
  url.searchParams.set("toBlock", "latest")
  url.searchParams.set("topic0", APPROVAL_TOPIC)
  url.searchParams.set("topic1", topicForAddress(ownerAddress))
  url.searchParams.set("topic0_1_opr", "and")
  url.searchParams.set("page", "1")
  url.searchParams.set("offset", "1000")
  url.searchParams.set("apikey", apiKey)

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error(`Etherscan logs HTTP ${res.status}`)
  return parseEtherscanLogs(await res.json())
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

function matchApproval(
  log: EtherscanLog,
  targets: Map<string, ExposureWatchAddress>,
  chain: string,
  userAddress: string
): ApprovalAlert | null {
  const spender = addressFromTopic(log.topics?.[2])
  const tokenAddress = log.address?.toLowerCase() ?? ""
  if (!spender || !tokenAddress) return null

  const allowance = parseHexBigInt(log.data)
  if (allowance === ZERO) return null

  const target = targets.get(spender)
  const unlimited = allowance > MAX_UINT_256 / TWO
  const severity = target?.severity === "critical"
    ? "critical"
    : unlimited
    ? "elevated"
    : target
    ? "elevated"
    : "context"
  const chainLabel = EVM_CHAIN_LABELS[chain] ?? chain
  const txHash = log.transactionHash ?? ""
  const explorerBase = EVM_EXPLORERS[chain] ?? ""
  const addressExplorerBase = EVM_ADDRESS_EXPLORERS[chain] ?? ""
  const chainId = EVM_CHAIN_IDS[chain]

  return {
    chain,
    chainLabel,
    tokenAddress,
    spenderAddress: spender,
    spenderLabel: target?.label ?? "Unlabeled spender",
    spenderRole: target?.role,
    incidentSlug: target?.incidentSlug,
    incidentName: target?.incidentName,
    severity,
    txHash,
    timestamp: parseNumberish(log.timeStamp),
    allowanceRaw: allowance.toString(),
    allowanceLabel: formatApprovalValue(allowance),
    reason: target
      ? `Approval granted to an indexed ${target.role} address from ${target.incidentName}.`
      : unlimited
      ? "Unlimited approval found. Confirm whether this spender is still trusted."
      : "Non-zero approval event found. Current allowance may have changed since this transaction.",
    revokeUrl: `https://revoke.cash/address/${userAddress}?chainId=${chainId}`,
    explorerUrl: txHash && explorerBase ? `${explorerBase}${txHash}` : undefined,
    tokenExplorerUrl: addressExplorerBase ? `${addressExplorerBase}${tokenAddress}` : undefined,
    spenderExplorerUrl: addressExplorerBase ? `${addressExplorerBase}${spender}` : undefined,
  }
}

function scoreMatches(matches: ExposureMatch[], approvals: ApprovalAlert[]) {
  if (!matches.length && !approvals.length) return 0
  const uniqueIncidents = new Set(matches.map((match) => match.incidentSlug)).size
  const critical = matches.filter((match) => match.severity === "critical").length
  const elevated = matches.filter((match) => match.severity === "elevated").length
  const context = matches.filter((match) => match.severity === "context").length
  const approvalCritical = approvals.filter((approval) => approval.severity === "critical").length
  const approvalElevated = approvals.filter((approval) => approval.severity === "elevated").length
  const approvalContext = approvals.filter((approval) => approval.severity === "context").length
  return Math.min(
    100,
    critical * 42 +
      elevated * 26 +
      context * 10 +
      approvalCritical * 34 +
      approvalElevated * 16 +
      approvalContext * 4 +
      uniqueIncidents * 8
  )
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
  const approvalAlerts: ApprovalAlert[] = []
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

  const approvalChains = [...new Set([...chains, ...APPROVAL_SCAN_CHAINS])]
  await Promise.all(
    approvalChains.map(async (chain) => {
      const chainId = EVM_CHAIN_IDS[chain]
      if (!chainId) return
      const chainTargets = new Map(
        watchlist
          .filter((item) => item.chain === chain)
          .map((item) => [item.normalizedAddress, item] as const)
      )

      try {
        const logs = await fetchApprovalLogs(chainId, normalizedAddress, apiKey)
        for (const log of logs) {
          const alert = matchApproval(log, chainTargets, chain, normalizedAddress)
          if (alert) approvalAlerts.push(alert)
        }
      } catch (error) {
        warnings.push(`${EVM_CHAIN_LABELS[chain] ?? chain} approvals: ${error instanceof Error ? error.message : "scan failed"}`)
      }
    })
  )

  const deduped = Array.from(
    new Map(matches.map((match) => [`${match.chain}:${match.txHash}:${match.watchedAddress}:${match.asset}`, match])).values()
  ).sort((a, b) => b.timestamp - a.timestamp)

  const dedupedApprovals = Array.from(
    new Map(
      approvalAlerts.map((approval) => [
        `${approval.chain}:${approval.txHash}:${approval.tokenAddress}:${approval.spenderAddress}`,
        approval,
      ])
    ).values()
  ).sort((a, b) => {
    const bySeverity = ["critical", "elevated", "context"].indexOf(a.severity) - ["critical", "elevated", "context"].indexOf(b.severity)
    if (bySeverity !== 0) return bySeverity
    return b.timestamp - a.timestamp
  })

  const score = scoreMatches(deduped, dedupedApprovals)
  const status = deduped.length
    ? "exposure_found"
    : dedupedApprovals.some((approval) => approval.severity !== "context")
    ? "approval_risk"
    : warnings.length >= chains.length + approvalChains.length
    ? "scan_limited"
    : "clear"
  const approvalSummary = dedupedApprovals.length
    ? ` ${dedupedApprovals.length} approval event${dedupedApprovals.length === 1 ? "" : "s"} need review.`
    : ""

  return NextResponse.json({
    address,
    checkedAt: new Date().toISOString(),
    status,
    score,
    summary: deduped.length
      ? `${deduped.length} interaction${deduped.length === 1 ? "" : "s"} found against indexed exploit addresses.`
      : `No direct interactions found against the currently indexed EVM exploit watchlist.${approvalSummary}`,
    matches: deduped.slice(0, 30),
    approvalAlerts: dedupedApprovals.slice(0, 25),
    warnings,
    coverage: {
      watchlistCount: coverage.watchlistCount,
      chains: coverage.chains,
      approvalChains: coverage.approvalChains,
      verifiedCount: coverage.verifiedCount,
      seededCount: coverage.seededCount,
      coveredIncidents: coverage.coveredIncidents.map((incident) => incident.name),
      limitedIncidents: coverage.limitedIncidents.map((incident) => incident.name),
    },
  })
}
