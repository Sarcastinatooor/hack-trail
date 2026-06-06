import { IncidentData } from './types'

export const ZCASH_ORCHARD_DATA: IncidentData = {
  incident: {
    id: "zcash-orchard-2026-06",
    name: "Zcash Orchard ZKP Soundness Vulnerability",
    victim: "Zcash Protocol (Orchard shielded pool)",
    attacker_attribution: "N/A — Vulnerability found by Taylor Hornby (Shielded Labs) using Claude Opus 4.8",
    root_cause:
      "Under-constrained elliptic curve scalar multiplication in halo2_gadgets crate (ecc::chip::mul). The point multiplication loop's base was not cryptographically tied to the protocol's required base point, allowing an attacker to supply an arbitrary base point. The circuit would accept invalid proofs as valid, breaking ZKP soundness and enabling unlimited counterfeit ZEC creation within the Orchard shielded pool.",
    loss_usd: 0,
    start_ts: 1653004800, // May 2022 — Orchard pool activation (bug introduced)
    pause_ts: 1748822400, // June 2, 2026 — Soft fork disables Orchard
    chains_touched: ["Zcash"],
    stats: [
      { label: "Vulnerability window", value: "4 years", sub: "May 2022 → Jun 2026", accent: "text-rose-300" },
      { label: "Potential damage", value: "∞ ZEC", sub: "Unlimited counterfeit creation possible", accent: "text-rose-300" },
      { label: "ZEC price crash", value: "−37%", sub: "$527 → $334 within 24h of disclosure", accent: "text-amber-300" },
      { label: "Emergency response", value: "4 days", sub: "Discovery → hard fork (May 29 → Jun 3)", accent: "text-sky-300" },
    ],
  },
  hops: [
    {
      step: 1, phase: "vulnerability", ts: 1653004800,
      from: { label: "Zcash NU5 Activation", kind: "protocol" },
      to: { label: "Orchard Shielded Pool", kind: "protocol" },
      asset: "ZEC", amount: null, usd: 0, chain: "Zcash",
      summary: "Orchard pool goes live on Zcash mainnet with flawed ZKP circuit in halo2_gadgets crate. Bug lies dormant.",
    },
    {
      step: 2, phase: "discovery", ts: 1748476800,
      from: { label: "Shielded Labs", kind: "protocol" },
      to: { label: "Taylor Hornby (auditor)", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Shielded Labs engages Taylor Hornby for protocol audit of Orchard circuit.",
    },
    {
      step: 3, phase: "discovery", ts: 1748563200,
      from: { label: "Taylor Hornby + Claude Opus 4.8", kind: "protocol" },
      to: { label: "ZODL Engineers", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Hornby discovers under-constrained ecc::chip::mul using AI-assisted code review. Develops local proof-of-concept exploit. Discloses to ZODL engineers same evening.",
    },
    {
      step: 4, phase: "response", ts: 1748649600,
      from: { label: "ZODL Engineers", kind: "protocol" },
      to: { label: "Zcash Foundation", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Daira-Emma Hopwood, Kris Nuttycombe, Jack Grigg confirm the vulnerability. Private coordination with miners and infrastructure operators begins.",
    },
    {
      step: 5, phase: "soft-fork", ts: 1748822400,
      from: { label: "Zebra 4.5.3", kind: "protocol" },
      to: { label: "Zcash Network (Block 3,363,426)", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Emergency soft fork activates at block 3,363,426. Orchard transactions temporarily DISABLED as precaution.",
    },
    {
      step: 6, phase: "hard-fork", ts: 1748908800,
      from: { label: "NU6.2 Hard Fork", kind: "protocol" },
      to: { label: "Zcash Network (Block 3,364,600)", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Hard fork NU6.2 activates at block 3,364,600. Corrected ZKP circuit deployed. Orchard functionality restored.",
    },
    {
      step: 7, phase: "disclosure", ts: 1749081600,
      from: { label: "Zooko Wilcox + Shielded Labs", kind: "protocol" },
      to: { label: "Public Disclosure", kind: "protocol" },
      asset: "N/A", amount: null, usd: 0, chain: "Zcash",
      summary: "Full public disclosure published by Zooko Wilcox, Shielded Labs, and Taylor Hornby.",
    },
    {
      step: 8, phase: "market-impact", ts: 1749085200,
      from: { label: "Arthur Hayes", kind: "protocol" },
      to: { label: "Exchanges", kind: "protocol" },
      asset: "ZEC", amount: null, usd: 0, chain: "Zcash",
      summary: "Arthur Hayes (BitMEX co-founder) liquidates entire ZEC position citing: 'supply integrity cannot be formally cryptographically proved'.",
    },
    {
      step: 9, phase: "market-impact", ts: 1749088800,
      from: { label: "ZEC Market", kind: "protocol" },
      to: { label: "$334 (-37%)", kind: "protocol" },
      asset: "ZEC", amount: null, usd: 0, chain: "Zcash",
      summary: "ZEC crashes ~37% from $527 to $334 within 24 hours. Heavy long-position liquidations across exchanges.",
    },
  ],
  timeline: [
    { ts: 1653004800, tag: "EXPLOIT", title: "Orchard pool activated on Zcash mainnet with flawed ZKP circuit (bug introduced)" },
    { ts: 1748476800, tag: "DISCOVERY", title: "Shielded Labs engages Taylor Hornby for Orchard circuit audit" },
    { ts: 1748476900, tag: "DISCOVERY", title: "Anthropic releases Claude Opus 4.8 — later used in the discovery" },
    { ts: 1748563200, tag: "DISCOVERY", title: "Hornby discovers under-constrained ecc::chip::mul using AI-assisted review; discloses to ZODL" },
    { ts: 1748649600, tag: "RESPONSE", title: "ZODL engineers confirm vulnerability; private coordination begins" },
    { ts: 1748822400, tag: "PAUSE", title: "Emergency soft fork (Zebra 4.5.3) — Orchard transactions disabled at block 3,363,426" },
    { ts: 1748908800, tag: "RECOVERY", title: "Hard fork NU6.2 at block 3,364,600 — corrected circuit deployed, Orchard restored" },
    { ts: 1749000000, tag: "CONTAGION", title: "Block explorers show stale data; social media reports (incorrectly) that Zcash is down" },
    { ts: 1749081600, tag: "DISCLOSURE", title: "Full public disclosure by Zooko Wilcox, Shielded Labs, and Taylor Hornby" },
    { ts: 1749085200, tag: "CONTAGION", title: "Arthur Hayes liquidates entire ZEC position" },
    { ts: 1749088800, tag: "CONTAGION", title: "ZEC crashes 37%: $527 → $334. Heavy exchange liquidations." },
  ],
  tracked_wallets: [],
}
