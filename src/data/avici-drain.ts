import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Solana mainnet finalized transaction logs and token balances, the reported collector address, Avici product documentation, and public user alerts; snapshot taken 2026-08-28 17:55 UTC"

const TS = {
  collectorCreated: 1787935788,
  firstWithdrawal: 1787936089,
  acceleration: 1787936342,
  liveSnapshot: 1787939703,
}

const ADDRESSES = {
  collector: "FVNFzqAny8spWdPmYw6RQ9TkYa29ueFFiqCFD1gQnCEj",
  collectorUsdc: "A5fBB5sLNMiF6NGz8JPpeKM2Ke6tCvmmAZ7PZVsp6rZy",
  aviciProgram: "CWgkFB7ngUc9cGD1LryyhP7h6xYWtwrAjhSKKCoR1gkz",
  firstVictimOwner: "HEgJutJjfCyG7RDtcS9xBc8sbty31TsqK3VCxyh4s7K1",
  firstVictimUsdc: "5okHTiR5zMRUcgtQhjxbNdP7x1QZzhXinwz6ubVpAnTN",
  globalState: "7AqR7EMxyW93tr1KQ1bMa4NpwqJwN5pscLkk6Eu4MAso",
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
    asset: "Repeated USDC withdrawals",
    amount: null,
    usd: 571_489.782056,
    chain: "Solana",
    summary:
      "The collector began submitting rapid WithdrawCollateralAsset calls through the Avici program. By the live snapshot, 2,011 transactions had touched its USDC account: 1,811 successful and 200 failed. This is transaction count, not a verified victim count.",
  },
  {
    step: 4,
    phase: "live-balance",
    ts: TS.liveSnapshot,
    from: { label: "Avici user collateral", kind: "user_funds" },
    to: { label: "Collector USDC balance", kind: "attacker", address: ADDRESSES.collectorUsdc },
    asset: "571,489.782056 USDC held",
    amount: 571_489.782056,
    usd: 571_489.782056,
    chain: "Solana",
    summary:
      "Solana RPC showed 571,489.782056 USDC in the collector token account at 17:55 UTC and the balance was still increasing during verification. A downstream exit or laundering route had not yet been confirmed.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.collectorCreated, tag: "SETUP", title: "Collector creates a fresh USDC associated token account", chain: "Solana" },
  { ts: TS.firstWithdrawal, tag: "FIRST DRAIN", title: "Verified Avici call moves 1,779.973441 USDC from a user collateral account", chain: "Solana" },
  { ts: TS.acceleration, tag: "AUTOMATION", title: "Rapid WithdrawCollateralAsset calls begin hitting multiple collateral accounts", chain: "Solana" },
  { ts: TS.liveSnapshot, tag: "LIVE", title: "Collector balance passes $571.4K USDC while the drain remains active", chain: "Solana" },
]

export const AVICI_DRAIN_DATA: IncidentData = {
  incident: {
    id: "avici-user-balance-drain-2026-08",
    name: "Avici User Collateral Account Drain",
    victim: "Avici users",
    attacker_attribution: "Unknown operator; collector FVNF...nCEj",
    root_cause:
      "A live Solana drain is moving USDC from multiple Avici-linked collateral accounts into one collector through successful WithdrawCollateralAsset instructions on Avici program CWgk...1gkz. Each sampled transaction is paid for and signed by the collector and includes two Ed25519 verification instructions before the Avici withdrawal executes. This confirms abuse of Avici's authorized withdrawal path, but does not yet establish whether the underlying failure is a compromised backend signer, leaked authorization material, replay weakness, or another access-control defect. Avici had not published a postmortem at the snapshot time. Users should avoid new deposits and use only Avici's official app and support channels for any emergency action.",
    loss_usd: 571_489.782056,
    start_ts: TS.firstWithdrawal,
    chains_touched: ["Solana"],
    stats: [
      { label: "Live collector balance", value: "$571.5K+", sub: "still rising at 17:55 UTC", accent: "text-rose-300" },
      { label: "Successful transactions", value: "1,811", sub: "not a unique-victim count", accent: "text-amber-300" },
      { label: "First verified drain", value: "$1,779.97", sub: "16:54:49 UTC", accent: "text-sky-300" },
      { label: "Asset", value: "USDC", sub: "Solana native USDC", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.collector, "Reported collector / executor", "attacker", "Signs the rapid Avici withdrawal transactions and controls the receiving USDC token account."),
    tracked(ADDRESSES.collectorUsdc, "Collector USDC token account", "attacker", "Held 571,489.782056 USDC at the live snapshot; monitor for downstream transfers."),
    tracked(ADDRESSES.aviciProgram, "Avici Solana program", "victim-program", "Program emitting AddCollateralAdmin and WithdrawCollateralAsset instructions. Infrastructure address, not attacker-controlled."),
    tracked(ADDRESSES.globalState, "Avici global state", "infrastructure", "Read-only state account present in sampled withdrawal calls; not attacker-controlled.", "curated"),
    tracked(ADDRESSES.firstVictimOwner, "First verified affected owner", "victim", "Owned the collateral account drained in the first verified 1,779.973441 USDC transfer."),
    tracked(ADDRESSES.firstVictimUsdc, "First verified affected USDC account", "victim", "Source token account in the first verified withdrawal."),
  ],
}
