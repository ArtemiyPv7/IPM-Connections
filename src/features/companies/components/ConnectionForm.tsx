import { useState } from 'react'
import type { Connection } from '../../../shared/types'
import { btnCls, inputCls } from '../../../shared/ui/styles'
import type { ConnectionDraft } from '../api'

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

export default function ConnectionForm({
  initial,
  defaultSort,
  onSubmit,
  onCancel,
}: {
  initial: Connection | null
  defaultSort: number
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
  const [error, setError] = useState('')

  function submit() {
    if (!title.trim()) {
      setError('Укажи название подключения')
      return
    }
    setError('')
    onSubmit({
      title: title.trim() || null,
      type,
      address: address.trim() || null,
      username: username.trim() || null,
      password: password || null,
      config_url: config.trim() || null,
      web_url: web.trim() || null,
      notes: notes.trim() || null,
      sort_order: Number(sort) || 0,
    })
  }

  return (
    <div className="glass-input rounded-lg p-4 mb-4 grid grid-cols-2 gap-2">
      <input className={inputCls} placeholder="Название *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
        {CONNECTION_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input className={inputCls} placeholder="Адрес / ID" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className={inputCls} placeholder="Пользователь" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className={inputCls} placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input className={inputCls} type="number" placeholder="Порядок" value={sort} onChange={(e) => setSort(e.target.value)} />
      <input className={inputCls} placeholder="Ссылка на конфиг" value={config} onChange={(e) => setConfig(e.target.value)} />
      <input className={inputCls} placeholder="Веб-ссылка" value={web} onChange={(e) => setWeb(e.target.value)} />
      <textarea
        className={`${inputCls} col-span-2`}
        rows={2}
        placeholder="Примечание"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="col-span-2 text-red text-sm">{error}</p>}
      <div className="col-span-2 flex gap-2">
        <button className="px-3 py-1.5 rounded-md bg-blue text-black text-xs transition-colors" onClick={submit}>
          Сохранить
        </button>
        <button className={btnCls} onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  )
}