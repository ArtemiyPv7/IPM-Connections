import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchCompanies, fetchFirstConnectionTypes } from '../features/companies/api'
import CompanyPassport from '../features/companies/components/CompanyPassport'
import CompanyRow from '../features/companies/components/CompanyRow'
import { useFavorites } from '../features/companies/hooks'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'
import type { Company } from '../shared/types'
import EmptyState from '../shared/ui/EmptyState'
import Skeleton from '../shared/ui/Skeleton'

// Экран «Заводы»: слева список во всю высоту «окна» (с border-r и своим скроллом),
// справа паспорт со своим скроллом. На ≤900px паспорт — поверх списка.
export default function CompaniesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [firstTypes, setFirstTypes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const role = useRole()
  const { favorites, toggle } = useFavorites()
  usePageTitle('Заводы · IPM Connections')

  useEffect(() => {
    Promise.all([fetchCompanies(), fetchFirstConnectionTypes()]).then(([list, types]) => {
      setCompanies(list)
      setFirstTypes(types)
      setLoading(false)
    })
  }, [])

  // Избранные ★ всегда сверху, дальше по алфавиту.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? companies.filter((c) =>
          [c.name, ...c.aliases, c.server_version ?? '', c.kpl_version ?? '', c.trade_groups_raw ?? '']
            .join(' ')
            .toLowerCase()
            .includes(q),
        )
      : companies
    return [...base].sort((a, b) => {
      const fa = favorites.includes(a.id) ? 0 : 1
      const fb = favorites.includes(b.id) ? 0 : 1
      if (fa !== fb) return fa - fb
      return a.name.localeCompare(b.name, 'ru')
    })
  }, [companies, query, favorites])

  function clearSearch() {
    setQuery('')
    searchRef.current?.focus()
  }

  return (
    <div className="flex h-full">
      {/* Левая колонка: фильтр + список */}
      <aside className="w-full min-[901px]:w-80 shrink-0 min-[901px]:border-r border-ink/10 flex flex-col min-h-0">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Фильтр: название, группа, протокол…"
                className="w-full field rounded-lg px-4 py-2.5 pr-9 text-ink placeholder:text-gray/50 focus:outline-none focus:border-blue"
              />
              {/* Крестик очистки — только когда есть текст */}
              {query && (
                <button
                  onClick={clearSearch}
                  title="Очистить"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-gray hover:text-red transition-colors text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            {role === 'admin' && (
              <button
                onClick={() => navigate('/company/new')}
                title="Добавить завод"
                className="px-3.5 py-2.5 rounded-lg text-sm leading-none border border-blue/60 bg-blue/10 text-sky hover:bg-blue/20 transition-colors"
              >
                +
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray px-1 pt-2">
            {loading ? 'Загрузка…' : `${filtered.length} из ${companies.length}`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[64px] rounded-xl" />
            ))}

          {!loading &&
            filtered.map((c) => (
              <CompanyRow
                key={c.id}
                company={c}
                protocol={firstTypes[c.id] ?? null}
                isFavorite={favorites.includes(c.id)}
                isSelected={c.id === id}
                onOpen={() => navigate(`/company/${c.id}`)}
                onToggleFavorite={() => toggle(c.id)}
              />
            ))}

          {!loading && filtered.length === 0 && (
            companies.length === 0 ? (
              <EmptyState
                icon="🏭"
                title="Заводов пока нет"
                hint={role === 'admin' ? 'нажми «+», чтобы создать первый' : undefined}
              />
            ) : (
              <EmptyState icon="🔍" title="Ничего не найдено" hint="попробуй другой запрос" />
            )
          )}
        </div>
      </aside>

      {/* Правая колонка: паспорт завода. Пусто — подсказка (только десктоп). */}
      {!id && (
        <section className="flex-1 min-w-0 max-[900px]:hidden flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <EmptyState icon="🏭" title="Выбери завод из списка" hint="паспорт завода откроется здесь" />
          </div>
        </section>
      )}

      {id && (
        <section
          key={id}
          className="flex-1 min-w-0 overflow-y-auto max-[900px]:absolute max-[900px]:inset-0 max-[900px]:z-40 max-[900px]:bg-[var(--card-bg)] max-[900px]:animate-slide-in"
        >
          {/* Мобильный топбар паспорта */}
          <div className="min-[901px]:hidden sticky top-0 z-10 flex items-center h-12 px-3 bg-[var(--card-bg)] border-b border-ink/10">
            <button
              onClick={() => navigate('/')}
              className="px-2 py-1 rounded-md text-sm text-gray hover:text-sky transition-colors"
            >
              ‹ Заводы
            </button>
          </div>
          <div className="p-5 min-[901px]:p-8">
            <CompanyPassport />
          </div>
        </section>
      )}
    </div>
  )
}