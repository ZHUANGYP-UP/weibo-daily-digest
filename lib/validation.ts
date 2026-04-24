/** 验证推送时间格式 HH:mm（00:00 - 23:59） */
export function validatePushTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
}

/** 验证 AI 风格 */
export function validateAiStyle(style: string): boolean {
  return ["concise", "detailed"].includes(style)
}
