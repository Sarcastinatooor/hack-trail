import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "CirrusNFT and 0xQuit public X statements, updated 2026-09-25; Magic Eden contract involvement remains preliminary"

const TS = {
  report: 1790317860,
  whitehatConfirmation: 1790318820,
}

const ADDRESSES = {
  recoveryWallet: "0x71cF3f5724bD2B72Ef6464992aCd26216DE7fe33",
}

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"],
): TrackedWallet {
  return { address, chain: "ethereum", label, role, notes, confidence, sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "approval-drain",
    ts: TS.report,
    from: { label: "Hundreds of NFT wallets", kind: "user_funds" },
    to: { label: "0x71cF...fe33 recovery wallet", kind: "recovery", address: ADDRESSES.recoveryWallet },
    asset: "3,832 NFTs",
    amount: 3832,
    usd: 0,
    chain: "Ethereum",
    summary:
      "CirrusNFT observed a wallet moving 3,832 NFTs from hundreds of wallets. The value is not yet reliably reconciled, and the collector is now described by 0xQuit as a whitehat recovery wallet.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.report, tag: "ALERT", title: "CirrusNFT reports 3,832 NFTs drained from hundreds of wallets", chain: "Ethereum" },
  { ts: TS.report + 1680, tag: "ROOT-CAUSE", title: "Follow-up points to a possible Magic Eden contract approval path", chain: "Ethereum" },
  { ts: TS.whitehatConfirmation, tag: "RECOVERY", title: "0xQuit identifies the collector as a whitehat wallet and says assets will be returned", chain: "Ethereum" },
  { ts: TS.whitehatConfirmation + 900, tag: "STATUS", title: "Reports indicate the drain may still be ongoing; revoke NFT permissions immediately", chain: "Ethereum" },
]

export const MAGIC_EDEN_NFT_DRAIN_DATA: IncidentData = {
  incident: {
    id: "magic-eden-nft-drain-2026-09",
    name: "Magic Eden NFT Approval Drain",
    victim: "NFT holders across hundreds of wallets",
    attacker_attribution: "Collector 0x71cF...fe33 identified by 0xQuit as whitehat recovery infrastructure",
    root_cause:
      "Preliminary reports show a collector moving 3,832 NFTs from hundreds of wallets through a suspected Magic Eden contract approval path. The exact contract, signing primitive, affected collections, and whether every transfer was unauthorized remain under investigation. Users with NFT valuables should revoke unneeded NFT approvals and move at-risk assets from affected wallets using a clean wallet.",
    loss_usd: 0,
    start_ts: TS.report,
    pause_ts: TS.whitehatConfirmation,
    chains_touched: ["Ethereum"],
    stats: [
      { label: "NFTs moved", value: "3,832", sub: "reported across hundreds of wallets", accent: "text-rose-300" },
      { label: "Dollar loss", value: "Unconfirmed", sub: "collection values not reconciled", accent: "text-amber-300" },
      { label: "Suspected path", value: "Magic Eden", sub: "preliminary contract attribution", accent: "text-sky-300" },
      { label: "Recovery state", value: "Whitehat", sub: "return promised by 0xQuit", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.recoveryWallet, "Whitehat recovery wallet", "recovery", "0xQuit says assets in this wallet are safe and will be returned once they are no longer at risk. Do not label this wallet malicious without contrary evidence.", "verified"),
  ],
}
