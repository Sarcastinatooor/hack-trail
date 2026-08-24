import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const KII_SOURCE =
  "KiiChain official security postmortem published 2026-08-24, KiiChain EVM RPC state at halted block 9,355,723, and verified BNB Chain KII transfer logs"

const TS = {
  firstBridgeMint: 1787431685,
  kucoinDeposit: 1787436674,
  referenceExploit: 1787437603,
  finalBridgeMint: 1787437651,
  chainHalt: 1787439058,
  containmentNotice: 1787458155,
  postmortem: 1787540129,
}

const ADDRESSES = {
  primaryAttacker: "0x0e7a96227fcf09f53d644ba6462d8c73993ef246",
  secondaryAttacker: "0x631dc2c664ed6dc291b08b35382b807a61b1cd35",
  helperA: "0x8f37701914d60cee95ccaa39af959561045cf9e8",
  helperB: "0x77308955c6cbc4cdef2e53defc7d78a007f29739",
  helperC: "0x8cdab0fa359ac467c80c19de3fee5a543e258365",
  referenceTarget: "0x424bd2ca539b0e088b033db0233c74aaa82c2501",
  kiiTokenBsc: "0xEEC6574eAbBa52bac3f0277F2cD5Ac7e67197886",
  pancakeInfinityVault: "0x238a358808379702088667322f80aC48bAd5e6c4",
  kucoinDeposit: "0x4dc97f8b986a1f826c7196e3d413a8fe38a2fcf4",
}

const REFERENCE_EXPLOIT_TX =
  "0xf45c07e94a4d4474220c96b1fff5f798bf22f4a4adf159d8f3e28c52caf1e840"
const KUCOIN_DEPOSIT_TX =
  "0x052f022d803294c2fd5dddc3b09a5812f76d6f15193e30659a930c3b455ee748"

