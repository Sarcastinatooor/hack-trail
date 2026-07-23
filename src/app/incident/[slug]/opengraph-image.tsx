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
