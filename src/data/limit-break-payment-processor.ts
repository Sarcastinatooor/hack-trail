import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Blockaid public alert and follow-up address disclosure, updated 2026-09-25; Limit Break root-cause confirmation pending"

const TS = {
  alert: 1790319060,
}

const ADDRESSES = {
  whitehatOrCollector: "0x71cF3f5724bD2B72Ef6464992aCd26216DE7fe33",
  exploiterTwo: "0x415F981b474b2E060D314BEc14461d9aeEf70B1a",
  exploiterThree: "0xB48D6Af77c5E3B99876eA71B38E9c814bA5B1C8E",
  exampleTx: "0x16921806c11110ebfa54c48ccf97cda2e0abd7e82fe97c117c736e54ffc6c926",
}

function tracked(address: string, label: string, role: string, notes: string, confidence: TrackedWallet["confidence"]): TrackedWallet {
  return { address, chain: "ethereum", label, role, notes, confidence, sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "approval-abuse",
    ts: TS.alert,
    from: { label: "Approved NFT holders", kind: "user_funds" },
    to: { label: "Limit Break Payment Processor V2", kind: "victim_contract" },
    asset: "Approved ERC-721 / ERC-1155 NFTs",
    amount: null,
    usd: 1_700_000,
    chain: "Ethereum",
    summary:
      "Blockaid reported that an attacker impersonated holders and used the Limit Break Payment Processor V2 path to purchase approved NFTs at a zero price. Approximately $1.7M was drained across about three transactions at the time of the alert.",
  },
  {
    step: 2,
    phase: "collector-monitoring",
    ts: TS.alert + 600,
    from: { label: "Limit Break processor path", kind: "victim_contract" },
    to: { label: "Published exploiter / recovery addresses", kind: "attacker" },
    asset: "Drained NFTs and downstream transfers",
    amount: null,
    usd: 1_700_000,
    chain: "Ethereum",
    summary:
      "Blockaid disclosed three addresses for monitoring. The role of 0x71cF...fe33 is nuanced: 0xQuit previously described it as whitehat recovery infrastructure in the related NFT drain, while Blockaid listed it among addresses to monitor here.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.alert, tag: "ALERT", title: "Blockaid reports an ongoing Limit Break Payment Processor V2 exploit", chain: "Ethereum" },
  { ts: TS.alert, tag: "DRAIN", title: "About $1.7M of user-approved NFTs reportedly drained across roughly three transactions", chain: "Ethereum" },
  { ts: TS.alert + 60, tag: "ADDRESS", title: "Blockaid publishes three addresses and an example exploit transaction for monitoring", chain: "Ethereum" },
  { ts: TS.alert + 900, tag: "RESPONSE", title: "Users are advised to revoke NFT approvals and treat Payment Processor V2 as compromised until contained", chain: "Ethereum" },
]

export const LIMIT_BREAK_PAYMENT_PROCESSOR_DATA: IncidentData = {
  incident: {
    id: "limit-break-payment-processor-2026-09",
    name: "Limit Break Payment Processor V2 NFT Drain",
    victim: "Limit Break NFT holders",
    attacker_attribution: "Addresses published by Blockaid; 0x71cF...fe33 has conflicting whitehat/recovery context",
    root_cause:
      "Blockaid reports an ongoing approval-based NFT exploit on Ethereum. The attacker allegedly used Limit Break Payment Processor V2 to impersonate NFT holders and buy approved NFTs at a zero price. The exact vulnerable call path, affected collections, and final loss remain under investigation. Users should revoke unneeded NFT approvals and avoid interacting with the processor until Limit Break confirms containment.",
    loss_usd: 1_700_000,
    start_ts: TS.alert,
    chains_touched: ["Ethereum"],
    stats: [
      { label: "Estimated drained", value: "~$1.7M", sub: "Blockaid alert estimate", accent: "text-rose-300" },
      { label: "Observed txs", value: "~3", sub: "at time of alert", accent: "text-amber-300" },
      { label: "Attack path", value: "Zero-price buys", sub: "against approved NFTs", accent: "text-sky-300" },
      { label: "Status", value: "Ongoing", sub: "containment not confirmed", accent: "text-[#ff2255]" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.whitehatOrCollector, "Published monitor address / related whitehat context", "recovery-or-exploiter", "Blockaid listed this address for monitoring. In the related NFT drain, 0xQuit described the same address as whitehat recovery infrastructure. Do not treat it as definitively malicious without further attribution.", "curated"),
    tracked(ADDRESSES.exploiterTwo, "Blockaid published address 2", "attacker", "Published by Blockaid as an exploiter address for this incident.", "curated"),
    tracked(ADDRESSES.exploiterThree, "Blockaid published address 3", "attacker", "Published by Blockaid as an exploiter address for this incident.", "curated"),
  ],
}
