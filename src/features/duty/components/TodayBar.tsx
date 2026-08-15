import { useEffect, useState } from 'react'
import { daysWord } from '../../../shared/lib/format'
import type { Person } from '../../../shared/types'
import { fetchPeople, fetchTodayDutyName } from '../api'

export default function TodayBar() {
  const [dutyName, setDutyName] = useState<string | null>(null)
  const [birthday, setBirthday] = useState<{ name: string; label: string } | null>(null)

  useEffect(() => {
    fetchTodayDutyName().then(setDutyName)
    fetchPeople().then((people) => {
      const withBirthday = people.filter(
        (p): p is Person & { birth_date: string } => p.birth_date !== null
      )
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let best: { name: string; diff: number } | null = null
      for (const p of withBirthday) {
        const [m, d] = p.birth_date.slice(5).split('-').map(Number)
        let next = new Date(start.getFullYear(), m - 1, d)
        if (next < start) next = new Date(start.getFullYear() + 1, m - 1, d)
        const diff = Math.round((next.getTime() - start.getTime()) / 86400000)
        if (!best || diff < best.diff) best = { name: p.full_name ?? p.name, diff }
      }
      if (!best) return
      const label =
        best.diff === 0
          ? 'сегодня 🎉'
          : best.diff === 1
            ? 'завтра'
            : `через ${best.diff} ${daysWord(best.diff)}`
      setBirthday({ name: best.name, label })
    })
  }, [])

  if (!dutyName && !birthday) return null

  return (
    <div className="card rounded-xl px-5 py-3 mb-4 flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
      {dutyName && (
        <p>
          <span className="text-gray">Сегодня дежурит: </span>
          <span className="text-sky">{dutyName}</span>
        </p>
      )}
      {birthday && (
        <p>
          <span className="text-gray">Ближайший день рождения: </span>
          <span className="text-sky">{birthday.name}</span>{' '}
          <span className="text-gray">— {birthday.label}</span>
        </p>
      )}
    </div>
  )
}