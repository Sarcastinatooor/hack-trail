"use client"

import ReactECharts from "echarts-for-react"

interface Link {
  source: string
  target: string
  value: number
  asset?: string
  chain?: string
  phase?: string
  step?: number
  summary?: string
}

interface Node {
  name: string
  kind: string
}

const KIND_COLOR: Record<string, string> = {
  bridge: "#ff2255",
  attacker: "#f43f5e",
  lending: "#f59e0b",
  mixer: "#8b5cf6",
  protocol: "#00d4ff",
  frozen: "#00ff88",
  market_trigger: "#ff2255",
  confidence: "#f59e0b",
  response: "#00d4ff",
  liability: "#f59e0b",
  liability_holders: "#f59e0b",
  depositors: "#00ff88",
  reported_reserves: "#00d4ff",
  rwa: "#8b5cf6",
  exchange: "#00d4ff",
  custody: "#00ff88",
  onchain_liquidity: "#00ff88",
  vault: "#f59e0b",
  lending_vault: "#f59e0b",
  market_adapter: "#8b5cf6",
  lending_market: "#f59e0b",
  vault_token: "#ff2255",
  claimants: "#f59e0b",
  redemption_queue: "#ff2255",
  oracle_signer: "#ff2255",
  verifier: "#00d4ff",
  executor: "#f43f5e",
  kyber: "#8b5cf6",
  fanout: "#ec4899",
  hot_wallet: "#f59e0b",
  retail_lp: "#00ff88",
  settlement_queue: "#f59e0b",
}

export function FlowSankey({ nodes, links }: { nodes: Node[]; links: Link[] }) {
  if (!links.length) {
    return (
      <div className="neon-card-static p-8 text-center">
        <div className="text-neutral-400 text-sm">No fund flow data available for this incident</div>
        <div className="text-neutral-600 text-xs mt-1 mono">
          This incident involves a vulnerability disclosure, not fund movement
        </div>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const option: any = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "#0a0a0f",
      borderColor: "rgba(0, 255, 136, 0.1)",
      textStyle: { color: "#e5e7eb", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
      extraCssText: "border-radius: 8px; box-shadow: 0 0 20px rgba(0,255,136,0.05);",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (p: any) => {
        if (p.dataType === "edge") {
          const d = p.data
          const usd = (d.value / 1_000_000).toFixed(1)
          return `<div style="min-width:260px;font-family:JetBrains Mono,monospace">
            <div style="font-weight:600;margin-bottom:6px;color:#00ff88">${d.source} → ${d.target}</div>
            <div style="display:flex;justify-content:space-between;gap:12px">
              <span style="opacity:.5">VALUE</span><span style="color:#ff2255">$${usd}M</span>
            </div>
            ${d.asset ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="opacity:.5">ASSET</span><span>${d.asset}</span></div>` : ""}
            ${d.chain ? `<div style="display:flex;justify-content:space-between;gap:12px"><span style="opacity:.5">CHAIN</span><span>${d.chain}</span></div>` : ""}
            ${d.summary ? `<div style="margin-top:6px;opacity:.6;font-size:10px;line-height:1.4">${d.summary}</div>` : ""}
          </div>`
        }
        return p.name
      },
    },
    series: [
      {
        type: "sankey",
        emphasis: { focus: "adjacency" },
        nodeAlign: "justify",
        layoutIterations: 64,
        nodeGap: 14,
        nodeWidth: 16,
        draggable: true,
        lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.3 },
        itemStyle: { borderWidth: 0 },
        label: {
          color: "#e5e7eb",
          fontSize: 10,
          fontWeight: 500,
          fontFamily: "JetBrains Mono, monospace",
          width: 160,
          overflow: "truncate",
        },
        data: nodes.map((n) => ({
          name: n.name,
          itemStyle: { color: KIND_COLOR[n.kind] ?? "#52525b" },
        })),
        links: links.map((l) => ({
          ...l,
          lineStyle: { opacity: 0.3 },
        })),
      },
    ],
  }

  return (
    <div className="neon-card-static p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
        <span className="mono text-xs text-neutral-400 uppercase tracking-wider">
          USD-Weighted Fund Flow
        </span>
      </div>
      <ReactECharts option={option} style={{ height: 500 }} opts={{ renderer: "canvas" }} />
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/[0.04]">
        {Object.entries(KIND_COLOR).map(([kind, color]) => (
          <div key={kind} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="mono text-[9px] text-neutral-500 uppercase">{kind}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
