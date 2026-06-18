import Link from "next/link"
import { INCIDENTS } from "@/data/incidents"

const PLAYBOOKS = [
  {
    title: "After a Bridge Exploit",
    severity: "Critical",
    steps: ["Pause bridge activity", "Check wrapped-asset pegs", "Avoid fresh lending deposits", "Track official recovery updates"],
  },
  {
    title: "After a Multisig/Admin-Key Incident",
    severity: "High",
    steps: ["Revoke approvals", "Avoid admin-upgraded markets", "Watch timelock bypasses", "Move funds from affected vaults if advised"],
  },
  {
    title: "After a ZKP / Protocol Bug",
    severity: "Systemic",
    steps: ["Check fork status", "Confirm exchange deposit rules", "Avoid stale wallets/pools", "Wait for patched-client confirmation"],
  },
  {
    title: "If Your Wallet Is Flagged",
    severity: "Personal",
    steps: ["Do not panic-sign", "Review the matched transaction", "Revoke stale approvals", "Move funds to a fresh wallet if exposure is material"],
  },
]

export default function ReportsPage() {
  const latestIncidents = [...INCIDENTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-[#f59e0b]/40" />
              <span className="mono text-[10px] tracking-[0.2em] text-[#f59e0b] uppercase">
                Safety Reports
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">User Response Playbooks</h1>
            <p className="mt-3 text-sm text-neutral-500 max-w-2xl leading-relaxed">
              Incident intelligence should end in action. These reports convert exploit patterns
              into practical wallet-safety steps users can follow quickly.
            </p>
          </div>
          <Link href="/intelligence" className="rounded-lg border border-[#00ff88]/25 bg-[#00ff88]/10 px-4 py-2.5 mono text-xs text-[#00ff88] hover:bg-[#00ff88]/15 transition-colors">
            RUN EXPOSURE CHECK
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAYBOOKS.map((playbook) => (
            <div key={playbook.title} className="neon-card-static p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="mono text-[10px] rounded border border-[#f59e0b]/20 bg-[#f59e0b]/5 px-2 py-1 text-[#f59e0b]">
                  {playbook.severity}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white min-h-[44px]">{playbook.title}</h2>
              <div className="mt-4 space-y-2">
                {playbook.steps.map((step, index) => (
                  <div key={step} className="flex gap-2 text-xs text-neutral-500 leading-relaxed">
                    <span className="mono text-[#00ff88]">{index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="neon-card-static p-5">
          <div className="mono text-xs text-neutral-400 uppercase tracking-wider mb-4">
            Incident Reports
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {latestIncidents.map((incident) => (
              <Link key={incident.id} href={`/incident/${incident.slug}`} className="neon-card p-4">
                <div className="mono text-[10px] text-neutral-600 uppercase">{incident.date_label}</div>
                <div className="mt-2 text-sm font-semibold text-white line-clamp-2">{incident.name}</div>
                <p className="mt-2 text-xs text-neutral-500 line-clamp-3">{incident.short_summary}</p>
                <div className="mt-3 mono text-[10px] text-[#00ff88]">OPEN REPORT</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
