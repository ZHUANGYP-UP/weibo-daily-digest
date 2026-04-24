"use client"

import { useEffect, useState } from "react"

interface Blogger {
  id: string
  uid: string
  name: string
  avatar: string | null
  createdAt: string
}

export default function BloggersPage() {
  const [bloggers, setBloggers] = useState<Blogger[]>([])
  const [uid, setUid] = useState("")
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchBloggers = async () => {
    const res = await fetch("/api/bloggers")
    if (res.ok) setBloggers(await res.json())
  }

  const addBlogger = async () => {
    if (!uid.trim()) {
      setMsg({ type: "error", text: "请输入博主 UID" })
      return
    }
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch("/api/bloggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "添加失败" })
      } else {
        setMsg({ type: "success", text: "博主添加成功" })
        setUid("")
        fetchBloggers()
      }
    } catch {
      setMsg({ type: "error", text: "网络错误" })
    } finally {
      setLoading(false)
      setTimeout(() => setMsg(null), 3000)
    }
  }

  const removeBlogger = async (id: string) => {
    await fetch(`/api/bloggers/${id}`, { method: "DELETE" })
    fetchBloggers()
  }

  useEffect(() => {
    fetchBloggers()
  }, [])

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <section className="flex items-baseline justify-between">
        <h2 className="font-headline font-extrabold text-2xl tracking-tight">
          已关注博主 ({bloggers.length})
        </h2>
        <span className="text-slate-500 text-sm font-medium">管理您的数据源</span>
      </section>

      {/* 添加博主 */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-headline font-bold text-lg mb-1">添加新数据源</h3>
        <p className="text-slate-500 text-sm mb-4">
          输入博主的唯一 UID 以开始追踪其更新。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBlogger()}
            className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all placeholder:text-slate-400"
            placeholder="例如：tech_visionary_99"
          />
          <button
            onClick={addBlogger}
            disabled={loading}
            className="bg-gradient-to-b from-primary to-primary-container text-white font-bold py-3 px-8 rounded-xl uppercase tracking-wider text-sm active:scale-95 transition-transform disabled:opacity-70"
          >
            添加
          </button>
        </div>
        {msg && (
          <div
            className={`mt-3 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
              msg.type === "error"
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {msg.type === "error" ? "error" : "check_circle"}
            </span>
            {msg.text}
          </div>
        )}
      </section>

      {/* 博主列表 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            活跃情报源
          </span>
        </div>
        {bloggers.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-200">
                {b.avatar ? (
                  <img
                    alt={b.name}
                    className="w-full h-full object-cover"
                    src={b.avatar}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                    {b.name[0]}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-headline font-bold">{b.name}</h4>
                <p className="text-xs text-slate-500">UID: {b.uid}</p>
              </div>
            </div>
            <button
              onClick={() => removeBlogger(b.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
              aria-label={`删除 ${b.name}`}
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
        {bloggers.length === 0 && (
          <div className="bg-slate-100 rounded-2xl p-8 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-slate-300">
              hub
            </span>
            <h4 className="font-headline font-bold text-slate-500">
              扩展您的网络
            </h4>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">
              添加高质量博主可提升每日 AI 摘要的精准度。
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
