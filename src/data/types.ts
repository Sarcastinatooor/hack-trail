export type IncidentStatus = "full" | "stub" | "ongoing"

export interface IncidentSummary {
  id: string
  slug: string
  name: string
  victim: string
  date: string
  date_label: string
  loss_usd: number
  loss_label?: string
  chains: string[]
  attack_vector: string
  attribution?: string
  short_summary: string
  status: IncidentStatus
  tags: string[]
}

export interface HopSide {
  label: string
  kind: string
  address?: string
}

export interface Hop {
  step: number
  phase: string
  ts: number
  from: HopSide
  to: HopSide
  asset: string
  amount: number | null
  usd: number
  chain: string
  summary: string
}

export interface TimelineEvent {
  ts: number
  tag: string
  title: string
  chain?: string
}

export interface TrackedWallet {
  address: string
  chain: string
  label?: string
  role?: string
}

export interface IncidentDetail {
  id: string
  name: string
  victim: string
  attacker_attribution: string
  root_cause: string
  loss_usd: number
  start_ts: number
  pause_ts?: number
  chains_touched: string[]
  stats: StatItem[]
}

export interface StatItem {
  label: string
  value: string
  sub?: string
  accent?: string
}

export interface IncidentData {
  incident: IncidentDetail
  hops: Hop[]
  timeline: TimelineEvent[]
  tracked_wallets: TrackedWallet[]
}
