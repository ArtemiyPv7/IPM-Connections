import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function daysWord(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

export default function TodayBar() {
  const [dutyName, setDutyName] = useState<string | null>(null)
  const [birthday, setBirthday] = useState<{ name: string; label: string } | null>(null)

  useEffect(() => {
    const n = new Date()
    const key = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`

    supabase
      .from('duty_assignments')
      .select('person:people(name)')
      .eq('duty_date', key)
      .maybeSingle()
      .then(({ data }) => setDutyName((data as any)?.person?.name ?? null))

    supabase
      .from('people')
      .select('name, full_name, birth_date')
      .not('birth_date', 'is', null)
      .then(({ data }) => {
        const list = ((data as any[]) ?? []).filter((p) => p.birth_date)
        const today = new Date(n.getFullYear(), n.getMonth(), n.getDate())
        let best: { name: string; diff: number } | null = null

        for (const p of list) {
          const [m, d] = (p.birth_date as string).slice(5).split('-').map(Number)
          let next = new Date(today.getFullYear(), m - 1, d)
          if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d)
          const diff = Math.round((next.getTime() - today.getTime()) / 86400000)
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
    <div className="glass rounded-xl px-5 py-3 mb-4 flex flex-wrap items-center gap-x-8 gap-y-1 text-sm">
      {dutyName && (
        <p>
          <span className="text-muted">Сегодня дежурит: </span>
          <span className="text-sand">{dutyName}</span>
        </p>
      )}
      {birthday && (
        <p>
          <span className="text-muted">Ближайший день рождения: </span>
          <span className="text-sand">{birthday.name}</span>{' '}
          <span className="text-muted">— {birthday.label}</span>
        </p>
      )}
    </div>
  )
}