function tracked(
  address: string,
  chain: string,
  label: string,
  role: string,
  notes: string,
  confidence: TrackedWallet["confidence"] = "verified"
): TrackedWallet {
  return {
    address,
    chain,
    label,
    role,
    confidence,
    sourceLabel: KII_SOURCE,
    notes,
  }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "vesting-setup",
    ts: TS.firstBridgeMint - 600,
    from: { label: "Precomputed EVM address", kind: "vesting_account" },
    to: { label: "Vesting-backed helper contracts", kind: "helper_contract" },
    asset: "contract / vesting state setup",
    amount: null,
    usd: 0,
    chain: "KiiChain",
    summary:
      "KiiChain says the attacker precomputed contract addresses, created vesting-account state at those addresses, and then deployed the exploit helpers there.",
  },
  {
    step: 2,
    phase: "balance-underflow",
    ts: TS.referenceExploit,
    from: { label: "KiiChain victim balances", kind: "victim_wallets" },
    to: {
      label: "Attacker and helper cluster",
      kind: "attacker",
      address: ADDRESSES.primaryAttacker,
    },
    asset: "148.326M KII drained; USD weight uses realized proceeds",
    amount: 148_326_583.15,
    usd: 1_607_323.41,
    chain: "KiiChain",
    summary:
      "The official report records 18 exploit repetitions draining 148,326,583.15 KII. It says the staking-precompile write-back underflow was combined with two additional Cosmos-EVM defects; this was not an infinite mint.",
  },
  {
    step: 3,
    phase: "recovery-freeze",
    ts: TS.chainHalt,
    from: { label: "Attacker and helper cluster", kind: "attacker" },
    to: { label: "Frozen on KiiChain", kind: "frozen" },
    asset: "80.729M KII",
    amount: 80_728_575.05611624,
    usd: 0,
    chain: "KiiChain",
    summary:
      "Balances at the halted chain state sum to 80,728,575.056116 KII across the five addresses named in KiiChain's recovery blocklist, matching the postmortem's 54.4% recoverable figure.",
  },
  {
    step: 4,
    phase: "bridge-mint",
    ts: TS.finalBridgeMint,
    from: { label: "Attacker and helper cluster", kind: "attacker" },
    to: {
      label: "BSC attacker 0x0e7a...f246",
      kind: "hyperlane",
      address: ADDRESSES.primaryAttacker,
    },
    asset: "67.598M KII in 10 Hyperlane mints",
    amount: 67_597_997.86624438,
    usd: 1_607_323.41,
    chain: "KiiChain -> BNB Chain",
    summary:
      "Ten verified KII mint transfers landed on the same BSC attacker address between 20:48:05 and 22:27:31 UTC, summing exactly to the amount KiiChain reported bridged out.",
  },
  {
    step: 5,
    phase: "dex-liquidation",
    ts: TS.finalBridgeMint + 1,
    from: {
      label: "BSC attacker 0x0e7a...f246",
      kind: "hyperlane",
      address: ADDRESSES.primaryAttacker,
    },
    to: {
      label: "PancakeSwap Infinity Vault",
      kind: "pancake_vault",
      address: ADDRESSES.pancakeInfinityVault,
    },
    asset: "64.598M KII sold for about 1.61M BUSD",
    amount: 64_597_997.87,
    usd: 1_607_323.41,
    chain: "BNB Chain",
    summary:
      "KiiChain reports that 64,597,997.87 KII was sold through the PancakeSwap BSC-USD/KII route, realizing about 1.61M BUSD.",
  },
  {
    step: 6,
    phase: "exchange-deposit",
    ts: TS.kucoinDeposit,
    from: {
      label: "BSC attacker 0x0e7a...f246",
      kind: "attacker",
      address: ADDRESSES.primaryAttacker,
    },
    to: {
      label: "KuCoin deposit 0x4dc9...fcf4",
      kind: "kucoin_deposit",
      address: ADDRESSES.kucoinDeposit,
    },
    asset: "3.000M KII; freeze pending in postmortem",
    amount: 3_000_000,
    usd: 0,
    chain: "BNB Chain",
    summary:
      `Transaction ${KUCOIN_DEPOSIT_TX} transferred exactly 3,000,000 KII to the exchange deposit address. KiiChain said freeze confirmation was still pending when its report was published.`,
  },
  {
    step: 7,
    phase: "chain-halt",
    ts: TS.chainHalt,
    from: { label: "KiiChain validators", kind: "response" },
    to: { label: "Halted block 9,355,723", kind: "recovery_wallets" },
    asset: "network containment",
    amount: null,
    usd: 0,
    chain: "KiiChain",
    summary:
      "Validators halted KiiChain at 22:50:58 UTC. The restart plan includes patched Cosmos-EVM logic, recovery state migration, an x/bank blocklist, and a 10M KII per 24-hour Hyperlane limit.",
  },
]

const timeline: TimelineEvent[] = [
  {
    ts: TS.firstBridgeMint,
    tag: "BRIDGE",
    title: "First of ten verified Hyperlane KII mints reaches the BSC attacker address",
    chain: "BNB Chain",
  },
  {
    ts: TS.kucoinDeposit,
    tag: "EXCHANGE",
    title: "Exactly 3M KII is transferred to the identified KuCoin deposit address",
    chain: "BNB Chain",
  },
  {
    ts: TS.referenceExploit,
    tag: "EXPLOIT",
    title: "Reference sweep transaction executes against a KiiChain target; KiiChain's report labels the same hash five blocks earlier",
    chain: "KiiChain",
  },
  {
    ts: TS.finalBridgeMint,
    tag: "BRIDGE",
    title: "Final 45M KII mint raises the verified BSC total to 67,597,997.866244 KII",
    chain: "BNB Chain",
  },
  {
    ts: TS.chainHalt,
    tag: "FREEZE",
    title: "KiiChain halts at block 9,355,723 with 80,728,575.06 KII still frozen on-chain",
    chain: "KiiChain",
  },
  {
    ts: TS.containmentNotice,
    tag: "DISCLOSURE",
    title: "KiiChain confirms the Cosmos-EVM-origin vulnerability is contained and other supported networks are unaffected",
    chain: "KiiChain",
  },
  {
    ts: TS.postmortem,
    tag: "RECOVERY",
    title: "Official postmortem publishes the 18-round accounting, five-address blocklist, and coordinated restart plan",
    chain: "KiiChain",
  },
]

