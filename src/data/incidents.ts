import { IncidentSummary } from './types'

export const INCIDENTS: IncidentSummary[] = [
  {
    id: "kelp-dao-rseth-2026-04",
    slug: "kelp-dao",
    name: "Kelp DAO rsETH Bridge Exploit",
    victim: "Kelp DAO",
    date: "2026-04-18",
    date_label: "Apr 18, 2026",
    loss_usd: 292_000_000,
    chains: ["Unichain", "Ethereum", "Arbitrum", "Bitcoin"],
    attack_vector: "LayerZero 1-of-1 DVN compromise",
    attribution: "Lazarus Group (DPRK)",
    short_summary:
      "Forged LayerZero packets minted 116,500 uncollateralised rsETH, deposited into Aave as fake collateral to borrow $190M. Aave TVL drawdown hit 37%.",
    status: "full",
    tags: ["bridge", "DVN", "LayerZero", "lending-contagion"],
  },
  {
    id: "zcash-orchard-2026-06",
    slug: "zcash-orchard",
    name: "Zcash Orchard ZKP Soundness Vulnerability",
    victim: "Zcash Protocol",
    date: "2026-06-05",
    date_label: "Jun 5, 2026",
    loss_usd: 0,
    loss_label: "∞ potential · 37% price crash",
    chains: ["Zcash"],
    attack_vector: "Under-constrained halo2 ZKP circuit",
    attribution: "Found by Taylor Hornby + Claude Opus 4.8",
    short_summary:
      "Critical soundness bug in Orchard shielded pool's elliptic curve scalar multiplication allowed potential unlimited counterfeit ZEC creation. Dormant 4 years. Emergency hard fork NU6.2 deployed. ZEC crashed 37%.",
    status: "full",
    tags: ["ZKP", "halo2", "soundness", "vulnerability", "AI-discovered"],
  },
  {
    id: "drift-protocol-2026-04",
    slug: "drift-protocol",
    name: "Drift Protocol — Solana Perp DEX Drain",
    victim: "Drift Protocol",
    date: "2026-04-01",
    date_label: "Apr 1, 2026",
    loss_usd: 285_000_000,
    chains: ["Solana", "Ethereum"],
    attack_vector: "Durable-nonce multisig bypass + fake CVT collateral",
    attribution: "UNC4736 / AppleJeus (DPRK)",
    short_summary:
      "Six-month social-engineering op harvested Security Council signatures via durable nonces, then drained 20+ tokens against wash-traded CarbonVote collateral in 12 minutes.",
    status: "stub",
    tags: ["Solana", "multisig", "social-engineering"],
  },
]

export function findIncident(slug: string): IncidentSummary | undefined {
  return INCIDENTS.find((i) => i.slug === slug)
}
