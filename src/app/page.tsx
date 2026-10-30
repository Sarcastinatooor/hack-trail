import Link from 'next/link'
import { IncidentExplorer } from '@/components/IncidentExplorer'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'
import { INCIDENTS } from '@/data/incidents'

export default function HomePage() {
  const incidents = [...INCIDENTS].sort((a,b) => b.date.localeCompare(a.date)).map((incident) => {
    const data = INCIDENT_DATA_BY_SLUG[incident.slug]
    const eventCount = data?.timeline.length ?? 0
    const hopCount = data?.hops.length ?? 0
    const walletCount = data?.tracked_wallets.length ?? 0
    return {...incident,eventCount,hopCount,walletCount,evidenceCount:eventCount+hopCount+walletCount}
  })
  const ongoing = incidents.filter((i) => i.status === 'ongoing').length
  const networks = [...new Set(incidents.flatMap((i) => i.chains))]
  const addresses = incidents.reduce((sum,i) => sum+i.walletCount,0)
  return <div className="screen-page">
    <header className="screen-heading"><div><div className="screen-eyebrow">Security observatory</div><h1>Incident screener</h1><p>Follow the exploit. Inspect the evidence. Track the funds.</p></div><Link className="workspace-action" href="/intelligence">Check wallet exposure ↗</Link></header>
    <section className="screen-metrics" aria-label="Coverage summary">{[[incidents.length,'Incidents indexed','Complete and partial investigations'],[ongoing,'Ongoing reports','Status from indexed incident records'],[networks.length,'Networks covered','Cross-chain incident coverage'],[addresses,'Tracked addresses','Published addresses and infrastructure']].map(([value,label,sub]) => <div key={label}><span className="screen-eyebrow">{label}</span><strong>{value}</strong><small>{sub}</small></div>)}</section>
    <div className="screen-destinations">{[['/analytics','Pattern analytics','Vectors, networks and incident distribution'],['/intelligence','Wallet intelligence','Exposure checks and approval safety'],['/reports','Safety reports','Incident findings and response playbooks']].map(([url,label,description]) => <Link href={url} key={url}><div>{label}<span>↗</span></div><p>{description}</p></Link>)}</div>
    <section className="mt-8"><div className="mb-4 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-base font-medium">Incident register</h2><span className="mono text-[10px] text-neutral-500">Newest first · {incidents.length} investigations</span></div><IncidentExplorer incidents={incidents} /></section>
    <footer className="mt-10 border-t border-white/10 py-5 text-xs text-neutral-500">HackTrail / Public onchain incident intelligence</footer>
  </div>
}
