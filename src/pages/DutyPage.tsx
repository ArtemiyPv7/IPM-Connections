import { useEffect, useState } from 'react'
import {
  fetchDuties,
  fetchPeople,
  fetchVacations,
  removeDuty,
  upsertDuty,
} from '../features/duty/api'
import { MONTHS } from '../features/duty/calendar'
import DutySummary from '../features/duty/components/DutySummary'
import MonthAgenda from '../features/duty/components/MonthAgenda'
import MonthGrid from '../features/duty/components/MonthGrid'
import PeopleManager from '../features/duty/components/PeopleManager'
import VacationsManager from '../features/duty/components/VacationsManager'
import { exportMonthDuties } from '../features/duty/exportMonth'
import { toast } from '../shared/lib/toast'
import { log } from '../shared/lib/audit'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'
import type { Duty, Person, Vacation } from '../shared/types'
import Modal from '../shared/ui/Modal'
import { dangerCls, navBtnCls } from '../shared/ui/styles'

interface MonthBlockProps {
  year: number
  month: number
  duties: Duty[]
  vacations: Vacation[]
  highlight: string | null
  isAdmin: boolean
  onToggleHighlight: (id: string) => void
  onEditDay: (date: string) => void
  className?: string
}

function MonthBlock({ year, month, className = '', ...grid }: MonthBlockProps) {
  return (
    <div className={className}>
      <h3 className="font-semibold text-ink mb-2">
        {MONTHS[month]} {year}
      </h3>
      <MonthGrid
        year={year}
        month={month}
        duties={grid.duties}
        vacations={grid.vacations}
        highlight={grid.highlight}
        isAdmin={grid.isAdmin}
        onToggleHighlight={grid.onToggleHighlight}
        onEditDay={grid.onEditDay}
      />
    </div>
  )
}

