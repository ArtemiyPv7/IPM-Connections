import type { Company } from '../../../shared/types'

export default function CompanyCard({
  company,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  company: Company
  isFavorite: boolean
  onOpen: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div onClick={onOpen} className="card card-hover cursor-pointer rounded-xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <h2 className="font-semibold text-lg text-ink leading-snug">{company.name}</h2>
        <div className="flex items-center gap-2 shrink-0">
          {!company.is_active && (
            <span className="text-xs text-red border border-red/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              не работает
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            className={`text-base leading-none transition-colors ${
              isFavorite ? 'text-sky' : 'text-gray/40 hover:text-sky'
            }`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray mb-1">
        Сервер: <span className="text-ink font-mono">{company.server_version ?? '—'}</span>
        {' / '}КПЛ: <span className="text-ink font-mono">{company.kpl_version ?? '—'}</span>
      </p>
      <p className="text-sm text-gray">
        Контуры: <span className="text-ink">{company.contours_count ?? '—'}</span>
        {company.trade_groups_raw && (
          <>
            {' · '}<span className="text-ink">{company.trade_groups_raw}</span>
          </>
        )}
      </p>
    </div>
  )
}