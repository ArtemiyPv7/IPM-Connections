import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Company } from '../types'
import TodayBar from '../components/TodayBar'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

function readIds(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[]
  } catch {
    return []
  }
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => readIds('ipm_favorites'))
  const [recents] = useState<string[]>(() => readIds('ipm_recents'))
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Заводы — IPM Connections'

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

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem('ipm_favorites', JSON.stringify(next))
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? companies.filter((c) =>
          [c.name, ...c.aliases, c.server_version ?? '', c.kpl_version ?? '', c.trade_groups_raw ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q)
        )
      : companies
    return [...base].sort((a, b) => {
      const fa = favorites.includes(a.id) ? 0 : 1
      const fb = favorites.includes(b.id) ? 0 : 1
      if (fa !== fb) return fa - fb
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [companies, query, favorites])

  const recentCompanies = recents
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is Company => !!c)
    .slice(0, 6)

  return (
    <div className="animate-rise">
      <TodayBar />

      <div className="flex items-center gap-4 mb-4">
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

      {!loading && recentCompanies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted">Недавние:</span>
          {recentCompanies.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/company/${c.id}`)}
              className="px-2.5 py-1 rounded-full border border-white/10 text-xs text-muted hover:text-sand hover:border-bronze transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <Skeleton className="h-5 w-2/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        companies.length === 0 ? (
          <EmptyState
            icon="🏭"
            title="Заводов пока нет"
            hint={role === 'admin' ? 'нажми «+ Добавить», чтобы создать первый' : undefined}
          />
        ) : (
          <EmptyState icon="🔍" title="Ничего не найдено" hint="попробуй другой запрос" />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-rise">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/company/${c.id}`)}
              className="glass glass-card cursor-pointer rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h2 className="font-semibold text-lg text-ink leading-snug">{c.name}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  {!c.is_active && (
                    <span className="text-xs text-terra border border-terra/40 rounded px-1.5 py-0.5 whitespace-nowrap">
                      не работает
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(c.id)
                    }}
                    title={favorites.includes(c.id) ? 'Убрать из избранного' : 'В избранное'}
                    className={`text-base leading-none transition-colors ${
                      favorites.includes(c.id) ? 'text-sand' : 'text-muted/40 hover:text-sand'
                    }`}
                  >
                    {favorites.includes(c.id) ? '★' : '☆'}
                  </button>
                </div>
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