import { buildWeeks, currentDutyDateKey, WEEKDAYS } from '../calendar'
import { dateKey, pad } from '../../../shared/lib/format'
import type { Duty, Vacation } from '../../../shared/types'
import { cellClasses, getDayInfo } from '../dutyCell'
import { OvertimeDot, PersonNameButton } from './CellParts'

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
              const info = getDayInfo(dutyByDate, vacations, key)
              const highlighted = info.person !== null && highlight === info.person.id
              return (
                <div
                  key={di}
                  className={cellClasses(
                    'h-14 rounded-lg border border-ink/10 px-1.5 py-1 overflow-hidden',
                    info,
                    key === currentKey,
                    highlighted,
                    isAdmin
                  )}
                  onClick={() => isAdmin && onEditDay(key)}
                  title={`${day}.${pad(month + 1)}${info.person ? ` · ${info.person.name}` : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray">{day}</span>
                    {info.duty && <OvertimeDot hours={info.duty.overtime_hours} />}
                  </div>
                  {info.person && (
                    <PersonNameButton
                      person={info.person}
                      highlighted={highlighted}
                      onToggleHighlight={onToggleHighlight}
                      className="w-full text-left text-xs leading-tight truncate"
                    />
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