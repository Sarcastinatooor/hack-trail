import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Blockaid incident report, published Sep 25, 2026; Bitget confirmation and full postmortem pending"

const TS = {
  staging: Date.parse("2026-09-24T18:31:00Z") / 1000,
  firstDrain: Date.parse("2026-09-24T18:58:00Z") / 1000,
  largestWave: Date.parse("2026-09-24T19:16:00Z") / 1000,
  finalObserved: Date.parse("2026-09-24T21:23:00Z") / 1000,
  crossChain: Date.parse("2026-09-25T02:13:00Z") / 1000,
  containment: Date.parse("2026-09-25T14:05:00Z") / 1000,
}

const ADDRESSES = {
  recipient: "0x770b10b273fC44Fe9197D6bF20F145c2e98463Ee",
  xrp: "rwNhefsz1UQEusxhCvHip3RANinWi4CTck",
  zec: "t1WgMdtND8NF7NDUuYmq8MpMj1NTCXkMDVG",
  tron: "TBWNguTTgezw9dVorX441C6nDrZpRxYwKD",
}

function tracked(address: string, label: string, role: string, notes: string): TrackedWallet {
  return { address, chain: "ethereum", label, role, notes, confidence: "verified", sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "staging",
    ts: TS.staging,
    from: { label: "Bitget compromised hot wallet", kind: "victim_contract" },
    to: { label: "Published attacker receiving address", kind: "attacker" },
    asset: "ETH",
    amount: 0.84,
    usd: 0,
    chain: "Ethereum",
    summary: "Blockaid reports that the receiving address was funded from a Bitget hot wallet 27 minutes before the first large drain.",
  },
  {
    step: 2,
    phase: "wallet-drain",
    ts: TS.firstDrain,
    from: { label: "Bitget hot and warm wallets", kind: "victim_contract" },
    to: { label: "Attacker-controlled recipients", kind: "attacker" },
    asset: "ETH, USDT, USDC, AVAX, BNB, XAUt, XRP, TRX",
    amount: null,
    usd: 350_000_000,
    chain: "8 chains",
    summary: "Unauthorized transfers continued from 18:58 to 21:23 UTC. The largest wave was about $185M in one minute across Ethereum, XRPL, and TRON.",
  },
  {
    step: 3,
    phase: "consolidation",
    ts: TS.crossChain,
    from: { label: "Drained wallets", kind: "attacker" },
    to: { label: "Dormant vaults and cross-chain routes", kind: "bridge" },
    asset: "ETH, AVAX, XRP and bridged proceeds",
    amount: null,
    usd: 155_000_000,
    chain: "EVM / XRPL / BTC routes",
    summary: "Blockaid traced DEX conversions and bridges into Ethereum-compatible dormant vaults; XRP proceeds later began moving toward BTC and ETH.",
  },
  {
    step: 4,
    phase: "containment",
    ts: TS.containment,
    from: { label: "Bitget response and security teams", kind: "victim_contract" },
    to: { label: "Exchanges, issuers, bridges and investigators", kind: "protocol" },
    asset: "Affected assets and address intelligence",
    amount: null,
    usd: 387_500_000,
    chain: "Multi-chain",
    summary: "Bitget says the vulnerability was remediated, the incident is contained, and some affected assets were frozen through industry coordination. A 5% recovery bounty program was announced for eligible voluntary freezes and recoveries.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.staging, tag: "STAGE", title: "Attacker receiving address funded with 0.84 ETH from a Bitget hot wallet", chain: "Ethereum" },
  { ts: TS.firstDrain, tag: "DRAIN", title: "First large transfer: approximately $34.75M USDT leaves a Bitget hot wallet", chain: "Ethereum" },
  { ts: TS.largestWave, tag: "PEAK", title: "Roughly $185M moves in about one minute across Ethereum, XRPL, and TRON", chain: "Multi-chain" },
  { ts: TS.finalObserved, tag: "CONTAIN", title: "Observed drain window closes after approximately two hours and 25 minutes", chain: "Multi-chain" },
  { ts: TS.crossChain, tag: "TRACE", title: "XRP proceeds begin moving through cross-chain swaps and bridges toward BTC and ETH", chain: "XRPL" },
  { ts: TS.containment, tag: "UPDATE", title: "Bitget revises affected-asset accounting to approximately $387.5M, adding Zcash and TRON", chain: "Multi-chain" },
  { ts: TS.containment, tag: "CONTAIN", title: "Bitget says the vulnerability was remediated and no further unauthorized transfers are possible", chain: "Multi-chain" },
  { ts: TS.containment, tag: "RECOVERY", title: "Some affected funds reportedly frozen; 5% recovery bounty program announced", chain: "Multi-chain" },
]

export const BITGET_WALLET_INFRASTRUCTURE_DATA: IncidentData = {
  incident: {
    id: "bitget-wallet-infrastructure-2026-09",
    name: "Bitget Hot Wallet Infrastructure Drain",
    victim: "Bitget hot and warm wallets",
    attacker_attribution: "Unknown; four primary attacker-controlled receiving addresses published by Bitget",
    root_cause:
      "Bitget says an attacker compromised a backend system that supplied transaction data to the signing process, spoofing withdrawal details and causing valid signatures for unauthorized transfers. Bitget has ruled out private-key compromise; the initial access path remains undisclosed pending its full postmortem.",
    loss_usd: 387_500_000,
    start_ts: TS.firstDrain,
    chains_touched: ["Ethereum", "Arbitrum", "Base", "Optimism", "BSC", "Avalanche", "XRP Ledger", "TRON"],
    stats: [
      { label: "Affected assets", value: "~$387.5M", sub: "revised Bitget accounting", accent: "text-rose-300" },
      { label: "Address families", value: "4", sub: "EVM, XRP, ZEC, TRON", accent: "text-cyan-300" },
      { label: "Drain window", value: "2h 25m", sub: "18:58 to 21:23 UTC", accent: "text-amber-300" },
      { label: "Status", value: "Contained", sub: "recovery tracing active", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.recipient, "Published Bitget EVM drain recipient", "attacker", "Bitget lists this as the primary EVM attacker-controlled receiving address. Funds were later split and routed across chains; monitor for new movements."),
    { address: ADDRESSES.xrp, chain: "xrp-ledger", label: "Published Bitget XRP recipient", role: "attacker", notes: "Primary XRP Ledger receiving address published by Bitget for live tracing.", confidence: "verified", sourceLabel: SOURCE },
    { address: ADDRESSES.zec, chain: "zcash", label: "Published Bitget ZEC recipient", role: "attacker", notes: "Primary Zcash receiving address added in Bitget's revised accounting.", confidence: "verified", sourceLabel: SOURCE },
    { address: ADDRESSES.tron, chain: "tron", label: "Published Bitget TRON recipient", role: "attacker", notes: "Primary TRON receiving address added in Bitget's revised accounting.", confidence: "verified", sourceLabel: SOURCE },
  ],
}
