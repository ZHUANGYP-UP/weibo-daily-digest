import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/notifications - 获取通知列表 + 未读数 */
export async function GET() {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { isRead: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}
