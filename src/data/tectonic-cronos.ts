import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Cronos Network and Tectonic public statements, The Block reporting, and on-chain researcher Weilin Li / Lookonchain estimates; updated 2026-08-31"

const TS = {
  firstSignal: 1788070320,
  chainHalt: 1788091200,
  bridgeExit: 1788093000,
}

const ADDRESSES = {
  tonic: "0xDD73dEa10ABC2Bff99c60882EC5b2B81Bb1Dc5B2",
}

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "curated",
): TrackedWallet {
  return { address, chain: "cronos", label, role, notes, confidence, sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "price-manipulation",
    ts: TS.firstSignal,
    from: { label: "Thin TONIC liquidity", kind: "market_trigger" },
    to: { label: "Tectonic TONIC price path", kind: "oracle_signer" },
    asset: "TONIC price / approximately 100x move",
    amount: null,
    usd: 0,
    chain: "Cronos",
    summary:
      "On-chain researcher Weilin Li reported that the attacker moved the thinly traded TONIC price roughly 100x in about 20 minutes before borrowing against the inflated collateral.",
  },
  {
    step: 2,
    phase: "over-borrow",
    ts: TS.firstSignal + 1200,
    from: { label: "Tectonic lending pools", kind: "lending" },
    to: { label: "Unidentified attacker position", kind: "attacker" },
    asset: "Borrowed assets against inflated TONIC",
    amount: null,
    usd: 75_000_000,
    chain: "Cronos",
    summary:
      "The reported affected amount is approximately $66M to $75M. Tectonic has not yet confirmed the final loss or published the exploit transaction set.",
  },
  {
    step: 3,
    phase: "emergency-containment",
    ts: TS.chainHalt,
    from: { label: "Cronos validators", kind: "response" },
    to: { label: "Cronos network", kind: "containment" },
    asset: "Chain halt",
    amount: null,
    usd: 60_000_000,
    chain: "Cronos",
    summary:
      "Cronos halted block production after identifying the Tectonic exploit. Reporting indicated roughly $60M remained stranded on Cronos at the halt, pending investigation and restart decisions.",
  },
  {
    step: 4,
    phase: "bridge-exit",
    ts: TS.bridgeExit,
    from: { label: "Attacker-controlled Cronos balances", kind: "attacker", },
    to: { label: "Ethereum", kind: "bridge" },
    asset: "USDC and other assets converted to ETH",
    amount: 2_592,
    usd: 6_290_000,
    chain: "Cronos / Ethereum",
    summary:
      "Lookonchain reporting put the observed bridge-out at about $6.29M, later swapped into approximately 2,592 ETH. The majority of the estimated affected value had not left Cronos when the network halted.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.firstSignal, tag: "ORACLE", title: "TONIC price is reportedly pushed roughly 100x in about 20 minutes", chain: "Cronos" },
  { ts: TS.firstSignal + 1200, tag: "BORROW", title: "Attacker borrows against inflated TONIC collateral; estimates reach $66M-$75M", chain: "Cronos" },
  { ts: TS.chainHalt, tag: "CONTAINMENT", title: "Cronos halts the network after identifying an exploit in Tectonic", chain: "Cronos" },
  { ts: TS.bridgeExit, tag: "BRIDGE", title: "About $6.29M is reported bridged to Ethereum and converted to approximately 2,592 ETH", chain: "Ethereum" },
  { ts: TS.bridgeExit + 3600, tag: "STATUS", title: "Tectonic asks users not to interact while its investigation continues", chain: "Cronos" },
]

export const TECTONIC_CRONOS_DATA: IncidentData = {
  incident: {
    id: "tectonic-cronos-2026-08",
    name: "Tectonic TONIC Price Manipulation Exploit",
    victim: "Tectonic",
    attacker_attribution: "Unknown operator; addresses not independently confirmed",
    root_cause:
      "Preliminary on-chain analysis indicates a Mango Markets-style price manipulation attack. The attacker reportedly inflated the thinly traded TONIC governance token by roughly 100x, then used the inflated token value as collateral to borrow real assets from Tectonic. TONIC's reported collateral factor was 20%. Tectonic has confirmed an incident but has not yet confirmed the final loss, root cause, or attacker addresses.",
    loss_usd: 75_000_000,
    start_ts: TS.firstSignal,
    pause_ts: TS.chainHalt,
    chains_touched: ["Cronos", "Ethereum"],
    stats: [
      { label: "Estimated impact", value: "$66M-$75M", sub: "third-party on-chain estimates", accent: "text-rose-300" },
      { label: "Observed bridge-out", value: "$6.29M", sub: "reported moved to Ethereum", accent: "text-amber-300" },
      { label: "TONIC move", value: "~100x", sub: "reported in about 20 minutes", accent: "text-sky-300" },
      { label: "Chain status", value: "Halted", sub: "Cronos emergency containment", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.tonic, "TONIC token", "collateral-token", "Verified Cronos token contract. It is tracked as the manipulated collateral asset, not as an attacker address."),
  ],
}
