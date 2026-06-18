import { NextResponse } from 'next/server'

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
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  const { searchParams } = new URL(request.url)
  const chain = searchParams.get('chain') || 'ethereum'
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
  const normalizedChain = chain.toLowerCase()
  const chainId = CHAIN_IDS[normalizedChain]
  const nativeSymbol = NATIVE_SYMBOLS[normalizedChain] ?? 'ETH'
  const apiKey = process.env.ETHERSCAN_API_KEY || ''

  if (!chainId) {
    return NextResponse.json({ data: [], note: `Chain ${chain} not supported for transfer lookups` })
  }

  try {
    // Fetch both normal txns and token transfers
    const [txRes, tokenRes] = await Promise.all([
      fetch(
        `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`,
        { next: { revalidate: 300 } }
      ),
      fetch(
        `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`,
        { next: { revalidate: 300 } }
      ),
    ])

    const txJson = await txRes.json()
    const tokenJson = await tokenRes.json()

    const normalTxs = (txJson.status === '1' ? txJson.result : []).map((tx: Record<string, string>) => ({
      tx_hash: tx.hash,
      from_address: tx.from,
      to_address: tx.to,
      amount: (parseFloat(tx.value) / 1e18).toFixed(6),
      token_symbol: nativeSymbol,
      timestamp: parseInt(tx.timeStamp),
      flow: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
    }))

    const tokenTxs = (tokenJson.status === '1' ? tokenJson.result : []).map((tx: Record<string, string>) => ({
      tx_hash: tx.hash,
      from_address: tx.from,
      to_address: tx.to,
      amount: (parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal) || 18)).toFixed(6),
      token_symbol: tx.tokenSymbol || 'UNKNOWN',
      timestamp: parseInt(tx.timeStamp),
      flow: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
    }))

    // Merge and sort by timestamp desc
    const all = [...normalTxs, ...tokenTxs]
      .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
      .slice(0, limit)

    return NextResponse.json({ data: all })
  } catch (e) {
    return NextResponse.json({ data: [], error: String(e) })
  }
}
