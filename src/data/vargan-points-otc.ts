import type { Hop, IncidentData } from "./types"

const ts = (value: string) => Date.parse(value) / 1000
export const VARGAN_ESCROW = "0xAbaBCAc9F5BedE18E7D0E55FA6289623d87C9369"
const A = "0xC9DC440697e4611396cf640e7438F0C26AF66958"
const B = "0x55CFdbda776A86458637B6dfDa5f7B81555C3fCf"

export const VARGAN_OUTFLOWS = [
  { ts: ts("2026-11-06T02:26:55Z"), amount: 40_000, to: A, hash: "0x46182e6f3aa75a159ed1ca6250d0f582788174bc677128c797b39b2fe20fa21c" },
  { ts: ts("2026-11-06T03:24:00Z"), amount: 40_000, to: B, hash: "0xb4adf5c5ff8e6e4e7aa2685a2e448479163c5afdbb0c847b24b3504a18a57c19" },
  { ts: ts("2026-11-06T03:40:47Z"), amount: 600, to: B, hash: "0xd57397fd0a99f091c65291cce71e9e3b2430ed9622daa2224c7b20de40526352" },
  { ts: ts("2026-11-06T04:29:28Z"), amount: 100_000, to: A, hash: "0x89ec1ad1238c907f144b930da4e4792b35ed5f333e56602134b6cac6ca1d08f0" },
  { ts: ts("2026-11-06T04:32:20Z"), amount: 330_518.320019, to: A, hash: "0x0b915fa7d07675de2e586e90c6ee3303703515f100234f95d50cf8c9732dc00e" },
]

export const VARGAN_BRIDGES = [
  { ts: ts("2026-11-06T02:33:40Z"), amount: 20_000, from: A, bridge: "Symbiosis", asset: "ETH", received: 8.932232871315978, to: "0x41da4e631424c54518b05469094a050e2ea4f937", hash: "0xf17e9aa931f332c4763d61cca196b4c8d73c25e7f02b25c7685076aa666af095", destinationHash: "0x9fc73dac7b5aa7caa6e76e0bbd13ec28f0d5e7c142e4d81731d62593636fca91" },
  { ts: ts("2026-11-06T02:37:26Z"), amount: 20_000, from: A, bridge: "Mayan", asset: "ETH", received: 8.93168968419881, to: "0x41da4e631424c54518b05469094a050e2ea4f937", hash: "0x470fd905b16eef495a206d8c5a0f0880a2e32f31a24621a57a0874d74620bb51", destinationHash: "0x8718bc8cd3040adc439fac5bf8913a62ab897f6140e3ccc3f5a91850f191676a" },
  { ts: ts("2026-11-06T04:36:08Z"), amount: 30_000, from: A, bridge: "Polymer Standard", asset: "DAI", received: 29_999.472768780743, to: "0x5e7edfd4737ae889d198d2f297bba0f1f8c142ec", hash: "0xf4ddc65d181e2233ac5bf7ee24c35c8eca61d8eab0e92b4d7306336dbb2e44e5", destinationHash: "0xe3c557b87b29d1b6ae1c00eb8f78f70caa4a4c3a7807a0647fa72feebc0a9dcd" },
  { ts: ts("2026-11-06T04:38:57Z"), amount: 50_000, from: A, bridge: "Mayan", asset: "ETH", received: 22.39601406496528, to: "0x3b022e78bf15b96cba1ed6d8c9ad98438f152c9e", hash: "0x84b2a0069514597c05b6cc4a1100da5c69f5dde0014f15ea27164945212fbef9", destinationHash: "0xaf0b242fbb2824b68829b393d43298395f353e5d156ae312f046d31d8649b6ce" },
  { ts: ts("2026-11-06T04:41:17Z"), amount: 50_000, from: A, bridge: "Across", asset: "DAI", received: 49_994.82864614051, to: "0x5eea8e41f1b0b23713e539b6b3fdc250b7fe2c38", hash: "0x4cdcbec70e7040bd9b495e1fff9f7e934f4a08caaa3fe87df21d880a55acc62b", destinationHash: "0xb64a4327e9f364d0cf22d5004b37e65cd7638b42ab1f74bdd039a361a6d98dd4" },
  { ts: ts("2026-11-06T04:45:11Z"), amount: 100_000, from: A, bridge: "Mayan Fast MCTP", asset: "ETH", received: 44.81037320628226, to: "0x70dc5969160d58d40e209753774b3beedf552b45", hash: "0xa781037e49de7a1fe388f4f5948f626d7f3ae3c8340c098bddb9985f7e2cb1f7", destinationHash: "0x6758f8191100a1224ed55d7c4efb3a9a912b43757a12889915c4d534ac82e4d5" },
  { ts: ts("2026-11-06T04:53:15Z"), amount: 200_518.320019, from: A, bridge: "Across", asset: "DAI", received: 200_498.1233883724, to: "0x30a31ce19a437c0a7c519adeb4aa3939ae81a185", hash: "0xa62ff2bcbbfef822a0d31419e0a8f0353f3b333f5a3d2464159fee016759ea5b", destinationHash: "0x32b4951832197ac50ca96ad99816b976e88b1c8ca5550ede69988911fff1effd" },
  { ts: ts("2026-11-06T05:04:13Z"), amount: 40_600, from: B, bridge: "Across", asset: "DAI", received: 40_595.80158442639, to: "0x67a13d500ec1caeed57389e11f965d317011221b", hash: "0x2fd2d04a36fa81834d2b4734868556d35890ab35de2720a548df2e4df77a3b9e", destinationHash: "0xa77a4350ba9d4326d5d94eea8a299dc0b98c2a5a992c497243946a16bf607cfe" },
]

