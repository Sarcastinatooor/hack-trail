import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "NEAR Intents team postmortem (Oct 16, 2026), CertiK investigation (Oct 8, 2026), NearBlocks execution trace, and near-intents source history"

const TS = {
  firstObserved: Date.parse("2026-09-29T16:14:19Z") / 1000,
  detected: Date.parse("2026-10-01T08:04:00Z") / 1000,
  paused: Date.parse("2026-10-01T08:33:00Z") / 1000,
  frontendMaintenance: Date.parse("2026-10-01T08:40:00Z") / 1000,
  routesRestricted: Date.parse("2026-10-01T11:20:00Z") / 1000,
  frontendResumed: Date.parse("2026-10-01T14:00:00Z") / 1000,
  fundsReturned: Date.parse("2026-10-02T00:00:00Z") / 1000,
  fixDeployed: Date.parse("2026-10-02T20:31:00Z") / 1000,
  depositsUnpaused: Date.parse("2026-10-02T20:38:00Z") / 1000,
  notificationsRemoved: Date.parse("2026-10-07T00:00:00Z") / 1000,
  payout1: Date.parse("2026-09-30T23:54:30Z") / 1000,
  payout2: Date.parse("2026-10-01T00:24:02Z") / 1000,
  payout3: Date.parse("2026-10-01T00:50:42Z") / 1000,
  payout4: Date.parse("2026-10-01T01:46:20Z") / 1000,
  payout5: Date.parse("2026-10-01T06:08:26Z") / 1000,
}

const ADDRESSES = {
  bscAttacker: "0x09fd1f5d9f185067a92493e43aa259ea4ab3ad37",
  hotTreasury: "0x233c5370CCfb3cD7409d9A3fb98ab94dE94Cb4Cd",
  nearAttacker: "20e6bfe4685d99004fc2095d3a0fc6158cd810ce8f801196141e183ed6e19d65",
  nearReceiver: "dd1fe58ec316ada5b673b88c14fe2fa2b7ede82080440901dfbd64b994241757",
}

