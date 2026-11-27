// 把契约里的 UTC ISO 字符串转成本地时间，形如 2026-11-25 16:30
export function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  // 解析失败就原样返回，方便排查格式问题，而不是显示 Invalid Date
  if (Number.isNaN(d.getTime())) return value
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
