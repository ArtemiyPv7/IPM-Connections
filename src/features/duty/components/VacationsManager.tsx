import { useEffect, useState } from 'react'
import { toast } from '../../../shared/lib/toast'
import type { Person, Vacation } from '../../../shared/types'
import Collapsible from '../../../shared/ui/Collapsible'
import Modal from '../../../shared/ui/Modal'
import { btnCls, iconBtnCls, inputCls } from '../../../shared/ui/styles'
import { fetchPeople, fetchVacations, removeVacation, saveVacation } from '../api'

function shortDate(iso: string): string {
  const y = iso.slice(0, 4)
  const cur = String(new Date().getFullYear())
  const dm = `${iso.slice(8, 10)}.${iso.slice(5, 7)}`
  return y === cur ? dm : `${dm}.${y}`
}

export default function VacationsManager({
  isAdmin,
  onChanged,
}: {
  isAdmin: boolean
  onChanged: () => void
}) {
  const [vacations, setVacations] = useState<Vacation[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [showForm, setShowForm] = useState(false)
  const [personId, setPersonId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')

  async function load() {
    const [vac, ppl] = await Promise.all([fetchVacations(), fetchPeople()])
    setVacations(vac)
    setPeople(ppl)
  }

  useEffect(() => {
    load()
  }, [])

  function closeForm() {
    setShowForm(false)
    setPersonId('')
    setStart('')
    setEnd('')
    setNote('')
  }

  async function save() {
    if (!personId || !start || !end) return
    if (end < start) {
      toast('Конец отпуска раньше начала')
      return
    }
    if (
      !(await saveVacation({
        person_id: personId,
        date_start: start,
        date_end: end,
        note: note.trim() || null,
      }))
    )
      return
    toast('Отпуск сохранён')
    closeForm()
    load()
    onChanged()
  }

  async function remove(id: string) {
    if (!window.confirm('Удалить отпуск?')) return
    if (!(await removeVacation(id))) return
    toast('Отпуск удалён')
    load()
    onChanged()
  }

  return (
    <>
      <Collapsible
        title="Отпуска"
        action={
          isAdmin ? (
            <button className={btnCls} onClick={() => setShowForm(true)}>
              + Добавить
            </button>
          ) : undefined
        }
      >
        {vacations.length === 0 ? (
          <p className="text-sm text-gray">Отпусков нет.</p>
        ) : (
          <div className="space-y-1 text-[13px]">
            {vacations.map((v) => (
              <div key={v.id} className="flex items-center gap-2 min-w-0">
                <span className="text-ink truncate">{v.person?.name ?? '—'}</span>
                <span className="text-gray shrink-0">
                  · {shortDate(v.date_start)} — {shortDate(v.date_end)}
                </span>
                {v.note && (
                  <span className="text-gray truncate" title={v.note}>
                    · {v.note}
                  </span>
                )}
                {isAdmin && (
                  <button
                    className={`${iconBtnCls} hover:text-red hover:border-red`}
                    title="Удалить"
                    onClick={() => remove(v.id)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Collapsible>
      {isAdmin && showForm && (
        <Modal title="Новый отпуск" onClose={closeForm}>
          <div className="space-y-3">
            <select
              className={inputCls}
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
            >
              <option value="">— сотрудник —</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input className={inputCls} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <input className={inputCls} type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <input
              className={inputCls}
              placeholder="Примечание"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2 pt-1">
              <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={save}>
                Сохранить
              </button>
              <button className={btnCls} onClick={closeForm}>
                Отмена
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}