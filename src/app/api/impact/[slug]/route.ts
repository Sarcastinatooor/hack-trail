import { NextResponse } from 'next/server'

interface Point {
  ts: number
  value: number
}

interface Summary {
  peak: { ts: number; value: number }
  trough: { ts: number; value: number }
  latest: { ts: number; value: number }
  first: { ts: number; value: number }
  drawdown: number
}

function summarize(data: Point[]): Summary | null {
  if (!data.length) return null
  const peak = data.reduce((a, b) => (a.value > b.value ? a : b))
  const trough = data.reduce((a, b) => (a.value < b.value ? a : b))
  const drawdown = peak.value > 0 ? ((peak.value - trough.value) / peak.value) * 100 : 0
  return { peak, trough, latest: data[data.length - 1], first: data[0], drawdown }
}

interface ImpactConfig {
  tvl: Array<{ key: string; protocol: string }>
  prices: Array<{ key: string; coinId: string }>
  staticSeries?: Array<{ key: string; data: Point[] }>
  from: number
  to: number
}

function lossConfig(
  loss: number,
  start: number,
  to = start + 86400,
  extraSeries: Array<{ key: string; data: Point[] }> = []
): ImpactConfig {
  return {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'cumulative_loss',
        data: [
          { ts: start - 86400, value: 0 },
          { ts: start + 3600, value: loss },
          { ts: to, value: loss },
        ],
      },
      ...extraSeries,
    ],
    from: start - 86400,
    to,
  }
}

async function fetchDefiLlamaTvl(protocol: string, from: number, to: number): Promise<Point[]> {
  try {
    const res = await fetch(`https://api.llama.fi/protocol/${protocol}`, { next: { revalidate: 3600 } })
    if (!res.ok) {
      console.error(`[DefiLlama] ${protocol}: HTTP ${res.status}`)
      return []
    }
    const json = await res.json()
    const tvl = json.tvl || []
    return tvl
      .map((d: { date: number; totalLiquidityUSD: number }) => ({
        ts: d.date,
        value: d.totalLiquidityUSD,
      }))
      .filter((d: Point) => d.ts >= from && d.ts <= to)
      .sort((a: Point, b: Point) => a.ts - b.ts)
  } catch (err) {
    console.error(`[DefiLlama] ${protocol}: fetch error`, err)
    return []
  }
}

