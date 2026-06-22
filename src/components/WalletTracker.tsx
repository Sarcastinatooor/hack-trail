"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}

interface WalletData {
  address: string
  chain: string
  label?: string
  role?: string
  balance_eth: number | null
  native_symbol?: string
  total_usd: number
}

interface Transfer {
  tx_hash: string
  from_address: string
  to_address: string
  amount: string
  token_symbol: string
  timestamp: number
  flow: string
}

function TransferRow({ t }: { t: Transfer }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 mono text-[11px] border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
      <span className={t.flow === "out" ? "text-[#ff2255]" : "text-[#00ff88]"}>
        {t.flow === "out" ? "↗" : "↘"}
      </span>
      <span className="text-neutral-400">{shortAddr(t.from_address)}</span>
      <span className="text-neutral-700">→</span>
      <span className="text-neutral-400">{shortAddr(t.to_address)}</span>
      <span className="ml-auto text-neutral-300">
        {parseFloat(t.amount).toFixed(4)} <span className="text-neutral-500">{t.token_symbol}</span>
      </span>
    </div>
  )
}

function WalletRow({ w, slug }: { w: WalletData; slug: string }) {
  const [expanded, setExpanded] = useState(false)
  const { data: transfers, isLoading } = useQuery<{ data: Transfer[] }>({
    queryKey: ["transfers", w.address, w.chain],
    queryFn: () =>
      fetch(`/api/wallet/${w.address}/transfers?chain=${w.chain}&limit=20`).then((r) => r.json()),
    enabled: expanded,
  })

  void slug

  return (
    <div className="neon-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="mono text-xs text-neutral-300">{shortAddr(w.address)}</span>
            {w.label && (
              <span className="text-[10px] text-neutral-500">{w.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-neutral-500 uppercase">
              {w.chain}
            </span>
            {w.role && (
              <span
                className={`mono text-[9px] px-1.5 py-0.5 rounded border ${
                  w.role === "attacker"
                    ? "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20"
                    : "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20"
                }`}
              >
                {w.role.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {w.balance_eth === null ? (
            <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">
              indexed
            </div>
          ) : (
            <div className="data-value text-sm text-neutral-200">
              {w.balance_eth.toFixed(4)}{" "}
              <span className="text-neutral-500 text-xs">{w.native_symbol ?? "ETH"}</span>
            </div>
          )}
        </div>
        <span
          className={`text-neutral-600 transition-transform text-xs ${expanded ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>
      {expanded && (
        <div className="border-t border-white/[0.04] bg-white/[0.01]">
          {isLoading ? (
            <div className="p-4 mono text-[11px] text-neutral-600 text-center">Loading transfers…</div>
          ) : transfers?.data?.length ? (
            transfers.data.map((t, i) => <TransferRow key={i} t={t} />)
          ) : (
            <div className="p-4 mono text-[11px] text-neutral-600 text-center">No transfers found</div>
          )}
        </div>
      )}
    </div>
  )
}

export function WalletTracker({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery<{ data: WalletData[]; note?: string }>({
    queryKey: ["wallets", slug],
    queryFn: () => fetch(`/api/wallets/${slug}`).then((r) => r.json()),
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 neon-card-static animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="neon-card-static p-4 border-l-2 border-l-[#ff2255]">
        <span className="text-sm text-[#ff2255]">Failed to load wallet data</span>
      </div>
    )
  }

  if (!data?.data?.length) {
    return (
      <div className="neon-card-static p-8 text-center">
        <div className="text-neutral-400 text-sm">No tracked wallets</div>
        <div className="text-neutral-600 text-xs mt-1 mono">
          {data?.note || "This incident has no on-chain wallet addresses to track."}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.data.map((w, i) => (
        <WalletRow key={i} w={w} slug={slug} />
      ))}
    </div>
  )
}
