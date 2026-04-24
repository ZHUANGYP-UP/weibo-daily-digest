"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface DigestDetail {
  id: string
  date: string
  title: string | null
  content: string | null
  status: string
}

export default function DigestDetailPage() {
  const params = useParams()
  const [digest, setDigest] = useState<DigestDetail | null>(null)

  useEffect(() => {
    if (params.id) {
      fetch(`/api/digests/${params.id}`)
        .then((r) => r.json())
        .then(setDigest)
        .catch(() => {})
    }
  }, [params.id])

  if (!digest) {
    return (
      <div className="text-center py-20 text-slate-400">
        <span className="material-symbols-outlined text-4xl animate-spin">
          sync
        </span>
        <p className="mt-4">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/history"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">
          arrow_back
        </span>
        <span className="text-sm font-medium">返回历史</span>
      </Link>

      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 font-headline">
          {digest.title || `${digest.date} 每日摘要`}
        </h1>
        <p className="text-slate-500 text-lg">{digest.date}</p>
      </section>

      {digest.status === "failed" ? (
        <div className="bg-red-50 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">
            error
          </span>
          <p className="text-red-600 font-medium">摘要生成失败，请重新触发抓取。</p>
        </div>
      ) : digest.content ? (
        <article className="bg-white rounded-xl p-8 md:p-12 prose prose-slate max-w-none">
          <div dangerouslySetInnerHTML={{ __html: digest.content }} />
        </article>
      ) : (
        <div className="bg-yellow-50 rounded-xl p-8 text-center">
          <p className="text-yellow-700 font-medium">摘要正在生成中...</p>
        </div>
      )}
    </div>
  )
}
