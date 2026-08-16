import type { Company } from '../../../shared/types'
import { groupNames } from '../groups'
import ProtocolTile from './ProtocolTile'

// Строка завода в левом списке: плитка протокола, название,
// версии «сервер / кпл» без подписей и только названия торговых групп.
export default function CompanyRow({
  company,
  protocol,
  isFavorite,
  isSelected,
  onOpen,
  onToggleFavorite,
}: {
  company: Company
  protocol: string | null
  isFavorite: boolean
  isSelected: boolean
  onOpen: () => void
  onToggleFavorite: () => void
}) {
  const groups = groupNames(company.trade_groups_raw)

  return (
    <div
      onClick={onOpen}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-all duration-150 ${
        isSelected
          ? 'translate-x-1 border-blue/60 bg-blue/10 shadow-sm'
          : 'border-ink/10 bg-[var(--field-bg)] hover:translate-x-1 hover:border-blue/40 hover:shadow-md'
      }`}
    >
      <ProtocolTile type={protocol} />

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink leading-tight">
          <span className="truncate">{company.name}</span>
          {!company.is_active && <span className="dot bg-red shrink-0" title="Завод не работает" />}
        </p>
        <p className="text-xs text-gray truncate mt-0.5">
          <span className="font-mono">
            {company.server_version ?? '—'} / {company.kpl_version ?? '—'}
          </span>
          {groups.length > 0 && <span className="ml-2">{groups.join(', ')}</span>}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        className={`shrink-0 text-sm leading-none px-1 transition-colors ${
          isFavorite ? 'text-sky' : 'text-gray/30 hover:text-sky'
        }`}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  )
}