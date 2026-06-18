"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/", label: "Incidents" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reports", label: "Reports" },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex items-center gap-6">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${active ? "nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
