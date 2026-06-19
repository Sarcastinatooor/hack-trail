import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import Link from "next/link"
import Image from "next/image"
import { NavLinks } from "@/components/NavLinks"
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
          <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden rounded-lg bg-black border border-white/[0.08] shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:border-[#00ff88]/30 group-hover:shadow-[0_0_22px_rgba(0,255,136,0.13)] transition-all duration-300">
            <Image
              src="/logo.svg"
              alt="HackTrail Logo"
              fill
              sizes="32px"
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="text-sm font-bold tracking-wider text-white">
            HACK<span className="text-[#00ff88]">TRAIL</span>
          </span>
        </Link>

        <NavLinks />

        {/* Right */}
        <div className="flex items-center gap-3">
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
