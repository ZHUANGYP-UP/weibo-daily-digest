import { NextResponse } from "next/server"

/** POST /api/scrape - 手动触发抓取所有博主 */
export async function POST() {
  // TODO: 接入 lib/scraper.ts 的 scrapeAll()
  return NextResponse.json({
    message: "抓取任务已触发（功能开发中）",
  })
}
