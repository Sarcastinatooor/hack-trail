import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const RISEX_SOURCE =
  "RISEx official X statement posted 2026-08-03 18:47 UTC and RISE Mainnet Blockscout transaction 0xc52560bec154a3d5533a321bd9805305a5076194573ddb2fbb059059ace3e987"

const TS = {
  strategyDeployment: 1783900800,
  withdrawal: 1785741718,
  patched: 1785744540,
  statement: 1785782834,
}

const ADDRESSES = {
  caller: "0xAAb85f96FeB6DaAc1E171e7e4B0118B16f1BB66d",
  target: "0x04a7934245c9B804082e391Ee077c130d31B10a5",
  rwaStrategy: "0x2C03C7d7e2974C6599b6B108879109281ef3F818",
  usdc: "0xe436820ba0C69702c1d3E601d421c0eF38262739",
  firstExitVault: "0xdEc93a1d6dE0267d5cDF3b1342A49b105AE37EF8",
  secondExitVault: "0x776e385A599B71AF893f58B4b8f8a67A5d9d63e5",
  exitProxy: "0xA6FfE66379C34B85cd2Ff4B3c8A73D3dE7ABA043",
  usdcBurnAdapter: "0x82675d0553D802039e6776C006BEb1b820a69d55",
  vaultChildFactory: "0xD25B229cd704f38897F7Ae9f82e64001640BecA6",
}

const EXPLOIT_TX =
  "0xc52560bec154a3d5533a321bd9805305a5076194573ddb2fbb059059ace3e987"

