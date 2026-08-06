import { useEffect, useState } from 'react'
import { fetchDuties, fetchPeople, removeDuty, upsertDuty } from '../features/duty/api'
import { buildWeeks, todayKey } from '../features/duty/calendar'
import { exportMonthDuties } from '../features/duty/exportMonth'
import PeopleManager from '../features/duty/components/PeopleManager'
import { toast } from '../lib/toast'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'
import type { Duty, Person } from '../shared/types'
import { navBtnCls } from '../shared/ui/styles'

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const WEEKDAYS = ['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС']

export default function DutyPage() {
  const role = useRole()
  const isAdmin = role === 'admin'

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

  usePageTitle('Дежурства — IPM Connections')

  async function load() {
    const [ppl, d] = await Promise.all([fetchPeople(), fetchDuties()])
    setPeople(ppl)
    setDuties(d)
  }

  useEffect(() => {
    load()
  }, [])

  const dutyByDate = new Map(duties.map((d) => [d.duty_date, d]))
  const weeks = buildWeeks(cursor.y, cursor.m)
  const tKey = todayKey()

  function openEditor(date: string) {
    setSelected(date)
    const d = dutyByDate.get(date)
    setEditPerson(d?.person?.id ?? '')
    setEditHours(d ? String(d.overtime_hours) : '0')
    setEditNote(d?.note ?? '')
  }

  async function saveDuty() {
    if (!selected || !editPerson) return
    if (!(await upsertDuty({
      duty_date: selected,
      person_id: editPerson,
      overtime_hours: Number(editHours) || 0,
      note: editNote || null,
    }))) return
    toast('Смена сохранена')
    setSelected(null)
    load()
  }

  async function deleteDuty() {
    if (!selected) return
    if (!(await removeDuty(selected))) return
    toast('Смена удалена')
    setSelected(null)
    load()
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
        <button className={navBtn} onClick={() => exportMonthDuties(cursor.y, cursor.m, duties)}>
          Экспорт месяца (.xlsx)
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs text-gray">
            {w}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((day, di) => {
              if (day === null) return <div key={di} />
              const key = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const d = dutyByDate.get(key)
              const isHighlighted = !!highlight && d?.person?.id === highlight
              return (
                <div
                  key={di}
                  onClick={() => isAdmin && openEditor(key)}
                  className={`glass glass-card relative min-h-16 rounded-xl p-2 text-sm ${
                    isHighlighted ? 'glass-hl' : key === tKey ? 'glass-today' : ''
                  } ${isAdmin ? 'cursor-pointer' : ''}`}
                >
                  <div className="text-gray text-xs mb-1">{day}</div>
                  <div className={isHighlighted ? 'text-sky' : 'text-ink'}>
                    {d?.person?.name ?? ''}
                  </div>
                  {d && Number(d.overtime_hours) > 0 && (
                    <span
                      title={`Переработка: ${d.overtime_hours} ч`}
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky"
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
                className="px-4 py-2 rounded-lg bg-blue text-black transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={deleteDuty}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray hover:text-red hover:border-red transition-colors"
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