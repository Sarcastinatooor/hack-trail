import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const OSTIUM_SOURCE =
  "Arbitrum USDC transfer logs and transaction receipts, Blockaid alert, Ostium protocol docs, Ostium app bundle, and DefiLlama Ostium TVL"

const TS = {
  preDrain: 1784073600,
  probe: 1784125103,
  largestTx: 1784125128,
  smallLoop1: 1784125177,
  smallLoop2: 1784125312,
  loop3: 1784125345,
  loop4: 1784125375,
  loop5: 1784125401,
  lastDrain: 1784125432,
  blockaidAlert: 1784127049,
  pauseAnnouncement: 1784128700,
}

const ADDRESSES = {
  vault: "0x20D419a8e12C45f88fDA7c5760bb6923Cee27F98",
  executor: "0x321df194646029e7a6193ea05573d4b9c398bfd9",
  operatorWallet: "0xD1794196f0fc99c7f27970e661597d77d9a85869",
  usdc: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  trading: "0x6D0bA1f9996DBD8885827e1b2e8f6593e7702411",
  tradingStorage: "0xccd5891083a8acd2074690f65d3024e7d13d66e7",
  tradingCallbacks: "0x7720fC8c8680bF4a1Af99d44c6c265a74e9742a9",
  priceRouter: "0x4B0C3c77D398912491f192d265b237C8d4441AD7",
  priceUpkeep: "0x52B2a78E12b09B66C6c8ce291D653D40bAb77f0c",
  privatePriceUpkeep: "0xb71ec9ebd8145dacacf6724363143cb5667a3d36",
  verifier: "0xcCF233920e8cc9415ecF503b992881d69b6c47Ad",
  keeper: "0x6297ce1a61c2c8a72bfb0de957f6b1cf0413141e",
}

