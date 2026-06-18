"use client"

import { useState } from "react"
import Link from "next/link"

type ExposureStatus = "clear" | "exposure_found" | "approval_risk" | "scan_limited"

interface ExposureMatch {
  incidentSlug: string
  incidentName: string
  incidentDate: string
  chainLabel: string
  watchedAddress: string
  watchedLabel: string
  watchedRole: string
  severity: "critical" | "elevated" | "context"
  txHash: string
  timestamp: number
  direction: "incoming" | "outgoing"
  asset: string
  amount: string
  reason: string
  explorerUrl?: string
}

interface ApprovalAlert {
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
  allowanceLabel: string
  reason: string
  revokeUrl: string
  explorerUrl?: string
  tokenExplorerUrl?: string
  spenderExplorerUrl?: string
}

interface ExposureReport {
  address: string
  checkedAt: string
  status: ExposureStatus
  score: number
  summary: string
  matches: ExposureMatch[]
  approvalAlerts: ApprovalAlert[]
  warnings: string[]
  coverage: {
    watchlistCount: number
    chains: string[]
    approvalChains: string[]
    verifiedCount: number
    seededCount: number
    coveredIncidents: string[]
    limitedIncidents: string[]
  }
}

interface EthereumProvider {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

function shortAddr(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatUtc(ts: number) {
  if (!ts) return "Unknown time"
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 16) + "Z"
}

function statusCopy(status?: ExposureStatus) {
  if (status === "exposure_found") return { label: "Exposure Found", color: "text-[#ff2255]", badge: "badge-critical" }
  if (status === "approval_risk") return { label: "Approval Risk", color: "text-[#f59e0b]", badge: "badge-pending" }
  if (status === "scan_limited") return { label: "Scan Limited", color: "text-[#f59e0b]", badge: "badge-pending" }
  return { label: "No Direct Exposure", color: "text-[#00ff88]", badge: "badge-active" }
}

function SeverityBadge({ severity }: { severity: ExposureMatch["severity"] | ApprovalAlert["severity"] }) {
  const cls = severity === "critical"
    ? "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20"
    : severity === "elevated"
    ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
    : "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20"

  return (
    <span className={`mono text-[9px] px-1.5 py-0.5 rounded border uppercase ${cls}`}>
      {severity}
    </span>
  )
}

export function ExposureChecker() {
  const [address, setAddress] = useState("")
  const [connectedAddress, setConnectedAddress] = useState("")
  const [report, setReport] = useState<ExposureReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function scanAddress(nextAddress: string) {
    const target = nextAddress.trim()
    if (!target) {
      setError("Connect a wallet or paste an EVM address first.")
      return
    }

    setLoading(true)
    setError("")
    setReport(null)

    try {
      const res = await fetch("/api/exposure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: target }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Exposure scan failed")
      setReport(json)
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Exposure scan failed")
    } finally {
      setLoading(false)
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setError("No injected EVM wallet found. Install MetaMask/Rabby or paste an address manually.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[]
      const account = accounts[0]
      if (!account) throw new Error("Wallet connection returned no address")
      setConnectedAddress(account)
      setAddress(account)
      await scanAddress(account)
    } catch (walletError) {
      setError(walletError instanceof Error ? walletError.message : "Wallet connection rejected")
      setLoading(false)
    }
  }

  const copy = statusCopy(report?.status)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-4">
      <div className="neon-card-static p-5 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
            <span className="mono text-xs text-neutral-400 uppercase tracking-wider">
              Wallet Exposure Check
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            Check whether your EVM wallet touched indexed exploit addresses.
          </h1>
          <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
            HackTrail scans your public wallet history against incident addresses in the current
            watchlist. It does not request a signature and does not move funds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="neon-card-static p-3 stat-accent-green">
            <div className="mono text-[10px] text-neutral-500 uppercase">Privacy</div>
            <div className="text-sm text-white mt-1">No signature</div>
          </div>
          <div className="neon-card-static p-3 stat-accent-cyan">
            <div className="mono text-[10px] text-neutral-500 uppercase">Scope</div>
            <div className="text-sm text-white mt-1">EVM chains</div>
          </div>
          <div className="neon-card-static p-3 stat-accent-red">
            <div className="mono text-[10px] text-neutral-500 uppercase">Signal</div>
            <div className="text-sm text-white mt-1">Tx + approvals</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10 px-4 py-3 text-sm font-semibold text-[#00ff88] transition-colors hover:bg-[#00ff88]/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Scanning..." : connectedAddress ? `Connected ${shortAddr(connectedAddress)}` : "Connect EVM Wallet"}
          </button>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <span className="mono text-[10px] text-neutral-600 uppercase">or paste address</span>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="0x..."
              className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 mono text-xs text-neutral-200 outline-none transition-colors placeholder:text-neutral-700 focus:border-[#00ff88]/30"
            />
            <button
              onClick={() => scanAddress(address)}
              disabled={loading}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 mono text-xs text-neutral-300 transition-colors hover:border-[#00ff88]/20 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Run Scan
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-[#ff2255]/20 bg-[#ff2255]/5 p-3 text-xs text-[#ff6688]">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] leading-relaxed text-neutral-500">
          <span className="mono text-[#00d4ff]">Coverage note:</span>{" "}
          this MVP checks direct EVM interactions and ERC-20 approval events on covered chains.
          Approval history is not proof of current allowance; use the revoke link to verify live state.
        </div>
      </div>

      <div className="neon-card-static p-5 min-h-[430px]">
        {!report ? (
          <div className="h-full min-h-[390px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/5 flex items-center justify-center mb-4">
              <span className="text-3xl text-[#00ff88]">◎</span>
            </div>
            <div className="mono text-xs text-neutral-500 uppercase tracking-wider">Awaiting Wallet Scan</div>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 leading-relaxed">
              Connect or paste an EVM address to generate an exposure report.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <span className={`text-[9px] mono px-2 py-0.5 rounded-md ${copy.badge}`}>
                  ● {copy.label}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-white">Exposure Report</h2>
                <div className="mono text-[11px] text-neutral-600 mt-1">{shortAddr(report.address)} · {new Date(report.checkedAt).toUTCString()}</div>
              </div>
              <div className="text-right">
                <div className="mono text-[10px] text-neutral-500 uppercase">Risk Score</div>
                <div className={`data-value text-4xl ${copy.color}`}>{report.score}</div>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm text-neutral-300 leading-relaxed">{report.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="mono text-[10px] rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-neutral-500">
                  {report.coverage.watchlistCount} addresses watched
                </span>
                <span className="mono text-[10px] rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-neutral-500">
                  {report.approvalAlerts.length} approvals flagged
                </span>
                {report.coverage.chains.map((chain) => (
                  <span key={chain} className="mono text-[10px] rounded border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-2 py-1 text-[#00d4ff]">
                    {chain}
                  </span>
                ))}
              </div>
            </div>

            {report.matches.length > 0 ? (
              <div className="space-y-2">
                <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  Direct Incident Interactions
                </div>
                {report.matches.map((match) => (
                  <div key={`${match.chainLabel}-${match.txHash}-${match.watchedAddress}-${match.asset}`} className="neon-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={match.severity} />
                          <span className="mono text-[10px] text-neutral-600">{match.chainLabel}</span>
                          <span className="mono text-[10px] text-neutral-700">{formatUtc(match.timestamp)}</span>
                        </div>
                        <div className="text-sm font-semibold text-white truncate">{match.incidentName}</div>
                        <div className="mt-1 text-xs text-neutral-500 leading-relaxed">{match.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={match.direction === "outgoing" ? "text-[#ff2255]" : "text-[#00ff88]"}>
                          {match.direction === "outgoing" ? "OUT" : "IN"}
                        </div>
                        <div className="mono text-[10px] text-neutral-600">{match.amount} {match.asset}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/[0.04] pt-2">
                      <div className="mono text-[10px] text-neutral-600">
                        {match.watchedLabel} · {shortAddr(match.watchedAddress)}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href={`/incident/${match.incidentSlug}`} className="mono text-[10px] text-[#00ff88] hover:text-white transition-colors">
                          INCIDENT
                        </Link>
                        {match.explorerUrl && (
                          <a href={match.explorerUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-[#00d4ff] hover:text-white transition-colors">
                            TX
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#00ff88]/15 bg-[#00ff88]/5 p-4">
                <div className="mono text-[10px] text-[#00ff88] uppercase tracking-wider">No direct hits</div>
                <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                  No direct transfer or transaction was found between this wallet and the currently
                  indexed exploit watchlist. Keep approvals, delegated permissions, and connected
                  dapps under review.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">
                Approval Review
              </div>
              {report.approvalAlerts.length > 0 ? (
                report.approvalAlerts.map((approval) => (
                  <div key={`${approval.chainLabel}-${approval.txHash}-${approval.tokenAddress}-${approval.spenderAddress}`} className="neon-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <SeverityBadge severity={approval.severity} />
                          <span className="mono text-[10px] text-neutral-600">{approval.chainLabel}</span>
                          <span className="mono text-[10px] text-neutral-700">{formatUtc(approval.timestamp)}</span>
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {approval.allowanceLabel} approval to {approval.spenderLabel}
                        </div>
                        <div className="mt-1 text-xs text-neutral-500 leading-relaxed">{approval.reason}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={approval.severity === "critical" ? "text-[#ff2255]" : approval.severity === "elevated" ? "text-[#f59e0b]" : "text-[#00d4ff]"}>
                          {approval.allowanceLabel === "Unlimited" ? "UNLIMITED" : "ALLOW"}
                        </div>
                        <div className="mono text-[10px] text-neutral-600">{shortAddr(approval.spenderAddress)}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/[0.04] pt-2">
                      <div className="mono text-[10px] text-neutral-600">
                        Token {shortAddr(approval.tokenAddress)}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {approval.incidentSlug && (
                          <Link href={`/incident/${approval.incidentSlug}`} className="mono text-[10px] text-[#00ff88] hover:text-white transition-colors">
                            INCIDENT
                          </Link>
                        )}
                        <a href={approval.revokeUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-[#ff2255] hover:text-white transition-colors">
                          REVOKE
                        </a>
                        {approval.explorerUrl && (
                          <a href={approval.explorerUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-[#00d4ff] hover:text-white transition-colors">
                            TX
                          </a>
                        )}
                        {approval.spenderExplorerUrl && (
                          <a href={approval.spenderExplorerUrl} target="_blank" rel="noopener noreferrer" className="mono text-[10px] text-neutral-500 hover:text-white transition-colors">
                            SPENDER
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-[#00ff88]/15 bg-[#00ff88]/5 p-4">
                  <div className="mono text-[10px] text-[#00ff88] uppercase tracking-wider">No approval events flagged</div>
                  <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
                    No non-zero ERC-20 approval events were found on the currently covered chains.
                    You can still open Revoke.cash from any report to verify live allowances.
                  </p>
                </div>
              )}
            </div>

            {report.warnings.length > 0 && (
              <div className="rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-3">
                <div className="mono text-[10px] text-[#f59e0b] uppercase mb-1">Scan Warnings</div>
                <div className="space-y-1">
                  {report.warnings.map((warning) => (
                    <div key={warning} className="text-[11px] text-neutral-500">{warning}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
