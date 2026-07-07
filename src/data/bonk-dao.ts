import { IncidentData } from './types'

export const BONK_DAO_DATA: IncidentData = {
  incident: {
    id: "bonk-dao-2026-07",
    name: "BonkDAO Governance Treasury Takeover",
    victim: "BonkDAO",
    attacker_attribution: "Unknown (Governance Arbitrageur)",
    root_cause:
      "A governance quorum takeover where the attacker acquired 882.28B BONK ($4.4M) and voted 'Yes' on a proposal to transfer 4.426T BONK ($21.2M) from the DAO treasury to their own wallet. The proposal passed and executed automatically on-chain.",
    loss_usd: 21_200_000,
    start_ts: 1782807984, // proposal creation: June 30, 2026
    pause_ts: 1783326384, // execution: July 6, 2026
    chains_touched: ["Solana"],
    stats: [
      { label: "Total drained", value: "4.426T BONK", sub: "~$21.20M USD from treasury", accent: "text-rose-300" },
      { label: "Voter stake acquired", value: "882.28B BONK", sub: "~$4.40M capital deployed", accent: "text-amber-300" },
      { label: "Net profit", value: "~$16.80M", sub: "Net margin of governance attack", accent: "text-emerald-300" },
      { label: "Storage holding", value: "4.386T BONK", sub: "EXaJnm...Veh42 (unmoved)", accent: "text-sky-300" },
    ],
  },
  hops: [
    {
      step: 1, phase: "exploit", ts: 1782807984,
      from: { label: "BonkDAO Treasury", kind: "protocol" },
      to: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      asset: "BONK", amount: 4_426_104_450_305.97, usd: 21_200_000, chain: "Solana",
      summary: "Attacker submits proposal on Realms to transfer 4.426T BONK from the treasury to a wallet they control.",
    },
    {
      step: 2, phase: "vote", ts: 1783326128,
      from: { label: "Voter EOA (CyEE...typQ)", kind: "attacker" },
      to: { label: "Realms Governance Portal", kind: "protocol" },
      asset: "BONK", amount: 882_285_000_000, usd: 4_400_000, chain: "Solana",
      summary: "Attacker votes 'Yes' with 882.285B BONK accumulated from exchanges, passing the quorum threshold.",
    },
    {
      step: 3, phase: "execution", ts: 1783326384,
      from: { label: "Realms Governance Portal", kind: "protocol" },
      to: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      asset: "BONK", amount: 4_426_104_450_305.97, usd: 21_200_000, chain: "Solana",
      summary: "Realms proposal passes and is executed automatically, releasing 4.426T BONK to the attacker's wallet.",
    },
    {
      step: 4, phase: "transfer", ts: 1783357257,
      from: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      to: { label: "OKX Deposit (Dd4v...Bnn7)", kind: "attacker" },
      asset: "BONK", amount: 10_000_000_000, usd: 47_900, chain: "Solana",
      summary: "Attacker deposits a test batch of 10B BONK to an OKX deposit account.",
    },
    {
      step: 5, phase: "transfer", ts: 1783358330,
      from: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      to: { label: "OKX Deposit (Dd4v...Bnn7)", kind: "attacker" },
      asset: "BONK", amount: 30_000_000_000, usd: 143_700, chain: "Solana",
      summary: "Attacker deposits another 30B BONK to the OKX deposit account, totaling 40B deposited.",
    },
    {
      step: 6, phase: "transfer", ts: 1783362212,
      from: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      to: { label: "Holding Wallet (EXaJ...eh42)", kind: "attacker" },
      asset: "BONK", amount: 100_000_000, usd: 479, chain: "Solana",
      summary: "Attacker sends a test transfer of 100M BONK to their secure holding wallet.",
    },
    {
      step: 7, phase: "transfer", ts: 1783362547,
      from: { label: "Attacker Beneficiary (9bxW...JHvQ)", kind: "attacker" },
      to: { label: "Holding Wallet (EXaJ...eh42)", kind: "attacker" },
      asset: "BONK", amount: 4_386_004_450_305.97, usd: 21_008_400, chain: "Solana",
      summary: "Attacker transfers the remaining 4.386T BONK to secure storage wallet EXaJnmrLf7RAKLfn1hehoKX94keKYmvZm5H5zuYVeh42.",
    },
  ],
  timeline: [
    { ts: 1782807984, tag: "PROPOSAL", title: "Realms Governance proposal submitted to transfer 4.426T BONK to attacker address" },
    { ts: 1783326128, tag: "VOTE", title: "Attacker casts 'Yes' vote with 882.285B BONK to reach required quorum" },
    { ts: 1783326384, tag: "EXPLOIT", title: "Proposal passes and automatically executes; 4.426T BONK transferred from treasury" },
    { ts: 1783357257, tag: "TRANSFER", title: "Attacker deposits first batch of 10B BONK to OKX" },
    { ts: 1783358330, tag: "TRANSFER", title: "Attacker deposits second batch of 30B BONK to OKX" },
    { ts: 1783362212, tag: "TRANSFER", title: "Test transfer of 100M BONK sent to secure holding wallet" },
    { ts: 1783362547, tag: "TRANSFER", title: "Remaining 4.386T BONK transferred to storage wallet EXaJnmrLf7RAKLfn1hehoKX94keKYmvZm5H5zuYVeh42" },
  ],
  tracked_wallets: [
    {
      address: "CyEE7oHVDaFJ5xZLbXY3h2Z2uk1VwhTkdy72kPUEtypQ",
      chain: "solana",
      label: "Attacker Voting Wallet",
      role: "attacker",
      confidence: "verified",
      sourceLabel: "Realms Votes & Solana RPC",
      notes: "Acquired 882.285B BONK via Binance/Bybit to pass quorum and vote 'Yes'."
    },
    {
      address: "9bxWkNf3BtJ6iehq9KbX9uCWMjem4TFiPZ19T2sYJHvQ",
      chain: "solana",
      label: "Attacker Beneficiary Wallet",
      role: "attacker",
      confidence: "verified",
      sourceLabel: "Proposal Target & Solana RPC",
      notes: "Recipient of the 4.426T BONK treasury transfer."
    },
    {
      address: "Dd4vDG5veWZ9okSQHQuYYzRChwPG1AYixt9tehVrBnn7",
      chain: "solana",
      label: "OKX Deposit Wallet",
      role: "attacker",
      confidence: "verified",
      sourceLabel: "Solana RPC Transfers",
      notes: "Received 40B BONK ($188K) in two transactions (10B and 30B)."
    },
    {
      address: "EXaJnmrLf7RAKLfn1hehoKX94keKYmvZm5H5zuYVeh42",
      chain: "solana",
      label: "Secure Storage Holding Wallet",
      role: "attacker",
      confidence: "verified",
      sourceLabel: "Solana RPC Transfers",
      notes: "Holds the remaining 4.386T BONK ($19.3M)."
    },
  ],
}
