"use client"

import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [pushTime, setPushTime] = useState("08:00")
  const [aiStyle, setAiStyle] = useState("concise")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setPushTime(data.pushTime || "08:00")
        setAiStyle(data.aiStyle || "concise")
      })
      .catch(() => {})
  }, [])

  const saveSettings = async () => {
    setError("")
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pushTime, aiStyle }),
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const data = await res.json()
      setError(data.error || "保存失败")
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {saved && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500">
            check_circle
          </span>
          <p className="text-blue-700 font-medium text-sm">设置已成功保存</p>
        </div>
      )}

      <h2 className="text-2xl font-extrabold tracking-tight font-headline">
        配置选项
      </h2>

      {/* 推送时间 */}
      <div className="bg-white rounded-xl p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg font-headline">推送通知</h3>
          <p className="text-slate-500 text-sm">管理接收情报更新的时间。</p>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
            每日推送时间
          </label>
          <input
            type="time"
            value={pushTime}
            onChange={(e) => setPushTime(e.target.value)}
            className="bg-slate-100 border-none rounded-xl px-4 py-3 text-2xl font-extrabold font-headline focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* AI 风格 */}
      <div className="bg-white rounded-xl p-8 space-y-6">
        <div>
          <h3 className="font-bold text-lg font-headline">AI 生成风格</h3>
          <p className="text-slate-500 text-sm">选择为您生成的摘要深度。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: "concise",
              icon: "short_text",
              title: "精简摘要",
              desc: "核心亮点与快速要点，阅读时间少于 2 分钟。",
            },
            {
              value: "detailed",
              icon: "article",
              title: "深度分析",
              desc: "深入的背景信息、来源对比及全面的见解。",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className="cursor-pointer"
              onClick={() => setAiStyle(opt.value)}
            >
              <div
                className={`p-5 rounded-xl border transition-all h-full ${
                  aiStyle === opt.value
                    ? "border-primary/30 bg-white shadow-sm"
                    : "border-transparent bg-slate-100"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="material-symbols-outlined text-slate-500">
                    {opt.icon}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      aiStyle === opt.value
                        ? "border-primary bg-primary"
                        : "border-slate-300"
                    }`}
                  >
                    {aiStyle === opt.value && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <h4 className="font-bold mb-1">{opt.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {opt.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      <button
        onClick={saveSettings}
        className="w-full bg-gradient-to-b from-primary to-primary-container text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/10 active:scale-[0.98] transition-transform uppercase tracking-widest text-sm"
      >
        保存更改
      </button>
    </div>
  )
}
