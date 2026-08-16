import ConnectionDetails from './ConnectionDetails'
import ProtocolTile from './ProtocolTile'
import { protocolMeta } from '../protocols'
import type { Connection, KeyValue } from '../../../shared/types'
import { btnCls, dangerCls } from '../../../shared/ui/styles'
import type { FieldDraft } from '../api'

// Цепочка подключений (например, VPN → RDP): шаги с номерами и соединительной
// линией, как в макете. Шаги отсортированы по chain_step.
export default function ChainCard({
  steps,
  connFields,
  companyName,
  isAdmin,
  onEdit,
  onDelete,
  onMarkChecked,
  onSaveField,
  onDeleteField,
}: {
  steps: Connection[]
  connFields: KeyValue[]
  companyName: string
  isAdmin: boolean
  onEdit: (connId: string) => void
  onDelete: (connId: string) => void
  onMarkChecked: (connId: string) => void
  onSaveField: (connId: string, p: FieldDraft) => Promise<void>
  onDeleteField: (id: string) => Promise<void>
}) {
  return (
    <div className="card card-hover rounded-xl p-5">
      {/* Шапка: плитка первого шага, составной заголовок, бейдж типа */}
      <div className="flex items-center gap-3 mb-5">
        <ProtocolTile type={steps[0].type} />
        <h3 className="font-medium text-ink flex-1 min-w-0 truncate">
          {steps.map((s) => protocolMeta(s.type).label).join(' + ')}
        </h3>
        <span className="text-[10px] uppercase tracking-wide text-blue border border-blue/40 rounded px-1.5 py-0.5 shrink-0">
          {steps[0].type}
        </span>
      </div>

      <div>
        {steps.map((conn, i) => (
          <div key={conn.id} className="relative pl-10 pb-6 last:pb-0">
            {/* Вертикальная линия между шагами */}
            {i < steps.length - 1 && (
              <span className="absolute left-3 top-7 bottom-0 w-px bg-ink/10" aria-hidden="true" />
            )}
            <span className="absolute left-0 top-0 w-6 h-6 rounded-full border border-ink/10 bg-[var(--field-bg)] text-[11px] text-gray flex items-center justify-center select-none">
              {i + 1}
            </span>
            <p className="text-sm font-medium text-ink mb-2">
              {conn.title ?? protocolMeta(conn.type).label}
            </p>

            <ConnectionDetails
              conn={conn}
              fields={connFields.filter((f) => f.connection_id === conn.id)}
              companyName={companyName}
              isAdmin={isAdmin}
              onMarkChecked={() => onMarkChecked(conn.id)}
              onSaveField={(p) => onSaveField(conn.id, p)}
              onDeleteField={onDeleteField}
            />

            {isAdmin && (
              <div className="flex gap-2 pt-3">
                <button className={btnCls} onClick={() => onEdit(conn.id)}>
                  Изменить
                </button>
                <button className={dangerCls} onClick={() => onDelete(conn.id)}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}