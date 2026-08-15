import { useState } from 'react'
import type { HistoryEntry } from '../../../shared/types'
import EmptyState from '../../../shared/ui/EmptyState'
import { btnCls, dangerCls, inputCls } from '../../../shared/ui/styles'

export default function HistorySection({
  history,
  isAdmin,
  onAdd,
  onDelete,
}: {
  history: HistoryEntry[]
  isAdmin: boolean
  onAdd: (content: string) => void
  onDelete: (id: string) => void
}) {
  const [note, setNote] = useState('')

  function submit() {
    if (!note.trim()) return
    onAdd(note.trim())
    setNote('')
  }

  return (
    <section className="card rounded-xl p-6">
      <h2 className="font-semibold text-ink mb-4">История и заметки</h2>
      {isAdmin && (
        <div className="mb-4">
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Новая заметка…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className={`${btnCls} mt-2`} onClick={submit}>
            Добавить заметку
          </button>
        </div>
      )}
      {history.length === 0 && <EmptyState icon="📝" title="Заметок пока нет" />}
      <div className="space-y-3">
        {history.map((h) => (
          <div key={h.id} className="text-sm flex items-start justify-between gap-4">
            <div>
              <p className="text-gray text-xs mb-1">{new Date(h.created_at).toLocaleDateString('ru-RU')}</p>
              <p className="text-ink whitespace-pre-wrap">{h.content}</p>
            </div>
            {isAdmin && (
              <button className={dangerCls} onClick={() => onDelete(h.id)}>
                Удалить
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}