const LARGEST_TX =
  "0x359f8c05b86a4409d60cfba02084334313fd94b19f74a294fb7fc4ea7d4870e0"

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified"
): TrackedWallet {
  return {
    address,
    chain: "arbitrum",
    label,
    role,
    confidence,
    sourceLabel: OSTIUM_SOURCE,
    notes,
  }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "oracle-compromise",
    ts: TS.probe - 1,
    from: { label: "Authorized signer path", kind: "oracle_signer" },
    to: { label: "Ostium verifier", kind: "verifier", address: ADDRESSES.verifier },
    asset: "signed price report",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Onchain execution and Blockaid's analysis point to an authorized signer path being compromised or abused. Ostium has not yet published a full postmortem.",
  },
  {
    step: 2,
    phase: "probe",
    ts: TS.probe,
    from: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    to: { label: "Ostium trading contract", kind: "protocol", address: ADDRESSES.trading },
    asset: "USDC collateral",
    amount: 100,
    usd: 100,
    chain: "Arbitrum",
    summary:
      "A 100 USDC probe tested the signed-price route and 100x trade before the vault paid 897.8008 USDC.",
  },
  {
    step: 3,
    phase: "probe",
    ts: TS.probe,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    asset: "USDC payout",
    amount: 897.8008,
    usd: 897.8008,
    chain: "Arbitrum",
    summary:
      "The first direct vault payout confirmed the loop would return roughly 8.98x the posted collateral.",
  },
  {
    step: 4,
    phase: "drain",
    ts: TS.largestTx,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC payouts",
    amount: 11_862_840.782,
    usd: 11_862_840.782,
    chain: "Arbitrum",
    summary:
      "The largest transaction packed five open-close loops using 1,000, 9,000, 80,000, 700,000, and 530,000 USDC collateral.",
  },
  {
    step: 5,
    phase: "drain",
    ts: TS.smallLoop1,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 13_479.6064,
    usd: 13_479.6064,
    chain: "Arbitrum",
    summary:
      "A follow-on transaction produced another direct 13,479.6064 USDC vault payout.",
  },
  {
    step: 6,
    phase: "drain",
    ts: TS.smallLoop2,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 13_479.6064,
    usd: 13_479.6064,
    chain: "Arbitrum",
    summary:
      "A second small transaction repeated the 13,479.6064 USDC payout before the attacker scaled again.",
  },
  {
    step: 7,
    phase: "drain",
    ts: TS.loop3,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 4_493_501.1004,
    usd: 4_493_501.1004,
    chain: "Arbitrum",
    summary:
      "The next scaled loop paid 4,493,501.1004 USDC directly from OLP to the executor.",
  },
  {
    step: 8,
    phase: "drain",
    ts: TS.loop4,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 3_594_800.7004,
    usd: 3_594_800.7004,
    chain: "Arbitrum",
    summary:
      "Another scaled loop paid 3,594,800.7004 USDC as the direct drain continued.",
  },
  {
    step: 9,
    phase: "drain",
    ts: TS.loop5,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 2_696_100.3004,
    usd: 2_696_100.3004,
    chain: "Arbitrum",
    summary:
      "The penultimate drain transaction paid 2,696,100.3004 USDC from OLP to the executor.",
  },
  {
    step: 10,
    phase: "drain",
    ts: TS.lastDrain,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 1_078_439.5804,
    usd: 1_078_439.5804,
    chain: "Arbitrum",
    summary:
      "The final known drain transaction brought verified direct vault payouts to 23,753,539.4772 USDC.",
  },
  {
    step: 11,
    phase: "swap",
    ts: TS.blockaidAlert,
    from: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    to: { label: "Kyber swap route", kind: "kyber" },
    asset: "USDC to ETH",
    amount: null,
    usd: 9_000_000,
    chain: "Arbitrum",
    summary:
      "Public analysis says USDC began routing into ETH through Kyber in roughly 3M clips.",
  },
  {
    step: 12,
    phase: "fanout",
    ts: TS.pauseAnnouncement,
    from: { label: "Kyber swap route", kind: "kyber" },
    to: { label: "Fresh wallet fanout cluster", kind: "fanout" },
    asset: "ETH",
    amount: null,
    usd: 19_000_000,
    chain: "Arbitrum",
    summary:
      "Funds were reportedly fanned out in roughly 1.9M chunks across more than ten fresh wallets.",
  },
  {
    step: 13,
    phase: "funding",
    ts: TS.probe - 7200,
    from: { label: "Bybit hot wallet", kind: "hot_wallet" },
    to: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    asset: "gas funding",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "The executor was reportedly gassed hours earlier from a Bybit hot wallet.",
  },
  {
    step: 14,
    phase: "funding",
    ts: TS.probe - 6900,
    from: { label: "ChangeNOW hot wallet", kind: "hot_wallet" },
    to: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    asset: "gas funding",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Public analysis also cites gas funding from a ChangeNOW hot wallet.",
  },
  {
    step: 15,
    phase: "settlement-risk",
    ts: TS.pauseAnnouncement,
    from: { label: "Withdrawal request queue", kind: "settlement_queue" },
    to: { label: "Redeeming LPs", kind: "retail_lp" },
    asset: "OLP settlement exposure",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Ostium's docs say withdrawals usually settle after two to three days at the OLP price then in effect. Requesting a withdrawal does not lock the pre-drain price.",
  },
]

const timeline: TimelineEvent[] = [
  {
    ts: TS.probe - 7200,
    tag: "FUNDING",
    title: "Executor reportedly funded from Bybit and ChangeNOW hot-wallet sources",
    chain: "Arbitrum",
  },
  {
    ts: TS.probe - 1,
    tag: "ORACLE",
    title: "Authorized price reports enter the execution path; signer compromise or abuse remains the leading public explanation",
    chain: "Arbitrum",
  },
  {
    ts: TS.probe,
    tag: "PROBE",
    title: "100 USDC probe returns 897.8008 USDC from OLP",
    chain: "Arbitrum",
  },
  {
    ts: TS.largestTx,
    tag: "DRAIN",
    title: "Largest known Arbitrum tx 0x359f...7e0 executes five loops and extracts about $11.86M",
    chain: "Arbitrum",
  },
  {
    ts: TS.lastDrain,
    tag: "DRAIN",
    title: "Direct drain ends with $23.7535M paid across 12 vault transfers in eight transactions",
    chain: "Arbitrum",
  },
  {
    ts: TS.blockaidAlert,
    tag: "ALERT",
    title: "Blockaid publishes its alert about 27 minutes after the final verified drain payout",
    chain: "Arbitrum",
  },
  {
    ts: TS.pauseAnnouncement,
    tag: "PAUSE",
    title: "Ostium publicly announces that all trading is paused while it investigates",
    chain: "Arbitrum",
  },
  {
    ts: TS.pauseAnnouncement,
    tag: "SETTLEMENT",
    title: "Next OLP settlement becomes the accounting watchpoint; withdrawal requests settle at the price then in effect",
    chain: "Arbitrum",
  },
]

