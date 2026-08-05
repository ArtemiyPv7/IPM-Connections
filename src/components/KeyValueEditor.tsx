import { useState } from 'react'
import CopyButton from './CopyButton'

export interface KVItem {
  id: string
  label: string
  value: string
}

const inputCls =
  'w-full glass-input rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-bronze'
const btnCls =
  'px-3 py-1.5 rounded-md border border-white/10 text-muted hover:text-sand hover:border-bronze transition-colors text-xs'

export default function KeyValueEditor({
  items,
  isAdmin,
  onSave,
  onDelete,
}: {
  items: KVItem[]
  isAdmin: boolean
  onSave: (p: { id?: string; label: string; value: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
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
    setEditingId(null)
  }

  return (
    <div>
      <div className="space-y-2">
        {items.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-2">
            <p className="text-sm min-w-0">
              <span className="text-muted">{f.label}: </span>
              <span className="text-ink break-all font-mono text-[13px]">{f.value}</span>
              <CopyButton text={f.value} />
            </p>
            {isAdmin && (
              <div className="flex gap-2 shrink-0">
                <button className={btnCls} onClick={() => start(f.id, f.label, f.value)}>
                  Изменить
                </button>
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-muted hover:text-terra hover:border-terra transition-colors text-xs"
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
          <input
            className={inputCls}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Поле"
          />
          <input
            className={inputCls}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Значение"
          />
          <div className="col-span-2 flex gap-2">
            <button
              className="px-3 py-1.5 rounded-md bg-bronze text-bg hover:bg-sand text-xs transition-colors"
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