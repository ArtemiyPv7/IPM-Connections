import { buildWeeks, currentDutyDateKey, WEEKDAYS } from '../calendar'
import { dateKey, pad } from '../../../shared/lib/format'
import type { Duty, Vacation } from '../../../shared/types'

// Сетка месяца 7×N для экранов ≥641px: ячейки фиксированной высоты,
// имя обрезается truncate и никогда не растягивает ячейку.
export default function MonthGrid({
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
  const weeks = buildWeeks(year, month)
  const currentKey = currentDutyDateKey()

  return (
    <div className="max-[640px]:hidden">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] text-gray">
            {w}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} />
              const key = dateKey(year, month, day)
              const duty = dutyByDate.get(key)
              const person = duty?.person ?? null
              const onVacation = vacations.some((v) => v.date_start <= key && key <= v.date_end)
              const classes = [
                'h-14 rounded-lg border border-ink/10 px-1.5 py-1 overflow-hidden',
                onVacation ? 'cell-vacation' : '',
                key === currentKey ? 'cell-today' : '',
                person && highlight === person.id ? 'cell-highlight' : '',
                isAdmin ? 'cursor-pointer' : '',
              ].join(' ')
              return (
                <div
                  key={di}
                  className={classes}
                  onClick={() => isAdmin && onEditDay(key)}
                  title={`${day}.${pad(month + 1)}${person ? ` · ${person.name}` : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray">{day}</span>
                    {duty && duty.overtime_hours > 0 && (
                      <span className="dot bg-sky" title={`Переработка: ${duty.overtime_hours} ч`} />
                    )}
                  </div>
                  {person && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleHighlight(person.id)
                      }}
                      title="Подсветить все смены"
                      className={`w-full text-left text-xs leading-tight truncate ${
                        highlight === person.id ? 'text-sky' : 'text-ink'
                      }`}
                    >
                      {person.name}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}