async function fetchCoinGeckoPrice(coinId: string, from: number, to: number): Promise<Point[]> {
  try {
    const rawApiKey = process.env.COINGECKO_API_KEY || ''
    const apiKey = (rawApiKey && rawApiKey !== 'your_api_key_here') ? rawApiKey : ''

    let baseUrl = 'https://api.coingecko.com/api/v3'
    const headers: Record<string, string> = {}

    if (apiKey) {
      if (apiKey.startsWith('CG-')) {
        baseUrl = 'https://api.coingecko.com/api/v3'
        headers['x-cg-demo-api-key'] = apiKey
      } else {
        baseUrl = 'https://pro-api.coingecko.com/api/v3'
        headers['x-cg-pro-api-key'] = apiKey
      }
    }

    // CoinGecko free tier only allows 365 days of history.
    // Clamp `from` to max 360 days ago to avoid errors.
    const now = Math.floor(Date.now() / 1000)
    const maxFrom = now - 360 * 86400
    const clampedFrom = Math.max(from, maxFrom)
    const clampedTo = Math.min(to, now)

    if (clampedFrom >= clampedTo) {
      console.warn(`[CoinGecko] ${coinId}: date range outside 365-day window`)
      return []
    }

    const url = `${baseUrl}/coins/${coinId}/market_chart/range?vs_currency=usd&from=${clampedFrom}&to=${clampedTo}`
    const res = await fetch(url, { headers, next: { revalidate: 3600 } })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[CoinGecko] ${coinId}: HTTP ${res.status}`, text.slice(0, 200))
      return []
    }

    const json = await res.json()

    if (json.status?.error_code) {
      console.error(`[CoinGecko] ${coinId}: API error`, json.status.error_message)
      return []
    }

    return (json.prices || []).map(([ms, val]: [number, number]) => ({
      ts: Math.floor(ms / 1000),
      value: val,
    }))
  } catch (err) {
    console.error(`[CoinGecko] ${coinId}: fetch error`, err)
    return []
  }
}

// Config per incident slug
const IMPACT_CONFIG: Record<string, ImpactConfig> = {
  'bonk-dao': {
    tvl: [],
    prices: [
      { key: 'bonk_price', coinId: 'bonk' },
    ],
    from: 1781913600, // 2026-06-20
    to: 1783641600,   // 2026-07-10
  },
  'kelp-dao': {
    tvl: [
      { key: 'aave_tvl', protocol: 'aave' },
      { key: 'kelp_tvl', protocol: 'kelp' },     // Fixed: was 'kelp-dao'
    ],
    prices: [
      { key: 'eth_price', coinId: 'ethereum' },
      { key: 'btc_price', coinId: 'bitcoin' },
    ],
    from: 1774857600, // 2026-03-30
    to: 1777276800,   // 2026-04-27
  },
  'zcash-orchard': {
    tvl: [],
    prices: [
      { key: 'zec_price', coinId: 'zcash' },
    ],
    from: 1779926400, // 2026-05-28 (Fixed: was 2025)
    to: 1780790400,   // 2026-06-07
  },
  'drift-protocol': {
    tvl: [
      { key: 'drift_tvl', protocol: 'drift-trade' },
    ],
    prices: [
      { key: 'sol_price', coinId: 'solana' },
    ],
    from: 1774224000, // 2026-03-20
    to: 1776643200,   // 2026-04-20
  },
  'ronin-bridge': {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'bridge_gap',
        data: [
          { ts: 1647907200, value: 0 },
          { ts: 1647997200, value: 624_000_000 },
          { ts: 1648512000, value: 624_000_000 },
        ],
      },
    ],
    from: 1647907200,
    to: 1648598400,
  },
  'poly-network': {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'cumulative_loss',
        data: [
          { ts: 1628467200, value: 0 },
          { ts: 1628557200, value: 273_000_000 },
          { ts: 1628560800, value: 611_000_000 },
          { ts: 1628640000, value: 611_000_000 },
        ],
      },
      {
        key: 'frozen_value',
        data: [
          { ts: 1628467200, value: 0 },
          { ts: 1628640000, value: 33_000_000 },
        ],
      },
    ],
    from: 1628467200,
    to: 1628726400,
  },
  'bnb-bridge': {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'cumulative_loss',
        data: [
          { ts: 1664995200, value: 0 },
          { ts: 1665080760, value: 293_000_000 },
          { ts: 1665088980, value: 586_000_000 },
        ],
      },
      {
        key: 'funds_escaped',
        data: [
          { ts: 1664995200, value: 0 },
          { ts: 1665091800, value: 127_000_000 },
          { ts: 1665100800, value: 127_000_000 },
        ],
      },
    ],
    from: 1664995200,
    to: 1665187200,
  },
  wormhole: {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'bridge_gap',
        data: [
          { ts: 1643673600, value: 0 },
          { ts: 1643760300, value: 326_000_000 },
          { ts: 1643846400, value: 0 },
        ],
      },
      {
        key: 'funds_escaped',
        data: [
          { ts: 1643673600, value: 0 },
          { ts: 1643763600, value: 254_000_000 },
          { ts: 1643767200, value: 326_000_000 },
        ],
      },
    ],
    from: 1643673600,
    to: 1643932800,
  },
  'euler-finance': {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'protocol_tvl_static',
        data: [
          { ts: 1678579200, value: 264_000_000 },
          { ts: 1678666200, value: 10_000_000 },
          { ts: 1678752000, value: 10_000_000 },
        ],
      },
      {
        key: 'cumulative_loss',
        data: [
          { ts: 1678579200, value: 0 },
          { ts: 1678666200, value: 197_000_000 },
        ],
      },
    ],
    from: 1678579200,
    to: 1678838400,
  },
  'nomad-bridge': {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'cumulative_loss',
        data: [
          { ts: 1659225600, value: 0 },
          { ts: 1659315600, value: 47_000_000 },
          { ts: 1659319200, value: 95_000_000 },
          { ts: 1659324600, value: 190_000_000 },
        ],
      },
      {
        key: 'top_exploiters',
        data: [
          { ts: 1659225600, value: 0 },
          { ts: 1659319200, value: 95_000_000 },
        ],
      },
    ],
    from: 1659225600,
    to: 1659484800,
  },
  beanstalk: {
    tvl: [],
    prices: [],
    staticSeries: [
      {
        key: 'cumulative_loss',
        data: [
          { ts: 1650067200, value: 0 },
          { ts: 1650154800, value: 181_000_000 },
        ],
      },
      {
        key: 'attacker_profit',
        data: [
          { ts: 1650067200, value: 0 },
          { ts: 1650155400, value: 76_000_000 },
        ],
      },
    ],
    from: 1650067200,
    to: 1650240000,
  },
  wazirx: lossConfig(235_000_000, 1721260800, 1721347200),
  cetus: lossConfig(223_000_000, 1747872000, 1747958400, [
    {
      key: 'frozen_value',
      data: [
        { ts: 1747785600, value: 0 },
        { ts: 1747882800, value: 162_000_000 },
      ],
    },
    {
      key: 'funds_escaped',
      data: [
        { ts: 1747785600, value: 0 },
        { ts: 1747879200, value: 60_000_000 },
      ],
    },
  ]),
  'gala-games': lossConfig(216_000_000, 1716163200, 1716249600, [
    {
      key: 'attacker_profit',
      data: [
        { ts: 1716076800, value: 0 },
        { ts: 1716166800, value: 21_800_000 },
      ],
    },
  ]),
  mixin: lossConfig(200_000_000, 1695427200, 1695600000),
  bitmart: lossConfig(196_000_000, 1638576000, 1638662400),
  wintermute: lossConfig(162_300_000, 1663632000, 1663642800, [
    {
      key: 'funds_escaped',
      data: [
        { ts: 1663545600, value: 0 },
        { ts: 1663637400, value: 118_400_000 },
      ],
    },
  ]),
  compound: lossConfig(147_000_000, 1632873600, 1633305600),
  'vulcan-forged': lossConfig(140_000_000, 1639353600, 1639440000),
  'cream-finance': lossConfig(130_000_000, 1635292800, 1635379200),
  multichain: lossConfig(126_300_000, 1688601600, 1688688000, [
    {
      key: 'frozen_value',
      data: [
        { ts: 1688515200, value: 0 },
        { ts: 1688688000, value: 65_000_000 },
      ],
    },
  ]),
  badger: lossConfig(120_000_000, 1638403200, 1638411600),
  'mango-markets': lossConfig(115_000_000, 1665446400, 1665532800),
  'harmony-bridge': lossConfig(100_000_000, 1655942400, 1655992800),
  'ostium-olp': {
    tvl: [
      { key: 'ostium_tvl', protocol: 'ostium' },
    ],
    prices: [],
    staticSeries: [
      {
        key: 'olp_vault_usdc',
        data: [
          { ts: 1784073600, value: 34_300_000 },
          { ts: 1784142227, value: 8_993_473 },
        ],
      },
      {
        key: 'visible_arkham_outflows',
        data: [
          { ts: 1784138400, value: 0 },
          { ts: 1784139060, value: 6_290_000 },
          { ts: 1784139600, value: 11_050_000 },
          { ts: 1784140200, value: 15_540_000 },
          { ts: 1784140800, value: 19_130_000 },
          { ts: 1784141400, value: 21_820_000 },
          { ts: 1784141820, value: 22_890_000 },
        ],
      },
      {
        key: 'largest_exploit_tx',
        data: [
          { ts: 1784138400, value: 0 },
          { ts: 1784138700, value: 11_860_000 },
          { ts: 1784142227, value: 11_860_000 },
        ],
      },
      {
        key: 'defillama_tvl_static',
        data: [
          { ts: 1784073600, value: 63_426_760 },
          { ts: 1784142227, value: 37_835_852 },
        ],
      },
    ],
    from: 1784073600,
    to: 1784160000,
  },
  'altura-hyperevm': {
    tvl: [
      { key: 'mainstreet_tvl', protocol: 'mainstreet' },
      { key: 'altura_tvl', protocol: 'altura' },
    ],
    prices: [],
    staticSeries: [
      {
        key: 'altura_reserves',
        data: [
          { ts: 1781801183, value: 39_938_359.81 },
          { ts: 1781840771, value: 40_512_378.77 },
          { ts: 1781919963, value: 40_609_802.45 },
          { ts: 1782038773, value: 35_509_155.91 },
          { ts: 1782089183, value: 34_163_466.39 },
          { ts: 1782126100, value: 33_773_613.2 },
        ],
      },
      {
        key: 'altura_supply',
        data: [
          { ts: 1781801183, value: 38_468_810.45 },
          { ts: 1781840771, value: 39_047_045.95 },
          { ts: 1781919963, value: 39_196_118.35 },
          { ts: 1782038773, value: 33_865_851.54 },
          { ts: 1782089183, value: 32_413_456.49 },
          { ts: 1782126100, value: 32_419_547.27 },
        ],
      },
      {
        key: 'instant_redemptions',
        data: [
          { ts: 1781919963, value: 0 },
          { ts: 1782075219, value: 8_500_000 },
          { ts: 1782126100, value: 8_500_000 },
        ],
      },
      {
        key: 'total_withdrawal_pressure',
        data: [
          { ts: 1781919963, value: 0 },
          { ts: 1782075219, value: 10_050_000 },
          { ts: 1782126100, value: 10_050_000 },
        ],
      },
      {
        key: 'morpho_idle_liquidity',
        data: [
          { ts: 1781919963, value: 0 },
          { ts: 1782075219, value: 0 },
          { ts: 1782126100, value: 0 },
        ],
      },
      {
        key: 'withdrawal_queue_total',
        data: [
          { ts: 1781919963, value: 0 },
          { ts: 1782075219, value: 2_910_000 },
          { ts: 1782126100, value: 2_910_000 },
        ],
      },
      {
        key: 'withdrawal_queue_outstanding',
        data: [
          { ts: 1781919963, value: 0 },
          { ts: 1782075219, value: 1_550_000 },
          { ts: 1782126100, value: 1_550_000 },
        ],
      },
    ],
    from: 1781801183,
    to: 1782126100,
  },
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const config = IMPACT_CONFIG[slug]
  if (!config) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 })
  }

  const results: Record<string, unknown> = {}

  for (const series of config.staticSeries ?? []) {
    results[series.key] = series.data
    results[`${series.key}_summary`] = summarize(series.data)
  }

  // Fetch TVL data
  await Promise.all(
    config.tvl.map(async ({ key, protocol }) => {
      const data = await fetchDefiLlamaTvl(protocol, config.from, config.to)
      results[key] = data
      results[`${key}_summary`] = summarize(data)
    })
  )

  // Fetch price data
  await Promise.all(
    config.prices.map(async ({ key, coinId }) => {
      const data = await fetchCoinGeckoPrice(coinId, config.from, config.to)
      results[key] = data
      results[`${key}_summary`] = summarize(data)
    })
  )

  return NextResponse.json(results)
}