function tracked(
  address: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified"
): TrackedWallet {
  return {
    address,
    chain: "rise",
    label,
    role,
    confidence,
    sourceLabel: RISEX_SOURCE,
    notes,
  }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "configuration",
    ts: TS.strategyDeployment,
    from: { label: "RWA strategy deployment", kind: "protocol" },
    to: { label: "RWA strategy source 0x2C03...1818", kind: "rwa_strategy", address: ADDRESSES.rwaStrategy },
    asset: "strategy configuration",
    amount: null,
    usd: 0,
    chain: "RISE",
    summary:
      "RISEx says the RWA strategy misconfiguration had been present since the strategy was deployed on July 13, 2026.",
  },
  {
    step: 2,
    phase: "withdrawal",
    ts: TS.withdrawal,
    from: { label: "RWA strategy source 0x2C03...1818", kind: "rwa_strategy", address: ADDRESSES.rwaStrategy },
    to: { label: "Recipient contract 0x04a7...10a5", kind: "attacker_contract", address: ADDRESSES.target },
    asset: "USDC.e",
    amount: 673_011.565895,
    usd: 673_011.565895,
    chain: "RISE",
    summary:
      "The RISE explorer shows 673,011.565895 Bridged USDC moving from the apparent RWA strategy source contract to the transaction target at 07:21:58 UTC.",
  },
  {
    step: 3,
    phase: "exit-split",
    ts: TS.withdrawal,
    from: { label: "Recipient contract 0x04a7...10a5", kind: "attacker_contract", address: ADDRESSES.target },
    to: { label: "RiseVault exit leg A", kind: "rise_vault", address: ADDRESSES.firstExitVault },
    asset: "USDC.e",
    amount: 350_000,
    usd: 350_000,
    chain: "RISE",
    summary:
      "The recipient contract split 350,000 USDC.e into a newly created RiseVault exit route in the same transaction.",
  },
  {
    step: 4,
    phase: "bridge-burn",
    ts: TS.withdrawal,
    from: { label: "RiseVault exit leg A", kind: "rise_vault", address: ADDRESSES.firstExitVault },
    to: { label: "USDC bridge burn adapter", kind: "usdc_adapter", address: ADDRESSES.usdcBurnAdapter },
    asset: "USDC.e burn route",
    amount: 349_999,
    usd: 349_999,
    chain: "RISE",
    summary:
      "The first exit leg routed 349,999 USDC.e through the verified USDCMintBurnAdapter and then burned it, with 1 USDC.e left as a small intermediate transfer.",
  },
  {
    step: 5,
    phase: "exit-split",
    ts: TS.withdrawal,
    from: { label: "Recipient contract 0x04a7...10a5", kind: "attacker_contract", address: ADDRESSES.target },
    to: { label: "RiseVault exit leg B", kind: "rise_vault", address: ADDRESSES.secondExitVault },
    asset: "USDC.e",
    amount: 323_011.565895,
    usd: 323_011.565895,
    chain: "RISE",
    summary:
      "The remaining 323,011.565895 USDC.e was sent into a second newly created RiseVault exit route in the same transaction.",
  },
  {
    step: 6,
    phase: "bridge-burn",
    ts: TS.withdrawal,
    from: { label: "RiseVault exit leg B", kind: "rise_vault", address: ADDRESSES.secondExitVault },
    to: { label: "USDC bridge burn adapter", kind: "usdc_adapter", address: ADDRESSES.usdcBurnAdapter },
    asset: "USDC.e burn route",
    amount: 323_010.565895,
    usd: 323_010.565895,
    chain: "RISE",
    summary:
      "The second exit leg also routed through the USDCMintBurnAdapter and burned 323,010.565895 USDC.e.",
  },
  {
    step: 7,
    phase: "response",
    ts: TS.patched,
    from: { label: "RISEx responders", kind: "response" },
    to: { label: "RWA strategy configuration", kind: "protocol_guardrail" },
    asset: "patch",
    amount: null,
    usd: 0,
    chain: "RISE",
    summary:
      "RISEx says it detected the issue within minutes and patched the misconfiguration by 08:09 UTC.",
  },
  {
    step: 8,
    phase: "coverage",
    ts: TS.statement,
    from: { label: "July RISEx fee reserve", kind: "fee_reserve" },
    to: { label: "XLP depositors", kind: "xlp_depositors" },
    asset: "coverage",
    amount: 673_011.56,
    usd: 673_011.56,
    chain: "RISE",
    summary:
      "RISEx says XLP depositors were made whole and the full amount was covered using a portion of fees generated in July.",
  },
  {
    step: 9,
    phase: "tracing",
    ts: TS.statement,
    from: { label: "RISEx incident response", kind: "response" },
    to: { label: "SEAL 911 tracing", kind: "seal911" },
    asset: "investigation",
    amount: null,
    usd: 0,
    chain: "RISE",
    summary:
      "RISEx says SEAL 911 was engaged, tracing was underway, and the team was attempting contact with the involved address about returning funds.",
  },
]

const timeline: TimelineEvent[] = [
  {
    ts: TS.strategyDeployment,
    tag: "CONFIG",
    title: "RISEx says the affected RWA strategy misconfiguration had been present since deployment on July 13",
    chain: "RISE",
  },
  {
    ts: TS.withdrawal,
    tag: "WITHDRAWAL",
    title: "Unauthorized withdrawal transaction moved 673,011.565895 USDC.e from the apparent RWA strategy source",
    chain: "RISE",
  },
  {
    ts: TS.withdrawal,
    tag: "BRIDGE-OUT",
    title: "The same transaction split the funds into two RiseVault exit legs and routed USDC.e through burn adapter paths",
    chain: "RISE",
  },
  {
    ts: TS.patched,
    tag: "PATCH",
    title: "RISEx says the issue was patched by 08:09 UTC, about 47 minutes after the withdrawal transaction",
    chain: "RISE",
  },
  {
    ts: TS.statement,
    tag: "REVIEW",
    title: "RISEx says it reviewed every transaction and deployment and found no other unauthorized withdrawals in the period",
    chain: "RISE",
  },
  {
    ts: TS.statement,
    tag: "COVERAGE",
    title: "RISEx says XLP depositors were made whole using a portion of July fees and that depositor funds were not affected",
    chain: "RISE",
  },
  {
    ts: TS.statement,
    tag: "SEAL911",
    title: "RISEx says SEAL 911 was engaged and tracing was underway",
    chain: "RISE",
  },
  {
    ts: TS.statement,
    tag: "SCAM-WARNING",
    title: "RISEx warned users there is no recovery form or claim process and not to connect wallets to incident links",
    chain: "RISE",
  },
]

