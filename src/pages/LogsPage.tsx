import { useEffect, useState } from 'react'
import { supabase } from '../shared/lib/supabase'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'

interface AuditRow {
  id: string
  created_at: string
  user_name: string
  action: string
  entity: string | null
  ip: string | null
  user_agent: string | null
  device_id: string | null
}

const ACTION_LABELS: Record<string, string> = {
  login_success: 'вход',
  login_failed: 'неудачная попытка входа',
  logout: 'выход',
  session_expired: 'сессия истекла (6 ч)',
  view_company: 'просмотр завода',
  copy: 'копирование',
  export_full: 'полный экспорт',
  export_month: 'экспорт месяца',
  create_company: 'создан завод',
  update_company: 'изменён завод',
  delete_company: 'удалён завод',
  save_connection: 'сохранено подключение',
  delete_connection: 'удалено подключение',
  mark_checked: 'отметка «проверено»',
  save_person: 'сохранён сотрудник',
  delete_person: 'удалён сотрудник',
  save_duty: 'сохранена смена',
  delete_duty: 'удалена смена',
}

export default function LogsPage() {
  const role = useRole()
  const [rows, setRows] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  usePageTitle('Логи · IPM Connections')

  useEffect(() => {
    if (role !== 'dev') return
    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows((data as AuditRow[]) ?? [])
        setLoading(false)
      })
  }, [role])

  if (role !== 'dev') return <p className="text-gray">Недостаточно прав.</p>

  const q = filter.trim().toLowerCase()
  const visible = q
    ? rows.filter((r) =>
        [r.user_name, ACTION_LABELS[r.action] ?? r.action, r.entity ?? '', r.ip ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : rows

  return (
    <div className="animate-rise">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-semibold text-2xl text-sky">Логи</h1>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Фильтр: пользователь, действие, завод, ip…"
          className="flex-1 max-w-md field rounded-lg px-4 py-2 text-ink placeholder:text-gray/60 focus:outline-none focus:border-blue"
        />
      </div>
      {loading ? (
        <p className="text-gray">Загрузка…</p>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <div
              key={r.id}
              className="card rounded-xl p-4 text-sm flex flex-wrap items-baseline gap-x-4 gap-y-1"
              title={r.user_agent ?? ''}
            >
              <span className="text-gray text-xs shrink-0 w-40">
                {new Date(r.created_at).toLocaleString('ru-RU')}
              </span>
              <span className="text-sky shrink-0">{r.user_name}</span>
              <span className="text-ink">{ACTION_LABELS[r.action] ?? r.action}</span>
              {r.entity && <span className="text-gray truncate">{r.entity}</span>}
              <span className="text-gray text-xs ml-auto shrink-0">
                ip: {r.ip ?? '—'} · device: {r.device_id ? r.device_id.slice(0, 8) : '—'}
              </span>
            </div>
          ))}
          {visible.length === 0 && <p className="text-gray">Ничего не найдено.</p>}
        </div>
      )}
    </div>
  )
}