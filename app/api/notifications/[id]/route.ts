import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** PATCH /api/notifications/[id] - 标记通知为已读（幂等） */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  })
  if (!notification) {
    return NextResponse.json({ error: "通知不存在" }, { status: 404 })
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: true },
  })

  return NextResponse.json(updated)
}
