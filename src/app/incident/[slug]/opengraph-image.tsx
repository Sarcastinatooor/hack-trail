import { ImageResponse } from "next/og"
import { INCIDENT_DATA_BY_SLUG } from "@/data/all-incident-data"
import { INCIDENTS } from "@/data/incidents"

export const alt = "HackTrail incident preview"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

function formatUsd(value: number) {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toLocaleString()}`
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

function LogoMark({ size: markSize = 64 }: { size?: number }) {
  return (
    <svg width={markSize} height={markSize} viewBox="0 0 128 128" fill="none">
      <defs>
        <linearGradient id="og-trail" x1="25" y1="24" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FF88" />
          <stop offset="0.55" stopColor="#00D4FF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="og-shield" x1="20" y1="18" x2="108" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00FF88" stopOpacity="0.95" />
          <stop offset="1" stopColor="#00D4FF" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="108" height="108" rx="24" fill="#050507" />
      <path
        d="M64 18L100 32V58C100 82.5 85.5 101.5 64 110C42.5 101.5 28 82.5 28 58V32L64 18Z"
        stroke="url(#og-shield)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M42 38V90M86 38V90"
        stroke="url(#og-trail)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M42 66H56L64 54L72 74L86 58"
        stroke="url(#og-trail)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M48 40H80" stroke="#E5FFF3" strokeOpacity="0.9" strokeWidth="5" strokeLinecap="round" />
      <path d="M55 90H73" stroke="#E5FFF3" strokeOpacity="0.72" strokeWidth="5" strokeLinecap="round" />
      <circle cx="42" cy="66" r="7" fill="#050507" stroke="#00FF88" strokeWidth="5" />
      <circle cx="64" cy="54" r="7" fill="#050507" stroke="#00D4FF" strokeWidth="5" />
      <circle cx="86" cy="58" r="7" fill="#050507" stroke="#8B5CF6" strokeWidth="5" />
    </svg>
  )
}

function MoonwellMamoOpenGraphCard() {
  const flowNodes = [
    { eyebrow: "COLLATERAL", label: "15.09M MAMO", color: "#8b5cf6" },
    { eyebrow: "ORACLE", label: "38.2x spike", color: "#ff315d" },
    { eyebrow: "BORROW", label: "4 markets", color: "#00d4ff" },
    { eyebrow: "LIQUIDATION", label: "595 calls", color: "#00ff88" },
  ]

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#050507",
        color: "#f4f4f5",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "40px 46px 30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "radial-gradient(circle at 88% 20%, rgba(139,92,246,0.14), transparent 30%), radial-gradient(circle at 18% 82%, rgba(0,212,255,0.08), transparent 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.4,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          display: "flex",
          background: "linear-gradient(90deg, #00ff88 0%, #00d4ff 48%, #8b5cf6 76%, #ff315d 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LogoMark size={62} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 900, letterSpacing: 1.5 }}>
              <span>HACK</span><span style={{ color: "#00ff88" }}>TRAIL</span>
            </div>
            <div style={{ display: "flex", color: "#71717a", fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>
              ON-CHAIN INCIDENT INTELLIGENCE
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", padding: "9px 14px", border: "1px solid rgba(0,212,255,0.35)", borderRadius: 6, color: "#00d4ff", background: "rgba(0,212,255,0.07)", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 }}>
            BASE
          </div>
          <div style={{ display: "flex", padding: "9px 14px", border: "1px solid rgba(255,49,93,0.38)", borderRadius: 6, color: "#ff5578", background: "rgba(255,49,93,0.08)", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 }}>
            ACTIVE INCIDENT
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 30, flex: 1, paddingTop: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 710 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#a1a1aa", fontSize: 12, fontWeight: 800, letterSpacing: 1.4 }}>
            <span style={{ color: "#ff315d" }}>ORACLE MANIPULATION</span>
            <span style={{ color: "#3f3f46" }}>/</span>
            <span>AUG 27, 2026</span>
          </div>
          <div style={{ display: "flex", marginTop: 13, fontSize: 45, lineHeight: 1.05, fontWeight: 850, letterSpacing: -0.6 }}>
            Moonwell MAMO Oracle Manipulation
          </div>
          <div style={{ display: "flex", marginTop: 14, color: "#a1a1aa", fontSize: 17, lineHeight: 1.42, maxWidth: 690 }}>
            A thin-liquidity collateral spike enabled cross-market borrowing and left Moonwell with residual bad debt.
          </div>

          <div style={{ display: "flex", alignItems: "stretch", marginTop: 25, gap: 7 }}>
            {flowNodes.map((node, index) => (
              <div key={node.eyebrow} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ display: "flex", flexDirection: "column", width: 150, padding: "12px 13px", border: `1px solid ${node.color}55`, borderRadius: 7, background: `${node.color}0D` }}>
                  <div style={{ display: "flex", color: node.color, fontSize: 9, fontWeight: 900, letterSpacing: 1.4 }}>{node.eyebrow}</div>
                  <div style={{ display: "flex", marginTop: 5, color: "#e4e4e7", fontSize: 16, fontWeight: 800 }}>{node.label}</div>
                </div>
                {index < flowNodes.length - 1 ? <div style={{ display: "flex", color: "#52525b", fontSize: 17, fontWeight: 900 }}>&gt;</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 360, border: "1px solid rgba(255,49,93,0.36)", borderRadius: 8, background: "rgba(255,49,93,0.065)", padding: "22px 22px 18px" }}>
          <div style={{ display: "flex", color: "#a1a1aa", fontSize: 10, fontWeight: 900, letterSpacing: 1.6 }}>RESIDUAL BAD DEBT</div>
          <div style={{ display: "flex", color: "#ff315d", fontSize: 54, lineHeight: 1, fontWeight: 900, marginTop: 9 }}>$9.19M</div>
          <div style={{ display: "flex", color: "#71717a", fontSize: 12, marginTop: 8 }}>backed by approximately $0.05 of collateral</div>
          <div style={{ display: "flex", gap: 10, marginTop: 19 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.025)", padding: "12px 11px" }}>
              <div style={{ display: "flex", color: "#71717a", fontSize: 8, fontWeight: 900, letterSpacing: 1.2 }}>ORACLE PEAK</div>
              <div style={{ display: "flex", color: "#f4f4f5", fontSize: 20, fontWeight: 850, marginTop: 4 }}>$0.4025</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.025)", padding: "12px 11px" }}>
              <div style={{ display: "flex", color: "#71717a", fontSize: 8, fontWeight: 900, letterSpacing: 1.2 }}>HEALTH FACTOR</div>
              <div style={{ display: "flex", color: "#f4f4f5", fontSize: 20, fontWeight: 850, marginTop: 4 }}>5.57e-9</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 16, paddingTop: 13 }}>
            <div style={{ display: "flex", color: "#71717a", fontSize: 9, fontWeight: 900, letterSpacing: 1.3 }}>BORROWED ASSETS</div>
            <div style={{ display: "flex", color: "#d4d4d8", fontSize: 14, fontWeight: 800, marginTop: 6 }}>cbBTC / USDC / wstETH / WETH</div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, marginTop: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, color: "#71717a", fontSize: 11 }}>
          <span style={{ color: "#a1a1aa", fontWeight: 800 }}>Borrower 0x719e...919d</span>
          <span style={{ color: "#3f3f46" }}>/</span>
          <span>15.09M MAMO supplied</span>
          <span style={{ color: "#3f3f46" }}>/</span>
          <span>Postmortem pending</span>
        </div>
        <div style={{ display: "flex", color: "#00ff88", fontSize: 13, fontWeight: 900 }}>hack-trail.vercel.app/incident/moonwell-mamo</div>
      </div>
    </div>
  )
}

function AviciRainOpenGraphCard() {
  const flowNodes = [
    { eyebrow: "ROOT CAUSE", label: "Outdated Rain contract", color: "#ff315d" },
    { eyebrow: "IMPACT", label: "1,685 users", color: "#f59e0b" },
    { eyebrow: "CONTAINMENT", label: "Contract upgraded", color: "#00d4ff" },
    { eyebrow: "RECOVERY", label: "Full refunds promised", color: "#00ff88" },
  ]

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#050507",
        color: "#f4f4f5",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "38px 46px 28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", background: "radial-gradient(circle at 88% 18%, rgba(0,255,136,0.10), transparent 30%), radial-gradient(circle at 15% 86%, rgba(0,212,255,0.08), transparent 32%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.38, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, display: "flex", background: "linear-gradient(90deg, #00ff88 0%, #00d4ff 46%, #8b5cf6 74%, #ff315d 100%)" }} />

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LogoMark size={62} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", fontSize: 24, fontWeight: 900, letterSpacing: 1.5 }}>
              <span>HACK</span><span style={{ color: "#00ff88" }}>TRAIL</span>
            </div>
            <div style={{ display: "flex", color: "#71717a", fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>ON-CHAIN INCIDENT INTELLIGENCE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", padding: "9px 14px", border: "1px solid rgba(139,92,246,0.38)", borderRadius: 6, color: "#a78bfa", background: "rgba(139,92,246,0.08)", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 }}>SOLANA</div>
          <div style={{ display: "flex", padding: "9px 14px", border: "1px solid rgba(0,255,136,0.35)", borderRadius: 6, color: "#00ff88", background: "rgba(0,255,136,0.07)", fontSize: 11, fontWeight: 900, letterSpacing: 1.3 }}>CONTAINED</div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", gap: 30, flex: 1, paddingTop: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 710 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#a1a1aa", fontSize: 12, fontWeight: 800, letterSpacing: 1.4 }}>
            <span style={{ color: "#ff5578" }}>RAIN CARD CONTRACT INCIDENT</span><span style={{ color: "#3f3f46" }}>/</span><span>AUG 28, 2026</span>
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 43, lineHeight: 1.04, fontWeight: 850, letterSpacing: -0.5 }}>Avici / Rain Solana Card Contract Drain</div>
          <div style={{ display: "flex", marginTop: 12, color: "#a1a1aa", fontSize: 16, lineHeight: 1.4, maxWidth: 690 }}>An outdated Rain card contract enabled unauthorized withdrawals from separate Avici card-balance accounts.</div>

          <div style={{ display: "flex", alignItems: "stretch", marginTop: 21, gap: 6 }}>
            {flowNodes.map((node, index) => (
              <div key={node.eyebrow} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", width: 150, padding: "11px 11px", border: `1px solid ${node.color}55`, borderRadius: 7, background: `${node.color}0D` }}>
                  <div style={{ display: "flex", color: node.color, fontSize: 8, fontWeight: 900, letterSpacing: 1.15 }}>{node.eyebrow}</div>
                  <div style={{ display: "flex", marginTop: 5, color: "#e4e4e7", fontSize: 14, fontWeight: 800 }}>{node.label}</div>
                </div>
                {index < flowNodes.length - 1 ? <div style={{ display: "flex", color: "#52525b", fontSize: 16, fontWeight: 900 }}>&gt;</div> : null}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 360, border: "1px solid rgba(255,49,93,0.34)", borderRadius: 8, background: "rgba(255,49,93,0.055)", padding: "20px 21px 17px" }}>
          <div style={{ display: "flex", color: "#a1a1aa", fontSize: 10, fontWeight: 900, letterSpacing: 1.6 }}>CONFIRMED AVICI IMPACT</div>
          <div style={{ display: "flex", color: "#ff315d", fontSize: 48, lineHeight: 1, fontWeight: 900, marginTop: 8 }}>$500,859.22</div>
          <div style={{ display: "flex", color: "#71717a", fontSize: 12, marginTop: 7 }}>separate card balances only</div>
          <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, background: "rgba(255,255,255,0.025)", padding: "11px 10px" }}>
              <div style={{ display: "flex", color: "#71717a", fontSize: 8, fontWeight: 900, letterSpacing: 1.1 }}>AFFECTED USERS</div>
              <div style={{ display: "flex", color: "#f4f4f5", fontSize: 21, fontWeight: 850, marginTop: 4 }}>1,685</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, border: "1px solid rgba(0,255,136,0.16)", borderRadius: 6, background: "rgba(0,255,136,0.035)", padding: "11px 10px" }}>
              <div style={{ display: "flex", color: "#71717a", fontSize: 8, fontWeight: 900, letterSpacing: 1.1 }}>WALLET STATUS</div>
              <div style={{ display: "flex", color: "#00ff88", fontSize: 18, fontWeight: 850, marginTop: 4 }}>SOL + EVM safe</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 14, paddingTop: 12 }}>
            <div style={{ display: "flex", color: "#71717a", fontSize: 9, fontWeight: 900, letterSpacing: 1.2 }}>REFUND STATUS</div>
            <div style={{ display: "flex", color: "#00ff88", fontSize: 13, fontWeight: 850 }}>Full refund promised</div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(245,158,11,0.22)", borderRadius: 7, background: "rgba(245,158,11,0.035)", padding: "10px 13px", marginTop: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", color: "#f59e0b", fontSize: 9, fontWeight: 900, letterSpacing: 1.3 }}>BROADER CAMPAIGN / ATTRIBUTED</span>
          <span style={{ display: "flex", color: "#f4f4f5", fontSize: 16, fontWeight: 900 }}>~$1.02M</span>
          <span style={{ display: "flex", color: "#71717a", fontSize: 11 }}>10,005 SOL + stables &gt; deBridge &gt; ~418 ETH &gt; reported Tornado route</span>
        </div>
        <div style={{ display: "flex", color: "#a1a1aa", fontSize: 10 }}>Tria related / Solayer Pay unaffected</div>
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12, marginTop: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#71717a", fontSize: 10 }}>
          <span style={{ color: "#a1a1aa", fontWeight: 800 }}>Rain: affected contract upgraded</span><span style={{ color: "#3f3f46" }}>/</span><span>No further unauthorized activity observed</span>
        </div>
        <div style={{ display: "flex", color: "#00ff88", fontSize: 13, fontWeight: 900 }}>hack-trail.vercel.app/incident/avici-user-drain</div>
      </div>
    </div>
  )
}

function RisexOpenGraphCard() {
  const flowNodes = [
    { eyebrow: "SOURCE", label: "RWA strategy", color: "#ff315d" },
    { eyebrow: "RECIPIENT", label: "0x04a7...10a5", color: "#f59e0b" },
    { eyebrow: "EXIT SPLIT", label: "2 RiseVault legs", color: "#00d4ff" },
    { eyebrow: "ROUTE", label: "USDC burn adapters", color: "#00ff88" },
  ]

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#050507",
        color: "#f4f4f5",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "42px 46px 34px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "radial-gradient(circle at 84% 18%, rgba(0,255,136,0.11), transparent 28%), radial-gradient(circle at 12% 78%, rgba(0,212,255,0.07), transparent 30%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          opacity: 0.42,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          display: "flex",
          background: "linear-gradient(90deg, #00ff88 0%, #00d4ff 55%, #ff315d 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 62,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 58,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(0,255,136,0.32)",
              borderRadius: 12,
              background: "rgba(0,0,0,0.68)",
              boxShadow: "0 0 24px rgba(0,255,136,0.12)",
            }}
          >
            <LogoMark size={52} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", fontSize: 25, fontWeight: 900, letterSpacing: 2 }}>
              <div style={{ display: "flex", color: "#ffffff" }}>HACK</div>
              <div style={{ display: "flex", color: "#00ff88" }}>TRAIL</div>
            </div>
            <div style={{ display: "flex", marginTop: 3, color: "#71717a", fontSize: 11, fontWeight: 700, letterSpacing: 3 }}>
              ON-CHAIN INCIDENT INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid rgba(0,212,255,0.25)",
              borderRadius: 8,
              background: "rgba(0,212,255,0.055)",
              padding: "9px 13px",
              color: "#8be7f8",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.7,
            }}
          >
            <div style={{ width: 7, height: 7, display: "flex", borderRadius: 99, background: "#00d4ff" }} />
            RISE VERIFIED TX
          </div>
          <div
            style={{
              display: "flex",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.035)",
              padding: "9px 13px",
              color: "#a1a1aa",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
            }}
          >
            AUG 3, 2026
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          gap: 30,
          marginTop: 30,
        }}
      >
        <div style={{ width: 718, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(255,49,93,0.36)",
                borderRadius: 7,
                background: "rgba(255,49,93,0.1)",
                padding: "7px 10px",
                color: "#ff6687",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              UNAUTHORIZED WITHDRAWAL
            </div>
            <div style={{ display: "flex", color: "#71717a", fontSize: 13, fontWeight: 700 }}>
              RISEx XLP · RWA STRATEGY
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 15,
              maxWidth: 700,
              fontSize: 51,
              fontWeight: 900,
              lineHeight: 1.03,
              letterSpacing: -1.2,
            }}
          >
            RISEx XLP RWA Strategy Unauthorized Withdrawal
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 15,
              maxWidth: 690,
              color: "#a1a1aa",
              fontSize: 18,
              lineHeight: 1.38,
            }}
          >
            A strategy misconfiguration enabled one withdrawal before RISEx patched the issue and covered the full amount from July fees.
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginTop: 25 }}>
            {flowNodes.map((node, index) => (
              <div key={node.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 142,
                    height: 68,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    border: `1px solid ${node.color}35`,
                    borderLeft: `3px solid ${node.color}`,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.028)",
                    padding: "9px 11px",
                  }}
                >
                  <div style={{ display: "flex", color: node.color, fontSize: 9, fontWeight: 900, letterSpacing: 1.6 }}>
                    {node.eyebrow}
                  </div>
                  <div style={{ display: "flex", marginTop: 5, color: "#d4d4d8", fontSize: 13, fontWeight: 800 }}>
                    {node.label}
                  </div>
                </div>
                {index < flowNodes.length - 1 && (
                  <div style={{ width: 17, display: "flex", alignItems: "center", justifyContent: "center", color: "#52525b", fontSize: 18 }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 360,
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 12,
            background: "rgba(8,9,12,0.88)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "20px 22px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,49,93,0.055)",
            }}
          >
            <div style={{ display: "flex", color: "#71717a", fontSize: 10, fontWeight: 900, letterSpacing: 2.1 }}>
              UNAUTHORIZED WITHDRAWAL
            </div>
            <div style={{ display: "flex", marginTop: 7, color: "#ff315d", fontSize: 44, fontWeight: 900, letterSpacing: -1 }}>
              $673,011.56
            </div>
            <div style={{ display: "flex", marginTop: 2, color: "#f4f4f5", fontSize: 20, fontWeight: 800 }}>
              USDC.e on RISE
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, padding: "13px 14px 0" }}>
            <div
              style={{
                width: 160,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(0,212,255,0.18)",
                borderRadius: 8,
                background: "rgba(0,212,255,0.045)",
                padding: "11px 12px",
              }}
            >
              <div style={{ display: "flex", color: "#71717a", fontSize: 9, fontWeight: 900, letterSpacing: 1.5 }}>PATCH WINDOW</div>
              <div style={{ display: "flex", marginTop: 4, color: "#00d4ff", fontSize: 27, fontWeight: 900 }}>47m</div>
              <div style={{ display: "flex", marginTop: 2, color: "#71717a", fontSize: 10 }}>07:21 → 08:09 UTC</div>
            </div>
            <div
              style={{
                width: 160,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(245,158,11,0.18)",
                borderRadius: 8,
                background: "rgba(245,158,11,0.045)",
                padding: "11px 12px",
              }}
            >
              <div style={{ display: "flex", color: "#71717a", fontSize: 9, fontWeight: 900, letterSpacing: 1.5 }}>SCOPE REVIEW</div>
              <div style={{ display: "flex", marginTop: 4, color: "#f59e0b", fontSize: 27, fontWeight: 900 }}>1 tx</div>
              <div style={{ display: "flex", marginTop: 2, color: "#71717a", fontSize: 10 }}>only withdrawal found</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              margin: "10px 14px 0",
              border: "1px solid rgba(0,255,136,0.24)",
              borderRadius: 8,
              background: "rgba(0,255,136,0.07)",
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", color: "#00ff88", fontSize: 10, fontWeight: 900, letterSpacing: 1.8 }}>
              DEPOSITOR STATUS
            </div>
            <div style={{ display: "flex", marginTop: 4, color: "#ffffff", fontSize: 23, fontWeight: 900 }}>
              Made whole
            </div>
            <div style={{ display: "flex", marginTop: 2, color: "#8ba497", fontSize: 11 }}>
              Covered from July fees
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "11px 14px 0", color: "#fbbf24", fontSize: 10, fontWeight: 800 }}>
            <div style={{ width: 6, height: 6, display: "flex", borderRadius: 99, background: "#f59e0b" }} />
            NO RECOVERY FORM OR CLAIM PROCESS
          </div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 15,
          marginTop: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 17, color: "#71717a", fontSize: 12 }}>
          <div style={{ display: "flex", color: "#a1a1aa", fontWeight: 800 }}>Official disclosure: @risextrade</div>
          <div style={{ display: "flex", color: "#3f3f46" }}>•</div>
          <div style={{ display: "flex" }}>RISE explorer tx: 0xc525...e987</div>
          <div style={{ display: "flex", color: "#3f3f46" }}>•</div>
          <div style={{ display: "flex" }}>SEAL 911 tracing underway</div>
        </div>
        <div style={{ display: "flex", color: "#00ff88", fontSize: 13, fontWeight: 900 }}>
          hack-trail.vercel.app/incident/risex-xlp
        </div>
      </div>
    </div>
  )
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const summary = INCIDENTS.find((incident) => incident.slug === slug)
  const detail = INCIDENT_DATA_BY_SLUG[slug]

  const name = summary?.name ?? "HackTrail Incident Intelligence"
  const victim = summary?.victim ?? detail?.incident.victim ?? "DeFi Incident"
  const loss = summary?.loss_label ?? (summary ? formatUsd(summary.loss_usd) : "Exploit Intel")
  const date = summary?.date_label ?? "Live Intel"
  const chains = summary?.chains.join(" / ") ?? detail?.incident.chains_touched.join(" / ") ?? "Onchain"
  const vector = summary?.attack_vector ?? detail?.incident.root_cause ?? "On-chain exploit trail"
  const description = truncate(summary?.short_summary ?? detail?.incident.root_cause ?? "", 185)
  const stats = detail?.incident.stats.slice(0, 2) ?? []
  const tags = summary?.tags.slice(0, 5) ?? []

  if (slug === "moonwell-mamo") {
    return new ImageResponse(<MoonwellMamoOpenGraphCard />, size)
  }

  if (slug === "avici-user-drain") {
    return new ImageResponse(<AviciRainOpenGraphCard />, size)
  }

  if (slug === "risex-xlp") {
    return new ImageResponse(<RisexOpenGraphCard />, size)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #050507 0%, #080b10 47%, #06110d 100%)",
          color: "#f5f5f5",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 54,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 86% 12%, rgba(0,255,136,0.18), transparent 32%), radial-gradient(circle at 12% 88%, rgba(0,212,255,0.12), transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, #00ff88, #00d4ff, #ff2255)",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 17,
                border: "1px solid rgba(0,255,136,0.35)",
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 28px rgba(0,255,136,0.15)",
              }}
            >
              <LogoMark />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>
                HACK<span style={{ color: "#00ff88" }}>TRAIL</span>
              </div>
              <div style={{ fontSize: 13, color: "#7d8590", letterSpacing: 3 }}>
                CRYPTO EXPLOIT INTELLIGENCE
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#00ff88",
              border: "1px solid rgba(0,255,136,0.35)",
              background: "rgba(0,255,136,0.08)",
              borderRadius: 999,
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                background: "#00ff88",
                display: "flex",
              }}
            />
            LIVE INCIDENT CARD
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 36,
            flex: 1,
            marginTop: 44,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 740 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22 }}>
              <div
                style={{
                  color: "#ff2255",
                  background: "rgba(255,34,85,0.12)",
                  border: "1px solid rgba(255,34,85,0.36)",
                  borderRadius: 10,
                  padding: "9px 13px",
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: 2,
                }}
              >
                ACTIVE INCIDENT
              </div>
              <div style={{ color: "#8b949e", fontSize: 18, fontWeight: 700 }}>{date}</div>
              <div style={{ color: "#00d4ff", fontSize: 18, fontWeight: 800 }}>{chains}</div>
            </div>

            <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.02, letterSpacing: -1 }}>
              {truncate(name, 62)}
            </div>
            <div
              style={{
                display: "flex",
                gap: 7,
                marginTop: 16,
                fontSize: 24,
                color: "#a7adb6",
                fontWeight: 700,
              }}
            >
              Victim: <span style={{ color: "#ffffff" }}>{victim}</span>
            </div>
            <div style={{ marginTop: 18, fontSize: 23, color: "#8b949e", lineHeight: 1.35 }}>
              {description}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    border: "1px solid rgba(0,212,255,0.28)",
                    color: "#00d4ff",
                    background: "rgba(0,212,255,0.07)",
                    borderRadius: 9,
                    padding: "8px 12px",
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", width: 300, gap: 14 }}>
            <div
              style={{
                border: "1px solid rgba(255,34,85,0.38)",
                background: "rgba(255,34,85,0.1)",
                borderRadius: 18,
                padding: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ color: "#8b949e", fontSize: 13, letterSpacing: 2, fontWeight: 800 }}>
                TOTAL LOSS
              </div>
              <div style={{ color: "#ff2255", fontSize: 44, fontWeight: 900, marginTop: 7 }}>
                {loss}
              </div>
              <div style={{ color: "#b6bcc6", fontSize: 16, marginTop: 10, lineHeight: 1.25 }}>
                {truncate(vector, 72)}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  width: 145,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.035)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ color: "#7d8590", fontSize: 10, letterSpacing: 2, fontWeight: 800 }}>
                  {stat.label.toUpperCase()}
                </div>
                <div style={{ color: "#ffffff", fontSize: 22, fontWeight: 900, marginTop: 4 }}>
                  {stat.value}
                </div>
                {stat.sub && (
                  <div style={{ color: "#8b949e", fontSize: 11, marginTop: 4 }}>
                    {truncate(stat.sub, 24)}
                  </div>
                )}
              </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            color: "#7d8590",
            fontSize: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 20,
          }}
        >
          <div>Wallet exposure checks, fund flow, timeline, and protocol impact</div>
          <div style={{ display: "flex", color: "#00ff88", fontWeight: 800 }}>
            hack-trail.vercel.app/incident/{slug}
          </div>
        </div>
      </div>
    ),
    size
  )
}
