"use client"

import NotificationBell from "./NotificationBell"

export default function TopAppBar() {
  return (
    <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md shadow-sm shadow-slate-200/40 flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">
          auto_awesome
        </span>
        <span className="text-xl font-black text-primary uppercase tracking-widest font-headline">
          大眼睛快搜内容
        </span>
      </div>
      <NotificationBell />
    </header>
  )
}