function tracked(address: string, chain: string, label: string, role: string, notes: string): TrackedWallet {
  return { address, chain, label, role, notes, confidence: "verified", sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "deposit-accounting",
    ts: TS.firstObserved,
    from: { label: "Resolver deposit flow", kind: "protocol" },
    to: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    asset: "NEAR representation / internal credit",
    amount: null,
    usd: 0,
    chain: "NEAR",
    summary: "A failed resolver receipt could leave earlier internal credit intact while the outer HOT refund returned backing, creating unbacked ledger balances. The failure was not a global rollback of the whole cross-contract operation.",
  },
  {
    step: 2,
    phase: "withdrawal",
    ts: TS.payout1,
    from: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    to: { label: "Attacker-controlled withdrawal routes", kind: "attacker" },
    asset: "USDT",
    amount: 800000,
    usd: 800000,
    chain: "BSC",
    summary: "First of five BSC payouts published by CertiK. The five sourced payout times and amounts total 3,865,000 USDT; this node is one observed transfer, not the whole aggregate.",
  },
  {
    step: 3,
    phase: "withdrawal",
    ts: TS.payout2,
    from: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    to: { label: "Attacker-controlled withdrawal routes", kind: "attacker" },
    asset: "USDT",
    amount: 1200000,
    usd: 1200000,
    chain: "BSC",
    summary: "Second CertiK-published BSC payout.",
  },
  {
    step: 4,
    phase: "withdrawal",
    ts: TS.payout3,
    from: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    to: { label: "Attacker-controlled withdrawal routes", kind: "attacker" },
    asset: "USDT",
    amount: 1500000,
    usd: 1500000,
    chain: "BSC",
    summary: "Third CertiK-published BSC payout.",
  },
  {
    step: 5,
    phase: "withdrawal",
    ts: TS.payout4,
    from: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    to: { label: "Attacker-controlled withdrawal routes", kind: "attacker" },
    asset: "USDT",
    amount: 330000,
    usd: 330000,
    chain: "BSC",
    summary: "Fourth CertiK-published BSC payout.",
  },
  {
    step: 6,
    phase: "withdrawal",
    ts: TS.payout5,
    from: { label: "NEAR Intents internal ledger", kind: "victim_contract", address: "intents.near" },
    to: { label: "Attacker-controlled withdrawal routes", kind: "attacker" },
    asset: "USDT",
    amount: 35000,
    usd: 35000,
    chain: "BSC",
    summary: "Fifth CertiK-published BSC payout. CertiK identified 23 failed resolvers, but fully verified retained-credit/refunded-backing correspondence for six, not all 23.",
  },
  {
    step: 7,
    phase: "recovery",
    ts: TS.fundsReturned,
    from: { label: "Recovery coordination", kind: "protocol" },
    to: { label: "Affected users", kind: "user_funds" },
    asset: "Recovered funds",
    amount: null,
    usd: 3800000,
    chain: "Multi-chain",
    summary: "Oct 2 date-only team report: approximately $3.8M returned and affected users made whole. This rounded report is not used to infer a precise residual loss from the $3.865M gross payout figure.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.firstObserved, tag: "EXPLOIT", title: "First examined execution shows mt_resolve_deposit failure after an oversized log", chain: "NEAR" },
  { ts: TS.detected, tag: "DETECT", title: "NEAR Intents team detects the accounting issue", chain: "NEAR" },
  { ts: TS.paused, tag: "PAUSE", title: "Affected contract routes are paused", chain: "NEAR" },
  { ts: TS.routesRestricted, tag: "RESTRICT", title: "Contract is unpaused with affected routes still restricted", chain: "NEAR" },
  { ts: TS.fundsReturned, tag: "RECOVERY", title: "Oct 2 (date-only): team reports funds returned and affected users made whole", chain: "Multi-chain" },
  { ts: TS.fixDeployed, tag: "FIX", title: "Refund-cap fix deployed according to the team timeline", chain: "NEAR" },
  { ts: TS.depositsUnpaused, tag: "RESUME", title: "Contract deposits unpaused", chain: "NEAR" },
  { ts: TS.notificationsRemoved, tag: "HARDEN", title: "Oct 7 (date-only): deposit notifications fully removed after a further critical report", chain: "NEAR" },
]

export const NEAR_INTENTS_DEPOSIT_NOTIFICATION_DATA: IncidentData = {
  incident: {
    id: "near-intents-deposit-notification-2026-10",
    name: "NEAR Intents Deposit-Notification Exploit",
    victim: "NEAR Intents",
    attacker_attribution: "Unknown; BSC and NEAR receiving addresses published in the postmortem and independent tracing",
    root_cause:
      "The deposit-notification accounting path could credit an internal balance, then encounter a failed resolver receipt while the outer HOT refund returned the backing asset. Because NEAR cross-contract receipts are asynchronous and do not globally roll back earlier successful calls, later withdrawals could be made against an unbacked internal credit. The issue was in the Intents contract accounting path, not the NEAR runtime itself or all Omni infrastructure.",
    loss_usd: 3_865_000,
    start_ts: TS.firstObserved,
    pause_ts: TS.paused,
    chains_touched: ["NEAR", "BSC"],
    stats: [
      { label: "Gross traced payout", value: "$3.865M", sub: "5 BSC payouts by CertiK", accent: "text-rose-300" },
      { label: "Team-reported recovery", value: "~$3.8M", sub: "users reported made whole", accent: "text-emerald-300" },
      { label: "Failed resolvers", value: "23", sub: "6 fully reconciled by CertiK", accent: "text-amber-300" },
      { label: "Status", value: "Contained", sub: "deposit notifications removed", accent: "text-cyan-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.bscAttacker, "bsc", "Published BSC attacker address", "attacker", "Primary BSC address published for the exploit. Live balance/transfer coverage depends on the connected explorer provider."),
    tracked(ADDRESSES.nearAttacker, "near", "Published NEAR attacker address", "attacker", "NEAR address published in the team postmortem."),
    tracked(ADDRESSES.nearReceiver, "near", "Published NEAR receiver address", "attacker", "NEAR receiver published in the team postmortem; role is bounded to the published flow and not expanded beyond the evidence."),
    tracked(ADDRESSES.hotTreasury, "bsc", "HOT treasury", "victim-infrastructure", "Victim-side treasury address. Included for context and monitoring; it is not an attacker address."),
  ],
}
