import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/bloggers - 获取博主列表 */
export async function GET() {
  const bloggers = await prisma.blogger.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(bloggers)
}

/** POST /api/bloggers - 添加博主 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { uid } = body

  if (!uid || typeof uid !== "string" || !uid.trim()) {
    return NextResponse.json({ error: "UID 不能为空" }, { status: 400 })
  }

  const trimmedUid = uid.trim()

  // 检查重复
  const existing = await prisma.blogger.findUnique({ where: { uid: trimmedUid } })
  if (existing) {
    return NextResponse.json({ error: "该博主已添加" }, { status: 400 })
  }

  // TODO: 调用微博 API 验证 UID 是否存在，获取昵称和头像
  // 目前先用 UID 作为昵称
  const blogger = await prisma.blogger.create({
    data: {
      uid: trimmedUid,
      name: trimmedUid,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedUid)}&background=e3e9ed&color=596064&bold=true`,
    },
  })

  return NextResponse.json(blogger, { status: 201 })
}
