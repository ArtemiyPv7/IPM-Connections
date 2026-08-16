import { useEffect, useState } from 'react'
import { toast } from '../../../lib/toast'
import type { Person } from '../../../shared/types'
import Collapsible from '../../../shared/ui/Collapsible'
import Modal from '../../../shared/ui/Modal'
import { btnCls, inputCls } from '../../../shared/ui/styles'
import { fetchPeople, removePerson, savePerson } from '../api'

const iconBtn =
  'w-6 h-6 inline-flex items-center justify-center rounded border border-ink/10 text-gray transition-colors text-[11px] leading-none shrink-0'

export default function PeopleManager({
  isAdmin,
  onChanged,
  highlightId,
  onSelectPerson,
}: {
  isAdmin: boolean
  onChanged: () => void
  highlightId: string | null
  onSelectPerson: (id: string) => void
}) {
  const [people, setPeople] = useState<Person[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [canDuty, setCanDuty] = useState(true)

  async function load() {
    const list = await fetchPeople()
    list.sort((a, b) => {
      const ad = a.birth_date ? a.birth_date.slice(5) : '99-99'
      const bd = b.birth_date ? b.birth_date.slice(5) : '99-99'
      return ad < bd ? -1 : ad > bd ? 1 : 0
    })
    setPeople(list)
  }

  useEffect(() => {
    load()
  }, [])

  function startNew() {
    setEditingId('new')
    setName('')
    setFullName('')
    setBirthDate('')
    setCanDuty(true)
  }

  function startEdit(p: Person) {
    setEditingId(p.id)
    setName(p.name)
    setFullName(p.full_name ?? '')
    setBirthDate(p.birth_date ?? '')
    setCanDuty(p.can_duty)
  }

  async function save() {
    if (!name.trim()) return
    const ok = await savePerson(
      {
        name: name.trim(),
        full_name: fullName.trim() || null,
        birth_date: birthDate || null,
        can_duty: canDuty,
      },
      editingId && editingId !== 'new' ? editingId : undefined
    )
    if (!ok) return
    toast('Сохранено')
    setEditingId(null)
    load()
    onChanged()
  }

  async function remove(p: Person) {
    if (!window.confirm(`Удалить сотрудника «${p.name}»? Его дежурства в календаре тоже удалятся.`))
      return
    if (!(await removePerson(p.id))) return
    toast('Сотрудник удалён')
    setEditingId(null)
    load()
    onChanged()
  }

  return (
    <>
      <Collapsible
        title="Сотрудники"
        hint="клик по имени — подсветка смен"
        action={
          isAdmin ? (
            <button className={btnCls} onClick={startNew}>
              + Добавить
            </button>
          ) : undefined
        }
      >
        <div className="space-y-1 text-[13px]">
          {people.map((p) => (
            <div key={p.id} className="flex items-center gap-2 min-w-0">
              <span className="text-gray w-12 shrink-0 font-mono text-xs">
                {p.birth_date ? `${p.birth_date.slice(8, 10)}.${p.birth_date.slice(5, 7)}` : '—'}
              </span>
              <button
                onClick={() => onSelectPerson(p.id)}
                title={`${p.full_name ?? p.name} · подсветить смены в календаре`}
                className={`truncate min-w-0 text-left transition-colors ${
                  highlightId === p.id ? 'text-sky' : 'text-ink hover:text-sky'
                }`}
              >
                {isAdmin ? p.name : (p.full_name ?? p.name)}
              </button>
              {/* Кнопки сразу после имени, как копи-кнопки в подключениях */}
              {isAdmin && (
                <>
                  <button
                    className={`${iconBtn} hover:text-sky hover:border-blue`}
                    title="Изменить"
                    onClick={() => startEdit(p)}
                  >
                    ✎
                  </button>
                  <button
                    className={`${iconBtn} hover:text-red hover:border-red`}
                    title="Удалить"
                    onClick={() => remove(p)}
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </Collapsible>

      {isAdmin && editingId !== null && (
        <Modal
          title={editingId === 'new' ? 'Новый сотрудник' : 'Изменить сотрудника'}
          onClose={() => setEditingId(null)}
        >
          <div className="space-y-3">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Имя (для дежурств)"
            />
            <input
              className={inputCls}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Полное имя"
            />
            <input
              className={inputCls}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-gray">
              <input
                type="checkbox"
                className="accent-blue"
                checked={canDuty}
                onChange={(e) => setCanDuty(e.target.checked)}
              />
              Может дежурить
            </label>
            <div className="flex gap-2 pt-1">
              <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={save}>
                Сохранить
              </button>
              <button className={btnCls} onClick={() => setEditingId(null)}>
                Отмена
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}