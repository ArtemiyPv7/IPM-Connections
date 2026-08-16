import LaunchButtons from './LaunchButtons'
import type { Connection, KeyValue } from '../../../shared/types'
import CopyButton from '../../../shared/ui/CopyButton'
import KeyValueEditor from '../../../shared/ui/KeyValueEditor'
import SecretValue from '../../../shared/ui/SecretValue'
import { btnCls } from '../../../shared/ui/styles'
import type { FieldDraft } from '../api'

// Кнопка копирования живёт внутри спана со значением:
// стоит сразу после текста и при переносе едет вместе с ним.
function FieldRow({
  label,
  value,
  auditPrefix,
}: {
  label: string
  value?: string | null
  auditPrefix: string
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-28 shrink-0 text-gray">{label}</span>
      <span className="min-w-0 break-all font-mono text-[13px] text-ink">
        {value}
        <CopyButton text={value} audit={`${auditPrefix} · ${label}`} />
      </span>
    </div>
  )
}

// Начинка карточки подключения: адрес/логин/пароль, доп. поля, примечание,
// статус «проверено» и быстрые действия. Используется и обычной карточкой,
// и шагом цепочки — чтобы не дублировать разметку.
export default function ConnectionDetails({
  conn,
  fields,
  companyName,
  isAdmin,
  onMarkChecked,
  onSaveField,
  onDeleteField,
}: {
  conn: Connection
  fields: KeyValue[]
  companyName: string
  isAdmin: boolean
  onMarkChecked: () => void
  onSaveField: (p: FieldDraft) => Promise<void>
  onDeleteField: (id: string) => Promise<void>
}) {
  const prefix = `${companyName} · ${conn.title ?? 'Подключение'}`

  return (
    <div className="space-y-2">
      <FieldRow label="Адрес" value={conn.address} auditPrefix={prefix} />
      <FieldRow label="Пользователь" value={conn.username} auditPrefix={prefix} />
      {conn.password && (
        <div className="flex items-start gap-2 text-sm">
          <span className="w-28 shrink-0 text-gray">Пароль</span>
          <span className="min-w-0">
            <SecretValue value={conn.password} />
            <CopyButton text={conn.password} audit={`${prefix} · Пароль`} />
          </span>
        </div>
      )}

      <KeyValueEditor
        items={fields}
        isAdmin={isAdmin}
        onSave={onSaveField}
        onDelete={onDeleteField}
        auditContext={prefix}
      />

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
  )
}