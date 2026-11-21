import type { IncidentData } from './types'

const report = 'https://x.com/OnchainLens/status/2124048730337026360'
const published = 1795247654
const evidence = { url: report, label: 'Onchain Lens alert', scope: 'Reported flow; timestamps mark publication, not block times.' }

export const CHAINFLIP: IncidentData = {
  incident: {
    id: 'chainflip-ethereum-vault', name: 'Chainflip Ethereum Vault Drain', victim: 'Chainflip Ethereum vault',
    attacker_attribution: 'Unknown', assessment: 'suspected', loss_usd: 0, observed_outflow_usd: 4860000,
    start_ts: published, chains_touched: ['Ethereum'],
    root_cause: 'Onchain Lens reports that the vault accepted a valid aggregate signature. That does not establish how authorization was obtained. Private-key compromise is a hypothesis, not a confirmed finding.',
    stats: [
      { label: 'Reported gross outflow', value: '~$4.86M', sub: 'Onchain Lens estimate' },
      { label: 'Reported ETH withdrawn', value: '520.2 ETH', sub: 'Alongside 3.25M USDC and 758K USDT' },
      { label: 'Reported onward movement', value: '2,909 ETH', sub: 'Not an additional loss' },
      { label: 'Net loss', value: 'Unknown', sub: 'Recovery and reconciliation unverified' },
    ],
  },
  timeline: [{ ts: published, tag: 'REPORT', title: 'Onchain Lens reports vault withdrawals and subsequent ETH movement', chain: 'Ethereum' }],
  hops: [
    { step: 1, phase: 'reported withdrawal', ts: published, chain: 'Ethereum', from: { label: 'Chainflip Ethereum vault', kind: 'vault' }, to: { label: 'Reported recipient wallets', kind: 'attacker' }, asset: '520.2 ETH + 3.25M USDC + 758K USDT', amount: null, usd: 4860000, summary: 'Approximate gross value across three assets, according to the alert.', evidence },
    { step: 2, phase: 'reported onward flow', ts: published, chain: 'Ethereum', from: { label: 'Reported recipient wallets', kind: 'attacker' }, to: { label: 'Multicall interacting with Tornado Cash', kind: 'mixer' }, asset: 'ETH', amount: 2909, usd: 4750000, summary: 'Reported downstream movement across multiple wallets. Intermediate swaps and individual deposits have not been independently reconciled.', evidence },
  ],
  tracked_wallets: [], sources: [{ label: 'Onchain Lens: November 21 alert', url: report }],
  limitations: ['Publication time is used because individual transaction times are not verified.', 'No wallet addresses have been added to exposure checks. The reported onward ETH value is not added to the vault outflow.'],
}
