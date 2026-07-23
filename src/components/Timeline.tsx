"use client"

import { useMemo } from "react"
import type { Hop, TimelineEvent } from "@/data/types"

function fmtUTC(ts: number) {
  const d = new Date(ts * 1000)
  return d.toISOString().replace("T", " ").slice(0, 16) + "Z"
}

const TAG_DOT: Record<string, string> = {
  EXPLOIT: "bg-[#ff2255]",
  VULNERABILITY: "bg-[#ff2255]",
  PAUSE: "bg-[#00d4ff]",
  REVERT: "bg-neutral-500",
  AAVE: "bg-[#f59e0b]",
  FREEZE: "bg-[#00ff88]",
  CONTAGION: "bg-[#8b5cf6]",
  DISPERSE: "bg-[#ec4899]",
  LAUNDER: "bg-[#a855f7]",
  BAILOUT: "bg-[#00d4ff]",
  RECOVERY: "bg-[#00ff88]",
  DISCOVERY: "bg-[#00d4ff]",
  RESPONSE: "bg-[#3b82f6]",
  DISCLOSURE: "bg-[#f59e0b]",
  "SOFT-FORK": "bg-[#00d4ff]",
  "HARD-FORK": "bg-[#00ff88]",
  "MARKET-IMPACT": "bg-[#ff2255]",
  TRIGGER: "bg-[#ff2255]",
  RUN: "bg-[#f59e0b]",
  BOTTLENECK: "bg-[#00d4ff]",
  QUEUE: "bg-[#8b5cf6]",
  "WIND-DOWN": "bg-[#00ff88]",
  RECON: "bg-[#f59e0b]",
  STAGING: "bg-[#ec4899]",
  ATTRIBUTION: "bg-[#8b5cf6]",
  LEGAL: "bg-[#f43f5e]",
  FUNDING: "bg-[#f59e0b]",
  ORACLE: "bg-[#ff2255]",
  AUTHORIZATION: "bg-[#f59e0b]",
  FINALIZATION: "bg-[#00d4ff]",
  WITHDRAWAL: "bg-[#ff2255]",
  BRIDGE: "bg-[#8b5cf6]",
  TVL: "bg-[#00ff88]",
  ALERT: "bg-[#00d4ff]",
  CLARIFICATION: "bg-[#3b82f6]",
  PROBE: "bg-[#00d4ff]",
  DRAIN: "bg-[#ff2255]",
  SWAP: "bg-[#8b5cf6]",
  FANOUT: "bg-[#ec4899]",
  SETTLEMENT: "bg-[#f59e0b]",
  "SETTLEMENT-RISK": "bg-[#f59e0b]",
  "BRIDGE-OUT": "bg-[#8b5cf6]",
}

const TAG_COLOR: Record<string, string> = {
  EXPLOIT: "text-[#ff2255]",
  VULNERABILITY: "text-[#ff2255]",
  PAUSE: "text-[#00d4ff]",
  REVERT: "text-neutral-400",
  AAVE: "text-[#f59e0b]",
  FREEZE: "text-[#00ff88]",
  CONTAGION: "text-[#8b5cf6]",
  DISPERSE: "text-[#ec4899]",
  LAUNDER: "text-[#a855f7]",
  BAILOUT: "text-[#00d4ff]",
  RECOVERY: "text-[#00ff88]",
  DISCOVERY: "text-[#00d4ff]",
  RESPONSE: "text-[#3b82f6]",
  DISCLOSURE: "text-[#f59e0b]",
  "SOFT-FORK": "text-[#00d4ff]",
  "HARD-FORK": "text-[#00ff88]",
  "MARKET-IMPACT": "text-[#ff2255]",
  TRIGGER: "text-[#ff2255]",
  RUN: "text-[#f59e0b]",
  BOTTLENECK: "text-[#00d4ff]",
  QUEUE: "text-[#8b5cf6]",
  "WIND-DOWN": "text-[#00ff88]",
  RECON: "text-[#f59e0b]",
  STAGING: "text-[#ec4899]",
  ATTRIBUTION: "text-[#8b5cf6]",
  LEGAL: "text-[#f43f5e]",
  FUNDING: "text-[#f59e0b]",
  ORACLE: "text-[#ff2255]",
  AUTHORIZATION: "text-[#f59e0b]",
  FINALIZATION: "text-[#00d4ff]",
  WITHDRAWAL: "text-[#ff2255]",
  BRIDGE: "text-[#8b5cf6]",
  TVL: "text-[#00ff88]",
  ALERT: "text-[#00d4ff]",
  CLARIFICATION: "text-[#3b82f6]",
  PROBE: "text-[#00d4ff]",
  DRAIN: "text-[#ff2255]",
  SWAP: "text-[#8b5cf6]",
  FANOUT: "text-[#ec4899]",
  SETTLEMENT: "text-[#f59e0b]",
  "SETTLEMENT-RISK": "text-[#f59e0b]",
  "BRIDGE-OUT": "text-[#8b5cf6]",
}

