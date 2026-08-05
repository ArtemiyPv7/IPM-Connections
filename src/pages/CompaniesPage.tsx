import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Company } from '../types'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => setRole(p?.role ?? null))
    })

    supabase
      .from('companies')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCompanies((data as Company[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) =>
      [
        c.name,
        ...c.aliases,
        c.server_version ?? '',
        c.kpl_version ?? '',
        c.trade_groups_raw ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [companies, query])

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: название, версия, торговая группа…"
          className="flex-1 glass rounded-lg px-4 py-2.5 text-ink placeholder:text-muted/60 focus:outline-none focus:border-bronze"
        />
        <span className="text-muted text-sm">{filtered.length}</span>
        {role === 'admin' && (
          <button
            onClick={() => navigate('/company/new')}
            className="px-4 py-2.5 rounded-lg bg-bronze text-bg hover:bg-sand transition-colors text-sm whitespace-nowrap"
          >
            + Добавить
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-muted">Загрузка…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/company/${c.id}`)}
              className="glass glass-card cursor-pointer rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="font-semibold text-lg text-ink leading-snug">{c.name}</h2>
                {!c.is_active && (
                  <span className="text-xs text-terra border border-terra/40 rounded px-1.5 py-0.5 whitespace-nowrap">
                    не работает
                  </span>
                )}
              </div>

              <p className="text-sm text-muted mb-1">
                Сервер: <span className="text-ink font-mono">{c.server_version ?? '—'}</span>
                {' / '}КПЛ: <span className="text-ink font-mono">{c.kpl_version ?? '—'}</span>
              </p>
              <p className="text-sm text-muted">
                Контуры: <span className="text-ink">{c.contours_count ?? '—'}</span>
                {c.trade_groups_raw && (
                  <>
                    {' · '}<span className="text-ink">{c.trade_groups_raw}</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}