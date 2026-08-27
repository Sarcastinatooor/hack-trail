import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const SOURCE =
  "Base transaction logs, Moonwell's public position API, Moonwell governance proposals MIP-B48 and MIP-X43, and official Moonwell contract documentation"

const TS = {
  firstSupply: 1787814251,
  largeSupply: 1787819265,
  firstBorrow: 1787820193,
  finalSupply: 1787821979,
  borrowEscalation: 1787822179,
  finalBorrow: 1787823013,
  firstLiquidation: 1787823045,
  finalLiquidation: 1787823985,
  snapshot: 1787825130,
}

const ADDRESSES = {
  attacker: "0x719eae70d4a83f35bf82a2740699f5db84be919d",
  collateralSource: "0xd71dd9b6e634412713c47fe7ae02c628e338c384",
  mMamo: "0x2F90Bb22eB3979f5FfAd31EA6C3F0792ca66dA32",
  mCbBtc: "0xF877ACaFA28c19b96727966690b2f44d35aD5976",
  mUsdc: "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22",
  mWstEth: "0x627Fe393Bc6EdDA28e99AE648fD6fF362514304b",
  mWeth: "0x628ff693426583D9a7FB391E54366292F509D457",
  mamo: "0x7300B37DfdfAb110d83290A29DfB31B1740219fE",
  oevWrapper: "0xDBD37C274A70A8A3f92A227c843a6a8d3203afe6",
  rawFeed: "0xeF7541b388a77C1709a3d44BfBfC5c1ED3F0Ac94",
  oracle: "0xEC942bE8A8114bFD0396A5052c36027f2cA6a9d0",
  comptroller: "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C",
}

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified"
): TrackedWallet {
  return { address, chain: "base", label, role, notes, confidence, sourceLabel: SOURCE }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "collateral-staging",
    ts: TS.firstSupply,
    from: { label: "MAMO staging wallets / DEX liquidity", kind: "market_trigger" },
    to: { label: "Borrower 0x719e...919d", kind: "attacker", address: ADDRESSES.attacker },
    asset: "15,089,595.23 MAMO accumulated",
    amount: 15_089_595.23,
    usd: 159_056,
    chain: "Base",
    summary:
      "The borrower assembled 15.09M MAMO. Two direct transfers from 0xd71d...c384 supplied 7.99M; high-gas self-calls then bought MAMO across many Base liquidity venues.",
  },
  {
    step: 2,
    phase: "collateral-supply",
    ts: TS.finalSupply,
    from: { label: "Borrower 0x719e...919d", kind: "attacker", address: ADDRESSES.attacker },
    to: { label: "Moonwell mMAMO market", kind: "lending_market", address: ADDRESSES.mMamo },
    asset: "15,089,595.23 MAMO collateral",
    amount: 15_089_595.23,
    usd: 159_056,
    chain: "Base",
    summary:
      "Three verified mint transactions supplied 99,986.92, 7,889,608.31, and 7,100,000 MAMO to Moonwell.",
  },
  {
    step: 3,
    phase: "oracle-manipulation",
    ts: TS.borrowEscalation,
    from: { label: "Thin MAMO liquidity", kind: "market_trigger" },
    to: { label: "MAMO/USD oracle path", kind: "oracle_signer", address: ADDRESSES.oevWrapper },
    asset: "$0.0105 to $0.4025 reported MAMO price",
    amount: null,
    usd: 0,
    chain: "Base",
    summary:
      "Historical Moonwell oracle reads show MAMO rising about 38.2x, from $0.010541 to a $0.402486 peak, before collapsing after the borrow sequence.",
  },
  {
    step: 4,
    phase: "over-borrow",
    ts: TS.finalBorrow,
    from: { label: "Moonwell supplier liquidity", kind: "lending" },
    to: { label: "Borrower 0x719e...919d", kind: "attacker", address: ADDRESSES.attacker },
    asset: "cbBTC + USDC + wstETH + WETH",
    amount: null,
    usd: 9_193_113.52,
    chain: "Base",
    summary:
      "The account borrowed 71.3555 cbBTC, 2.56M USDC, 368 wstETH, and 623.6003 WETH while the manipulated collateral valuation climbed.",
  },
  {
    step: 5,
    phase: "liquidation-race",
    ts: TS.firstLiquidation,
    from: { label: "Liquidation bots and OEV wrapper", kind: "response" },
    to: { label: "Moonwell debt markets", kind: "lending_market" },
    asset: "595 liquidation calls",
    amount: 595,
    usd: 0,
    chain: "Base",
    summary:
      "Between 09:30:45 and 09:46:25 UTC, 595 verified LiquidateBorrow events repaid part of the four debts and seized effectively all mMAMO collateral.",
  },
  {
    step: 6,
    phase: "bad-debt",
    ts: TS.snapshot,
    from: { label: "Moonwell debt markets", kind: "liability" },
    to: { label: "Protocol bad debt", kind: "liability_holders" },
    asset: "$9.193M residual borrow",
    amount: null,
    usd: 9_193_113.52,
    chain: "Base",
    summary:
      "Moonwell's API snapshot showed $9.193M borrowed against $0.051 of remaining collateral and a health factor near 5.57e-9.",
  },
]

