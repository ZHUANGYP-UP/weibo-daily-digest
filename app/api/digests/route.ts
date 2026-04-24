import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const PAGE_SIZE = 10

/** GET /api/digests - 获取摘要列表，按日期降序，支持分页 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))

  const [data, total] = await Promise.all([
    prisma.digest.findMany({
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.digest.count(),
  ])

  return NextResponse.json({ data, total })
}
