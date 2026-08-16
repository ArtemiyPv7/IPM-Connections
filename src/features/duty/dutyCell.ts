import type { Duty, Person, Vacation } from '../../shared/types'

export interface DayInfo {
  duty: Duty | undefined
  person: Person | null
  onVacation: boolean
}

export function getDayInfo(
  dutyByDate: Map<string, Duty>,
  vacations: Vacation[],
  key: string
): DayInfo {
  const duty = dutyByDate.get(key)
  return {
    duty,
    person: duty?.person ?? null,
    onVacation: vacations.some((v) => v.date_start <= key && key <= v.date_end),
  }
}

export function cellClasses(
  base: string,
  info: DayInfo,
  isToday: boolean,
  isHighlighted: boolean,
  isAdmin: boolean
): string {
  return [
    base,
    info.onVacation ? 'cell-vacation' : '',
    isToday ? 'cell-today' : '',
    isHighlighted ? 'cell-highlight' : '',
    isAdmin ? 'cursor-pointer' : '',
  ].join(' ')
}