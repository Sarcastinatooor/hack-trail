import Link from "next/link"
import { INCIDENTS } from "@/data/incidents"

function fmtUsd(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toFixed(0)}`
}

const SIGNALS = [
  {
    title: "Bridge / Messaging Failure",
    query: ["bridge", "DVN", "LayerZero"],
    action: "Monitor privileged validator sets, bridge mint events, and sudden synthetic-asset supply jumps.",
  },
  {
    title: "Social Engineering / Multisig",
    query: ["social-engineering", "multisig"],
    action: "Flag blind-signing, durable nonces, admin actions without timelocks, and unusual signer clustering.",
  },
  {
    title: "ZKP / Protocol Soundness",
    query: ["ZKP", "soundness", "vulnerability"],
    action: "Track emergency forks, private disclosure windows, proof-system audits, and exchange halt notices.",
  },
  {
    title: "Lending Contagion",
    query: ["lending-contagion"],
    action: "Watch collateral depegs, frozen markets, fast TVL drawdowns, and abnormal borrow loops.",
  },
]

export default function AnalyticsPage() {
  const totalLoss = INCIDENTS.reduce((sum, incident) => sum + incident.loss_usd, 0)
  const chains = [...new Set(INCIDENTS.flatMap((incident) => incident.chains))]
  const latest = [...INCIDENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-[#00d4ff]/40" />
              <span className="mono text-[10px] tracking-[0.2em] text-[#00d4ff] uppercase">
                Threat Analytics
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">Exploit Pattern Radar</h1>
            <p className="mt-3 text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Turn historical incident data into defensive signals: what failed, what users should watch,
              and which chains or protocols appear in multi-hop exploit paths.
            </p>
          </div>
          <Link href="/intelligence" className="rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10 px-4 py-2.5 mono text-xs text-[#00ff88] hover:bg-[#00ff88]/15 transition-colors">
            CHECK WALLET EXPOSURE
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="neon-card-static p-4 stat-accent-red">
            <div className="mono text-[10px] text-neutral-500 uppercase">Confirmed Losses</div>
            <div className="data-value text-2xl text-[#ff2255] mt-1">{fmtUsd(totalLoss)}</div>
          </div>
          <div className="neon-card-static p-4 stat-accent-cyan">
            <div className="mono text-[10px] text-neutral-500 uppercase">Chains Touched</div>
            <div className="data-value text-2xl text-white mt-1">{chains.length}</div>
          </div>
          <div className="neon-card-static p-4 stat-accent-green">
            <div className="mono text-[10px] text-neutral-500 uppercase">Mapped Incidents</div>
            <div className="data-value text-2xl text-white mt-1">{INCIDENTS.length}</div>
          </div>
          <div className="neon-card-static p-4 stat-accent-amber">
            <div className="mono text-[10px] text-neutral-500 uppercase">Latest Signal</div>
            <div className="text-sm font-semibold text-white mt-2 line-clamp-2">{latest.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SIGNALS.map((signal) => {
            const count = INCIDENTS.filter((incident) =>
              signal.query.some((tag) => incident.tags.includes(tag))
            ).length

            return (
              <div key={signal.title} className="neon-card-static p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mono text-[10px] text-neutral-500 uppercase tracking-wider">Pattern</div>
                    <h2 className="mt-1 text-lg font-semibold text-white">{signal.title}</h2>
                  </div>
                  <div className="data-value text-2xl text-[#00d4ff]">{count}</div>
                </div>
                <p className="mt-3 text-sm text-neutral-500 leading-relaxed">{signal.action}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {signal.query.map((tag) => (
                    <span key={tag} className="mono text-[10px] rounded bg-white/[0.03] px-2 py-1 text-neutral-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
