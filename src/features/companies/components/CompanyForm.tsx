import { useState } from 'react'
import type { Company } from '../../../shared/types'
import { btnCls, inputCls } from '../../../shared/ui/styles'
import type { CompanyPayload } from '../api'

export default function CompanyForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Company | null
  onSubmit: (payload: CompanyPayload) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [server, setServer] = useState(initial?.server_version ?? '')
  const [kpl, setKpl] = useState(initial?.kpl_version ?? '')
  const [contours, setContours] = useState(initial?.contours_count?.toString() ?? '')
  const [groups, setGroups] = useState(initial?.trade_groups_raw ?? '')
  const [status, setStatus] = useState(initial?.version_status ?? '')
  const [notes, setNotes] = useState(initial?.version_notes ?? '')
  const [active, setActive] = useState(initial?.is_active ?? true)
  const [error, setError] = useState('')

  function submit() {
    if (!name.trim()) {
      setError('Укажи название завода')
      return
    }
    if (contours && Number.isNaN(Number(contours))) {
      setError('Контуры — это число')
      return
    }
    setError('')
    onSubmit({
      name: name.trim(),
      server_version: server.trim() || null,
      kpl_version: kpl.trim() || null,
      contours_count: contours ? Number(contours) : null,
      trade_groups_raw: groups.trim() || null,
      version_status: status.trim() || null,
      version_notes: notes.trim() || null,
      is_active: active,
    })
  }

  return (
    <section className="glass rounded-xl p-6 mb-6">
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} placeholder="Название *" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="Версия сервера" value={server} onChange={(e) => setServer(e.target.value)} />
        <input className={inputCls} placeholder="Версия КПЛ" value={kpl} onChange={(e) => setKpl(e.target.value)} />
        <input className={inputCls} type="number" placeholder="Контуры" value={contours} onChange={(e) => setContours(e.target.value)} />
        <input className={inputCls} placeholder="Торговые группы" value={groups} onChange={(e) => setGroups(e.target.value)} />
        <input className={inputCls} placeholder="Статус версии" value={status} onChange={(e) => setStatus(e.target.value)} />
        <textarea
          className={`${inputCls} col-span-2`}
          rows={3}
          placeholder="Примечания"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <label className="col-span-2 flex items-center gap-2 text-sm text-gray">
          <input type="checkbox" className="accent-blue" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Завод активен
        </label>
      </div>
      {error && <p className="text-red text-sm mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-2 rounded-lg bg-blue text-black transition-colors text-sm" onClick={submit}>
          Сохранить
        </button>
        {onCancel && (
          <button className={btnCls} onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </section>
  )
}