const PHASE_BADGE: Record<string, string> = {
  exploit: "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  vulnerability: "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "cross-chain-hop": "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  "aave-loop": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  "kelp-pause": "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  "l2-freeze": "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
  dispersal: "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20",
  laundering: "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
  discovery: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  response: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
  "soft-fork": "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  "hard-fork": "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
  disclosure: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  "market-impact": "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "social-engineering": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  staging: "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20",
  "multisig-compromise": "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "protocol-pause": "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  conversion: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  "cross-chain-bridge": "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  obfuscation: "bg-[#a855f7]/10 text-[#a855f7] border-[#a855f7]/20",
  "upstream-depeg": "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "exposure-denial": "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  "liability-run": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  "reserve-bucket": "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
  "morpho-bottleneck": "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  "collateral-loop": "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  "queue-growth": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  "queue-claims": "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20",
  "queue-outstanding": "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "oracle-compromise": "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  probe: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  drain: "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  swap: "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  fanout: "bg-[#ec4899]/10 text-[#ec4899] border-[#ec4899]/20",
  funding: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  authorization: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  finalization: "bg-[#00d4ff]/10 text-[#00d4ff] border-[#00d4ff]/20",
  withdrawal: "bg-[#ff2255]/10 text-[#ff2255] border-[#ff2255]/20",
  "bridge-out": "bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20",
  "settlement-risk": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
}

export function Timeline({
  timeline,
  hops,
}: {
  timeline: TimelineEvent[]
  hops: Hop[]
}) {
  const events = useMemo(() => {
    const merged = [
      ...timeline.map((t) => ({ kind: "event" as const, ts: t.ts, tag: t.tag, title: t.title })),
      ...hops.map((h) => ({
        kind: "hop" as const,
        ts: h.ts,
        tag: h.phase.toUpperCase(),
        title: h.summary,
        hop: h,
      })),
    ].sort((a, b) => a.ts - b.ts)
    const seen = new Set<string>()
    return merged.filter((e) => {
      const key = `${Math.floor(e.ts / 60)}-${e.title.slice(0, 40)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [timeline, hops])

  return (
    <div className="relative pl-6">
      {/* Vertical neon line */}
      <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-[#00ff88]/30 via-[#00d4ff]/15 to-transparent" />

      <div className="space-y-5">
        {events.map((e, i) => {
          const dotColor = TAG_DOT[e.tag] ?? "bg-neutral-600"
          const tagColor = TAG_COLOR[e.tag] ?? "text-neutral-400"

          return (
            <div key={i} className="relative group">
              {/* Dot */}
              <div className={`absolute -left-6 top-[7px] w-[9px] h-[9px] rounded-full ${dotColor} ring-2 ring-[#050507] group-hover:ring-white/10 transition-all`}>
                <div className={`absolute inset-0 rounded-full ${dotColor} opacity-40 blur-[4px]`} />
              </div>

              <div className="flex items-start gap-4">
                {/* Timestamp */}
                <div className="min-w-[135px] mono text-[10px] text-neutral-600 pt-0.5 tabular-nums">
                  {fmtUTC(e.ts)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`mono text-[10px] font-semibold uppercase tracking-wider ${tagColor}`}>
                      {e.tag.replace("-", " ")}
                    </span>
                    {e.kind === "hop" && "hop" in e && (
                      <span className={`mono text-[9px] px-1.5 py-0.5 rounded border ${PHASE_BADGE[e.hop.phase] ?? "bg-white/5 text-neutral-400 border-white/10"}`}>
                        STEP {e.hop.step}
                      </span>
                    )}
                  </div>
                  <div className="text-[13px] text-neutral-300 leading-relaxed">{e.title}</div>
                  {e.kind === "hop" && "hop" in e && e.hop.usd > 0 && (
                    <div className="mt-1 flex items-center gap-2 mono text-[10px] text-neutral-600">
                      <span>{e.hop.asset}</span>
                      <span className="text-neutral-700">·</span>
                      <span className="text-[#ff2255]">${(e.hop.usd / 1_000_000).toFixed(1)}M</span>
                      <span className="text-neutral-700">·</span>
                      <span>{e.hop.chain}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
