import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const X_ANALYSIS_SOURCE =
  "Not_A_De_Gen X analysis, Accountable dashboard, DefiLlama, and public HyperEVM contract trail"

const RESERVES = {
  inessaRwa: 21_915_859.79,
  okx: 9_618_772.04,
  cobo: 1_271_123.02,
  hyperevm: 524_731.56,
  ethereum: 341_170.97,
  tauri: 101_622.19,
  hyperliquid: 333.64,
}

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
    phase: "upstream-depeg",
    ts: 1781740800,
    from: { label: "Mainstreet / MSY synthetic dollar", kind: "market_trigger" },
    to: { label: "HyperEVM stable vault confidence", kind: "confidence" },
    asset: "TVL drawdown signal",
    amount: null,
    usd: 7_861_521,
    chain: "Ethereum",
    summary:
      "Mainstreet TVL fell from about $82.0M on June 16 to about $74.2M by June 21-22, creating the upstream fear that pushed users to examine unrelated stable-vault liquidity.",
  },
  {
    step: 2,
    phase: "exposure-denial",
    ts: 1781919963,
    from: { label: "Altura founder response", kind: "response" },
    to: { label: "Altura depositors", kind: "liability_holders" },
    asset: "Mainstreet exposure",
    amount: null,
    usd: 0,
    chain: "HyperEVM",
    summary:
      "Altura stated it had no Mainstreet exposure, but user concern shifted from direct exposure to whether Altura itself had enough same-day liquidity for mass exits.",
  },
  {
    step: 3,
    phase: "liability-run",
    ts: 1782038773,
    from: { label: "Altura redeemable supply", kind: "liability" },
    to: { label: "Redeeming users", kind: "depositors" },
    asset: "USDT",
    amount: 8_500_000,
    usd: 8_500_000,
    chain: "HyperEVM",
    summary:
      "Founder response cited more than 8.5M USDT in instant redemptions over 24 hours before the vault moved toward an orderly wind-down.",
  },
  {
    step: 4,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "Inessa RWA", kind: "rwa" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.inessaRwa,
    chain: "Offchain",
    summary:
      "Accountable's largest reserve bucket was Inessa RWA. The dashboard caveat says this does not independently verify asset-level existence, custody, segregation, valuation or backing.",
  },
  {
    step: 5,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "OKX venue balance", kind: "exchange" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.okx,
    chain: "Offchain",
    summary:
      "A large share of reserves sat as exchange or venue balance, which can exist but is not the same as instant on-chain redemption capacity during a run.",
  },
  {
    step: 6,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "Cobo custody balance", kind: "custody" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.cobo,
    chain: "Offchain",
    summary:
      "Custody balances depend on operational movement and settlement timing, making them slower than idle liquidity inside a redemption contract.",
  },
  {
    step: 7,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "HyperEVM on-chain reserve", kind: "onchain_liquidity" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.hyperevm,
    chain: "HyperEVM",
    summary:
      "Accountable showed only about $525k in the HyperEVM bucket at the snapshot, small relative to $32M+ supply and the redemption wave.",
  },
  {
    step: 8,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "Ethereum on-chain reserve", kind: "onchain_liquidity" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.ethereum,
    chain: "Ethereum",
    summary:
      "Ethereum on-chain reserves were present, but also much smaller than total outstanding claims.",
  },
  {
    step: 9,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "Tauri Vault", kind: "vault" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.tauri,
    chain: "HyperEVM",
    summary:
      "Tauri Vault was a small remaining DeFi bucket in the Accountable reserve split.",
  },
  {
    step: 10,
    phase: "reserve-bucket",
    ts: 1782126100,
    from: { label: "Altura reserves", kind: "reported_reserves" },
    to: { label: "Hyperliquid venue balance", kind: "exchange" },
    asset: "reported reserves",
    amount: null,
    usd: RESERVES.hyperliquid,
    chain: "Hyperliquid L1",
    summary:
      "The remaining Hyperliquid bucket was tiny by the dashboard snapshot, but it is still part of the full reserve map.",
  },
  {
    step: 11,
    phase: "morpho-bottleneck",
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
      "The Alpha USDT Prime vault was described as holding about $5.9M while showing zero idle, zero liquid, and zero force-deallocatable liquidity.",
  },
  {
    step: 12,
    phase: "collateral-loop",
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
    step: 13,
    phase: "queue-growth",
    ts: 1782075219,
    from: { label: "AVLT holders", kind: "claimants" },
    to: { label: "AVLT queued over 72h", kind: "redemption_queue" },
    asset: "AVLT",
    amount: 2_910_000,
    usd: 2_910_000,
    chain: "HyperEVM",
    summary:
      "Dium's queue scan was cited at 2.91M AVLT queued over roughly 72 hours, showing how the slow-redemption path became the visible exit line.",
  },
  {
    step: 14,
    phase: "queue-claims",
    ts: 1782075219,
    from: { label: "AVLT queued over 72h", kind: "redemption_queue" },
    to: { label: "Claimed redemptions", kind: "depositors" },
    asset: "AVLT",
    amount: 1_310_000,
    usd: 1_310_000,
    chain: "HyperEVM",
    summary:
      "The same queue scan showed about 1.31M AVLT claimed, meaning some redemptions were moving while the queue kept growing.",
  },
  {
    step: 15,
    phase: "queue-outstanding",
    ts: 1782075219,
    from: { label: "AVLT queued over 72h", kind: "redemption_queue" },
    to: { label: "Outstanding withdrawal queue", kind: "redemption_queue" },
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
    ts: 1781740800,
    tag: "TRIGGER",
    title: "Mainstreet/MSY depeg fear begins upstream confidence shock",
    chain: "Ethereum",
  },
  {
    ts: 1781919963,
    tag: "RESPONSE",
    title: "Altura says it has no Mainstreet exposure, but users start testing Altura's own liquidity stack",
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
    title: "Alpha USDT Prime and AVLT-backed Morpho market reported at 0 idle liquidity and full utilization",
    chain: "HyperEVM",
  },
  {
    ts: 1782075219,
    tag: "QUEUE",
    title: "Slow-redemption queue shows 2.91M queued, 223 open requests and about 1.55M AVLT outstanding",
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
      "Altura's HyperEVM vault was hit by a redemption-liquidity crisis after Mainstreet/MSY depeg fear pushed users to test instant exits. The full incident chain is not a single exploit: Mainstreet/MSY created the upstream confidence shock, Altura denied direct exposure, users then underwrote Altura's own liquidity stack, Accountable showed reserve coverage but most reserves sat in RWA, exchange, custody and venue buckets, the HyperEVM Morpho/AVLT path showed zero idle liquidity, and the slow-redemption queue added another pending withdrawal layer on top of the $8.5M+ already processed.",
    loss_usd: 10_050_000,
    start_ts: 1782038773,
    pause_ts: 1782126100,
    chains_touched: ["HyperEVM", "Hyperliquid L1", "Ethereum"],
    stats: [
      {
        label: "Exit pressure",
        value: "$10.05M+",
        sub: "$8.5M instant + 1.55M AVLT pending",
        accent: "text-rose-300",
      },
      {
        label: "Reserve coverage",
        value: "104%",
        sub: "$33.8M reserves / $32.4M supply",
        accent: "text-emerald-300",
      },
      {
        label: "Pending queue",
        value: "1.55M AVLT",
        sub: "223 open withdrawal requests",
        accent: "text-amber-300",
      },
      {
        label: "Immediate bucket",
        value: "$524k",
        sub: "HyperEVM reserve at dashboard snapshot",
        accent: "text-sky-300",
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
      "HyperEVM Morpho vault cited in public incident analysis as holding about $5.9M with zero idle liquidity."
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
