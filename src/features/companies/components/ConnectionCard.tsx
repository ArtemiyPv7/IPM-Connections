import LaunchButtons from './LaunchButtons'
import type { Connection, KeyValue } from '../../../shared/types'
import CopyButton from '../../../shared/ui/CopyButton'
import KeyValueEditor from '../../../shared/ui/KeyValueEditor'
import { btnCls, dangerCls } from '../../../shared/ui/styles'
import type { FieldDraft } from '../api'

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm">
      <span className="text-gray">{label}: </span>
      <span className="text-white break-all font-mono text-[13px]">{value}</span>
      <CopyButton text={value} audit={label} />
    </p>
  )
}

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
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-medium">{conn.title ?? 'Подключение'}</h3>
          <span className="text-xs uppercase tracking-wide text-blue border border-blue/40 rounded px-1.5 py-0.5">
            {conn.type}
          </span>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className={btnCls} onClick={onEdit}>
              Изменить
            </button>
            <button className={dangerCls} onClick={onDelete}>
              Удалить
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <FieldRow label="Адрес" value={conn.address} />
        <FieldRow label="Пользователь" value={conn.username} />
        <FieldRow label="Пароль" value={conn.password} />
        <KeyValueEditor items={fields} isAdmin={isAdmin} onSave={onSaveField} onDelete={onDeleteField} />
        {conn.notes && <p className="text-sm text-gray whitespace-pre-wrap pt-2">{conn.notes}</p>}
        <div className="flex items-center gap-2 pt-2">
          {conn.checked_at ? (
            <span className="text-xs text-green">
              проверено {new Date(conn.checked_at).toLocaleDateString('ru-RU')}
            </span>
          ) : (
            <span className="text-xs text-gray/60">не проверено</span>
          )}
          {isAdmin && (
            <button className={btnCls} onClick={onMarkChecked}>
              ✓ проверено сегодня
            </button>
          )}
        </div>
        <LaunchButtons conn={conn} companyName={companyName} />
      </div>
    </div>
  )
}