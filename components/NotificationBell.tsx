"use client"

import { useEffect, useState } from "react"

/** 消息角标 + 通知列表面板 */
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<
    { id: string; title: string; body?: string; isRead: boolean; createdAt: string }[]
  >([])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {
      // 静默失败，不阻塞 UI
    }
  }

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" })
    fetchNotifications()
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        className="text-primary hover:bg-slate-50 transition-colors p-2 rounded-full active:scale-95 duration-200 relative"
        aria-label="通知"
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl shadow-slate-900/10 z-50 p-4 space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-primary text-lg font-headline mb-2">
              通知
            </h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">暂无通知</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-3 rounded-xl text-sm flex gap-3 items-start cursor-pointer transition-colors ${
                    n.isRead
                      ? "text-slate-500 hover:bg-slate-50"
                      : "text-primary font-bold bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined shrink-0 text-lg">
                    description
                  </span>
                  <div>
                    <p>{n.title}</p>
                    {n.body && (
                      <span className="text-xs font-normal text-slate-500">
                        {n.body}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
