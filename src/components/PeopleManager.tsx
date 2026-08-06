import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { btnCls, inputCls } from '../shared/ui/styles'

interface Person {
  id: string
  name: string
  full_name: string | null
  birth_date: string | null
  can_duty: boolean
}

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
    const { data } = await supabase.from('people').select('*')
    const list = (data as Person[]) ?? []
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
    const payload = {
      name: name.trim(),
      full_name: fullName.trim() || null,
      birth_date: birthDate || null,
      can_duty: canDuty,
    }
    if (editingId === 'new') {
      await supabase.from('people').insert(payload)
    } else if (editingId) {
      await supabase.from('people').update(payload).eq('id', editingId)
    }
    toast('Сохранено')
    setEditingId(null)
    load()
    onChanged()
  }

  async function remove(p: Person) {
    if (!window.confirm(`Удалить сотрудника «${p.name}»? Его дежурства в календаре тоже удалятся.`))
      return
    await supabase.from('duty_assignments').delete().eq('person_id', p.id)
    await supabase.from('people').delete().eq('id', p.id)
    toast('Сотрудник удалён')
    setEditingId(null)
    setEditingId(null)
    load()
    onChanged()
  }

  return (
    <div className="mt-8 glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-white">Сотрудники</h2>
        {isAdmin && (
          <button className={btnCls} onClick={startNew}>
            + Добавить
          </button>
        )}
      </div>
      <p className="text-xs text-gray mb-4">нажми на имя, чтобы подсветить смены в календаре</p>

      {isAdmin && editingId && (
        <div className="mb-4 grid grid-cols-3 gap-2">
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
          <label className="col-span-3 flex items-center gap-2 text-sm text-gray">
            <input
              type="checkbox"
              checked={canDuty}
              onChange={(e) => setCanDuty(e.target.checked)}
              className="accent-blue"
            />
            Может дежурить
          </label>
          <div className="col-span-3 flex gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-blue text-black hover:bg-sky transition-colors text-sm"
              onClick={save}
            >
              Сохранить
            </button>
            <button className={btnCls} onClick={() => setEditingId(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 text-sm">
        {people.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-3 min-w-0">
              <span className="text-gray w-28 shrink-0">
                {p.birth_date
                  ? new Date(p.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                  : '—'}
              </span>
              <button
                onClick={() => onSelectPerson(p.id)}
                title="Подсветить смены в календаре"
                className={`text-left truncate transition-colors ${
                  highlightId === p.id ? 'text-sky' : 'text-white hover:text-sky'
                }`}
              >
                {isAdmin ? (
                  <>
                    {p.name}
                    {p.full_name && <span className="text-gray"> · {p.full_name}</span>}
                  </>
                ) : (
                  <>{p.full_name ?? p.name}</>
                )}
              </button>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button className={btnCls} onClick={() => startEdit(p)}>
                  Изменить
                </button>
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-gray hover:text-red hover:border-red transition-colors text-xs"
                  onClick={() => remove(p)}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}