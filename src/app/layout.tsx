import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import Link from "next/link"
import Image from "next/image"
import { Providers } from "@/components/Providers"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "HackTrail — Crypto Exploit Intelligence",
  description:
    "Real-time crypto exploit trail mapper. Chronological journey, USD-weighted fund flows, live wallet balances, and protocol damage — powered by on-chain data.",
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#050507]/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 relative flex items-center justify-center overflow-hidden rounded bg-black border border-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-[#00ff88]/30 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300">
            <Image
              src="/logo.png"
              alt="HackTrail Logo"
              fill
              sizes="28px"
              className="object-cover scale-[1.3] transition-transform duration-300 group-hover:scale-[1.4]"
            />
          </div>
          <span className="text-sm font-bold tracking-wider text-white">
            HACK<span className="text-[#00ff88]">TRAIL</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="nav-link nav-link-active">Incidents</Link>
          <span className="nav-link cursor-default opacity-40">Intelligence</span>
          <span className="nav-link cursor-default opacity-40">Analytics</span>
          <span className="nav-link cursor-default opacity-40">Reports</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-neutral-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="mono">Search...</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-neutral-600 ml-4">⌘K</kbd>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="pulse-dot bg-[#00ff88]" />
            <span className="text-[10px] mono text-neutral-500 hidden sm:inline">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-[#050507] text-neutral-200 antialiased">
        <Providers>
          <NavBar />
          <main className="bg-grid min-h-[calc(100vh-56px)]">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