export const OSTIUM_OLP_DATA: IncidentData = {
  incident: {
    id: "ostium-olp-2026-07",
    name: "Ostium OLP Oracle Signer Drain",
    victim: "Ostium OLP Vault",
    attacker_attribution: "Unknown attacker; executor reportedly funded from Bybit and ChangeNOW hot wallets",
    root_cause:
      "Onchain execution and Blockaid's public analysis point to a compromised or otherwise abused authorized signer path. Fabricated price reports carrying valid authorization were bundled with 100x trades, allowing positions to open at one false mark and close at another while the vault paid the resulting profit. Ostium has paused trading but has not yet published a full postmortem. Verified direct OLP-to-executor payouts total $23.7535M; the larger $25.31M figure is the observed vault USDC balance drawdown, not the same measurement.",
    loss_usd: 23_753_539,
    start_ts: TS.probe,
    pause_ts: TS.pauseAnnouncement,
    chains_touched: ["Arbitrum"],
    stats: [
      {
        label: "Verified payouts",
        value: "$23.75M",
        sub: "12 transfers across eight txs",
        accent: "text-rose-300",
      },
      {
        label: "Vault drawdown",
        value: "$25.31M",
        sub: "OLP USDC 34.3M -> 8.99M",
        accent: "text-amber-300",
      },
      {
        label: "Largest tx",
        value: "$11.86M",
        sub: "five loops in one Arbitrum tx",
        accent: "text-sky-300",
      },
      {
        label: "Protocol TVL drop",
        value: "$25.6M",
        sub: "DefiLlama 63.43M -> 37.84M",
        accent: "text-emerald-300",
      },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(
      ADDRESSES.vault,
      "Ostium OLP vault",
      "victim",
      "Arkham labels this as Ostium ostiumLP / OLP; visible USDC balance fell from about 34.3M to 8.99M in the incident window."
    ),
    tracked(
      ADDRESSES.executor,
      "Executor 0x321D...BFD9",
      "attacker",
      `Executor wallet provided by the incident source. Largest known tx: ${LARGEST_TX}.`
    ),
    tracked(
      ADDRESSES.operatorWallet,
      "Second wallet, same operator",
      "attacker",
      "Second operator-linked wallet supplied by the incident source for clustering and exposure checks."
    ),
    tracked(
      ADDRESSES.trading,
      "Ostium trading contract",
      "protocol",
      "Trading contract address extracted from the live Ostium app bundle; useful for wallet exposure checks around trade open/close calls."
    ),
    tracked(
      ADDRESSES.tradingStorage,
      "Ostium trading storage",
      "protocol",
      "Stores trading state and collateral backing open positions in the Ostium deployment."
    ),
    tracked(
      ADDRESSES.tradingCallbacks,
      "Ostium trading callbacks",
      "protocol",
      "Protocol callback contract in the Ostium Arbitrum deployment."
    ),
    tracked(
      ADDRESSES.verifier,
      "Ostium verifier",
      "protocol",
      "Verifier contract that accepted validly signed price reports; the signer trust path is the tracked risk surface."
    ),
    tracked(
      ADDRESSES.priceRouter,
      "Ostium price router",
      "protocol",
      "Price routing contract from the Ostium app bundle, included to catch wallet interactions with price execution paths."
    ),
    tracked(
      ADDRESSES.priceUpkeep,
      "Ostium price upkeep",
      "protocol",
      "Automation/upkeep contract in the Ostium price stack."
    ),
    tracked(
      ADDRESSES.privatePriceUpkeep,
      "Ostium private price upkeep",
      "protocol",
      "Private upkeep contract in the Ostium price stack."
    ),
    tracked(
      ADDRESSES.keeper,
      "Ostium keeper",
      "protocol",
      "Keeper address from the live app config, useful for monitoring automation-linked exposure."
    ),
    tracked(
      ADDRESSES.usdc,
      "Arbitrum native USDC",
      "token",
      "Native USDC contract used by Ostium on Arbitrum.",
      "curated"
    ),
  ],
}
