import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCompanies } from '../features/companies/api'
import CompanyCard from '../features/companies/components/CompanyCard'
import { useFavorites, useRecents } from '../features/companies/hooks'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'
import type { Company } from '../shared/types'
import EmptyState from '../shared/ui/EmptyState'
import { CardSkeletonGrid } from '../shared/ui/Skeleton'
import TodayBar from '../features/duty/components/TodayBar'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const role = useRole()
  const { favorites, toggle } = useFavorites()
  const recents = useRecents()
  const navigate = useNavigate()

  usePageTitle('Заводы · IPM Connections')

  useEffect(() => {
    fetchCompanies().then((list) => {
      setCompanies(list)
      setLoading(false)
    })
  }, [])

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
          className="flex-1 field rounded-lg px-4 py-2.5 text-ink placeholder:text-gray/50 focus:outline-none focus:border-blue"
        />
        <span className="text-gray text-sm shrink-0">{filtered.length}</span>
        {role === 'admin' && (
          <button
            onClick={() => navigate('/company/new')}
            className="btn-primary px-4 py-2.5 rounded-lg text-sm whitespace-nowrap"
          >
            + Добавить
          </button>
        )}
      </div>

      {!loading && recentCompanies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-gray">Недавние:</span>
          {recentCompanies.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/company/${c.id}`)}
              className="px-2.5 py-1 rounded-full border border-ink/10 text-xs text-gray hover:text-sky hover:border-blue transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <CardSkeletonGrid />
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
            <CompanyCard
              key={c.id}
              company={c}
              isFavorite={favorites.includes(c.id)}
              onOpen={() => navigate(`/company/${c.id}`)}
              onToggleFavorite={() => toggle(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}