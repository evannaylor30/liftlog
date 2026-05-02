/** Shift `YYYY-MM` by a number of months (negative = previous). */
export function shiftMonthYm(viewMonthYm: string, delta: number) {
  const match = /^(\d{4})-(\d{2})$/.exec(viewMonthYm.trim())
  if (!match) {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth() + 1 + delta
    const next = new Date(y, m - 1, 1)
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
  }
  const y = Number(match[1])
  const monthIndex = Number(match[2]) - 1 + delta
  const next = new Date(y, monthIndex, 1)
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`
}
