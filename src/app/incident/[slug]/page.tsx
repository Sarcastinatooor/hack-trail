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

function KiiChainIncidentMatrix() {
  const bridgeMints = [
    { time: "20:48:05", amount: "0.350M", tx: "0x6caefd4949158a4e46331ce1dc3403d7fba64bec838caa66dbbb3934e611849b" },
    { time: "21:02:09", amount: "0.977M", tx: "0xe37ee850cde05e119c7cfa455289ce4bac9d5c3a2003e6a9beb566434e7b70a2" },
    { time: "21:11:56", amount: "0.982M", tx: "0x7a67997a5df5344e96dcb53e5bce72782844bc12c6ee9f07667e17c7f37ec24d" },
    { time: "21:21:59", amount: "0.992M", tx: "0x9660494f47834caf006f0e419c0ffa42bf028dcb534f4a9f20e232d6fb68935f" },
    { time: "21:37:19", amount: "2.027M", tx: "0x00fec90476fb66e204d250410ff38a3186fad5d4861daaa576cefe9f7c5166d3" },
    { time: "21:47:59", amount: "2.154M", tx: "0x73410626e061f24dd66485e6dbdc1068d7cb6a5240797d56870de1511989c29a" },
    { time: "21:58:22", amount: "2.232M", tx: "0xfed50f909fefea898dfbf1bc839f6abe7d039de8fab427837bea263e9c9bd7e6" },
    { time: "22:08:23", amount: "7.743M", tx: "0x33956fc8582ec345006ca3ed2d2fd8e755061b5fadffc51afc2cf17606c19f07" },
    { time: "22:17:52", amount: "5.140M", tx: "0x5b3f60d5a49487dbc2e4380917a7ab689ebb2766ac13a8784aed4af368cf2ab1" },
    { time: "22:27:31", amount: "45.000M", tx: "0x9bac8fb35865f2cd0fe80fd7789d07b765bd99e4fefd51a88944492dcc89a58e" },
  ]

  const watchList = [
    { label: "Primary attacker", address: "0x0e7a96227fcf09f53d644ba6462d8c73993ef246" },
    { label: "Secondary attacker", address: "0x631dc2c664ed6dc291b08b35382b807a61b1cd35" },
    { label: "Helper with 42.18M KII", address: "0x8f37701914d60cee95ccaa39af959561045cf9e8" },
    { label: "Helper with 38.55M KII", address: "0x77308955c6cbc4cdef2e53defc7d78a007f29739" },
    { label: "KuCoin deposit on BSC", address: "0x4dc97f8b986a1f826c7196e3d413a8fe38a2fcf4" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="neon-card-static p-4 stat-accent-red">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">1. Exploit primitive</div>
          <div className="mt-1 text-sm font-semibold text-white">Vesting balance underflow</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            A precomputed contract address was made into a vesting account. Delegating one wei beyond its
            spendable balance underflowed the staking precompile&apos;s EVM write-back.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-amber">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">2. Drain scope</div>
          <div className="mt-1 text-sm font-semibold text-white">148.33M KII / 18 rounds</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            KiiChain says two additional undisclosed Cosmos-EVM defects converted the mirrored underflow into
            withdrawals of real victim balances. This was not an infinite token mint.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-green">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">3. Recoverable</div>
          <div className="mt-1 text-sm font-semibold text-white">80.73M KII frozen</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Direct halted-state balance checks across the five official blocklist addresses reconcile to
            80,728,575.056116 KII, or 54.4% of the drain.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-cyan">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">4. Monetized path</div>
          <div className="mt-1 text-sm font-semibold text-white">~1.61M BUSD realized</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Of 67.60M KII bridged to BSC, 64.60M was sold through PancakeSwap. The remaining 3M reached a KuCoin
            deposit address; freeze confirmation was pending in the report.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] gap-4">
        <div className="neon-card-static p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Verified bridge trail</div>
              <h3 className="text-sm font-semibold text-white mt-1">Ten BSC mints reconcile to 67.597997M KII</h3>
            </div>
            <div className="mono text-[10px] text-[#8b5cf6] whitespace-nowrap">Aug 22 UTC</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bridgeMints.map((row, index) => (
              <a
                key={row.tx}
                href={`https://bscscan.com/tx/${row.tx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[28px_64px_72px_minmax(0,1fr)] items-center gap-2 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-colors hover:border-[#8b5cf6]/25"
              >
                <div className="mono text-[9px] text-neutral-600">#{String(index + 1).padStart(2, "0")}</div>
                <div className="mono text-[10px] text-neutral-500">{row.time}</div>
                <div className="data-value text-[11px] text-[#8b5cf6]">{row.amount}</div>
                <div className="truncate mono text-[9px] text-[#00d4ff]">{row.tx.slice(0, 10)}...</div>
              </a>
            ))}
          </div>
          <div className="mt-3 rounded border border-[#00d4ff]/15 bg-[#00d4ff]/[0.03] px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
            Reference exploit hash:
            <span className="ml-1 mono text-[#00d4ff]">0xf45c...e840</span>. The official report labels it block
            9,355,102; KiiChain&apos;s EVM RPC returns the same hash at block 9,355,107. The hash and execution path
            match, so HackTrail preserves the five-block indexing discrepancy instead of silently choosing one.
          </div>
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Exposure watchlist</div>
          <h3 className="text-sm font-semibold text-white mt-1 mb-3">Addresses HackTrail now checks</h3>
          <div className="space-y-2">
            {watchList.map((item) => (
              <div key={item.address} className="rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <div className="mono text-[10px] text-[#00d4ff]">{item.label}</div>
                <div className="mt-1 break-all mono text-[10px] text-neutral-500">{item.address}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <a
              href="https://x.com/KiiChainio/status/2091721027583709214"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
            >
              Official postmortem
            </a>
            <a
              href="https://bscscan.com/tx/0x052f022d803294c2fd5dddc3b09a5812f76d6f15193e30659a930c3b455ee748"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
            >
              3M KII KuCoin tx
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlturaIncidentMatrix() {
  const reserveBuckets = [
    { name: "Inessa RWA", value: "$21.9M", detail: "largest reserve bucket; asset-level verification caveat" },
    { name: "OKX", value: "$9.6M", detail: "venue balance, not instant redemption-contract liquidity" },
    { name: "Cobo", value: "$1.27M", detail: "custody bucket dependent on operational movement" },
    { name: "HyperEVM", value: "$524k", detail: "immediate on-chain bucket at dashboard snapshot" },
    { name: "Ethereum", value: "$341k", detail: "on-chain bucket outside HyperEVM" },
    { name: "Tauri Vault", value: "$102k", detail: "small DeFi reserve bucket" },
    { name: "Hyperliquid", value: "$334", detail: "remaining venue bucket at dashboard snapshot" },
  ]

  const userChecks = [
    "Altura / AVLT share exposure",
    "Pending slow-redemption request status",
    "Alpha USDT Prime vault exposure",
    "Morpho AVLT-backed market exposure",
    "Mainstreet / MSY exposure",
    "USDT0 liquidity routes on HyperEVM",
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="neon-card-static p-4 stat-accent-red">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">1. Upstream trigger</div>
          <div className="mt-1 text-sm font-semibold text-white">Mainstreet / MSY depeg fear</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Mainstreet TVL fell from about $82.0M to about $74.2M. Even without direct Altura exposure,
            users started testing whether nearby stable-vault liquidity could survive a run.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-amber">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">2. Liability run</div>
          <div className="mt-1 text-sm font-semibold text-white">$10.05M+ exit pressure</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Altura reportedly processed more than $8.5M USDT in instant redemptions, with another ~1.55M
            AVLT still pending in the slow-redemption queue.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-cyan">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">3. Liquidity bottleneck</div>
          <div className="mt-1 text-sm font-semibold text-white">Morpho / AVLT at 0 idle</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            The Alpha USDT Prime path was reported around $5.9M supplied, 100% utilized, and dependent on
            repayment, new lenders, reallocation, or external capital.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-green">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">4. Exit queue</div>
          <div className="mt-1 text-sm font-semibold text-white">223 open withdrawal requests</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Dium&apos;s queue scan cited 2.91M AVLT queued, 1.31M claimed, 150k cancelled, and about 1.55M AVLT
            still outstanding.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] gap-4">
        <div className="neon-card-static p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Reserve composition</div>
              <h3 className="text-sm font-semibold text-white mt-1">Proof of reserves vs proof of liquidity</h3>
            </div>
            <a
              href="https://accountable.altura.trade/"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
            >
              Accountable source
            </a>
          </div>
          <div className="space-y-2">
            {reserveBuckets.map((bucket) => (
              <div key={bucket.name} className="grid grid-cols-1 gap-1 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2 sm:grid-cols-[110px_86px_minmax(0,1fr)] sm:gap-3">
                <div className="mono text-[10px] text-neutral-300">{bucket.name}</div>
                <div className="data-value text-xs text-white">{bucket.value}</div>
                <div className="text-[11px] leading-relaxed text-neutral-500">{bucket.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">User exposure checks</div>
          <h3 className="text-sm font-semibold text-white mt-1 mb-3">What HackTrail should flag</h3>
          <div className="space-y-2">
            {userChecks.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <a
            href="https://x.com/Not_A_De_Gen/status/2068799530276167876"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
          >
            Full incident analysis
          </a>
        </div>
      </div>
    </div>
  )
}

function RisexIncidentMatrix() {
  const evidenceRows = [
    {
      label: "Official disclosure",
      value: "@risextrade",
      href: "https://x.com/risextrade/status/2084350396609520105",
      note: "RISEx says the RWA strategy withdrawal was patched and depositors were made whole",
    },
    {
      label: "Exploit tx",
      value: "0xc525...e987",
      href: "https://explorer.risechain.com/tx/0xc52560bec154a3d5533a321bd9805305a5076194573ddb2fbb059059ace3e987",
      note: "673,011.565895 USDC.e moved at 2026-08-03 07:21:58 UTC",
    },
    {
      label: "Source",
      value: "0x2C03...1818",
      href: "https://explorer.risechain.com/address/0x2C03C7d7e2974C6599b6B108879109281ef3F818",
      note: "apparent RWA strategy source contract in the transfer log",
    },
    {
      label: "Recipient",
      value: "0x04a7...10a5",
      href: "https://explorer.risechain.com/address/0x04a7934245c9B804082e391Ee077c130d31B10a5",
      note: "transaction target and recipient contract that split the funds into exit legs",
    },
  ]

  const watchList = [
    { label: "Transaction caller", address: "0xAAb85f96FeB6DaAc1E171e7e4B0118B16f1BB66d" },
    { label: "RWA strategy source", address: "0x2C03C7d7e2974C6599b6B108879109281ef3F818" },
    { label: "Recipient contract", address: "0x04a7934245c9B804082e391Ee077c130d31B10a5" },
    { label: "RiseVault exit leg A", address: "0xdEc93a1d6dE0267d5cDF3b1342A49b105AE37EF8" },
    { label: "RiseVault exit leg B", address: "0x776e385A599B71AF893f58B4b8f8a67A5d9d63e5" },
    { label: "Bridged USDC.e", address: "0xe436820ba0C69702c1d3E601d421c0eF38262739" },
  ]

  const userChecks = [
    "XLP depositor exposure and whether reimbursement is reflected in vault accounting",
    "Direct interaction with the transaction caller, recipient contract, or exit-leg contracts",
    "USDC.e approvals or transfers touching the RWA strategy source contract",
    "Scam links claiming a recovery form, claim page, or wallet verification step",
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="neon-card-static p-4 stat-accent-red">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">1. Failure mode</div>
          <div className="mt-1 text-sm font-semibold text-white">RWA strategy misconfig</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            RISEx says the issue was a misconfiguration present since July 13, not a novel attack or dependency
            failure.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-amber">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">2. Withdrawal</div>
          <div className="mt-1 text-sm font-semibold text-white">673,011.56 USDC.e</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            The cited RISE transaction moved the funds from the apparent strategy source to a recipient contract,
            then split them through two RiseVault exit legs.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-cyan">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">3. Patch window</div>
          <div className="mt-1 text-sm font-semibold text-white">47 minutes</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            RISEx says detection happened within minutes and the issue was patched by 08:09 UTC, after the 07:21
            UTC withdrawal.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-green">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">4. Depositor status</div>
          <div className="mt-1 text-sm font-semibold text-white">Made whole</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            RISEx says the full amount was covered by a portion of July fees and XLP depositor funds were not
            affected by the event.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-4">
        <div className="neon-card-static p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Verified evidence</div>
              <h3 className="text-sm font-semibold text-white mt-1">Official statement plus RISE explorer tx</h3>
            </div>
            <div className="mono text-[10px] text-[#00ff88]">covered</div>
          </div>
          <div className="space-y-2">
            {evidenceRows.map((row) => (
              <a
                key={row.label}
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-1 gap-1 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-colors hover:border-[#00d4ff]/20 sm:grid-cols-[118px_118px_minmax(0,1fr)] sm:gap-3"
              >
                <div className="mono text-[10px] text-neutral-500">{row.label}</div>
                <div className="mono text-[10px] text-[#00d4ff]">{row.value}</div>
                <div className="text-[11px] leading-relaxed text-neutral-500">{row.note}</div>
              </a>
            ))}
          </div>

          <div className="mt-4 rounded border border-[#ff2255]/15 bg-[#ff2255]/[0.03] px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
            User safety note: RISEx explicitly warned there is no recovery form or claim process. Any link asking
            users to connect a wallet for this incident should be treated as hostile unless it comes from official
            RISEx channels.
          </div>
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Exposure watchlist</div>
          <h3 className="text-sm font-semibold text-white mt-1 mb-3">Addresses HackTrail now checks</h3>
          <div className="space-y-2">
            {watchList.map((item) => (
              <div key={item.address} className="rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <div className="mono text-[10px] text-[#00d4ff]">{item.label}</div>
                <div className="mt-1 break-all mono text-[10px] text-neutral-500">{item.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="neon-card-static p-5">
        <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">User intelligence checks</div>
        <h3 className="text-sm font-semibold text-white mt-1 mb-3">What this incident should help users verify</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {userChecks.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs text-neutral-400">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00ff88]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AfxIncidentMatrix() {
  const evidenceRows = [
    {
      label: "Exploit tx",
      value: "0x50d0...547b",
      href: "https://arbiscan.io/tx/0x50d0b3ec6c3f5fce0f10abf81540bbb508f421494aa2b3480c4a264b0436547b",
      note: "batchedFinalizeWithdrawals moved 24.15M USDC",
    },
    {
      label: "AFX bridge",
      value: "0xCb3B...2e67",
      href: "https://arbiscan.io/address/0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67",
      note: "victim custody bridge contract",
    },
    {
      label: "Recipient",
      value: "0x2f29...FEefc",
      href: "https://arbiscan.io/address/0x2f2974fAbc54dbA33442261211c06BD20E0FEefc",
      note: "received the finalized withdrawal",
    },
    {
      label: "L1 reference",
      value: "0x41cd...0b29",
      href: "https://etherscan.io/tx/0x41cdf8853427622994440157729ea35fa87b0ce53affbc6980d0235cac300b29",
      note: "Arbitrum batch submitter reference, not attacker custody",
    },
  ]

  const watchList = [
    { label: "AFX bridge contract", address: "0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67" },
    { label: "Withdrawal recipient", address: "0x2f2974fAbc54dbA33442261211c06BD20E0FEefc" },
    { label: "Finalizer caller", address: "0x5553EA7Bda594aDE7AFe91D279779a42b2B84208" },
    { label: "Native Arbitrum USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="neon-card-static p-4 stat-accent-red">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">1. Affected rail</div>
          <div className="mt-1 text-sm font-semibold text-white">AFX-operated bridge</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            The incident targeted AFX&apos;s own bridge/custody rail on Arbitrum. Offchain Labs publicly clarified
            the native Arbitrum bridge was not exploited.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-amber">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">2. Trust path</div>
          <div className="mt-1 text-sm font-semibold text-white">Authorized finalization</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            The withdrawal appears to have passed the bridge authorization path. Public tracker analysis says
            five signatures from a seven-validator set were involved.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-cyan">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">3. Direct loss</div>
          <div className="mt-1 text-sm font-semibold text-white">$24.15M native USDC</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            A single FinalizedWithdrawal event moved native Arbitrum USDC from the AFX bridge contract to
            0x2f29...FEefc at 2026-07-22 21:30 UTC.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-green">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">4. Exit route</div>
          <div className="mt-1 text-sm font-semibold text-white">Reported 12,467.5 ETH</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Reports citing PeckShield say the funds were bridged to Ethereum, swapped into ETH, and traced to a
            wallet abbreviated 0x6276...ebAC.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-4">
        <div className="neon-card-static p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Transaction evidence</div>
              <h3 className="text-sm font-semibold text-white mt-1">What the chain confirms today</h3>
            </div>
            <div className="mono text-[10px] text-[#ff2255]">$24.15M USDC</div>
          </div>
          <div className="space-y-2">
            {evidenceRows.map((row) => (
              <a
                key={row.label}
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-1 gap-1 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-colors hover:border-[#00d4ff]/20 sm:grid-cols-[105px_118px_minmax(0,1fr)] sm:gap-3"
              >
                <div className="mono text-[10px] text-neutral-500">{row.label}</div>
                <div className="mono text-[10px] text-[#00d4ff]">{row.value}</div>
                <div className="text-[11px] leading-relaxed text-neutral-500">{row.note}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Exposure watchlist</div>
          <h3 className="text-sm font-semibold text-white mt-1 mb-3">Addresses HackTrail now checks</h3>
          <div className="space-y-2">
            {watchList.map((item) => (
              <div key={item.address} className="rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <div className="mono text-[10px] text-[#00d4ff]">{item.label}</div>
                <div className="mt-1 break-all mono text-[10px] text-neutral-500">{item.address}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <a
              href="https://x.com/blockaid_/status/2080080240265621680"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
            >
              Blockaid alert
            </a>
            <a
              href="https://defillama.com/protocol/afx-bridge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
            >
              DefiLlama bridge TVL
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function OstiumIncidentMatrix() {
  const transferRows = [
    { n: "01", value: "$6.291M", note: "largest payout inside the five-loop transaction" },
    { n: "02", value: "$4.763M", note: "second-largest payout inside the same transaction" },
    { n: "03", value: "$4.494M", note: "largest follow-on drain transaction" },
    { n: "04", value: "$3.595M", note: "next scaled transaction paid the same executor" },
    { n: "05", value: "$2.696M", note: "penultimate scaled drain transaction" },
    { n: "06", value: "$1.078M", note: "final transaction before the verified drain ended" },
  ]

  const watchList = [
    { label: "OLP vault", address: "0x20D419a8e12C45f88fDA7c5760bb6923Cee27F98" },
    { label: "Executor", address: "0x321df194646029e7a6193ea05573d4b9c398bfd9" },
    { label: "Second wallet, same operator", address: "0xD1794196f0fc99c7f27970e661597d77d9a85869" },
    { label: "PrivatePriceUpKeep", address: "0xb71ec9ebd8145dacacf6724363143cb5667a3d36" },
    { label: "Verifier", address: "0xcCF233920e8cc9415ecF503b992881d69b6c47Ad" },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="neon-card-static p-4 stat-accent-red">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">1. Trust break</div>
          <div className="mt-1 text-sm font-semibold text-white">Authorized signer path</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Onchain execution and Blockaid&apos;s report point to signer compromise or abuse. Ostium has not yet
            published the postmortem needed to confirm the exact failure.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-amber">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">2. Atomic loop</div>
          <div className="mt-1 text-sm font-semibold text-white">100x fabricated marks</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            The attacker packed a signed false price and a 100x trade into one call, opened at one fabricated
            mark, closed at another, and let the vault pay capped max profit.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-cyan">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">3. Payout math</div>
          <div className="mt-1 text-sm font-semibold text-white">$11.86M largest tx</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            A small probe returned roughly 8.99x collateral. The largest known Arbitrum transaction packed
            five exploit loops into one tx.
          </p>
        </div>
        <div className="neon-card-static p-4 stat-accent-green">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">4. LP risk</div>
          <div className="mt-1 text-sm font-semibold text-white">Settlement accounting</div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Withdrawals usually take two to three days and settle at the OLP price then in effect. A request
            does not lock the pre-drain price; the next settlement is the accounting watchpoint.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-4">
        <div className="neon-card-static p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Verified OLP payouts</div>
              <h3 className="text-sm font-semibold text-white mt-1">Six largest transfers account for $22.9169M</h3>
            </div>
            <div className="mono text-[10px] text-[#ff2255]">$23.7535M total</div>
          </div>
          <div className="mb-3 rounded border border-[#00d4ff]/15 bg-[#00d4ff]/[0.03] px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
            Largest known transaction:
            <a
              href="https://arbiscan.io/tx/0x359f8c05b86a4409d60cfba02084334313fd94b19f74a294fb7fc4ea7d4870e0"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 mono text-[#00d4ff] hover:text-[#00ff88]"
            >
              0x359f...7e0
            </a>
            {" "}for about $11.86M across five loops.
          </div>
          <div className="space-y-2">
            {transferRows.map((row) => (
              <div key={row.n} className="grid grid-cols-[42px_88px_minmax(0,1fr)] gap-3 rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <div className="mono text-[10px] text-neutral-500">#{row.n}</div>
                <div className="data-value text-xs text-[#ff2255]">{row.value}</div>
                <div className="text-[11px] leading-relaxed text-neutral-500">{row.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-[10px] uppercase tracking-wider text-neutral-500">Exposure watchlist</div>
          <h3 className="text-sm font-semibold text-white mt-1 mb-3">Addresses HackTrail now checks</h3>
          <div className="space-y-2">
            {watchList.map((item) => (
              <div key={item.address} className="rounded border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                <div className="mono text-[10px] text-[#00d4ff]">{item.label}</div>
                <div className="mt-1 break-all mono text-[10px] text-neutral-500">{item.address}</div>
              </div>
            ))}
          </div>
          <a
            href="https://app.hypernative.xyz/risk-insights/explore/J5CYISWNXL4B"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
          >
            Hypernative detection
          </a>
          <a
            href="https://docs.ostium.com/vault/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 mt-4 inline-flex mono text-[10px] text-[#00d4ff] hover:text-[#00ff88]"
          >
            Ostium vault mechanics
          </a>
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
    mainstreet_tvl: { title: "Mainstreet TVL", color: "#8b5cf6", unit: "$" },
    altura_tvl: { title: "Altura TVL", color: "#00d4ff", unit: "$" },
    altura_reserves: { title: "Altura Reserves", color: "#00ff88", unit: "$" },
    altura_supply: { title: "Altura Supply", color: "#ff2255", unit: "$" },
    instant_redemptions: { title: "Instant Redemptions", color: "#f59e0b", unit: "$" },
    total_withdrawal_pressure: { title: "Total Exit Pressure", color: "#ff2255", unit: "$" },
    morpho_idle_liquidity: { title: "Morpho Idle Liquidity", color: "#ff2255", unit: "$" },
    withdrawal_queue_total: { title: "Total Queued Withdrawals", color: "#f59e0b", unit: "$" },
    withdrawal_queue_outstanding: { title: "Queue Outstanding", color: "#8b5cf6", unit: "$" },
    ostium_tvl: { title: "Ostium Protocol TVL", color: "#00d4ff", unit: "$" },
    olp_vault_usdc: { title: "OLP Vault USDC", color: "#ff2255", unit: "$" },
    visible_arkham_outflows: { title: "Verified OLP Payouts", color: "#f59e0b", unit: "$" },
    largest_exploit_tx: { title: "Largest Exploit Tx", color: "#8b5cf6", unit: "$" },
    defillama_tvl_static: { title: "DefiLlama TVL Snapshot", color: "#00ff88", unit: "$" },
    afx_bridge_tvl: { title: "AFX Bridge TVL", color: "#00d4ff", unit: "$" },
    afx_bridge_tvl_static: { title: "AFX Bridge Custody Estimate", color: "#ff2255", unit: "$" },
    converted_eth_value: { title: "Reported ETH Conversion Value", color: "#8b5cf6", unit: "$" },
    arb_price: { title: "ARB Price", color: "#00ff88", unit: "$" },
    risex_unauthorized_withdrawal: { title: "Unauthorized Withdrawal", color: "#ff2255", unit: "$" },
    risex_covered_amount: { title: "Covered Amount", color: "#00ff88", unit: "$" },
    risex_recovery_gap: { title: "Temporary Recovery Gap", color: "#f59e0b", unit: "$" },
    kii_total_drained: { title: "Total KII Drained", color: "#ff2255", unit: "KII " },
    kii_frozen_recoverable: { title: "KII Frozen / Recoverable", color: "#00ff88", unit: "KII " },
    kii_bridged_bsc: { title: "KII Bridged to BSC", color: "#8b5cf6", unit: "KII " },
    realized_busd: { title: "Realized BUSD Proceeds", color: "#f59e0b", unit: "$" },
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
            <div className="space-y-4">
              {slug === "altura-hyperevm" && <AlturaIncidentMatrix />}
              {slug === "kiichain-cosmos-evm" && <KiiChainIncidentMatrix />}
              {slug === "risex-xlp" && <RisexIncidentMatrix />}
              {slug === "afx-bridge" && <AfxIncidentMatrix />}
              {slug === "ostium-olp" && <OstiumIncidentMatrix />}
              <div className="neon-card-static p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                  <span className="mono text-xs text-neutral-400 uppercase tracking-wider">
                    Chronological Event Trail
                  </span>
                </div>
                <Timeline timeline={timeline} hops={hops} />
              </div>
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
