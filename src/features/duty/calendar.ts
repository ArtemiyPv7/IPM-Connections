import { dateKey } from '../../shared/lib/format'

export const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

export const WEEKDAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export const WEEKDAY_NAMES = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

export function todayKey(): string {
  const n = new Date()
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate())
}

// Смена 8:00–8:00: до 8 утра дежурит вчерашняя смена.
export function currentDutyDateKey(now = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < 8) d.setDate(d.getDate() - 1)
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
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