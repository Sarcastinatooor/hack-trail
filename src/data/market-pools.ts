import verified from './verified-market-pools.json' with { type: 'json' }

export interface MarketPool {
  network: string
  token: string
  pool: string
  label: string
  incidentTs: number
  createdAt?: string
  verifiedAt?: string
  source?: string
}

type AssetKey = keyof typeof verified
export interface MarketCoverage { assets: AssetKey[]; note: string }

// Associations follow incident records; pools are context, not attacker attribution.
export const MARKET_COVERAGE: Record<string, MarketCoverage> = {
  'chainflip-ethereum-vault': { assets: ['eth', 'usdc', 'usdt'], note: 'Ethereum payout-asset markets; WETH is a native ETH proxy. No selected pool is attributed to attacker swaps.' },
  'vargan-points-otc': { assets: ['arbUsdc', 'dai', 'eth'], note: 'USDC escrow outflows and Ethereum proceeds. Variational points are not transferable tokens. WETH is an ETH market proxy.' },
  'binance-hot-wallet-2026': { assets: ['ena', 'usdt', 'usdc', 'arb', 'eth', 'sol', 'uni', 'aave'], note: 'Selected affected-asset and ecosystem markets, not a complete stolen-asset inventory. UNI/AAVE provide protocol context, not protocol volume or TVL. Native BTC, XRP and TRX are not replaced with unrelated wrapped assets. Pool volume is not UniswapX-wide volume.' },
  'near-intents-deposit-notification': { assets: ['bscUsdt'], note: 'BSC USDT payout-asset market context, not NEAR Intents internal liquidity.' },
  'bitget-wallet-infrastructure': { assets: ['eth', 'usdt', 'usdc', 'arbUsdc', 'baseUsdc'], note: 'Selected EVM asset markets; not every affected network or asset. WETH is an ETH proxy.' },
  'limit-break-payment-processor': { assets: [], note: 'NFT approval incident. Fungible-token pools do not measure collection floor prices or NFT liquidity; no relevant fungible pool has been established.' },
  'magic-eden-nft-drain': { assets: [], note: 'NFT approval and recovery incident. Token pools cannot substitute for affected collections\' floor prices and sales.' },
  'tectonic-cronos': { assets: ['tonic', 'eth'], note: 'TONIC collateral markets on Cronos and WETH as Ethereum proceeds context. Selected pools are not independently attributed to attacker swaps.' },
  'avici-user-drain': { assets: ['solUsdc', 'eth'], note: 'Solana USDC card-balance asset and Ethereum exit-asset context. Pool liquidity is not card reserves or recoverable customer balances.' },
  'moonwell-mamo': { assets: ['mamo', 'baseUsdc', 'cbBtc', 'baseEth'], note: 'MAMO collateral plus selected borrowed assets on Base. wstETH is not mapped until its exact Base deployment is verified. Trades include all participants.' },
  'kiichain-cosmos-evm': { assets: [], note: 'No verified KiiChain KII market pool is configured. BNB-chain lookalike tickers are not substitutes for the exploited asset.' },
  'risex-xlp': { assets: [], note: 'XLP strategy accounting and withdrawals are not public AMM liquidity. No verified RISE XLP pool has been established; use the vault and recovery series below.' },
  'afx-bridge': { assets: ['arbUsdc', 'eth'], note: 'Arbitrum native USDC and Ethereum exit-asset proxy markets, not bridge backing or a confirmed swap route.' },
  'ostium-olp': { assets: ['arbUsdc', 'eth'], note: 'USDC payout-asset and ETH proceeds context. OLP settlement price and vault NAV are separate from AMM prices.' },
  'bonk-dao': { assets: ['bonk'], note: 'BONK treasury asset markets. Trading activity is not proof of DAO-token liquidation.' },
  'altura-hyperevm': { assets: ['hyperUsdt'], note: 'USDT0 collateral market context only. No verified AVLT or impaired-vault share pool is configured; redemption queues and reserves remain separate.' },
  'kelp-dao': { assets: ['rseth', 'eth'], note: 'Ethereum rsETH and WETH markets. Partial multi-chain coverage, not unbacked bridge supply or Aave reserves.' },
  'zcash-orchard': { assets: [], note: 'Native Zcash vulnerability. No verified native ZEC AMM pool is configured; wrapped ZEC would introduce separate bridge and issuer risks.' },
  'drift-protocol': { assets: ['solUsdc', 'sol'], note: 'Selected Solana settlement assets. Wrapped SOL is a native SOL proxy, not Drift account equity.' },
  cetus: { assets: ['sui', 'suiUsdc'], note: 'Sui settlement-asset markets. Selected pools are not necessarily the historical Cetus pools that were drained.' },
  wazirx: { assets: ['shib', 'pepe', 'usdt', 'eth'], note: 'Selected drained assets. Current pools are not an exhaustive stolen-token inventory.' },
  'gala-games': { assets: ['gala', 'eth'], note: 'GALA minting and ETH proceeds context. GALA is the current Ethereum deployment.' },
  mixin: { assets: ['usdt', 'dai', 'eth'], note: 'Ethereum asset and conversion-market context; native BTC and Mixin internal reserves are not represented.' },
  multichain: { assets: ['usdc', 'dai', 'usdt', 'wbtc', 'eth'], note: 'Ethereum assets only. Not depegged Fantom or Moonriver bridge representations.' },
  'euler-finance': { assets: ['usdc', 'dai', 'wbtc', 'steth'], note: 'Selected affected collateral markets. Pool reserves are distinct from Euler lending TVL.' },
  'bnb-bridge': { assets: ['bnb', 'bscUsdt'], note: 'Wrapped BNB proxy and BSC stablecoin markets, not bridge backing or forged BNB supply.' },
  'mango-markets': { assets: ['mngo', 'solUsdc', 'sol'], note: 'MNGO collateral and settlement markets. Current pools may not cover the 2022 exploit window.' },
  wintermute: { assets: ['usdc', 'usdt', 'dai', 'eth'], note: 'Selected stablecoin and ETH markets, not a complete compromised-asset inventory.' },
  'harmony-bridge': { assets: ['eth', 'usdc', 'usdt'], note: 'Ethereum-side underlying assets; not Harmony depegged bridged representations.' },
  'nomad-bridge': { assets: ['usdc', 'dai', 'wbtc', 'eth'], note: 'Selected Ethereum bridge assets. History may be unavailable for the 2022 incident.' },
  beanstalk: { assets: ['dai', 'usdc', 'usdt', 'eth'], note: 'Funding and proceeds context only. Historical BEAN deployment and exploited pools are not substituted with a newer token.' },
  'ronin-bridge': { assets: ['usdc', 'eth'], note: 'Ethereum backing assets. WETH is an ETH proxy, not Ronin bridge TVL.' },
  wormhole: { assets: ['eth', 'sol'], note: 'Wrapped native-asset proxies only. WETH is not the unbacked Solana whETH deployment from the exploit.' },
  'vulcan-forged': { assets: ['pyr', 'eth'], note: 'Ethereum PYR and WETH context; Polygon holdings are not covered by an Ethereum pool.' },
  bitmart: { assets: ['eth', 'bnb', 'usdt'], note: 'Selected Ethereum/BSC markets, not an exhaustive drained-token inventory.' },
  badger: { assets: ['wbtc'], note: 'Underlying WBTC market, not Badger vault share price or drained vault holdings.' },
  'cream-finance': { assets: ['dai', 'wbtc', 'eth'], note: 'Selected underlying collateral context. No verified historical yUSDVault share pool is configured.' },
  compound: { assets: ['comp'], note: 'COMP distribution asset. Pool sales are not automatically sales by excess-COMP recipients.' },
  'poly-network': { assets: ['usdc', 'dai', 'wbtc', 'usdt', 'eth', 'bnb'], note: 'Selected Ethereum/BSC markets. Polygon and other bridge representations are not covered.' },
}

export const MARKET_POOLS: Record<string, MarketPool[]> = Object.fromEntries(
  Object.entries(MARKET_COVERAGE).map(([slug, coverage]) => [slug, coverage.assets.flatMap(asset => {
    const entry = verified[asset]
    return entry.pools.map(pool => ({ ...pool, createdAt: Date.parse(pool.createdAt) >= Date.UTC(2009, 0, 1) ? pool.createdAt : undefined, network: entry.network, token: entry.token,
      label: `${entry.symbol} | ${pool.label}`, verifiedAt: entry.verifiedAt, source: entry.source,
      incidentTs: 0, // Assigned from the incident record on the server.
    }))
  })])
)
