"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", icon: "dashboard", label: "主页" },
  { href: "/bloggers", icon: "group", label: "博主" },
  { href: "/history", icon: "history", label: "历史" },
  { href: "/settings", icon: "settings", label: "设置" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 border-t border-slate-100">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all active:scale-90 ${
              isActive
                ? "text-primary bg-slate-50 rounded-xl"
                : "text-slate-400 hover:text-primary-container"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-semibold tracking-wide uppercase mt-1">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
