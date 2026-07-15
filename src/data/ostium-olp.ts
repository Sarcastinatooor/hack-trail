import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const OSTIUM_SOURCE =
  "User-provided Arkham screenshot and Arbiscan tx, Hypernative detection, Ostium protocol docs, Ostium app bundle, and DefiLlama Ostium TVL"

const TS = {
  preDrain: 1784073600,
  probe: 1784138400,
  largestTx: 1784138700,
  loop1: 1784139000,
  loop2: 1784139600,
  loop3: 1784140200,
  loop4: 1784140800,
  loop5: 1784141400,
  snapshot: 1784142227,
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
    ts: TS.probe - 1800,
    from: { label: "Compromised oracle signer", kind: "oracle_signer" },
    to: { label: "Ostium verifier", kind: "verifier", address: ADDRESSES.verifier },
    asset: "signed price report",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "The verifier accepted validly signed reports. The failure appears to sit at signer trust, not signature verification logic.",
  },
  {
    step: 2,
    phase: "probe",
    ts: TS.probe,
    from: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    to: { label: "Ostium trading contract", kind: "protocol", address: ADDRESSES.trading },
    asset: "USDC collateral",
    amount: 1_000,
    usd: 1_000,
    chain: "Arbitrum",
    summary:
      "A 1,000 USDC probe bundled a signed fabricated mark and 100x trade, then closed for about 8,986 USDC.",
  },
  {
    step: 3,
    phase: "probe",
    ts: TS.probe + 120,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    asset: "USDC payout",
    amount: 8_986,
    usd: 8_986,
    chain: "Arbitrum",
    summary:
      "The small test confirmed the vault would pay the capped maximum profit at roughly 8.99x collateral.",
  },
  {
    step: 4,
    phase: "drain",
    ts: TS.loop1,
    from: { label: "Executor 0x321D...BFD9", kind: "executor", address: ADDRESSES.executor },
    to: { label: "Ostium trading contract", kind: "protocol", address: ADDRESSES.trading },
    asset: "USDC collateral",
    amount: 700_000,
    usd: 700_000,
    chain: "Arbitrum",
    summary:
      "After the probe cleared, the attacker scaled to a 700,000 USDC collateral leg.",
  },
  {
    step: 5,
    phase: "drain",
    ts: TS.loop1 + 60,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 6_290_000,
    usd: 6_290_000,
    chain: "Arbitrum",
    summary:
      "Largest visible Arkham transfer: about 6.29M USDC to the executor after the scaled loop.",
  },
  {
    step: 6,
    phase: "drain",
    ts: TS.loop2,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 4_760_000,
    usd: 4_760_000,
    chain: "Arbitrum",
    summary:
      "Second large Arkham outflow in the visible one-hour drain sequence.",
  },
  {
    step: 7,
    phase: "drain",
    ts: TS.loop3,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 4_490_000,
    usd: 4_490_000,
    chain: "Arbitrum",
    summary:
      "Third large Arkham outflow; the first three visible transfers total about 15.54M USDC.",
  },
  {
    step: 8,
    phase: "drain",
    ts: TS.loop4,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 3_590_000,
    usd: 3_590_000,
    chain: "Arbitrum",
    summary:
      "Fourth large visible OLP outflow as the exploit loop kept paying capped profits.",
  },
  {
    step: 9,
    phase: "drain",
    ts: TS.loop5,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 2_690_000,
    usd: 2_690_000,
    chain: "Arbitrum",
    summary:
      "Fifth large visible OLP outflow; cumulative visible Arkham outflows reached about 21.82M USDC.",
  },
  {
    step: 10,
    phase: "drain",
    ts: TS.loop5 + 420,
    from: { label: "Ostium OLP vault", kind: "vault", address: ADDRESSES.vault },
    to: { label: "Executor 0x321D...BFD9", kind: "attacker", address: ADDRESSES.executor },
    asset: "USDC",
    amount: 1_070_000,
    usd: 1_070_000,
    chain: "Arbitrum",
    summary:
      "Sixth large visible OLP outflow; the six Arkham rows total about 22.89M USDC.",
  },
  {
    step: 11,
    phase: "swap",
    ts: TS.loop5 + 900,
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
    ts: TS.snapshot,
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
    ts: TS.snapshot,
    from: { label: "Pre-settlement OLP share price", kind: "settlement_queue" },
    to: { label: "Redeeming LPs", kind: "retail_lp" },
    asset: "OLP redemption risk",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Because OLP price updates only at daily settlement, redemptions processed before the loss prints can shift more loss to remaining LPs.",
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
    ts: TS.probe - 1800,
    tag: "ORACLE",
    title: "Compromised oracle signer begins producing valid signed price reports",
    chain: "Arbitrum",
  },
  {
    ts: TS.probe,
    tag: "PROBE",
    title: "1,000 USDC probe returns about 8,986 USDC, proving the 8.99x loop works",
    chain: "Arbitrum",
  },
  {
    ts: TS.largestTx,
    tag: "DRAIN",
    title: "Largest known Arbitrum tx 0x359f...7e0 executes five loops and extracts about $11.86M",
    chain: "Arbitrum",
  },
  {
    ts: TS.loop1,
    tag: "DRAIN",
    title: "Attacker scales to 700,000 USDC collateral and pulls roughly 6.29M in one leg",
    chain: "Arbitrum",
  },
  {
    ts: TS.loop5 + 420,
    tag: "DRAIN",
    title: "Six large Arkham-visible OLP outflows total about 22.89M USDC inside one hour",
    chain: "Arbitrum",
  },
  {
    ts: TS.loop5 + 900,
    tag: "SWAP",
    title: "USDC begins moving through Kyber into ETH in roughly 3M clips",
    chain: "Arbitrum",
  },
  {
    ts: TS.snapshot,
    tag: "FANOUT",
    title: "ETH fanout begins across more than ten fresh wallets in roughly 1.9M chunks",
    chain: "Arbitrum",
  },
  {
    ts: TS.snapshot,
    tag: "SETTLEMENT-RISK",
    title: "OLP vault shows about 8.99M USDC left while share price may wait for daily settlement",
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
      "Ostium's OLP vault was drained through a compromised oracle signer path. The attacker bundled validly signed fabricated price reports with 100x trades in atomic calls, opened at one false mark, closed at another, and let the vault pay capped maximum profit. The largest known transaction packed five loops into one Arbitrum tx and pulled about $11.86M. The critical user-risk wrinkle is settlement timing: Ostium docs say OLP price updates only once daily, so redemptions before the post-drain settlement can push more loss onto users still in the vault.",
    loss_usd: 25_300_000,
    start_ts: TS.probe,
    pause_ts: TS.snapshot,
    chains_touched: ["Arbitrum"],
    stats: [
      {
        label: "Vault drawdown",
        value: "$25.3M",
        sub: "OLP USDC 34.3M -> 8.99M",
        accent: "text-rose-300",
      },
      {
        label: "Visible outflows",
        value: "$22.89M",
        sub: "six Arkham rows inside one hour",
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
