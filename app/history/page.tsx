"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Digest {
  id: string
  date: string
  title: string | null
  status: string
  createdAt: string
}

export default function HistoryPage() {
  const [digests, setDigests] = useState<Digest[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchDigests = async (p: number) => {
    try {
      const res = await fetch(`/api/digests?page=${p}`)
      if (res.ok) {
        const data = await res.json()
        setDigests((prev) => (p === 1 ? data.data : [...prev, ...data.data]))
        setTotal(data.total)
      }
    } catch {
      // 静默
    }
  }

  useEffect(() => {
    fetchDigests(1)
  }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchDigests(next)
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight font-headline mb-2">
          摘要历史
        </h1>
        <p className="text-slate-500 font-medium">
          重温您的情报档案和精选见解。
        </p>
      </section>

      <section className="space-y-4">
        {digests.map((d) => (
          <Link
            key={d.id}
            href={`/history/${d.id}`}
            className="group block bg-white p-6 rounded-xl transition-all hover:bg-slate-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  description
                </span>
                {d.date}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  d.status === "done"
                    ? "bg-green-50 text-green-600"
                    : d.status === "failed"
                      ? "bg-red-50 text-red-600"
                      : "bg-yellow-50 text-yellow-600"
                }`}
              >
                {d.status === "done"
                  ? "已完成"
                  : d.status === "failed"
                    ? "生成失败"
                    : "处理中"}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors font-headline">
              {d.title || `${d.date} 每日摘要`}
            </h3>
          </Link>
        ))}

        {digests.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-4 block">
              history
            </span>
            <p>暂无历史摘要</p>
          </div>
        )}

        {digests.length < total && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition-all active:scale-95"
            >
              加载更多
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
