import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { useRole } from '../shared/hooks/useRole'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { handleError } from '../shared/lib/errors'
import { navBtnCls } from '../shared/ui/styles'
import PeopleManager from '../components/PeopleManager'

interface Person {
  id: string
  name: string
  full_name: string | null
  birth_date: string | null
  can_duty: boolean
}

interface Duty {
  id: string
  duty_date: string
  overtime_hours: number
  note: string | null
  person: Person | null
}

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const WEEKDAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС']

function pad(n: number) {
  return n.toString().padStart(2, '0')
}

function dateKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export default function DutyPage() {
  const role = useRole()
  const [people, setPeople] = useState<Person[]>([])
  const [duties, setDuties] = useState<Duty[]>([])
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })
  const [selected, setSelected] = useState<string | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [editPerson, setEditPerson] = useState('')
  const [editHours, setEditHours] = useState('0')
  const [editNote, setEditNote] = useState('')

  const isAdmin = role === 'admin'

  usePageTitle('Дежурства — IPM Connections')

  async function load() {
    const [ppl, d] = await Promise.all([
      supabase.from('people').select('*').order('name'),
      supabase
        .from('duty_assignments')
        .select('*, person:people(id, name, full_name, birth_date, can_duty)')
        .order('duty_date'),
    ])
    if (handleError(ppl.error, 'load people') || handleError(d.error, 'load duties')) return
    setPeople(ppl.data ?? [])
    setDuties((d.data as Duty[]) ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  const dutyByDate = new Map(duties.map((d) => [d.duty_date, d]))

  const firstOffset = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const monthDuties = duties.filter((d) =>
    d.duty_date.startsWith(`${cursor.y}-${pad(cursor.m + 1)}`)
  )

  const today = new Date()
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())

  function openEditor(date: string) {
    setSelected(date)
    const d = dutyByDate.get(date)
    setEditPerson(d?.person?.id ?? '')
    setEditHours(d ? String(d.overtime_hours) : '0')
    setEditNote(d?.note ?? '')
  }

  async function saveDuty() {
    if (!selected || !editPerson) return
    await supabase.from('duty_assignments').upsert(
      {
        duty_date: selected,
        person_id: editPerson,
        overtime_hours: Number(editHours) || 0,
        note: editNote || null,
      },
      { onConflict: 'duty_date' }
    )
    toast('Смена сохранена')
    setSelected(null)
    load()
  }

  async function deleteDuty() {
    if (!selected) return
    await supabase.from('duty_assignments').delete().eq('duty_date', selected)
    toast('Смена удалена')
    setSelected(null)
    load()
  }

  function exportMonth() {
    const rows: (string | number)[][] = [['Дата', 'Дежурный', 'Часы переработки', 'Примечание']]
    for (const d of monthDuties) {
      rows.push([
        new Date(d.duty_date).toLocaleDateString('ru-RU'),
        d.person?.name ?? '—',
        d.overtime_hours,
        d.note ?? '',
      ])
    }
    const totals = new Map<string, number>()
    for (const d of monthDuties) {
      const name = d.person?.name ?? '—'
      totals.set(name, (totals.get(name) ?? 0) + Number(d.overtime_hours))
    }
    rows.push([])
    rows.push(['Итого по часам'])
    for (const [name, hours] of totals) rows.push([name, hours])

    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Дежурства')
    XLSX.writeFile(wb, `Дежурства_${cursor.y}-${pad(cursor.m + 1)}.xlsx`)
  }

  const navBtn = navBtnCls

  return (
    <div className="animate-rise">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            className={navBtn}
            onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
          >
            ←
          </button>
          <h1 className="font-semibold text-xl text-ink w-44 text-center">
            {MONTHS[cursor.m]} {cursor.y}
          </h1>
          <button
            className={navBtn}
            onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
          >
            →
          </button>
        </div>
        <button className={navBtn} onClick={exportMonth}>
          Экспорт месяца (.xlsx)
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-muted">
            {w}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((day, di) => {
              if (day === null) return <div key={di} />
              const key = dateKey(cursor.y, cursor.m, day)
              const d = dutyByDate.get(key)
              const isHighlighted = !!highlight && d?.person?.id === highlight
              return (
                <div
                  key={di}
                  onClick={() => isAdmin && openEditor(key)}
                  className={`glass glass-card relative min-h-16 rounded-xl p-2 text-sm ${
                    isHighlighted ? 'glass-hl' : key === todayKey ? 'glass-today' : ''
                  } ${isAdmin ? 'cursor-pointer' : ''}`}
                >
                                    
                  <div className="text-muted text-xs mb-1">{day}</div>
                  <div className={isHighlighted ? 'text-sand' : 'text-ink'}>
                    {d?.person?.name ?? ''}
                  </div>
                  {d && Number(d.overtime_hours) > 0 && (
                    <span
                      title={`Переработка: ${d.overtime_hours} ч`}
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sand"
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {isAdmin && selected && (
        <div className="mt-6 glass rounded-xl p-6 max-w-md">
          <h2 className="font-semibold text-ink mb-4">
            Смена {new Date(selected).toLocaleDateString('ru-RU')}
          </h2>
          <div className="space-y-3">
            <select
              value={editPerson}
              onChange={(e) => setEditPerson(e.target.value)}
              className="w-full glass-input rounded-lg px-3 py-2 text-ink"
            >
              <option value="">— не назначено —</option>
              {people
                .filter((p) => p.can_duty || p.id === editPerson)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
            <input
              type="number"
              step="0.5"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
              placeholder="Часы переработки"
              className="w-full glass-input rounded-lg px-3 py-2 text-ink"
            />
            <input
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Примечание"
              className="w-full glass-input rounded-lg px-3 py-2 text-ink"
            />
            <div className="flex gap-2">
              <button
                onClick={saveDuty}
                  className="px-4 py-2 rounded-lg bg-bronze text-bg transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={deleteDuty}
                className="px-4 py-2 rounded-lg border border-white/10 text-muted hover:text-terra hover:border-terra transition-colors"
              >
                Удалить
              </button>
              <button onClick={() => setSelected(null)} className={navBtn}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <PeopleManager
        isAdmin={isAdmin}
        onChanged={load}
        highlightId={highlight}
        onSelectPerson={(id) => setHighlight((prev) => (prev === id ? null : id))}
      />
    </div>
  )
}