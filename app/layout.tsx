import type { Metadata } from "next"
import TopAppBar from "@/components/TopAppBar"
import BottomNav from "@/components/BottomNav"
import "./globals.css"

export const metadata: Metadata = {
  title: "大眼睛快搜内容",
  description: "微博每日摘要系统 - 自动抓取、AI 整理、站内推送",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen pb-24">
        <TopAppBar />
        <main className="pt-20 px-6 max-w-5xl mx-auto">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
