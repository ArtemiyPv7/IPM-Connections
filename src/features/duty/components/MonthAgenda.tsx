import { currentDutyDateKey, WEEKDAY_NAMES } from '../calendar'
import { dateKey } from '../../../shared/lib/format'
import type { Duty, Vacation } from '../../../shared/types'

// Агенда для ≤640px: вертикальный список дней, имя во всю ширину —
// всегда помещается, строки фиксированной высоты.
export default function MonthAgenda({
  year,
  month,
  duties,
  vacations,
  highlight,
  isAdmin,
  onToggleHighlight,
  onEditDay,
}: {
  year: number
  month: number
  duties: Duty[]
  vacations: Vacation[]
  highlight: string | null
  isAdmin: boolean
  onToggleHighlight: (id: string) => void
  onEditDay: (date: string) => void
}) {
  const dutyByDate = new Map(duties.map((d) => [d.duty_date, d]))
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const currentKey = currentDutyDateKey()

  return (
    <div className="min-[641px]:hidden space-y-1">
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const key = dateKey(year, month, day)
        const duty = dutyByDate.get(key)
        const person = duty?.person ?? null
        const onVacation = vacations.some((v) => v.date_start <= key && key <= v.date_end)
        const classes = [
          'flex items-center gap-3 rounded-lg border border-ink/10 px-3 py-2',
          onVacation ? 'cell-vacation' : '',
          key === currentKey ? 'cell-today' : '',
          person && highlight === person.id ? 'cell-highlight' : '',
          isAdmin ? 'cursor-pointer' : '',
        ].join(' ')
        return (
          <div key={day} className={classes} onClick={() => isAdmin && onEditDay(key)}>
            <span className="w-14 shrink-0 text-xs text-gray">
              {day} · {WEEKDAY_NAMES[new Date(year, month, day).getDay()]}
            </span>
            {person ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleHighlight(person.id)
                }}
                className={`min-w-0 truncate text-sm text-left ${
                  highlight === person.id ? 'text-sky' : 'text-ink'
                }`}
              >
                {person.name}
              </button>
            ) : (
              <span className="text-xs text-gray/60">— не назначено</span>
            )}
            {duty && duty.overtime_hours > 0 && (
              <span className="dot bg-sky ml-auto" title={`Переработка: ${duty.overtime_hours} ч`} />
            )}
          </div>
        )
      })}
    </div>
  )
}