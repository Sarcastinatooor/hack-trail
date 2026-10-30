import { NextResponse } from 'next/server'
import { INCIDENT_DATA_BY_SLUG } from '@/data/all-incident-data'
import type { TrackedWallet } from '@/data/types'

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  arbitrum: 42161,
  base: 8453,
  optimism: 10,
  polygon: 137,
  unichain: 130,
}

const NATIVE_SYMBOLS: Record<string, string> = {
  ethereum: 'ETH',
  bsc: 'BNB',
  arbitrum: 'ETH',
  base: 'ETH',
  optimism: 'ETH',
  polygon: 'MATIC',
  unichain: 'ETH',
  rise: 'RISE',
  hyperevm: 'HYPE',
  solana: 'SOL',
  sui: 'SUI',
  bitcoin: 'BTC',
  kiichain: 'KII',
}

interface TokenHolding {
  symbol: string
  name: string
  balance: number
  contract: string
  decimals: number
}

async function getEthBalance(address: string, chain: string): Promise<number | null> {
  const chainId = CHAIN_IDS[chain.toLowerCase()]
  if (!chainId) return null
  const apiKey = process.env.ETHERSCAN_API_KEY || ''
  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`,
      { next: { revalidate: 300 } }
    )
    const json = await res.json()
    if (json.status === '1') {
      return parseFloat(json.result) / 1e18
    }
    return 0
  } catch {
    return 0
  }
}

async function getTokenHoldings(address: string, chain: string): Promise<TokenHolding[]> {
  const chainId = CHAIN_IDS[chain.toLowerCase()]
  if (!chainId) return []
  const apiKey = process.env.ETHERSCAN_API_KEY || ''
  try {
    const res = await fetch(
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokentx&address=${address}&page=1&offset=10000&sort=asc&apikey=${apiKey}`,
      { next: { revalidate: 60 } }
    )
    const json = await res.json()
    if (!Array.isArray(json.result) || json.result.length === 0) {
      if (chain.toLowerCase() === 'ethereum') {
        const blockscout = await fetch(
          `https://eth.blockscout.com/api/v2/addresses/${address}/token-balances`,
          { next: { revalidate: 60 } }
        )
        const balances = await blockscout.json()
        if (Array.isArray(balances)) {
          return balances
            .map((item: { token?: { address_hash?: string; name?: string; symbol?: string; decimals?: string }; value?: string }) => {
              const decimals = Number(item.token?.decimals || 0)
              const raw = Number(item.value || 0)
              return {
                symbol: item.token?.symbol || 'TOKEN',
                name: item.token?.name || item.token?.symbol || 'Token',
                balance: decimals ? raw / 10 ** decimals : raw,
                contract: item.token?.address_hash || '',
                decimals,
              }
            })
            .filter((token: TokenHolding) => token.contract && Number.isFinite(token.balance) && token.balance > 0)
            .sort((a: TokenHolding, b: TokenHolding) => b.balance - a.balance)
            .slice(0, 12)
        }
      }
      return []
    }

    const balances = new Map<string, TokenHolding & { rawBalance: bigint }>()
    for (const transfer of json.result as Array<{
      contractAddress?: string
      tokenSymbol?: string
      tokenName?: string
      tokenDecimal?: string
      value?: string
      from?: string
      to?: string
    }>) {
      const contract = (transfer.contractAddress || '').toLowerCase()
      if (!contract) continue
      const decimals = Number(transfer.tokenDecimal || 0)
      const value = BigInt(transfer.value || '0')
      const existing = balances.get(contract) ?? {
        symbol: transfer.tokenSymbol || 'TOKEN',
        name: transfer.tokenName || transfer.tokenSymbol || 'Token',
        balance: 0,
        contract,
        decimals,
        rawBalance: BigInt(0),
      }
      if ((transfer.to || '').toLowerCase() === address.toLowerCase()) existing.rawBalance += value
      if ((transfer.from || '').toLowerCase() === address.toLowerCase()) existing.rawBalance -= value
      existing.balance = Number(existing.rawBalance) / 10 ** decimals
      balances.set(contract, existing)
    }

    return [...balances.values()]
      .filter((token) => token.rawBalance > BigInt(0) && Number.isFinite(token.balance) && token.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .map(({ rawBalance, ...token }) => {
        void rawBalance
        return token
      })
      .slice(0, 12)
  } catch {
    return []
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = INCIDENT_DATA_BY_SLUG[slug]
  if (!data) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  const wallets = data.tracked_wallets
  if (!wallets.length) {
    return NextResponse.json({ data: [], note: 'No tracked wallets for this incident (shielded/private chain)' })
  }

  const results = await Promise.all(
    wallets.map(async (w: TrackedWallet) => {
      const [balance, tokens] = await Promise.all([
        getEthBalance(w.address, w.chain),
        getTokenHoldings(w.address, w.chain),
      ])
      return {
        address: w.address,
        chain: w.chain,
        label: w.label,
        role: w.role,
        notes: w.notes,
        source_label: w.sourceLabel,
        balance_eth: balance,
        native_symbol: NATIVE_SYMBOLS[w.chain.toLowerCase()] ?? 'ETH',
        tokens,
        total_usd: 0, // Would need price * balance
      }
    })
  )

  return NextResponse.json({ data: results })
}