const timeline: TimelineEvent[] = [
  { ts: TS.firstSupply, tag: "COLLATERAL", title: "First 99,986.92 MAMO is supplied to Moonwell", chain: "Base" },
  { ts: TS.largeSupply, tag: "COLLATERAL", title: "A second mint supplies 7.8896M MAMO", chain: "Base" },
  { ts: TS.firstBorrow, tag: "BORROW", title: "The first 0.5007 cbBTC probe borrow succeeds", chain: "Base" },
  { ts: TS.finalSupply, tag: "COLLATERAL", title: "Another 7.10M MAMO brings total supplied collateral to 15.0896M", chain: "Base" },
  { ts: TS.borrowEscalation, tag: "ORACLE", title: "MAMO oracle price accelerates upward as cbBTC borrows scale", chain: "Base" },
  { ts: TS.finalBorrow, tag: "BORROW", title: "Final 990,000 USDC borrow completes the four-asset extraction", chain: "Base" },
  { ts: TS.firstLiquidation, tag: "LIQUIDATION", title: "Liquidators begin repaying debt and seizing mMAMO 32 seconds later", chain: "Base" },
  { ts: TS.finalLiquidation, tag: "BAD-DEBT", title: "595 liquidation calls end with effectively no collateral left", chain: "Base" },
  { ts: TS.snapshot, tag: "SNAPSHOT", title: "Moonwell API records $9.193M borrowed against $0.051 collateral", chain: "Base" },
]

export const MOONWELL_MAMO_DATA: IncidentData = {
  incident: {
    id: "moonwell-mamo-2026-08",
    name: "Moonwell MAMO Oracle Manipulation Bad Debt",
    victim: "Moonwell",
    attacker_attribution: "Unknown operator; Base borrower 0x719e...919d",
    root_cause:
      "Onchain evidence shows a borrower supplied 15.09M MAMO into Moonwell while aggressively buying the thin-liquidity token across Base venues. Moonwell's MAMO/USD oracle path followed the market from about $0.0105 to $0.4025, temporarily inflating collateral value about 38.2x. The account borrowed cbBTC, USDC, wstETH, and WETH before the price collapsed. Liquidators seized nearly all collateral but could repay only part of the debt. This is confirmed oracle-market manipulation; no evidence indicates that Chainlink signing keys or Moonwell contracts were compromised. An official postmortem has not yet been published.",
    loss_usd: 9_193_113.52,
    start_ts: TS.firstSupply,
    pause_ts: TS.finalLiquidation,
    chains_touched: ["Base"],
    stats: [
      { label: "Residual bad debt", value: "$9.19M", sub: "Moonwell API at 10:05 UTC", accent: "text-rose-300" },
      { label: "MAMO supplied", value: "15.09M", sub: "three verified deposits", accent: "text-amber-300" },
      { label: "Oracle spike", value: "38.2x", sub: "$0.0105 -> $0.4025", accent: "text-sky-300" },
      { label: "Liquidations", value: "595", sub: "09:30:45-09:46:25 UTC", accent: "text-emerald-300" },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(ADDRESSES.attacker, "Borrower / exploiter", "attacker", "Supplied 15.09M MAMO and borrowed four liquid assets during the oracle spike."),
    tracked(ADDRESSES.collateralSource, "MAMO staging source", "funding", "Sent 100,000 and 7,889,608.31 MAMO directly to the borrower before the large Moonwell supplies.", "curated"),
    tracked(ADDRESSES.mMamo, "Moonwell mMAMO market", "victim-market", "Collateral market used in the manipulation. Protocol infrastructure, not attacker-controlled."),
    tracked(ADDRESSES.mCbBtc, "Moonwell mcbBTC market", "victim-market", "Source of the cbBTC borrow and subsequent liquidations."),
    tracked(ADDRESSES.mUsdc, "Moonwell mUSDC market", "victim-market", "Source of the USDC borrow and subsequent liquidations."),
    tracked(ADDRESSES.mWstEth, "Moonwell mwstETH market", "victim-market", "Source of the wstETH borrow and subsequent liquidations."),
    tracked(ADDRESSES.mWeth, "Moonwell mWETH market", "victim-market", "Source of the WETH borrow and subsequent liquidations."),
    tracked(ADDRESSES.mamo, "MAMO token", "token", "Underlying collateral token; monitor interactions for exposure context, not as a malicious address.", "curated"),
    tracked(ADDRESSES.oevWrapper, "MAMO OEV oracle wrapper", "infrastructure", "Official Moonwell MAMO/USD OEV wrapper. It also appears as a liquidator in verified logs; not attacker-controlled.", "curated"),
    tracked(ADDRESSES.rawFeed, "Chainlink MAMO/USD feed", "infrastructure", "Underlying MAMO/USD feed registered by Moonwell. No signer compromise is currently indicated.", "curated"),
    tracked(ADDRESSES.oracle, "Moonwell ChainlinkOracle", "infrastructure", "Protocol oracle contract that maps Moonwell markets to feeds.", "curated"),
    tracked(ADDRESSES.comptroller, "Moonwell Comptroller", "infrastructure", "Core risk and collateral controller for Moonwell Base markets.", "curated"),
  ],
}