export const VARGAN_TOTAL_OUTFLOW = VARGAN_OUTFLOWS.reduce((sum, transfer) => sum + transfer.amount, 0)
const recipientLabel = (address: string) => address === A ? "Arbitrum recipient A" : "Arbitrum recipient B"

const hops: Hop[] = [
  ...VARGAN_OUTFLOWS.map((transfer): Hop => ({
    step: 0, phase: "escrow-outflow", ts: transfer.ts,
    from: { label: "OTC public escrow (2-of-3 Safe)", kind: "custody", address: VARGAN_ESCROW },
    to: { label: recipientLabel(transfer.to), kind: "recipient", address: transfer.to },
    asset: "USDC", amount: transfer.amount, usd: transfer.amount, chain: "Arbitrum",
    summary: `${transfer.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC transferred with two Safe owner confirmations. Receipt and Transfer log independently verified. Customer settlement obligations and intent remain unconfirmed.`,
    evidence: { url: `https://arbiscan.io/tx/${transfer.hash}`, label: "Verified Arbitrum receipt", transaction: transfer.hash, scope: "Verified successful USDC outflow, not a final theft determination. Animation reconstructs a historical transfer; it is not a live transfer signal." },
  })),
  ...VARGAN_BRIDGES.map((route): Hop => ({
    step: 0, phase: "bridge-and-swap", ts: route.ts,
    from: { label: recipientLabel(route.from), kind: "recipient", address: route.from },
    to: { label: `${route.bridge} / ${route.asset} destination ${route.to.slice(0, 6)}...${route.to.slice(-4)}`, kind: "recipient", address: route.to },
    asset: `USDC -> ${route.asset}`, amount: route.amount, usd: route.amount, chain: "Arbitrum -> Ethereum",
    summary: `${route.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC routed through LI.FI with ${route.bridge}; the source event records jumper.exchange as integrator. LI.FI reports completion delivering ${route.received.toLocaleString("en-US", { maximumFractionDigits: 8 })} ${route.asset}. These are onward proceeds, not additional losses.`,
    evidence: { url: `https://arbiscan.io/tx/${route.hash}`, label: "Verified bridge initiation", transaction: route.hash, scope: "Source receipt and LI.FI event verified. Destination amount and final recipient are provider-reported; representative Ethereum receipts were checked. Bridge use is not evidence of a vulnerability in the bridge or aggregator. Animation is historical, not live." },
  })),
].sort((a, b) => a.ts - b.ts).map((hop, index) => ({ ...hop, step: index + 1 }))

