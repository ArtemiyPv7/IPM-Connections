import ConnectionDetails from './ConnectionDetails'
import ProtocolTile from './ProtocolTile'
import { protocolMeta } from '../protocols'
import type { Connection, KeyValue } from '../../../shared/types'
import { btnCls, dangerCls } from '../../../shared/ui/styles'
import type { FieldDraft } from '../api'

export default function ConnectionCard({
  conn,
  fields,
  companyName,
  isAdmin,
  onEdit,
  onDelete,
  onMarkChecked,
  onSaveField,
  onDeleteField,
}: {
  conn: Connection
  fields: KeyValue[]
  companyName: string
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
  onMarkChecked: () => void
  onSaveField: (p: FieldDraft) => Promise<void>
  onDeleteField: (id: string) => Promise<void>
}) {
  const meta = protocolMeta(conn.type)

  return (
    <div className="card card-hover rounded-xl p-5 h-full">
      {/* Шапка карточки: плитка протокола, название, бейдж типа */}
      <div className="flex items-center gap-3 mb-4">
        <ProtocolTile type={conn.type} />
        <h3 className="font-medium text-ink flex-1 min-w-0 truncate">
          {conn.title ?? meta.label}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-blue border border-blue/40 rounded px-1.5 py-0.5 shrink-0">
          {conn.type}
        </span>
      </div>

      <ConnectionDetails
        conn={conn}
        fields={fields}
        companyName={companyName}
        isAdmin={isAdmin}
        onMarkChecked={onMarkChecked}
        onSaveField={onSaveField}
        onDeleteField={onDeleteField}
      />

      {isAdmin && (
        <div className="flex gap-2 pt-3 mt-3 border-t border-ink/10">
          <button className={btnCls} onClick={onEdit}>
            Изменить
          </button>
          <button className={dangerCls} onClick={onDelete}>
            Удалить
          </button>
        </div>
      )}
    </div>
  )
}