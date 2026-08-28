import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Solana mainnet finalized logs and balances, Avici's public acknowledgment, The Defiant's transaction review and live-tracker figures, and Avici product documentation; updated 2026-08-29"

const TS = {
  collectorCreated: 1787935788,
  firstWithdrawal: 1787936089,
  acceleration: 1787936342,
  aviciAcknowledges: 1787942520,
  peakSnapshot: 1787943480,
  collectorSweep: 1787945194,
  relaySweep: 1787945624,
  bridgeExit: 1787945744,
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
}

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified"
): TrackedWallet {
  return { address, chain: "solana", label, role, notes, confidence, sourceLabel: SOURCE }
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
    usd: 1_081_600,
    chain: "Solana",
    summary:
      "The repeated sequence was SubmitSignatures, AddCollateralAdmin, then WithdrawCollateralAsset. A public tracker observed at least 125 distinct sending accounts; this is a lower bound, not a final victim count.",
  },
  {
    step: 4,
    phase: "conversion-and-peak",
    ts: TS.peakSnapshot,
    from: { label: "Stolen USDC and USDT", kind: "attacker_proceeds" },
    to: { label: "Collector SOL balance", kind: "attacker", address: ADDRESSES.collector },
    asset: "10,005.03 SOL plus about $11.6K stables",
    amount: 10_005.03,
    usd: 1_081_600,
    chain: "Solana",
    summary:
      "The operator periodically swapped drained stablecoins into SOL. At 18:58 UTC the collector held 10,005.03 SOL, then worth about $1.07M, plus roughly $11.6K in USDC and USDT.",
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
]

export const AVICI_DRAIN_DATA: IncidentData = {
  incident: {
    id: "avici-user-balance-drain-2026-08",
    name: "Avici User Collateral Account Drain",
    victim: "Avici users",
    attacker_attribution: "Unknown operator; collector FVNF...nCEj",
    root_cause:
      "The attacker traversed Avici's authorization layer rather than draining ordinary Solana wallets directly. The repeated path submitted Ed25519-verified signatures, registered a new administrator on a user's collateral account with AddCollateralAdmin, and then called WithdrawCollateralAsset to move USDC or USDT. At least 125 distinct sending accounts were observed and the attacker signed 14,672 transactions, including 2,344 failures. The collector peaked at 10,005.03 SOL plus about $11.6K in stables before being emptied through relay wallets and cross-chain deBridge orders. Avici acknowledged an issue affecting card-balance withdrawals and said it was working with relevant partners. The source of the accepted authorization remains unconfirmed: a postmortem is still needed to distinguish compromised signing infrastructure, leaked authorization material, replay weakness, or another access-control defect.",
    loss_usd: 1_081_600,
    start_ts: TS.firstWithdrawal,
    chains_touched: ["Solana"],
    stats: [
      { label: "Estimated extracted", value: "$1.08M+", sub: "10,005 SOL + stables at peak", accent: "text-rose-300" },
      { label: "Sending accounts", value: "125+", sub: "public-tracker lower bound", accent: "text-amber-300" },
      { label: "Attacker transactions", value: "14,672", sub: "2,344 failed", accent: "text-sky-300" },
      { label: "Primary collector", value: "$0", sub: "proceeds swept to relays", accent: "text-emerald-300" },
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
    tracked(ADDRESSES.aviciProgram, "Avici Solana program", "victim-program", "Program emitting AddCollateralAdmin and WithdrawCollateralAsset instructions. Infrastructure address, not attacker-controlled."),
    tracked(ADDRESSES.globalState, "Avici global state", "infrastructure", "Read-only state account present in sampled withdrawal calls; not attacker-controlled.", "curated"),
    tracked(ADDRESSES.firstVictimOwner, "First verified affected owner", "victim", "Owned the collateral account drained in the first verified 1,779.973441 USDC transfer."),
    tracked(ADDRESSES.firstVictimUsdc, "First verified affected USDC account", "victim", "Source token account in the first verified withdrawal."),
  ],
}
