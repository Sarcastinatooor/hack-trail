import type { Metadata } from "next"
import { INCIDENTS } from "@/data/incidents"

const SITE_URL = "https://hack-trail.vercel.app"
const OG_IMAGE_VERSION = "hacktrail-logo-v2"
const RISEX_OG_IMAGE_VERSION = "risex-forensic-card-v1"
const MOONWELL_MAMO_OG_IMAGE_VERSION = "moonwell-mamo-forensic-card-v1"
const AVICI_OG_IMAGE_VERSION = "avici-rain-forensic-card-v4"
const TECTONIC_OG_IMAGE_VERSION = "tectonic-cronos-forensic-card-v1"

function truncate(text: string, max = 180) {
  return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const incident = INCIDENTS.find((item) => item.slug === slug)

  if (!incident) {
    return {
      title: "Incident Not Found | HackTrail",
      description: "Crypto exploit intelligence and wallet exposure tracking by HackTrail.",
    }
  }

  const title = `${incident.name} | HackTrail`
  const description = truncate(incident.short_summary)
  const canonicalUrl = `${SITE_URL}/incident/${incident.slug}`
  const imageVersion =
    incident.slug === "risex-xlp"
      ? RISEX_OG_IMAGE_VERSION
      : incident.slug === "avici-user-drain"
        ? AVICI_OG_IMAGE_VERSION
      : incident.slug === "tectonic-cronos"
        ? TECTONIC_OG_IMAGE_VERSION
      : incident.slug === "moonwell-mamo"
        ? MOONWELL_MAMO_OG_IMAGE_VERSION
        : OG_IMAGE_VERSION
  const imageUrl = `${canonicalUrl}/opengraph-image?v=${imageVersion}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "HackTrail",
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${incident.name} HackTrail incident preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function IncidentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
