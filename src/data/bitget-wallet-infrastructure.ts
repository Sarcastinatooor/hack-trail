import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Blockaid incident report, published Sep 25, 2026; Bitget confirmation and full postmortem pending"

const TS = {
  staging: Date.parse("2026-09-24T18:31:00Z") / 1000,
  firstDrain: Date.parse("2026-09-24T18:58:00Z") / 1000,
  largestWave: Date.parse("2026-09-24T19:16:00Z") / 1000,
  finalObserved: Date.parse("2026-09-24T21:23:00Z") / 1000,
  crossChain: Date.parse("2026-09-25T02:13:00Z") / 1000,
}

const ADDRESSES = {
  recipient: "0x770b10b273fC44Fe9197D6bF20F145c2e98463Ee",
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
]

const timeline: TimelineEvent[] = [
  { ts: TS.staging, tag: "STAGE", title: "Attacker receiving address funded with 0.84 ETH from a Bitget hot wallet", chain: "Ethereum" },
  { ts: TS.firstDrain, tag: "DRAIN", title: "First large transfer: approximately $34.75M USDT leaves a Bitget hot wallet", chain: "Ethereum" },
  { ts: TS.largestWave, tag: "PEAK", title: "Roughly $185M moves in about one minute across Ethereum, XRPL, and TRON", chain: "Multi-chain" },
  { ts: TS.finalObserved, tag: "CONTAIN", title: "Observed drain window closes after approximately two hours and 25 minutes", chain: "Multi-chain" },
  { ts: TS.crossChain, tag: "TRACE", title: "XRP proceeds begin moving through cross-chain swaps and bridges toward BTC and ETH", chain: "XRPL" },
]

export const BITGET_WALLET_INFRASTRUCTURE_DATA: IncidentData = {
  incident: {
    id: "bitget-wallet-infrastructure-2026-09",
    name: "Bitget Hot Wallet Infrastructure Drain",
    victim: "Bitget hot and warm wallets",
    attacker_attribution: "Unknown; Blockaid-linked recipient address under active monitoring",
    root_cause:
      "Bitget says an attacker compromised a backend system that supplied transaction data to the signing process, spoofing withdrawal details and causing valid signatures for unauthorized transfers. Bitget has ruled out private-key compromise; the initial access path remains undisclosed pending its full postmortem.",
    loss_usd: 350_000_000,
    start_ts: TS.firstDrain,
    chains_touched: ["Ethereum", "Arbitrum", "Base", "Optimism", "BSC", "Avalanche", "XRP Ledger", "TRON"],
    stats: [
      { label: "Estimated drained", value: "~$350M", sub: "Blockaid estimate", accent: "text-rose-300" },
      { label: "Affected chains", value: "8", sub: "EVM + XRPL + TRON", accent: "text-cyan-300" },
      { label: "Drain window", value: "2h 25m", sub: "18:58 to 21:23 UTC", accent: "text-amber-300" },
      { label: "Status", value: "Tracking", sub: "postmortem pending", accent: "text-[#ff2255]" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.recipient, "Published Bitget drain recipient", "attacker", "Blockaid identifies this Ethereum address as the receiving address funded before the drain. Funds were later split and routed across chains; monitor for new movements.")
  ],
}
