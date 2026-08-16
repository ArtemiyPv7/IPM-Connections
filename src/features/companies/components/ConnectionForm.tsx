import { useState } from 'react'
import type { Connection } from '../../../shared/types'
import Field, { FormSection } from '../../../shared/ui/Field'
import { btnCls, inputCls } from '../../../shared/ui/styles'
import type { ConnectionDraft } from '../api'
import { protocolMeta } from '../protocols'

const CONNECTION_TYPES = [
  'anydesk',
  'rdp',
  'vpn',
  'openvpn',
  'wireguard',
  'vnc',
  'rudesktop',
  'rustdesk',
  'ammyy',
  'kontur',
  'custom',
]

// Плейсхолдер адреса подсказывает формат по выбранному типу.
function addressPlaceholder(type: string): string {
  if (type === 'anydesk') return 'AnyDesk ID, например: 1 686 857 607'
  if (type === 'rdp' || type === 'vnc') return 'адрес:порт, например: 192.168.106.99'
  if (type === 'vpn' || type === 'openvpn' || type === 'wireguard')
    return 'адрес, например: 87.242.82.104'
  return 'Адрес / ID'
}

// Поле пароля: type="text" + CSS-маска вместо type="password" —
// менеджеры паролей браузера на такое поле вообще не реагируют
// (ни автоподстановки, ни «сохранить пароль?»).
function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        type="text"
        autoComplete="off"
        className={`${inputCls} pr-9 ${visible ? '' : 'secret-mask'}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        title={visible ? 'Скрыть' : 'Показать'}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-sm transition-colors ${
          visible ? 'text-sky' : 'text-gray hover:text-sky'
        }`}
      >
        👁
      </button>
    </div>
  )
}

export default function ConnectionForm({
  initial,
  defaultSort,
  chainSuggestions = [],
  onSubmit,
  onCancel,
}: {
  initial: Connection | null
  defaultSort: number
  chainSuggestions?: string[]
  onSubmit: (draft: ConnectionDraft) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [type, setType] = useState(initial?.type ?? 'rdp')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [username, setUsername] = useState(initial?.username ?? '')
  const [password, setPassword] = useState(initial?.password ?? '')
  const [config, setConfig] = useState(initial?.config_url ?? '')
  const [web, setWeb] = useState(initial?.web_url ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [sort, setSort] = useState(String(initial?.sort_order ?? defaultSort))
  const [chain, setChain] = useState(initial?.chain_id ?? '')
  const [chainStep, setChainStep] = useState(String(initial?.chain_step ?? 1))
  const [error, setError] = useState('')

  function submit() {
    if (config.trim() && !/^https?:\/\//.test(config.trim())) {
      setError('Ссылка на конфиг должна начинаться с http:// или https://')
      return
    }
    if (web.trim() && !/^https?:\/\//.test(web.trim())) {
      setError('Веб-ссылка должна начинаться с http:// или https://')
      return
    }
    setError('')
    onSubmit({
      // Название необязательно: пустое заменяется именем типа (RDP, AnyDesk…).
      title: title.trim() || protocolMeta(type).label,
      type,
      address: address.trim() || null,
      username: username.trim() || null,
      password: password || null,
      config_url: config.trim() || null,
      web_url: web.trim() || null,
      notes: notes.trim() || null,
      sort_order: Number(sort) || 0,
      chain_id: chain.trim() || null,
      chain_step: Number(chainStep) || 0,
    })
  }

  return (
    <div>
      <FormSection title="Основное">
        <Field label="Название" hint={`Если пусто — «${protocolMeta(type).label}»`}>
          <input
            className={inputCls}
            placeholder="Название (необязательно)"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Тип">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
            {CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {protocolMeta(t).label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Цепочка" hint="Одинаковая цепочка — одна карточка с шагами">
          <input
            className={inputCls}
            list="chain-suggestions"
            placeholder="Например: vpn-rdp (необязательно)"
            autoComplete="off"
            value={chain}
            onChange={(e) => setChain(e.target.value)}
          />
          <datalist id="chain-suggestions">
            {chainSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Номер шага" hint="Порядок шагов внутри цепочки">
          <input
            className={inputCls}
            type="number"
            autoComplete="off"
            value={chainStep}
            onChange={(e) => setChainStep(e.target.value)}
          />
        </Field>
        <Field label="Порядок показа" hint="Меньше — выше в списке">
          <input
            className={inputCls}
            type="number"
            autoComplete="off"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Доступ">
        <Field label="Адрес / ID" className="sm:col-span-2">
          <input
            className={inputCls}
            placeholder={addressPlaceholder(type)}
            autoComplete="off"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>
        <Field label="Пользователь">
          <input
            className={inputCls}
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Пароль">
          <PasswordInput value={password} onChange={setPassword} />
        </Field>
      </FormSection>

      <FormSection title="Ссылки">
        <Field label="Ссылка на конфиг" hint="Попадёт в секцию «Файлы и ссылки»">
          <input
            className={inputCls}
            autoComplete="off"
            value={config}
            onChange={(e) => setConfig(e.target.value)}
          />
        </Field>
        <Field label="Веб-ссылка" hint="Попадёт в секцию «Файлы и ссылки»">
          <input
            className={inputCls}
            autoComplete="off"
            value={web}
            onChange={(e) => setWeb(e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="Примечания">
        <textarea
          className={`${inputCls} sm:col-span-2`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormSection>

      {error && <p className="text-red text-sm mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button className="btn-primary px-4 py-2 rounded-lg text-sm" onClick={submit}>
          Сохранить
        </button>
        <button className={btnCls} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}