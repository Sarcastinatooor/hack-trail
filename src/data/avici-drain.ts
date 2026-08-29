import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Solana mainnet finalized logs, Rain and Avici incident statements, Avici's reconciliation, Tria and Solayer Pay status updates, The Defiant's transaction review, and Onchain Lens fund-flow reporting; updated 2026-08-29"

const TS = {
  collectorCreated: 1787935788,
  firstWithdrawal: 1787936089,
  acceleration: 1787936342,
  aviciAcknowledges: 1787942520,
  peakSnapshot: 1787943480,
  collectorSweep: 1787945194,
  relaySweep: 1787945624,
  bridgeExit: 1787945744,
  rainContainment: 1787948760,
  aviciReconciliation: 1787949840,
  launderingReport: 1787964600,
}

const ADDRESSES = {
  collector: "FVNFzqAny8spWdPmYw6RQ9TkYa29ueFFiqCFD1gQnCEj",
  collectorUsdc: "A5fBB5sLNMiF6NGz8JPpeKM2Ke6tCvmmAZ7PZVsp6rZy",
  aviciProgram: "CWgkFB7ngUc9cGD1LryyhP7h6xYWtwrAjhSKKCoR1gkz",
  firstVictimOwner: "HEgJutJjfCyG7RDtcS9xBc8sbty31TsqK3VCxyh4s7K1",
  firstVictimUsdc: "5okHTiR5zMRUcgtQhjxbNdP7x1QZzhXinwz6ubVpAnTN",
  globalState: "7AqR7EMxyW93tr1KQ1bMa4NpwqJwN5pscLkk6Eu4MAso",
  firstRelay: "7XigoEaHxpoHp819fnajGqsz329Lve9c2SXSq8KaFRVf",
  secondRelay: "Dn1qRqxgCY6XzNe3kMEbGmEPY24MQCD5W1uA8xeBPNch",
  debridgeProgram: "src5qyZHqTqecJV4aY6Cb6zDZLMDzrDKKezs22MPHr4",
  reportedEthereumExit: "0x2cE21E4921d3Eb116526c3651Dac0257657338D5",
}

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified",
  chain = "solana"
): TrackedWallet {
  return { address, chain, label, role, notes, confidence, sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "collection-setup",
    ts: TS.collectorCreated,
    from: { label: "Reported operator", kind: "attacker", address: ADDRESSES.collector },
    to: { label: "Collector USDC account", kind: "attacker", address: ADDRESSES.collectorUsdc },
    asset: "Fresh Solana USDC token account",
    amount: 0,
    usd: 0,
    chain: "Solana",
    summary:
      "The reported collector created its associated USDC token account at 16:49:48 UTC, minutes before the first verified withdrawal reached it.",
  },
  {
    step: 2,
    phase: "first-withdrawal",
    ts: TS.firstWithdrawal,
    from: { label: "User collateral account", kind: "user_funds", address: ADDRESSES.firstVictimUsdc },
    to: { label: "Collector USDC account", kind: "attacker", address: ADDRESSES.collectorUsdc },
    asset: "1,779.973441 USDC",
    amount: 1_779.973441,
    usd: 1_779.973441,
    chain: "Solana",
    summary:
      "A finalized Avici-program call logged WithdrawCollateralAsset and transferred the full 1,779.973441 USDC balance from a user-owned collateral account to the collector. The reported wallet paid for and signed the transaction.",
  },
  {
    step: 3,
    phase: "automated-drain",
    ts: TS.acceleration,
    from: { label: "Multiple Avici collateral accounts", kind: "user_funds" },
    to: { label: "Collector wallet", kind: "attacker", address: ADDRESSES.collector },
    asset: "Repeated USDC and USDT withdrawals",
    amount: null,
    usd: 500_859.22,
    chain: "Solana",
    summary:
      "The repeated sequence was SubmitSignatures, AddCollateralAdmin, then WithdrawCollateralAsset. Avici later reconciled 1,685 affected users and $500,859.22 taken from its separate card-balance contract.",
  },
  {
    step: 4,
    phase: "conversion-and-peak",
    ts: TS.peakSnapshot,
    from: { label: "Stolen USDC and USDT", kind: "attacker_proceeds" },
    to: { label: "Collector SOL balance", kind: "attacker", address: ADDRESSES.collector },
    asset: "10,005.03 SOL plus about $11.6K stables across the campaign",
    amount: 10_005.03,
    usd: 1_020_000,
    chain: "Solana",
    summary:
      "The operator periodically swapped drained stablecoins into SOL. At 18:58 UTC the collector held 10,005.03 SOL plus roughly $11.6K in stables. This broader balance included proceeds from other Rain programs and is not Avici's confirmed loss.",
  },
  {
    step: 5,
    phase: "collector-sweep",
    ts: TS.collectorSweep,
    from: { label: "Primary collector", kind: "attacker", address: ADDRESSES.collector },
    to: { label: "First relay 7Xigo...FRVf", kind: "attacker", address: ADDRESSES.firstRelay },
    asset: "886.942478746 SOL final balance",
    amount: 886.942478746,
    usd: 94_900,
    chain: "Solana",
    summary:
      "The primary collector sent its final 886.942478746 SOL to a fresh relay and closed with zero SOL, USDC, and USDT. Other proceeds had already left in earlier chunks.",
  },
  {
    step: 6,
    phase: "relay-sweep",
    ts: TS.relaySweep,
    from: { label: "First relay 7Xigo...FRVf", kind: "attacker", address: ADDRESSES.firstRelay },
    to: { label: "Second relay Dn1q...PNch", kind: "attacker", address: ADDRESSES.secondRelay },
    asset: "886.942478386 SOL",
    amount: 886.942478386,
    usd: 94_900,
    chain: "Solana",
    summary:
      "Seven minutes later the first relay forwarded effectively the full balance to Dn1q...PNch and was emptied.",
  },
  {
    step: 7,
    phase: "cross-chain-exit",
    ts: TS.bridgeExit,
    from: { label: "Second relay Dn1q...PNch", kind: "attacker", address: ADDRESSES.secondRelay },
    to: { label: "Jupiter and deBridge order flow", kind: "bridge", address: ADDRESSES.debridgeProgram },
    asset: "SOL converted to USDC and routed into bridge orders",
    amount: null,
    usd: 94_900,
    chain: "Solana",
    summary:
      "The second relay converted SOL into USDC through Jupiter routes and invoked deBridge CreateOrderWithNonce flows. The destination-chain recipients require continued cross-chain tracing.",
  },
  {
    step: 8,
    phase: "reported-laundering",
    ts: TS.launderingReport,
    from: { label: "deBridge destination flow", kind: "bridge" },
    to: { label: "Reported Ethereum / Tornado path", kind: "mixer", address: ADDRESSES.reportedEthereumExit },
    asset: "Approximately 418 ETH reported",
    amount: 418,
    usd: 1_020_000,
    chain: "Ethereum",
    summary:
      "Onchain Lens reported that roughly $1.02M was bridged to Ethereum, converted into about 418 ETH, and deposited through a Tornado Cash-linked route at 0x2cE2...38D5. HackTrail marks this as third-party fund-flow attribution pending a complete public cross-chain order map.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.collectorCreated, tag: "SETUP", title: "Collector creates a fresh USDC associated token account", chain: "Solana" },
  { ts: TS.firstWithdrawal, tag: "FIRST DRAIN", title: "Verified Avici call moves 1,779.973441 USDC from a user collateral account", chain: "Solana" },
  { ts: TS.acceleration, tag: "AUTOMATION", title: "SubmitSignatures, AddCollateralAdmin, and withdrawal loops accelerate", chain: "Solana" },
  { ts: TS.aviciAcknowledges, tag: "RESPONSE", title: "Avici acknowledges an issue affecting card-balance withdrawals", chain: "Solana" },
  { ts: TS.peakSnapshot, tag: "PEAK", title: "Collector reaches 10,005.03 SOL plus about $11.6K in stables", chain: "Solana" },
  { ts: TS.collectorSweep, tag: "SWEEP", title: "Primary collector sends its final 886.942 SOL to 7Xigo...FRVf", chain: "Solana" },
  { ts: TS.relaySweep, tag: "RELAY", title: "7Xigo...FRVf forwards the balance to Dn1q...PNch", chain: "Solana" },
  { ts: TS.bridgeExit, tag: "EXIT", title: "Dn1q...PNch begins routing converted USDC through deBridge orders", chain: "Solana" },
  { ts: TS.rainContainment, tag: "CONTAINED", title: "Rain says every program on the outdated Solana contract has been upgraded", chain: "Solana" },
  { ts: TS.aviciReconciliation, tag: "REFUND", title: "Avici confirms 1,685 users, $500,859.22 affected, and full refunds", chain: "Solana" },
  { ts: TS.launderingReport, tag: "LAUNDERING", title: "Onchain Lens reports roughly 418 ETH routed through a Tornado Cash-linked path", chain: "Ethereum" },
]

export const AVICI_DRAIN_DATA: IncidentData = {
  incident: {
    id: "avici-user-balance-drain-2026-08",
    name: "Avici / Rain Solana Card Contract Drain",
    victim: "Avici users",
    attacker_attribution: "Unknown operator; collector FVNF...nCEj",
    root_cause:
      "Rain identified a vulnerability in an outdated version of its Solana card contract used by Avici and a small number of other programs. The attacker traversed the contract's authorization path with Ed25519-verified SubmitSignatures calls, registered a new collateral administrator, and executed unauthorized USDC or USDT withdrawals. Avici reconciled $500,859.22 taken from 1,685 users' card balances and promised full refunds. Avici's self-custodial Solana and EVM wallets were separate and were not affected. Rain says all programs using the outdated contract were upgraded and no further unauthorized activity was observed. Tria reported and resolved a related Solana card-balance issue; Solayer Pay, KAST, and ether.fi said they were not affected. The broader attacker wallet reached roughly $1.02M in campaign proceeds, which should not be presented as Avici's loss. A detailed technical postmortem and refund-completion timetable remain pending.",
    loss_usd: 500_859.22,
    start_ts: TS.firstWithdrawal,
    chains_touched: ["Solana"],
    stats: [
      { label: "Confirmed Avici impact", value: "$500,859.22", sub: "card balances only", accent: "text-rose-300" },
      { label: "Avici users affected", value: "1,685", sub: "official reconciliation", accent: "text-amber-300" },
      { label: "Broader campaign", value: "~$1.02M", sub: "reported across Rain programs", accent: "text-sky-300" },
      { label: "Refund status", value: "Full", sub: "promised; completion pending", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.collector, "Primary collector / executor", "attacker", "Signed the Avici authorization and withdrawal sequence, swapped stablecoins into SOL, and was emptied after reaching a reported 10,005.03 SOL peak."),
    tracked(ADDRESSES.collectorUsdc, "Collector USDC token account", "attacker", "Received drained USDC and is now empty after conversion and exit activity."),
    tracked(ADDRESSES.firstRelay, "First SOL relay", "attacker", "Received the collector's final 886.942478746 SOL, then forwarded effectively all of it to Dn1q...PNch."),
    tracked(ADDRESSES.secondRelay, "Second relay / bridge executor", "attacker", "Received 886.942478386 SOL, converted proceeds through Jupiter, and created deBridge orders."),
    tracked(ADDRESSES.debridgeProgram, "deBridge order program", "infrastructure", "Cross-chain order program used in the exit path. Infrastructure address, not attacker-controlled.", "curated"),
    tracked(ADDRESSES.reportedEthereumExit, "Reported Ethereum / Tornado route", "mixer-route", "Onchain Lens attributes roughly 418 ETH of campaign proceeds to this laundering route; cross-chain attribution remains third-party sourced.", "curated", "ethereum"),
    tracked(ADDRESSES.aviciProgram, "Avici Solana program", "victim-program", "Program emitting AddCollateralAdmin and WithdrawCollateralAsset instructions. Infrastructure address, not attacker-controlled."),
    tracked(ADDRESSES.globalState, "Avici global state", "infrastructure", "Read-only state account present in sampled withdrawal calls; not attacker-controlled.", "curated"),
    tracked(ADDRESSES.firstVictimOwner, "First verified affected owner", "victim", "Owned the collateral account drained in the first verified 1,779.973441 USDC transfer."),
    tracked(ADDRESSES.firstVictimUsdc, "First verified affected USDC account", "victim", "Source token account in the first verified withdrawal."),
  ],
}
