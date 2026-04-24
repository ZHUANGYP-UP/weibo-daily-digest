"use client"

import { useState } from "react"
import Link from "next/link"

export default function HomePage() {
  const [scraping, setScraping] = useState(false)
  const [scrapeResult, setScrapeResult] = useState("")

  const triggerScrape = async () => {
    setScraping(true)
    setScrapeResult("")
    try {
      const res = await fetch("/api/scrape", { method: "POST" })
      const data = await res.json()
      setScrapeResult(data.message || "抓取完成")
    } catch {
      setScrapeResult("抓取失败，请重试")
    } finally {
      setTimeout(() => {
        setScraping(false)
        setScrapeResult("")
      }, 2000)
    }
  }

  return (
    <div className="space-y-8">
      {/* 欢迎区 + 状态卡片 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold tracking-tight font-headline">
            情报概览
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            为您监测的微博流中提取的精选洞察。
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              系统状态
            </span>
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between items-center">
              <span>已追踪博主</span>
              <span className="material-symbols-outlined text-sm text-slate-400">
                group
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>上次抓取：--</span>
              <span className="material-symbols-outlined text-sm text-slate-400">
                update
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 手动抓取按钮 */}
      <section>
        <button
          onClick={triggerScrape}
          disabled={scraping}
          className="w-full bg-gradient-to-b from-primary to-primary-container text-white py-5 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-80"
        >
          <span
            className={`material-symbols-outlined text-2xl ${scraping ? "animate-spin" : ""}`}
          >
            {scrapeResult ? "check_circle" : "sync"}
          </span>
          <span className="font-headline font-bold text-lg tracking-wide">
            {scraping
              ? "正在抓取中..."
              : scrapeResult || "立即手动触发抓取"}
          </span>
        </button>
      </section>

      {/* 每日摘要 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight px-1 font-headline">
          每日摘要
        </h2>
        <Link
          href="/history"
          className="block bg-white rounded-xl p-8 shadow-sm relative overflow-hidden group hover:bg-slate-50 transition-all"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
                精选摘要
              </span>
            </div>
            <h3 className="text-2xl font-extrabold leading-tight mb-4 font-headline">
              暂无摘要
            </h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              添加博主并触发抓取后，AI 将为您生成每日摘要。
            </p>
            <span className="flex items-center gap-2 text-primary font-bold">
              查看历史摘要
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </span>
          </div>
        </Link>
      </section>
    </div>
  )
}
