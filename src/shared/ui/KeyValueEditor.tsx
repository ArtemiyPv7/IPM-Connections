import { useState } from 'react'
import CopyButton from './CopyButton'
import { toast } from '../../lib/toast'
import { btnCls, inputCls } from './styles'

export interface KVItem {
  id: string
  label: string
  value: string
}

export default function KeyValueEditor({
  items,
  isAdmin,
  onSave,
  onDelete,
  auditContext,
}: {
  items: KVItem[]
  isAdmin: boolean
  onSave: (p: { id?: string; label: string; value: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  auditContext?: string
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')

  function start(id: string | 'new', l = '', v = '') {
    setEditingId(id)
    setLabel(l)
    setValue(v)
  }

  async function save() {
    if (!label.trim() || !value.trim()) return
    await onSave({
      id: editingId && editingId !== 'new' ? editingId : undefined,
      label: label.trim(),
      value: value.trim(),
    })
    toast('Сохранено')
    setEditingId(null)
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-2">
            <p className="text-sm min-w-0">
              <span className="text-gray">{f.label}: </span>
              <span className="text-white break-all font-mono text-[13px]">{f.value}</span>
              <CopyButton
                text={f.value}
                audit={auditContext ? `${auditContext} · ${f.label}` : f.label}
              />
            </p>
            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <button className={btnCls} onClick={() => start(f.id, f.label, f.value)}>
                  Изменить
                </button>
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-gray hover:text-red hover:border-red transition-colors text-xs"
                  onClick={() => {
                    if (window.confirm('Удалить поле?')) onDelete(f.id)
                  }}
                >
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isAdmin && editingId && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Поле" />
          <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Значение" />
          <div className="col-span-2 flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-blue text-black text-xs transition-colors"
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

      {isAdmin && !editingId && (
        <button className={`${btnCls} mt-3`} onClick={() => start('new')}>
          + Добавить поле
        </button>
      )}
    </div>
  )
}