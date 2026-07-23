import type { Hop, IncidentData, TimelineEvent, TrackedWallet } from "./types"

const AFX_SOURCE =
  "Blockaid X alert, Officer's Notes X analysis, Arbiscan transaction 0x50d0b3ec6c3f5fce0f10abf81540bbb508f421494aa2b3480c4a264b0436547b, DefiLlama AFX Bridge, Offchain Labs clarification, and PeckShield tracking cited by BeInCrypto"

const TS = {
  preDrainTvl: 1784753399,
  finalizedWithdrawal: 1784755825,
  l1BatchReference: 1784755907,
  officerAlert: 1784761676,
  arbitrumClarification: 1784762597,
  blockaidConfirmation: 1784764749,
  firstPressReport: 1784770800,
}

const ADDRESSES = {
  bridge: "0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67",
  recipient: "0x2f2974fAbc54dbA33442261211c06BD20E0FEefc",
  finalizer: "0x5553EA7Bda594aDE7AFe91D279779a42b2B84208",
  usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  ethBatchSubmitter: "0xC1b634853Cb333D3aD8663715b08f41A3Aec47cc",
  ethSequencerInbox: "0x1c479675ad559DC151F6Ec7ed3FbF8ceE79582B6",
}

const VALIDATOR_SET = [
  "0x00BB84aF06daC03BFe744Da13dF9D2D6fd8e77E5",
  "0x0C95AB7e26Df9F63cc6E06DF8ee897B822d8C77c",
  "0x27259f90D6ae500262AcE6E8428434e0c1f308F5",
  "0x2e26dE22a92e41704B3eA00cc65a6CDA47b12c9e",
  "0x52D4D9AD78a53a69bD089eE8f282CE0Cd0506Da7",
  ADDRESSES.finalizer,
  "0xBB472BC3962Ad02Ac660429FdBB319B5BC66DA7b",
]

const EXPLOIT_TX =
  "0x50d0b3ec6c3f5fce0f10abf81540bbb508f421494aa2b3480c4a264b0436547b"
const L1_BATCH_TX =
  "0x41cdf8853427622994440157729ea35fa87b0ce53affbc6980d0235cac300b29"
const MESSAGE_HASH =
  "0x558a989f405d706935fa15efee8eac6e32fbba7ea3f70dfd930c66436e7ed8c2"

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
    sourceLabel: AFX_SOURCE,
    notes,
  }
}

const hops: Hop[] = [
  {
    step: 1,
    phase: "authorization",
    ts: TS.finalizedWithdrawal - 1,
    from: { label: "Reported 5-of-7 validator path", kind: "validator_set" },
    to: { label: "AFX bridge verifier", kind: "bridge_contract", address: ADDRESSES.bridge },
    asset: "withdrawal authorization",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Public tracker analysis says the withdrawal was finalized with five signatures from a seven-validator set, pointing to possible validator-key or backend compromise. AFX has not yet published a postmortem.",
  },
  {
    step: 2,
    phase: "finalization",
    ts: TS.finalizedWithdrawal,
    from: { label: "Finalizer 0x5553...4208", kind: "finalizer", address: ADDRESSES.finalizer },
    to: { label: "AFX bridge contract", kind: "bridge_contract", address: ADDRESSES.bridge },
    asset: "batchedFinalizeWithdrawals",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      `Arbiscan shows ${EXPLOIT_TX} calling batchedFinalizeWithdrawals with message ${MESSAGE_HASH.slice(0, 10)}...${MESSAGE_HASH.slice(-6)}.`,
  },
  {
    step: 3,
    phase: "withdrawal",
    ts: TS.finalizedWithdrawal,
    from: { label: "AFX bridge contract", kind: "bridge_contract", address: ADDRESSES.bridge },
    to: { label: "Recipient 0x2f29...FEefc", kind: "attacker", address: ADDRESSES.recipient },
    asset: "USDC",
    amount: 24_150_000,
    usd: 24_146_353,
    chain: "Arbitrum",
    summary:
      "A FinalizedWithdrawal event transferred 24.15M native Arbitrum USDC from the AFX bridge contract to the recipient wallet.",
  },
  {
    step: 4,
    phase: "bridge-out",
    ts: TS.finalizedWithdrawal + 120,
    from: { label: "Recipient 0x2f29...FEefc", kind: "attacker", address: ADDRESSES.recipient },
    to: { label: "Ethereum exit route", kind: "bridge" },
    asset: "USDC bridge-out",
    amount: 24_150_000,
    usd: 24_150_000,
    chain: "Arbitrum -> Ethereum",
    summary:
      "Public reporting says the stolen USDC was moved from Arbitrum to Ethereum after the abnormal withdrawal cleared.",
  },
  {
    step: 5,
    phase: "swap",
    ts: TS.blockaidConfirmation,
    from: { label: "Ethereum exit route", kind: "bridge" },
    to: { label: "ETH wallet 0x6276...ebAC", kind: "swap_route" },
    asset: "ETH",
    amount: 12_467.5,
    usd: 24_150_000,
    chain: "Ethereum",
    summary:
      "PeckShield tracking cited by BeInCrypto says the bridged funds were swapped into 12,467.5 ETH and traced to a single wallet abbreviated 0x6276...ebAC.",
  },
  {
    step: 6,
    phase: "response",
    ts: TS.blockaidConfirmation,
    from: { label: "Blockaid monitoring", kind: "response" },
    to: { label: "AFX and Arbitrum responders", kind: "protocol" },
    asset: "incident coordination",
    amount: null,
    usd: 0,
    chain: "Arbitrum",
    summary:
      "Blockaid said it was coordinating with Arbitrum teams and affected protocols, including freeze and response support where possible.",
  },
]

