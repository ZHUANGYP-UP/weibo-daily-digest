import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePushTime, validateAiStyle } from "@/lib/validation"

/** GET /api/settings - 获取配置 */
export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: "singleton" } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "singleton", pushTime: "08:00", aiStyle: "concise" },
    })
  }
  return NextResponse.json(settings)
}

/** PUT /api/settings - 更新配置 */
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { pushTime, aiStyle } = body

  // 验证
  const errors: string[] = []
  if (pushTime !== undefined && !validatePushTime(pushTime)) {
    errors.push("推送时间格式不合法，应为 HH:mm（00:00-23:59）")
  }
  if (aiStyle !== undefined && !validateAiStyle(aiStyle)) {
    errors.push("AI 风格不合法，应为 concise 或 detailed")
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("；") }, { status: 400 })
  }

  const settings = await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {
      ...(pushTime !== undefined && { pushTime }),
      ...(aiStyle !== undefined && { aiStyle }),
    },
    create: {
      id: "singleton",
      pushTime: pushTime || "08:00",
      aiStyle: aiStyle || "concise",
    },
  })

  return NextResponse.json(settings)
}
