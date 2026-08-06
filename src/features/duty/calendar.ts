import { dateKey, pad } from '../../shared/lib/format'

export function monthKey(y: number, m: number): string {
  return `${y}-${pad(m + 1)}`
}

export function todayKey(): string {
  const n = new Date()
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate())
}

export function buildWeeks(y: number, m: number): (number | null)[][] {
  const firstOffset = (new Date(y, m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}