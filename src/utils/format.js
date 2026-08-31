// ========================================================
// 格式化工具
// ========================================================

import dayjs from 'dayjs'

// 把时间字符串格式化成中文友好的形式：2026年08月31日 21:30:00
export function formatTime(time) {
  return dayjs(time).format('YYYY年MM月DD日 HH:mm:ss')
}

// 简版时间：只显示日期，用于表格列
export function formatDate(time) {
  return dayjs(time).format('YYYY-MM-DD')
}
