# Pool market impact

Every published incident has an explicit coverage entry in `src/data/market-pools.ts`. Applicable fungible assets have up to two reviewed pools per asset; NFT incidents and unsupported networks show a specific explanation instead of disappearing. Multi-chain and multi-asset coverage is explicitly partial, never an exhaustive stolen-token inventory.

`src/data/verified-market-pools.json` records exact CoinGecko IDs/contracts and GeckoTerminal pool membership, source URLs, creation dates and verification timestamps. `scripts/verify-market-pools.mjs` regenerates it from the official CoinGecko coins list with `include_platform=true`. Never infer identity from symbols. Selection requires a reviewed counterpart contract (major settlement assets on that network), excludes multi-asset pools, then ranks reported liquidity. This is not proof of authenticity, safety, or attacker usage. Missing/epoch-zero creation dates are unknown, not evidence the pool predates the exploit. New mappings require review before publication.

## Configuration

- Without a key, requests use GeckoTerminal public API. Rate limits and historical coverage apply.
- Optional `COINGECKO_ONCHAIN_API_KEY` and `COINGECKO_ONCHAIN_PLAN=demo|pro` explicitly select CoinGecko credentials. Do not infer tier from the key prefix.
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for persistent readings. Vercel's integration names `KV_REST_API_URL` and `KV_REST_API_TOKEN` are also supported as a pair. The app does not silently fall back to process memory or a serverless filesystem. Missing or failed storage is disclosed in the UI.
- Redis retains at most 2,016 readings per network/token/pool, with a 30-day inactivity expiry. Writes are atomically limited to one per five-minute bucket. Sampling is request-driven while the panel is open, not an unattended monitoring service.

## Semantics

Current readings and risk responses use the provider response date; responses may be cached for five minutes. A successful fetch does not establish when the provider last indexed a token. History comparisons use successive saved readings, not an invented pre-incident baseline. Rolling 24-hour volume differences are not incremental volume. A market selector fetches one allowlisted network/token/pool at a time to bound rate-limit pressure. Arbitrary caller-supplied addresses are rejected.

OHLCV requests cover 24 hours before through 48 hours after the incident record's start timestamp. Pools created after the incident are explicitly labelled and never queried as incident history. Unavailable history stays unavailable, with no substitution of recent candles. Missing intervals are not filled. All displayed OHLCV prices/volumes are USD. Older incidents may exceed public API history retention even when a pool existed at the time.

Failed pool requests use the last saved reading marked stale, or unavailable when no saved reading exists. Risk fields are independently optional and never produce a safety verdict. Null/blank/invalid numbers are not zero. Pool identity and token membership are validated before accepting metrics.

Do not attribute pool activity to an attacker without transaction evidence. Pool dollar-liquidity can move due to price, trading, or migrations. GT indicators are not the entire website's third-party risk report.

## Verification

`node --experimental-strip-types --test tests/market-impact.test.mjs`

Provider references:
- https://docs.coingecko.com/reference/pool-address
- https://docs.coingecko.com/reference/pool-ohlcv-contract-address
- https://docs.coingecko.com/reference/token-info-contract-address
- https://www.geckoterminal.com/rug-checker
