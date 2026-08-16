import { useState } from 'react'
import type { Company } from '../../../shared/types'
import Field, { FormSection } from '../../../shared/ui/Field'
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
    <div>
      <FormSection title="Основное">
        <Field label="Название *" className="sm:col-span-2">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray">
          <input
            type="checkbox"
            className="accent-blue"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Завод активен
        </label>
      </FormSection>

      <FormSection title="Версии и статус">
        <Field label="Версия сервера">
          <input className={inputCls} value={server} onChange={(e) => setServer(e.target.value)} />
        </Field>
        <Field label="Версия КПЛ">
          <input className={inputCls} value={kpl} onChange={(e) => setKpl(e.target.value)} />
        </Field>
        <Field label="Статус версии" className="sm:col-span-2">
          <input className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Группы">
        <Field label="Контуры">
          <input
            className={inputCls}
            type="number"
            value={contours}
            onChange={(e) => setContours(e.target.value)}
          />
        </Field>
        <Field
          label="Торговые группы"
          hint="Формат: 4000 - milk, 4001 - softdrinks"
          className="sm:col-span-2"
        >
          <input className={inputCls} value={groups} onChange={(e) => setGroups(e.target.value)} />
        </Field>
      </FormSection>

      <FormSection title="Примечания">
        <textarea
          className={`${inputCls} sm:col-span-2`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormSection>

      {error && <p className="text-red text-sm mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={submit}>
          Сохранить
        </button>
        {onCancel && (
          <button className={btnCls} onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </div>
  )
}