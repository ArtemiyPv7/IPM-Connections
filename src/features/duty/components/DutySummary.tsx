import { currentDutyDateKey, todayKey } from '../calendar'
import { daysWord, formatDateRu } from '../../../shared/lib/format'
import type { Duty, Person, Vacation } from '../../../shared/types'

// Компактная сводка-чипы: дежурный (смена 8:00–8:00), ближайшие ДР, отпуска.
export default function DutySummary({
  people,
  duties,
  vacations,
}: {
  people: Person[]
  duties: Duty[]
  vacations: Vacation[]
}) {
  const tKey = todayKey()
  const current = duties.find((d) => d.duty_date === currentDutyDateKey())

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const birthdays = people
    .filter((p) => p.birth_date !== null)
    .map((p) => {
      const [m, d] = p.birth_date!.slice(5).split('-').map(Number)
      let next = new Date(start.getFullYear(), m - 1, d)
      if (next < start) next = new Date(start.getFullYear() + 1, m - 1, d)
      const diff = Math.round((next.getTime() - start.getTime()) / 86400000)
      return { name: p.full_name ?? p.name, diff }
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 3)

  const activeVac = vacations.filter((v) => v.date_start <= tKey && tKey <= v.date_end)
  const upcomingVac = vacations.filter((v) => v.date_start > tKey).slice(0, 2)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="chip text-ink">
        Дежурит: <span className="font-medium text-sky">{current?.person?.name ?? '—'}</span>
      </span>
      {birthdays.map((b) => (
        <span key={b.name} className="chip text-ink">
          🎂 {b.name} · {b.diff === 0 ? 'сегодня 🎉' : `через ${b.diff} ${daysWord(b.diff)}`}
        </span>
      ))}
      {activeVac.map((v) => (
        <span key={v.id} className="chip text-ink">
          🏖 {v.person?.name ?? '—'} · по {formatDateRu(v.date_end)}
        </span>
      ))}
      {upcomingVac.map((v) => (
        <span key={v.id} className="chip text-gray">
          🏖 {v.person?.name ?? '—'} · с {formatDateRu(v.date_start)}
        </span>
      ))}
    </div>
  )
}