const timeline: TimelineEvent[] = [
  {
    ts: TS.preDrainTvl,
    tag: "TVL",
    title: "DefiLlama's last pre-drain AFX Bridge snapshot showed about $24.18M USDC locked on Arbitrum",
    chain: "Arbitrum",
  },
  {
    ts: TS.finalizedWithdrawal,
    tag: "WITHDRAWAL",
    title: "Arbiscan transaction 0x50d...547b finalized a 24.15M USDC withdrawal from the AFX bridge contract",
    chain: "Arbitrum",
  },
  {
    ts: TS.l1BatchReference,
    tag: "BRIDGE",
    title: "Ethereum L1 batch reference 0x41cd...0b29 appears shortly after the Arbitrum withdrawal",
    chain: "Ethereum",
  },
  {
    ts: TS.officerAlert,
    tag: "ALERT",
    title: "Officer's Notes flags an abnormal Arbitrum bridge withdrawal and links it to a validly authorized message path",
    chain: "Arbitrum",
  },
  {
    ts: TS.arbitrumClarification,
    tag: "CLARIFICATION",
    title: "Offchain Labs clarifies the transaction came from a third-party protocol and the native Arbitrum bridge was not exploited",
    chain: "Arbitrum",
  },
  {
    ts: TS.blockaidConfirmation,
    tag: "ALERT",
    title: "Blockaid confirms the incident targeted AFX and was specific to a bridge operated by AFX",
    chain: "Arbitrum",
  },
  {
    ts: TS.firstPressReport,
    tag: "SWAP",
    title: "Public reports citing PeckShield say funds were bridged to Ethereum, swapped into 12,467.5 ETH, and traced to 0x6276...ebAC",
    chain: "Ethereum",
  },
]

export const AFX_BRIDGE_DATA: IncidentData = {
  incident: {
    id: "afx-bridge-2026-07",
    name: "AFX Bridge Authorized Withdrawal Drain",
    victim: "AFX Bridge",
    attacker_attribution: "Unknown attacker; public trackers point to possible validator-key or backend compromise",
    root_cause:
      "Blockaid detected an exploit at 2026-07-22 21:30 UTC against a bridge operated by AFX on Arbitrum. The onchain withdrawal appears to have passed the bridge's authorization path rather than bypassing Arbitrum itself: a batched finalization moved 24.15M native Arbitrum USDC from the AFX bridge contract to 0x2f29...FEefc. Offchain Labs clarified that the native Arbitrum bridge was not hacked; AFX has not yet published a final postmortem, so the validator/backend compromise theory remains the leading public analysis rather than a confirmed root cause.",
    loss_usd: 24_150_000,
    start_ts: TS.finalizedWithdrawal,
    pause_ts: TS.blockaidConfirmation,
    chains_touched: ["Arbitrum", "Ethereum"],
    stats: [
      {
        label: "Confirmed drain",
        value: "$24.15M",
        sub: "native Arbitrum USDC",
        accent: "text-rose-300",
      },
      {
        label: "Affected rail",
        value: "AFX bridge",
        sub: "not native Arbitrum bridge",
        accent: "text-sky-300",
      },
      {
        label: "Message path",
        value: "5/7",
        sub: "reported validator signature threshold",
        accent: "text-amber-300",
      },
      {
        label: "Exit asset",
        value: "12,467.5 ETH",
        sub: "reported post-bridge swap",
        accent: "text-emerald-300",
      },
    ],
  },
  hops,
  timeline,
  tracked_wallets: [
    tracked(
      ADDRESSES.bridge,
      "arbitrum",
      "AFX bridge contract",
      "victim",
      "Victim custody bridge contract that emitted FinalizedWithdrawal and sent 24.15M native Arbitrum USDC to the recipient."
    ),
    tracked(
      ADDRESSES.recipient,
      "arbitrum",
      "Withdrawal recipient 0x2f29...FEefc",
      "attacker",
      `Recipient of the 24.15M USDC transfer in Arbiscan transaction ${EXPLOIT_TX}.`
    ),
    tracked(
      ADDRESSES.usdc,
      "arbitrum",
      "Arbitrum native USDC",
      "token",
      "Native Arbitrum USDC token transferred out of the AFX bridge contract.",
      "curated"
    ),
    tracked(
      ADDRESSES.ethBatchSubmitter,
      "ethereum",
      "Arbitrum batch submitter",
      "infrastructure",
      `Ethereum-side batch submitter address associated with L1 reference transaction ${L1_BATCH_TX}. Not attacker-controlled.`,
      "curated"
    ),
    tracked(
      ADDRESSES.ethSequencerInbox,
      "ethereum",
      "Arbitrum sequencer inbox",
      "infrastructure",
      "Ethereum inbox contract for Arbitrum sequencing references. Included for analyst context, not as attacker exposure.",
      "curated"
    ),
    ...VALIDATOR_SET.map((address, index) => {
      const isFinalizer = address === ADDRESSES.finalizer
      return tracked(
        address,
        "arbitrum",
        isFinalizer ? "Finalizer / reported validator 6" : `Reported validator ${index + 1}`,
        isFinalizer ? "finalizer" : "validator",
        isFinalizer
          ? "Transaction sender that called batchedFinalizeWithdrawals on the AFX bridge contract. Public tracker analysis includes it in the reported validator set."
          : "Public tracker analysis lists this address in the reported seven-validator set. Treat as a watchlist clue until AFX publishes a postmortem.",
        isFinalizer ? "verified" : "curated"
      )
    }),
  ],
}