export const KIICHAIN_COSMOS_EVM_DATA: IncidentData = {
  incident: {
    id: "kiichain-cosmos-evm-2026-08",
    name: "KiiChain Cosmos-EVM Vesting Underflow Exploit",
    victim: "KiiChain",
    attacker_attribution:
      "Unknown operator; KiiChain links the exploit class to the same-week MANTRA and TAC incidents",
    root_cause:
      "KiiChain's postmortem attributes the drain to a chain of at least three upstream Cosmos-EVM defects. The attacker precomputed an EVM contract address, caused vesting-account state to exist there, deployed helper code at the same address, and delegated one wei more than the spendable balance. A staking-precompile write-back underflow inflated the EVM balance mirror toward 2^256; two additional undisclosed bugs then let the helpers extract real balances from targeted accounts. The attack was repeated 18 times and did not create unbacked KII: each drain remained capped by a victim's real balance.",
    loss_usd: 1_607_323.41,
    start_ts: TS.firstBridgeMint,
    pause_ts: TS.chainHalt,
    chains_touched: ["KiiChain", "BNB Chain"],
    stats: [
      {
        label: "Total drained",
        value: "148.33M KII",
        sub: "18 exploit rounds",
        accent: "text-rose-300",
      },
      {
        label: "Frozen / recoverable",
        value: "80.73M KII",
        sub: "54.4% verified at halt",
        accent: "text-emerald-300",
      },
      {
        label: "Bridged to BSC",
        value: "67.60M KII",
        sub: "10 exact Hyperlane mints",
        accent: "text-sky-300",
      },
      {
        label: "Realized proceeds",
        value: "~$1.61M",
        sub: "BUSD; 3M KII freeze pending",
        accent: "text-amber-300",
      },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(
      ADDRESSES.primaryAttacker,
      "kiichain",
      "Primary attacker wallet",
      "attacker",
      "Officially named attacker wallet. Its halted KiiChain balance is 110.078276992939146226 KII; it is also the recipient of all ten verified BSC bridge mints."
    ),
    tracked(
      ADDRESSES.secondaryAttacker,
      "kiichain",
      "Secondary attacker wallet",
      "attacker",
      "Officially named attacker wallet with 1.975663162588187122 KII frozen at the halted state."
    ),
    tracked(
      ADDRESSES.helperA,
      "kiichain",
      "Exploit helper A",
      "attacker-contract",
      "Officially named helper contract holding 42,178,468.002176081424538811 KII at the halted state."
    ),
    tracked(
      ADDRESSES.helperB,
      "kiichain",
      "Exploit helper B",
      "attacker-contract",
      "Officially named helper contract holding 38,549,992.999999999999999999 KII at the halted state."
    ),
    tracked(
      ADDRESSES.helperC,
      "kiichain",
      "Exploit helper C",
      "attacker-contract",
      "Officially named helper contract holding exactly 2 KII at the halted state."
    ),
    tracked(
      ADDRESSES.referenceTarget,
      "kiichain",
      "Reference sweep target",
      "drain-target",
      `KiiChain RPC shows ${REFERENCE_EXPLOIT_TX} calling sweep(address) on this contract and passing the primary attacker as recipient.`,
      "curated"
    ),
    tracked(
      ADDRESSES.primaryAttacker,
      "bsc",
      "BSC bridge recipient / seller",
      "attacker",
      "Received 67,597,997.866244379161354320 KII across ten verified Hyperlane mints, then routed KII to PancakeSwap and KuCoin."
    ),
    tracked(
      ADDRESSES.kucoinDeposit,
      "bsc",
      "KuCoin deposit address",
      "exit-route",
      `Received exactly 3,000,000 KII in ${KUCOIN_DEPOSIT_TX}; KiiChain said exchange freeze confirmation remained pending at publication.`
    ),
    tracked(
      ADDRESSES.pancakeInfinityVault,
      "bsc",
      "PancakeSwap Infinity Vault",
      "infrastructure",
      "DEX infrastructure used to sell 64,597,997.87 KII through the BSC-USD/KII route. Not identified as attacker-controlled.",
      "curated"
    ),
    tracked(
      ADDRESSES.kiiTokenBsc,
      "bsc",
      "KII token on BNB Chain",
      "token",
      "BNB Chain KII token contract used in the bridge mints, DEX sale, and exchange deposit trail.",
      "curated"
    ),
  ],
}