export const VARGAN_POINTS_OTC_DATA: IncidentData = {
  incident: {
    id: "vargan-points-otc-2026-11", name: "Vargan Points OTC - Suspected Exit Scam",
    victim: "Third-party points OTC escrow participants",
    attacker_attribution: "Operator identity, signer independence, and intent unverified",
    assessment: "suspected", loss_usd: 0, observed_outflow_usd: VARGAN_TOTAL_OUTFLOW,
    root_cause: "Suspected third-party OTC exit scam, not an established Variational protocol exploit. The publicly advertised 2-of-3 Safe sent 511,118.320019 USDC to two recipients on November 6. The same two owners confirmed all five transfers in Safe's index. Social reports describe an inaccessible operator account and Telegram group. Whether the transfers were misappropriation, legitimate settlements, or compromised-key activity remains unresolved; net customer loss is unknown.",
    start_ts: VARGAN_OUTFLOWS[0].ts, chains_touched: ["Arbitrum", "Ethereum"],
    stats: [
      { label: "Verified gross outflow", value: "$511.12K", sub: "511,118.320019 USDC", accent: "text-amber-300" },
      { label: "Confirmed net loss", value: "Unknown", sub: "not counted in loss totals", accent: "text-sky-300" },
      { label: "Traced routes", value: "5 + 8", sub: "escrow transfers + bridge routes", accent: "text-emerald-300" },
      { label: "Assessment", value: "Suspected", sub: "third-party OTC / escrow risk", accent: "text-amber-300" },
    ],
  },
  hops,
  timeline: [
    { ts: ts("2026-08-04T15:01:37Z"), tag: "SCAM-WARNING", title: "ProMint raises concerns about the OTC desk; allegations are not a confirmed exploit or loss determination" },
    { ts: ts("2026-08-07T12:01:00Z"), tag: "SCAM-WARNING", title: "HypingBull publishes follow-up concerns about OTC account histories and signer independence" },
    { ts: ts("2026-11-06T05:13:18Z"), tag: "DISCLOSURE", title: "william reports possible exit scam with screenshots of unavailable X account and inaccessible Telegram group" },
    { ts: ts("2026-11-06T06:55:03Z"), tag: "DISCLOSURE", title: "Louis repeats the disappearance report; this quotes the earlier report, not wholly independent corroboration" },
  ],
  tracked_wallets: [
    { address: VARGAN_ESCROW, chain: "arbitrum", role: "victim", confidence: "verified", label: "Advertised public OTC escrow", sourceLabel: "Archived operator post, Safe API, Arbitrum receipts", notes: "Context address, not an attacker attribution. Two-of-three owner configuration verified. Snapshot balances are not real-time guarantees." },
    ...[A, B].map((address) => ({ address, chain: "arbitrum", role: "recipient", confidence: "verified" as const, label: recipientLabel(address), sourceLabel: "Verified Arbitrum USDC Transfer logs", notes: "Received public-escrow outflows and routed proceeds onward. Intent and beneficial owner unverified; a historical interaction is not proof of loss or wrongdoing." })),
    ...[...new Map(VARGAN_BRIDGES.map((route) => [route.to, route])).values()].map((route) => ({ address: route.to, chain: "ethereum", role: "recipient", confidence: "curated" as const, label: `Reported ${route.asset} destination`, sourceLabel: "LI.FI completion API; representative Ethereum receipts checked", notes: "Provider-reported final recipient, not a claim of current holdings or malicious ownership. Further transfers and net losses are not reconciled." })),
  ],
  limitations: [
    "511,118.320019 USDC is verified gross public-escrow outflow, not confirmed net customer loss. Converted proceeds must not be added again.",
    "This is third-party OTC activity. No evidence reviewed establishes a compromise of Variational's core protocol; its points are wallet-bound and non-transferable.",
    "Reports of account/group disappearance do not establish why they became inaccessible. Account-history allegations and common ownership of signers remain unverified.",
    "ProMint's original investigation also promotes a competing OTC service. Its allegations require independent corroboration.",
    "Only the public escrow is reconciled. Private escrows, victim count, settlements, refunds, recovery, and later Ethereum movements remain unknown.",
    "Verified records are a November 6 research snapshot. Wallet providers can refresh balances; this is not an automatic live investigation or loss counter.",
  ],
  sources: [
    { label: "August 7 warning", url: "https://x.com/hypingbull/status/2085697715934244926", note: "Historical allegation, not an exploit receipt" },
    { label: "Original investigation", url: "https://x.com/ProMint_X/status/2084656004956921969", note: "Author also promotes a competing OTC desk" },
    { label: "November 6 first report", url: "https://x.com/willllliam/status/2118572410957930650", note: "Account/group availability screenshots" },
    { label: "Safe configuration and owners", url: `https://safe-transaction-arbitrum.safe.global/api/v1/safes/${VARGAN_ESCROW}/` },
    { label: "Executed escrow transactions", url: `https://safe-transaction-arbitrum.safe.global/api/v1/safes/${VARGAN_ESCROW}/multisig-transactions/?executed=true&limit=100` },
    { label: "Largest Ethereum DAI delivery", url: "https://etherscan.io/tx/0x32b4951832197ac50ca96ad99816b976e88b1c8ca5550ede69988911fff1effd", note: "Successful receipt and final DAI transfer independently checked" },
    { label: "Official points transfer policy", url: "https://help.variational.io/en/articles/14766791-points-on-omni" },
    ...VARGAN_BRIDGES.map((route) => ({ label: `${route.bridge}: ${route.amount.toLocaleString("en-US")} USDC route`, url: `https://li.quest/v1/status?txHash=${route.hash}&fromChain=42161&toChain=1`, note: `Provider reports ${route.received.toFixed(6)} ${route.asset}; destination receipt ${route.destinationHash}` })),
  ],
}
