import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** DELETE /api/bloggers/[id] - 删除博主及其关联 Post（级联删除） */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const blogger = await prisma.blogger.findUnique({ where: { id } })
  if (!blogger) {
    return NextResponse.json({ error: "博主不存在" }, { status: 404 })
  }

  await prisma.blogger.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
