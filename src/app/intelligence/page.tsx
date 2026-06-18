import { ExposureChecker } from "@/components/safety/ExposureChecker"
import { getExposureCoverage } from "@/data/exposure"

const NEXT_MODULES = [
  {
    title: "Approval Risk Scanner",
    body: "Detect stale token approvals to routers, bridges, vaults, and contracts linked to prior incident patterns.",
  },
  {
    title: "Wallet Hygiene Timeline",
    body: "Show risky dapp touchpoints, high-risk signatures, bridge usage, and contract interactions over time.",
  },
  {
    title: "Incident Watch Alerts",
    body: "Let users subscribe to wallet-specific alerts when new exploit addresses are added to HackTrail.",
  },
]

export default function IntelligencePage() {
  const coverage = getExposureCoverage()

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-[#00ff88]/40" />
          <span className="mono text-[10px] tracking-[0.2em] text-[#00ff88] uppercase">
            Wallet Intelligence
          </span>
        </div>

        <ExposureChecker />

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="neon-card-static p-5">
            <div className="mono text-xs text-neutral-400 uppercase tracking-wider mb-4">
              Current Coverage
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="data-value text-2xl text-white">{coverage.watchlistCount}</div>
                <div className="mono text-[10px] text-neutral-600 uppercase">Addresses</div>
              </div>
              <div>
                <div className="data-value text-2xl text-white">{coverage.chainCount}</div>
                <div className="mono text-[10px] text-neutral-600 uppercase">EVM Chains</div>
              </div>
              <div>
                <div className="data-value text-2xl text-white">{coverage.coveredIncidents.length}</div>
                <div className="mono text-[10px] text-neutral-600 uppercase">Incidents</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {coverage.chains.map((chain) => (
                <span key={chain} className="mono text-[10px] rounded border border-[#00d4ff]/20 bg-[#00d4ff]/5 px-2 py-1 text-[#00d4ff]">
                  {chain}
                </span>
              ))}
            </div>
            {coverage.limitedIncidents.length > 0 && (
              <p className="mt-4 text-xs text-neutral-500 leading-relaxed">
                Limited coverage: {coverage.limitedIncidents.map((incident) => incident.name).join(", ")} have no public EVM exploit addresses indexed yet.
              </p>
            )}
          </div>

          <div className="neon-card-static p-5">
            <div className="mono text-xs text-neutral-400 uppercase tracking-wider mb-4">
              Next Intelligence Modules
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {NEXT_MODULES.map((module) => (
                <div key={module.title} className="neon-card p-4">
                  <div className="text-sm font-semibold text-white">{module.title}</div>
                  <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{module.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
