// Regenerate reviewed market identities from exact CoinGecko IDs, never tickers.
// Usage: node scripts/verify-market-pools.mjs /path/to/coins-list.json
import { readFile, writeFile } from 'node:fs/promises'

const coins = JSON.parse(await readFile(process.argv[2], 'utf8'))
const candidates = {
  eth: ['weth', 'ethereum', 'eth'], usdc: ['usd-coin', 'ethereum', 'eth'],
  usdt: ['tether', 'ethereum', 'eth'], dai: ['dai', 'ethereum', 'eth'],
  ena: ['ethena', 'ethereum', 'eth'], arb: ['arbitrum', 'arbitrum-one', 'arbitrum'],
  uni: ['uniswap', 'ethereum', 'eth'], aave: ['aave', 'ethereum', 'eth'],
  wbtc: ['wrapped-bitcoin', 'ethereum', 'eth'], sol: ['wrapped-solana', 'solana', 'solana'],
  solUsdc: ['usd-coin', 'solana', 'solana'], bonk: ['bonk', 'solana', 'solana'],
  mngo: ['mango-markets', 'solana', 'solana'], tonic: ['tectonic', 'cronos', 'cro'],
  rseth: ['kelp-dao-restaked-eth', 'ethereum', 'eth'], gala: ['gala', 'ethereum', 'eth'],
  shib: ['shiba-inu', 'ethereum', 'eth'], pepe: ['pepe', 'ethereum', 'eth'],
  comp: ['compound-governance-token', 'ethereum', 'eth'], pyr: ['vulcan-forged', 'ethereum', 'eth'],
  sui: ['sui', 'sui', 'sui-network'], suiUsdc: ['usd-coin', 'sui', 'sui-network'],
  mamo: ['mamo', 'base', 'base'], baseUsdc: ['usd-coin', 'base', 'base'],
  arbUsdc: ['usd-coin', 'arbitrum-one', 'arbitrum'],
  steth: ['staked-ether', 'ethereum', 'eth'], bnb: ['wbnb', 'binance-smart-chain', 'bsc'],
  hyperUsdt: ['usdt0', 'hyperevm', 'hyperevm'],
  bscUsdt: ['binance-bridged-usdt-bnb-smart-chain', 'binance-smart-chain', 'bsc'],
  cbBtc: ['coinbase-wrapped-btc', 'base', 'base'],
  baseEth: ['l2-standard-bridged-weth-base', 'base', 'base'],
}
const target = new URL('../src/data/verified-market-pools.json', import.meta.url)
const anchors = {
  eth: [['weth', 'ethereum'], ['usd-coin', 'ethereum'], ['tether', 'ethereum'], ['dai', 'ethereum'], ['wrapped-bitcoin', 'ethereum']],
  arbitrum: [['usd-coin', 'arbitrum-one'], ['arbitrum-bridged-weth-arbitrum-one', 'arbitrum-one'], ['usdt0', 'arbitrum-one']],
  base: [['usd-coin', 'base'], ['l2-standard-bridged-weth-base', 'base'], ['coinbase-wrapped-btc', 'base']],
  solana: [['wrapped-solana', 'solana'], ['usd-coin', 'solana'], ['tether', 'solana']],
  cro: [['wrapped-cro', 'cronos'], ['usd-coin', 'cronos']],
  bsc: [['wbnb', 'binance-smart-chain'], ['binance-bridged-usdt-bnb-smart-chain', 'binance-smart-chain'], ['binance-bridged-usdc-bnb-smart-chain', 'binance-smart-chain']],
  hyperevm: [['wrapped-hype', 'hyperevm'], ['usd-coin', 'hyperevm'], ['usdt0', 'hyperevm']],
  'sui-network': [['sui', 'sui'], ['usd-coin', 'sui']],
}
const canonical = (network, value) => network === 'sui-network' ? value.replace(/0x0+([a-fA-F0-9]+)::/, '0x$1::') : network === 'solana' ? value : value.toLowerCase()
let output = {}
try { output = JSON.parse(await readFile(target, 'utf8')) } catch { /* First run. */ }
for (const [key, [coinId, platform, network]] of Object.entries(candidates)) {
  if (output[key]?.selectionVersion === 2 && !process.argv.includes('--refresh')) continue
  const coin = coins.find(c => c.id === coinId)
  let token = coin?.platforms?.[platform]
  if (!token) throw new Error(`Missing contract for ${key}`)
  if (network === 'sui-network') token = token.replace(/^0x0+([a-fA-F0-9]+)::/, '0x$1::')
  const source = `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${encodeURIComponent(token)}/pools`
  let body
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(source, { signal: AbortSignal.timeout(20000) })
    if (response.ok) { body = await response.json(); break }
    if (response.status !== 429) throw new Error(`${key}: ${response.status}`)
    await new Promise(resolve => setTimeout(resolve, 30000))
  }
  if (!body?.data) throw new Error(`Provider failure for ${key}; refusing to publish empty coverage`)
  const normalize = value => canonical(network, value)
  const tokenId = normalize(`${network}_${token}`)
  const trusted = anchors[network].map(([id, platform]) => normalize(`${network}_${coins.find(c => c.id === id)?.platforms?.[platform]}`))
  if (network === 'eth') trusted.push('eth_0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  const eligible = p => {
    const sides = [p.relationships?.base_token?.data?.id, p.relationships?.quote_token?.data?.id].map(id => id && normalize(id))
    return sides.includes(tokenId) && sides.some(id => id !== tokenId && trusted.includes(id)) && p.attributes.name.split(' / ').length === 2
  }
  for (let page = 2; body.data.filter(eligible).length < 2 && page <= 3; page++) {
    await new Promise(resolve => setTimeout(resolve, 2300))
    const response = await fetch(`${source}?page=${page}`, { signal: AbortSignal.timeout(20000) })
    if (!response.ok) break
    body.data.push(...(await response.json()).data)
  }
  const pools = body.data.filter(eligible)
    .sort((a, b) => Number(b.attributes.reserve_in_usd) - Number(a.attributes.reserve_in_usd))
    .slice(0, 2).map(p => ({ pool: p.attributes.address, label: `${p.attributes.name} / ${p.relationships.dex.data.id}`, createdAt: Date.parse(p.attributes.pool_created_at) >= Date.UTC(2009, 0, 1) ? p.attributes.pool_created_at : '' }))
  output[key] = { network, token, symbol: coin.symbol.toUpperCase(), coinId, source, verifiedAt: new Date().toISOString(), selectionVersion: 2, pools }
  console.log(`${key}: ${network} ${pools.length} verified pools`)
  await writeFile(target, JSON.stringify(output, null, 2) + '\n')
  await new Promise(resolve => setTimeout(resolve, 2300))
}
await writeFile(target, JSON.stringify(output, null, 2) + '\n')