export const RISEX_XLP_DATA: IncidentData = {
  incident: {
    id: "risex-xlp-2026-08",
    name: "RISEx XLP RWA Strategy Unauthorized Withdrawal",
    victim: "RISEx XLP Vault",
    attacker_attribution: "Unknown actor; RISEx says SEAL 911 tracing is underway",
    root_cause:
      "RISEx disclosed that an unauthorized withdrawal hit the RWA strategy associated with the XLP vault at 2026-08-03 07:21 UTC. The team attributed the 673,011.56 USDC withdrawal to a strategy misconfiguration present since July 13, not to a novel attack or dependency failure. RISE explorer data for the cited transaction shows 673,011.565895 USDC.e moving from the apparent RWA strategy source contract 0x2C03...1818 to recipient contract 0x04a7...10a5, then splitting through two RiseVault exit legs and USDC burn-adapter routes. RISEx says it detected the issue within minutes, patched it by 08:09 UTC, covered the full amount from July fees, and found no equivalent issue across other XLP strategies.",
    loss_usd: 673_011.56,
    start_ts: TS.withdrawal,
    pause_ts: TS.patched,
    chains_touched: ["RISE"],
    stats: [
      {
        label: "Unauthorized withdrawal",
        value: "$673.0k",
        sub: "USDC.e on RISE",
        accent: "text-rose-300",
      },
      {
        label: "Patch window",
        value: "47m",
        sub: "07:21 to 08:09 UTC",
        accent: "text-sky-300",
      },
      {
        label: "Depositor impact",
        value: "Made whole",
        sub: "covered from July fees",
        accent: "text-emerald-300",
      },
      {
        label: "Scope review",
        value: "1 tx",
        sub: "only unauthorized withdrawal found",
        accent: "text-amber-300",
      },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(
      ADDRESSES.rwaStrategy,
      "Apparent RWA strategy source",
      "victim",
      `Source contract for the 673,011.565895 USDC.e transfer in RISE transaction ${EXPLOIT_TX}. The explorer marks it as an unverified EIP-1967 proxy.`
    ),
    tracked(
      ADDRESSES.target,
      "Recipient contract 0x04a7...10a5",
      "attacker",
      "Contract created by the transaction caller and target of the transaction; it received the 673,011.565895 USDC.e withdrawal and split the funds into two exit legs."
    ),
    tracked(
      ADDRESSES.caller,
      "Transaction caller 0xAAb8...B66d",
      "attacker",
      "EOA that created the recipient contract and submitted the cited unauthorized withdrawal transaction."
    ),
    tracked(
      ADDRESSES.firstExitVault,
      "RiseVault exit leg A",
      "exit-route",
      "Newly created RiseVault contract that received the 350,000 USDC.e exit leg.",
      "curated"
    ),
    tracked(
      ADDRESSES.secondExitVault,
      "RiseVault exit leg B",
      "exit-route",
      "Newly created RiseVault contract that received the 323,011.565895 USDC.e exit leg.",
      "curated"
    ),
    tracked(
      ADDRESSES.usdcBurnAdapter,
      "USDCMintBurnAdapter",
      "infrastructure",
      "Verified RISE bridge/mint-burn adapter used by both exit legs. Infrastructure address, not necessarily attacker-controlled.",
      "curated"
    ),
    tracked(
      ADDRESSES.usdc,
      "Bridged USDC.e token",
      "token",
      "Bridged USDC token transferred in the unauthorized withdrawal.",
      "curated"
    ),
    tracked(
      ADDRESSES.vaultChildFactory,
      "VaultChildFactory",
      "infrastructure",
      "Verified factory that created the two RiseVault exit contracts inside the transaction. Infrastructure address, not necessarily attacker-controlled.",
      "curated"
    ),
  ],
}