export default function DutyPage() {
  const role = useRole()
  const isAdmin = role === 'admin'
  const [people, setPeople] = useState<Person[]>([])
  const [duties, setDuties] = useState<Duty[]>([])
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [highlight, setHighlight] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [editPerson, setEditPerson] = useState('')
  const [editHours, setEditHours] = useState('0')
  const [editNote, setEditNote] = useState('')

  usePageTitle('Дежурства · IPM Connections')

  async function load() {
    const [ppl, d, vac] = await Promise.all([fetchPeople(), fetchDuties(), fetchVacations()])
    setPeople(ppl)
    setDuties(d)
    setVacations(vac)
  }

  useEffect(() => {
    load()
  }, [])

  const dutyByDate = new Map(duties.map((d) => [d.duty_date, d]))
  const second = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 }

  function openEditor(date: string) {
    setSelected(date)
    const d = dutyByDate.get(date)
    setEditPerson(d?.person?.id ?? '')
    setEditHours(d ? String(d.overtime_hours) : '0')
    setEditNote(d?.note ?? '')
  }

  async function saveDuty() {
    if (!selected || !editPerson) return
    if (
      !(await upsertDuty({
        duty_date: selected,
        person_id: editPerson,
        overtime_hours: Number(editHours) || 0,
        note: editNote || null,
      }))
    )
      return
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

  function toggleHighlight(id: string) {
    setHighlight((prev) => (prev === id ? null : id))
  }

  function exportMonth() {
    void log('export_month', `${year}-${month + 1}`)
    exportMonthDuties(year, month, duties)
  }

  const now = new Date()

  return (
    <div className="flex h-full">
      <aside className="w-full min-[901px]:w-80 shrink-0 min-[901px]:border-r border-ink/10 flex-col min-h-0 max-[900px]:hidden flex">
        <div className="p-4 pb-2 flex items-center justify-between">
          <button className={navBtnCls} aria-label="Предыдущий год" onClick={() => setYear((y) => y - 1)}>
            ‹
          </button>
          <span className="font-semibold text-ink">{year}</span>
          <button className={navBtnCls} aria-label="Следующий год" onClick={() => setYear((y) => y + 1)}>
            ›
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {MONTHS.map((title, m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 ${
                month === m
                  ? 'translate-x-1 border-blue/60 bg-blue/10 shadow-sm font-medium text-ink'
                  : 'border-ink/10 bg-[var(--field-bg)] text-ink hover:translate-x-1 hover:border-blue/40'
              }`}
            >
              {title}
              {year === now.getFullYear() && m === now.getMonth() && (
                <span className="dot bg-sky" title="Текущий месяц" />
              )}
            </button>
          ))}
        </div>
      </aside>
      <section className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-5 min-[901px]:p-8">
          <div className="min-[901px]:hidden mb-3 flex items-center justify-between">
            <button className={navBtnCls} aria-label="Предыдущий год" onClick={() => setYear((y) => y - 1)}>
              ‹
            </button>
            <span className="font-semibold text-ink">{year}</span>
            <button className={navBtnCls} aria-label="Следующий год" onClick={() => setYear((y) => y + 1)}>
              ›
            </button>
          </div>
          <div className="min-[901px]:hidden mb-4 flex gap-1.5 overflow-x-auto pb-1">
            {MONTHS.map((title, m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`chip shrink-0 transition-colors ${
                  month === m ? 'border-blue/60 bg-blue/10 text-sky' : 'text-gray'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <DutySummary people={people} duties={duties} vacations={vacations} />
          <div className="flex items-center justify-between gap-3 mb-3 mt-6">
            <p className="text-[11px] text-gray">
              клик по имени — подсветить смены; клик по дню (админ) — редактировать смену
            </p>
            <button
              onClick={exportMonth}
              title={`Скачать дежурства за ${MONTHS[month]} ${year} в Excel`}
              className="px-3.5 py-2 rounded-lg text-sm border border-blue/60 bg-blue/10 text-sky hover:bg-blue/20 transition-colors shrink-0"
            >
              Экспорт месяца в Excel
            </button>
          </div>
          <div className="max-w-[1150px] 2xl:max-w-none grid gap-6 2xl:grid-cols-2">
            <MonthBlock
              year={year}
              month={month}
              duties={duties}
              vacations={vacations}
              highlight={highlight}
              isAdmin={isAdmin}
              onToggleHighlight={toggleHighlight}
              onEditDay={openEditor}
            />
            <MonthBlock
              year={second.y}
              month={second.m}
              duties={duties}
              vacations={vacations}
              highlight={highlight}
              isAdmin={isAdmin}
              onToggleHighlight={toggleHighlight}
              onEditDay={openEditor}
              className="hidden 2xl:block"
            />
          </div>
          <MonthAgenda
            year={year}
            month={month}
            duties={duties}
            vacations={vacations}
            highlight={highlight}
            isAdmin={isAdmin}
            onToggleHighlight={toggleHighlight}
            onEditDay={openEditor}
          />
          {isAdmin && selected && (
            <Modal
              title={`Смена · ${new Date(selected).toLocaleDateString('ru-RU')}`}
              onClose={() => setSelected(null)}
            >
              <div className="space-y-3">
                <select
                  value={editPerson}
                  onChange={(e) => setEditPerson(e.target.value)}
                  className="w-full field rounded-lg px-3 py-2 text-ink"
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
                  className="w-full field rounded-lg px-3 py-2 text-ink"
                />
                <input
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Примечание"
                  className="w-full field rounded-lg px-3 py-2 text-ink"
                />
                <div className="flex gap-2 pt-1">
                  <button onClick={saveDuty} className="btn-primary px-4 py-2 rounded-lg text-sm">
                    Сохранить
                  </button>
                  <button className={dangerCls} onClick={deleteDuty}>
                    Удалить
                  </button>
                  <button className={navBtnCls} onClick={() => setSelected(null)}>
                    Отмена
                  </button>
                </div>
              </div>
            </Modal>
          )}
          <div className="grid gap-4 md:grid-cols-2 items-start mt-8">
            <PeopleManager
              isAdmin={isAdmin}
              onChanged={load}
              highlightId={highlight}
              onSelectPerson={toggleHighlight}
            />
            <VacationsManager isAdmin={isAdmin} onChanged={load} />
          </div>
        </div>
      </section>
    </div>
  )
}