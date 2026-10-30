import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Binance Security Incident Update (Oct 30, 2026), TRM Labs tracing report (Oct 29-30), and corroborating onchain transaction reports"

const TS = {
  preparation: Date.parse("2026-10-29T15:59:00Z") / 1000,
  delegation: Date.parse("2026-10-29T20:20:59Z") / 1000,
  firstSweep: Date.parse("2026-10-29T20:24:23Z") / 1000,
  freeze: Date.parse("2026-10-29T21:04:00Z") / 1000,
  secondWave: Date.parse("2026-10-29T23:05:00Z") / 1000,
  securityUpdate: Date.parse("2026-10-30T02:23:00Z") / 1000,
}

const ADDRESSES = {
  binance14: "0x28C6c06298d514Db089934071355E5743bf21d60",
  binance16: "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d",
  collection: "0x5227f603C1eE34CE3C06eFe6477003BDfCCB2f8c",
  sweeper: "0x63e842B054Bd624a465454D533C33F573e9c6fAe",
  operator: "0x7C8601d4645b93cea45F71e118A729332e6B5CA0",
  ethStash: "0x8532FA14ACAf483729C449b8458aedDb900543D4",
}

function tracked(address: string, label: string, role: string, notes: string): TrackedWallet {
  return { address, chain: "ethereum", label, role, notes, confidence: "verified", sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "preparation",
    ts: TS.preparation,
    from: { label: "Attacker operator wallet", kind: "attacker", address: ADDRESSES.operator },
    to: { label: "Sweeper contract", kind: "attacker", address: ADDRESSES.sweeper },
    asset: "EIP-7702 sweeper code",
    amount: null,
    usd: 0,
    chain: "Ethereum",
    summary: "TRM reports the sweeper contract was deployed after preparation and testing on attacker-controlled wallets, hours before the main drain.",
  },
  {
    step: 2,
    phase: "authorization",
    ts: TS.delegation,
    from: { label: "Binance 14 hot wallet", kind: "victim_contract", address: ADDRESSES.binance14 },
    to: { label: "Attacker sweeper contract", kind: "attacker", address: ADDRESSES.sweeper },
    asset: "EIP-7702 delegation",
    amount: 50,
    usd: 0,
    chain: "Ethereum",
    summary: "A transaction carried 50 pre-signed authorizations across consecutive nonces; one matched the wallet's live nonce and delegated execution to the sweeper.",
  },
  {
    step: 3,
    phase: "drain",
    evidence: {
      url: "https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history",
      label: "TRM Labs investigation",
      transaction: "0x53bd38b816c23e74134786c29a8c18d792777998a3b9326047b583100e88e2f3",
      scope: "The transaction documents the Ethereum main sweep only. The $6.36B figure aggregates transfers across ten chains; it is not this transaction's value.",
    },
    ts: TS.firstSweep,
    from: { label: "Binance hot wallets", kind: "victim_contract" },
    to: { label: "Main attacker collection address", kind: "attacker", address: ADDRESSES.collection },
    asset: "ETH, BTC, USDT, USDC, XRP, TRX, SOL and other tokens",
    amount: null,
    usd: 6_360_000_000,
    chain: "10 blockchains",
    summary: "TRM traced approximately $6.36B in gross transfers from Binance-attributed wallets. Binance's own initial estimate is approximately $6.3B; neither figure is a settled net unrecovered loss.",
  },
  {
    step: 4,
    phase: "freezes-and-laundering",
    ts: TS.freeze,
    from: { label: "Attacker collection and split wallets", kind: "attacker", address: ADDRESSES.collection },
    to: { label: "Issuers, Arbitrum Security Council and lending/DEX venues", kind: "protocol" },
    asset: "Frozen stablecoins, ETH and ARB",
    amount: null,
    usd: 2_700_000_000,
    chain: "Multi-chain",
    summary: "TRM reports approximately $2.7B frozen onchain by issuers and Arbitrum. The attacker also swapped stablecoins for ETH and borrowed ETH against USDT on Aave.",
  },
  {
    step: 5,
    phase: "swap",
    evidence: { url: "https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history", label: "TRM Labs swap tracing", scope: "Reported aggregate: approximately $325M USDT exchanged through UniswapX and other intent routes for approximately 122,300 ETH. A complete transaction list and exact per-swap timestamps are not indexed here." },
    ts: TS.freeze,
    from: { label: "Attacker collection address", kind: "attacker", address: ADDRESSES.collection },
    to: { label: "UniswapX + market makers", kind: "swap_route" },
    asset: "USDT → ETH",
    amount: null,
    usd: 325_000_000,
    chain: "Ethereum",
    summary: "TRM reports approximately $325M USDT sold through UniswapX and other intent-based routes for approximately 122,300 ETH, at a steep discount while issuers raced to freeze funds.",
  },
  {
    step: 6,
    phase: "lending",
    evidence: { url: "https://www.trmlabs.com/resources/blog/north-korea-steals-usd-6-36-billion-from-binance-in-the-largest-hack-in-history", label: "TRM Labs Aave tracing", scope: "Reported position: $60M USDT collateral and approximately 19,760 ETH borrowed. The displayed USD amount is collateral, not proceeds or an additional loss. Exact transaction hash is not yet indexed." },
    ts: TS.freeze,
    from: { label: "Attacker split wallet", kind: "attacker" },
    to: { label: "Aave", kind: "lending" },
    asset: "USDT collateral → WETH loan",
    amount: 19_760,
    usd: 60_000_000,
    chain: "Ethereum",
    summary: "A separate attacker wallet supplied approximately $60M USDT to Aave and borrowed roughly 19,760 ETH before the affected market was frozen.",
  },
  {
    step: 7,
    phase: "consolidation",
    ts: TS.secondWave,
    from: { label: "Attacker routes", kind: "attacker" },
    to: { label: "ETH and BTC consolidation wallets", kind: "attacker" },
    asset: "ETH + BTC",
    amount: null,
    usd: 2_400_000_000,
    chain: "Ethereum / Bitcoin",
    summary: "At TRM's reporting snapshot, more than 420,000 ETH and 18,270 BTC remained beyond issuer freeze controls, valued at approximately $2.4B.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.preparation, tag: "PREP", title: "Sweeper contract deployed after attacker-controlled test runs", chain: "Ethereum" },
  { ts: TS.delegation, tag: "DELEGATE", title: "50 EIP-7702 authorizations submitted for Binance 14; one becomes valid", chain: "Ethereum" },
  { ts: TS.firstSweep, tag: "DRAIN", title: "Main Binance 14 sweep moves 167,464 ETH, 1.615B USDT and other tokens", chain: "Ethereum" },
  { ts: TS.freeze, tag: "FREEZE", title: "Circle freezes approximately $823M USDC; other issuers and networks freeze additional assets", chain: "Multi-chain" },
  { ts: TS.secondWave, tag: "WAVE", title: "Additional Binance wallets on Avalanche and Polygon send funds to attacker-controlled routes", chain: "Multi-chain" },
  { ts: TS.securityUpdate, tag: "RESPONSE", title: "Binance reports suspected DevOps laptop compromise, suspends deposits and withdrawals, and says user funds are safe", chain: "Exchange infrastructure" },
]

export const BINANCE_HOT_WALLET_2026_DATA: IncidentData = {
  incident: {
    id: "binance-hot-wallet-2026-10",
    name: "Binance Multi-Chain Hot Wallet Drain",
    victim: "Binance exchange hot wallets",
    attacker_attribution: "TRM assesses TraderTraitor, a North Korea-linked group, with high confidence; Binance has not published a final attribution",
    root_cause:
      "Binance's preliminary explanation points to a compromised DevOps engineer laptop, service-container access, and unauthorized withdrawal submissions, with no evidence of a wallet private-key leak. On Ethereum, TRM reports an EIP-7702 delegation that turned Binance 14 into an attacker-controlled sweeper. The cross-chain pattern suggests signing-infrastructure compromise, but Binance's final technical postmortem is pending.",
    loss_usd: 6_360_000_000,
    start_ts: TS.firstSweep,
    pause_ts: TS.securityUpdate,
    chains_touched: ["Ethereum", "Bitcoin", "TRON", "XRP Ledger", "Solana", "Arbitrum", "Avalanche", "Optimism", "Base", "Polygon"],
    stats: [
      { label: "Gross traced outflow", value: "~$6.36B", sub: "TRM valuation at transfer time", accent: "text-rose-300" },
      { label: "Frozen onchain", value: "~$2.7B", sub: "issuers + Arbitrum response", accent: "text-cyan-300" },
      { label: "Affected networks", value: "10", sub: "multi-chain wallet drain", accent: "text-amber-300" },
      { label: "Status", value: "Ongoing", sub: "postmortem and fund tracing active", accent: "text-[#ff2255]" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.binance14, "Binance 14 delegated hot wallet", "victim-hot-wallet", "Central Ethereum hot wallet used in the EIP-7702 delegation and main sweep."),
    tracked(ADDRESSES.binance16, "Binance 16 drained hot wallet", "victim-hot-wallet", "Second Binance Ethereum wallet reported to have transferred funds to the main collection address."),
    tracked(ADDRESSES.collection, "Primary attacker collection address", "attacker", "Main collection address receiving the Binance 14 sweep and multiple cross-chain inflows."),
    tracked(ADDRESSES.sweeper, "Attacker EIP-7702 sweeper contract", "attacker-contract", "Unverified sweeper contract called after Binance 14 delegated execution to it."),
    tracked(ADDRESSES.operator, "Attacker operator wallet", "attacker", "Operator address reported as funded through Tornado Cash before the incident."),
    tracked(ADDRESSES.ethStash, "Large ETH consolidation wallet", "attacker", "TRM reports this wallet held a major ETH consolidation tranche beyond issuer freeze controls at its reporting snapshot."),
  ],
}
