import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const X_ANALYSIS_SOURCE =
  "Not_A_De_Gen X analysis, Accountable dashboard, DefiLlama, and public HyperEVM contract trail"

function watch(
  address: string,
  label: string,
  role: string,
  notes: string
): TrackedWallet {
  return {
    address,
    chain: "hyperevm",
    label,
    role,
    confidence: "verified",
    sourceLabel: X_ANALYSIS_SOURCE,
    notes,
  }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "Confidence shock",
    ts: 1781919963,
    from: { label: "Mainstreet/MSY depeg fear", kind: "market_trigger" },
    to: { label: "Altura stablecoin vault depositors", kind: "liability_holders" },
    asset: "confidence",
    amount: null,
    usd: 0,
    chain: "HyperEVM",
    summary:
      "The MSY depeg created the initial fear. Altura said it had no Mainstreet exposure, but users began underwriting Altura's own liquidity stack.",
  },
  {
    step: 2,
    phase: "Instant redemptions",
    ts: 1782038773,
    from: { label: "Altura instant liquidity", kind: "vault_liquidity" },
    to: { label: "Redeeming users", kind: "depositors" },
    asset: "USDT",
    amount: 8_500_000,
    usd: 8_500_000,
    chain: "HyperEVM",
    summary:
      "Founder response cited more than 8.5M USDT in instant redemptions over 24 hours before the vault moved toward an orderly wind-down.",
  },
  {
    step: 3,
    phase: "Reserve composition",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "RWA, exchanges, custody, HyperEVM and Ethereum buckets", kind: "liquidity_stack" },
    asset: "reserve backing",
    amount: null,
    usd: 33_773_613,
    chain: "Multi-venue",
    summary:
      "Accountable showed reserve coverage above reported supply, but most backing sat outside instantly redeemable on-chain liquidity.",
  },
  {
    step: 4,
    phase: "Morpho bottleneck",
    ts: 1782075219,
    from: {
      label: "Alpha USDT Prime vault",
      kind: "lending_vault",
      address: "0x242572d6f1AF7111bcA807ECDd0f74108cEAeD5d",
    },
    to: {
      label: "Morpho adapter into AVLT-backed market",
      kind: "market_adapter",
      address: "0x4651f49F4AFB050e9B1cdB212d2655fF647C6f80",
    },
    asset: "USDT0",
    amount: 5_900_000,
    usd: 5_900_000,
    chain: "HyperEVM",
    summary:
      "The Alpha USDT Prime vault was described as having about 5.9M in assets but zero idle, zero liquid, and zero force-deallocatable liquidity.",
  },
  {
    step: 5,
    phase: "Collateral loop",
    ts: 1782075219,
    from: {
      label: "Morpho market supply",
      kind: "lending_market",
      address: "0x4651f49F4AFB050e9B1cdB212d2655fF647C6f80",
    },
    to: {
      label: "AVLT collateral contract",
      kind: "vault_token",
      address: "0xd0Ee0CF300DFB598270cd7F4D0c6E0D8F6e13f29",
    },
    asset: "AVLT collateral",
    amount: null,
    usd: 5_900_000,
    chain: "HyperEVM",
    summary:
      "The AVLT-backed market was reported at roughly 100% utilization and 91.5% LLTV, making normal exits dependent on repayments, new liquidity, reallocation, or external capital.",
  },
  {
    step: 6,
    phase: "Slow-redemption queue",
    ts: 1782075219,
    from: { label: "AVLT holders", kind: "claimants" },
    to: { label: "Altura withdrawal queue", kind: "redemption_queue" },
    asset: "AVLT",
    amount: 1_550_000,
    usd: 1_550_000,
    chain: "HyperEVM",
    summary:
      "Dium's queue scan was cited at 223 open withdrawal requests and about 1.55M AVLT still outstanding after net queue growth over roughly 72 hours.",
  },
]

const timeline: TimelineEvent[] = [
  {
    ts: 1781919963,
    tag: "TRIGGER",
    title: "MSY depeg fear pushes users to re-underwrite Altura liquidity",
    chain: "HyperEVM",
  },
  {
    ts: 1782038773,
    tag: "RUN",
    title: "Altura supply drops sharply as redemptions accelerate",
    chain: "HyperEVM",
  },
  {
    ts: 1782075219,
    tag: "BOTTLENECK",
    title: "Morpho AVLT-backed lending market reported at 0 idle liquidity and full utilization",
    chain: "HyperEVM",
  },
  {
    ts: 1782075219,
    tag: "QUEUE",
    title: "Slow-redemption queue shows 223 open requests and about 1.55M AVLT outstanding",
    chain: "HyperEVM",
  },
  {
    ts: 1782126100,
    tag: "WIND-DOWN",
    title: "Accountable shows reserve coverage above supply while Altura moves toward staged wind-down",
    chain: "HyperEVM",
  },
]

export const ALTURA_HYPEREVM_DATA: IncidentData = {
  incident: {
    id: "altura-hyperevm-2026-06",
    name: "Altura HyperEVM Vault Redemption Liquidity Crisis",
    victim: "Altura",
    attacker_attribution: "No confirmed attacker; liquidity run and asset-liability mismatch",
    root_cause:
      "Altura's HyperEVM vault was hit by a redemption-liquidity crisis after Mainstreet/MSY depeg fear pushed users to test instant exits. Public analysis and dashboard data point to an asset-liability maturity mismatch: user claims behaved like short-duration redeemable dollars, while reserves were spread across RWA exposure, exchange balances, custody, venue balances, and a fully utilized Morpho market tied to AVLT collateral.",
    loss_usd: 8_500_000,
    start_ts: 1782038773,
    pause_ts: 1782126100,
    chains_touched: ["HyperEVM", "Hyperliquid L1", "Ethereum"],
    stats: [
      {
        label: "Instant redeemed",
        value: "$8.5M+",
        sub: "processed over 24h before wind-down",
        accent: "text-rose-300",
      },
      {
        label: "Reserve coverage",
        value: "104%",
        sub: "$33.8M reserves / $32.4M supply",
        accent: "text-emerald-300",
      },
      {
        label: "Onchain HyperEVM",
        value: "$524k",
        sub: "reported liquid bucket vs total claims",
        accent: "text-sky-300",
      },
      {
        label: "Morpho liquidity",
        value: "0 idle",
        sub: "100% utilized AVLT-backed market",
        accent: "text-amber-300",
      },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    watch(
      "0x242572d6f1AF7111bcA807ECDd0f74108cEAeD5d",
      "Alpha USDT Prime vault",
      "protocol",
      "HyperEVM Morpho vault cited in public incident analysis as holding about 5.9M assets with zero idle liquidity."
    ),
    watch(
      "0x4651f49F4AFB050e9B1cdB212d2655fF647C6f80",
      "Morpho market adapter",
      "protocol",
      "Adapter cited as routing Alpha USDT Prime liquidity into the AVLT-backed lending market."
    ),
    watch(
      "0xd0Ee0CF300DFB598270cd7F4D0c6E0D8F6e13f29",
      "AVLT contract",
      "protocol",
      "AVLT contract connecting the withdrawal queue trail and Morpho collateral trail."
    ),
  ],
}
