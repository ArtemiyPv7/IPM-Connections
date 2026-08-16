import { useState } from 'react'
import type { HistoryEntry } from '../../../shared/types'
import { btnCls, dangerCls, inputCls } from '../../../shared/ui/styles'

export default function HistorySection({
  history,
  isAdmin,
  versionNotes,
  onAdd,
  onDelete,
}: {
  history: HistoryEntry[]
  isAdmin: boolean
  versionNotes?: string | null
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
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray mb-3">
        История и заметки
      </h2>

      {versionNotes && (
        <div className="card rounded-xl p-4 mb-3 text-sm text-gray whitespace-pre-wrap">
          {versionNotes}
        </div>
      )}

      {isAdmin && (
        <div className="mb-3">
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

      {history.length === 0 && !versionNotes ? (
        <div className="border border-dashed border-ink/10 rounded-xl px-4 py-3 text-sm text-gray">
          📝 Заметок пока нет
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="card rounded-xl p-4 text-sm flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-gray text-xs mb-1">
                  {new Date(h.created_at).toLocaleDateString('ru-RU')}
                </p>
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
      )}
    </section>
  )
}