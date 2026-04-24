import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/digests/[id] - 获取摘要详情 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const digest = await prisma.digest.findUnique({ where: { id: params.id } })
  if (!digest) {
    return NextResponse.json({ error: "摘要不存在" }, { status: 404 })
  }
  return NextResponse.json(digest)
}
