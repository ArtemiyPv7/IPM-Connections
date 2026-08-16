import { currentDutyDateKey, WEEKDAY_NAMES } from '../calendar'
import { dateKey } from '../../../shared/lib/format'
import type { Duty, Vacation } from '../../../shared/types'
import { cellClasses, getDayInfo } from '../dutyCell'
import { OvertimeDot, PersonNameButton } from './CellParts'

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
        const info = getDayInfo(dutyByDate, vacations, key)
        const highlighted = info.person !== null && highlight === info.person.id
        return (
          <div
            key={day}
            className={cellClasses(
              'flex items-center gap-3 rounded-lg border border-ink/10 px-3 py-2',
              info,
              key === currentKey,
              highlighted,
              isAdmin
            )}
            onClick={() => isAdmin && onEditDay(key)}
          >
            <span className="w-14 shrink-0 text-xs text-gray">
              {day} · {WEEKDAY_NAMES[new Date(year, month, day).getDay()]}
            </span>
            {info.person ? (
              <PersonNameButton
                person={info.person}
                highlighted={highlighted}
                onToggleHighlight={onToggleHighlight}
                className="min-w-0 truncate text-sm text-left"
              />
            ) : (
              <span className="text-xs text-gray/60">— не назначено</span>
            )}
            {info.duty && <OvertimeDot hours={info.duty.overtime_hours} className="ml-auto" />}
          </div>
        )
      })}
    </div>
  )
}