import Skeleton from '../components/Skeleton'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CopyButton from '../components/CopyButton'
import KeyValueEditor from '../components/KeyValueEditor'
import LaunchButtons from '../components/LaunchButtons'
import EmptyState from '../components/EmptyState'
import { toast } from '../lib/toast'
import { pushRecent } from '../shared/lib/storage'
import type { Company, Connection, HistoryEntry, KeyValue } from '../shared/types'

const inputCls =
  'w-full glass-input rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-bronze'
const btnCls =
  'px-3 py-1.5 rounded-md border border-white/10 text-muted hover:text-sand hover:border-bronze transition-colors text-xs'
const dangerCls =
  'px-3 py-1.5 rounded-md border border-white/10 text-muted hover:text-terra hover:border-terra transition-colors text-xs'

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

export default function CompanyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [role, setRole] = useState<string | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [connFields, setConnFields] = useState<KeyValue[]>([])
  const [companyFields, setCompanyFields] = useState<KeyValue[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const [editCompany, setEditCompany] = useState(isNew)
  const [fName, setFName] = useState('')
  const [fServer, setFServer] = useState('')
  const [fKpl, setFKpl] = useState('')
  const [fContours, setFContours] = useState('')
  const [fGroups, setFGroups] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fNotes, setFNotes] = useState('')
  const [fActive, setFActive] = useState(true)

  const [editConn, setEditConn] = useState<string | null>(null)
  const [cTitle, setCTitle] = useState('')
  const [cType, setCType] = useState('rdp')
  const [cAddress, setCAddress] = useState('')
  const [cUser, setCUser] = useState('')
  const [cPass, setCPass] = useState('')
  const [cConfig, setCConfig] = useState('')
  const [cWeb, setCWeb] = useState('')
  const [cNotes, setCNotes] = useState('')
  const [cSort, setCSort] = useState('1')

  const [newNote, setNewNote] = useState('')

  const isAdmin = role === 'admin'

  async function load() {
    if (isNew) return
    const [c, conn, cf, gf, h] = await Promise.all([
      supabase.from('companies').select('*').eq('id', id).maybeSingle(),
      supabase.from('connections').select('*').eq('company_id', id).order('sort_order'),
      supabase
        .from('connection_fields')
        .select('*, connection:connections!inner(company_id)')
        .eq('connection.company_id', id)
        .order('sort_order'),
      supabase.from('company_fields').select('*').eq('company_id', id).order('sort_order'),
      supabase
        .from('company_history')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false }),
    ])
    setCompany((c.data as Company) ?? null)
    setConnections((conn.data as Connection[]) ?? [])
    setConnFields((cf.data as KeyValue[]) ?? [])
    setCompanyFields((gf.data as KeyValue[]) ?? [])
    setHistory((h.data as HistoryEntry[]) ?? [])

    const comp = (c.data as Company) ?? null
    if (comp) {
      document.title = `${comp.name} — IPM Connections`
      pushRecent(comp.id)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => setRole(p?.role ?? null))
    })
  }, [])

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (isNew) document.title = 'Новый завод — IPM Connections'
  }, [isNew])

  function startEditCompany() {
    if (!company) return
    setFName(company.name)
    setFServer(company.server_version ?? '')
    setFKpl(company.kpl_version ?? '')
    setFContours(company.contours_count?.toString() ?? '')
    setFGroups(company.trade_groups_raw ?? '')
    setFStatus(company.version_status ?? '')
    setFNotes(company.version_notes ?? '')
    setFActive(company.is_active)
    setEditCompany(true)
  }

  async function saveCompany() {
    if (!fName.trim()) return
    const payload = {
      name: fName.trim(),
      server_version: fServer.trim() || null,
      kpl_version: fKpl.trim() || null,
      contours_count: fContours ? Number(fContours) : null,
      trade_groups_raw: fGroups.trim() || null,
      version_status: fStatus.trim() || null,
      version_notes: fNotes.trim() || null,
      is_active: fActive,
    }
    if (isNew) {
      const { data } = await supabase.from('companies').insert(payload).select().single()
      if (!data) return
      setEditCompany(false)
      toast('Сохранено')
      navigate(`/company/${data.id}`)
      return
    }
    await supabase.from('companies').update(payload).eq('id', id)
    setEditCompany(false)
    toast('Сохранено')
    load()
  }

  async function deleteCompany() {
    if (!window.confirm('Удалить завод вместе со всеми подключениями и полями?')) return
    await supabase.from('companies').delete().eq('id', id)
    toast('Завод удалён')
    navigate('/')
  }

  function openConnEditor(conn: Connection | 'new') {
    if (conn === 'new') {
      setEditConn('new')
      setCTitle('')
      setCType('rdp')
      setCAddress('')
      setCUser('')
      setCPass('')
      setCConfig('')
      setCWeb('')
      setCNotes('')
      setCSort(String(connections.length + 1))
    } else {
      setEditConn(conn.id)
      setCTitle(conn.title ?? '')
      setCType(conn.type)
      setCAddress(conn.address ?? '')
      setCUser(conn.username ?? '')
      setCPass(conn.password ?? '')
      setCConfig(conn.config_url ?? '')
      setCWeb(conn.web_url ?? '')
      setCNotes(conn.notes ?? '')
      setCSort(String(conn.sort_order))
    }
  }

  async function saveConnection() {
    const payload = {
      company_id: id,
      title: cTitle.trim() || null,
      type: cType,
      address: cAddress.trim() || null,
      username: cUser.trim() || null,
      password: cPass || null,
      config_url: cConfig.trim() || null,
      web_url: cWeb.trim() || null,
      notes: cNotes.trim() || null,
      sort_order: Number(cSort) || 0,
    }
    if (editConn === 'new') {
      await supabase.from('connections').insert(payload)
    } else if (editConn) {
      await supabase.from('connections').update(payload).eq('id', editConn)
    }
    setEditConn(null)
    toast('Подключение сохранено')
    load()
  }

  async function deleteConnection(connId: string) {
    if (!window.confirm('Удалить подключение?')) return
    await supabase.from('connections').delete().eq('id', connId)
    toast('Подключение удалено')
    load()
  }

  async function markChecked(connId: string) {
    await supabase
      .from('connections')
      .update({ checked_at: new Date().toISOString() })
      .eq('id', connId)
    toast('Отметка «проверено» обновлена')
    load()
  }

  async function saveCompanyField(p: { id?: string; label: string; value: string }) {
    if (p.id) {
      await supabase.from('company_fields').update({ label: p.label, value: p.value }).eq('id', p.id)
    } else {
      await supabase.from('company_fields').insert({ company_id: id, label: p.label, value: p.value })
    }
    load()
  }

  async function deleteCompanyField(fid: string) {
    await supabase.from('company_fields').delete().eq('id', fid)
    load()
  }

  async function saveConnField(connId: string, p: { id?: string; label: string; value: string }) {
    if (p.id) {
      await supabase.from('connection_fields').update({ label: p.label, value: p.value }).eq('id', p.id)
    } else {
      await supabase.from('connection_fields').insert({ connection_id: connId, label: p.label, value: p.value })
    }
    load()
  }

  async function deleteConnField(fid: string) {
    await supabase.from('connection_fields').delete().eq('id', fid)
    load()
  }

  async function addNote() {
    if (!newNote.trim()) return
    await supabase.from('company_history').insert({ company_id: id, content: newNote.trim() })
    setNewNote('')
    toast('Заметка добавлена')
    load()
  }

  async function deleteNote(noteId: string) {
    if (!window.confirm('Удалить заметку?')) return
    await supabase.from('company_history').delete().eq('id', noteId)
    load()
  }

  const connForm = (
    <div className="glass-input rounded-lg p-4 mb-4 grid grid-cols-2 gap-2">
      <input className={inputCls} placeholder="Название" value={cTitle} onChange={(e) => setCTitle(e.target.value)} />
      <select className={inputCls} value={cType} onChange={(e) => setCType(e.target.value)}>
        {CONNECTION_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input className={inputCls} placeholder="Адрес / ID" value={cAddress} onChange={(e) => setCAddress(e.target.value)} />
      <input className={inputCls} placeholder="Пользователь" value={cUser} onChange={(e) => setCUser(e.target.value)} />
      <input className={inputCls} placeholder="Пароль" value={cPass} onChange={(e) => setCPass(e.target.value)} />
      <input className={inputCls} type="number" placeholder="Порядок" value={cSort} onChange={(e) => setCSort(e.target.value)} />
      <input className={inputCls} placeholder="Ссылка на конфиг" value={cConfig} onChange={(e) => setCConfig(e.target.value)} />
      <input className={inputCls} placeholder="Веб-ссылка" value={cWeb} onChange={(e) => setCWeb(e.target.value)} />
      <textarea
        className={`${inputCls} col-span-2`}
        rows={2}
        placeholder="Примечание"
        value={cNotes}
        onChange={(e) => setCNotes(e.target.value)}
      />
      <div className="col-span-2 flex gap-2">
        <button
          className="px-3 py-1.5 rounded-md bg-bronze text-bg hover:bg-sand text-xs transition-colors"
          onClick={saveConnection}
        >
          Сохранить
        </button>
        <button className={btnCls} onClick={() => setEditConn(null)}>
          Отмена
        </button>
      </div>
    </div>
  )

  if (isNew && !isAdmin) return <p className="text-muted">Недостаточно прав.</p>
  if (!isNew && !company) {
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-4 w-24 mb-6" />
        <Skeleton className="h-9 w-64 mb-8" />
        <div className="glass rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4" />
          </div>
        </div>
        <div className="glass rounded-xl p-6 mb-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="glass rounded-xl p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-muted hover:text-sand transition-colors">
            ← к списку
          </Link>
          <h1 className="font-semibold text-3xl text-sand mt-2 mb-6">
            {isNew ? 'Новый завод' : company!.name}
          </h1>
        </div>
        {isAdmin && !isNew && (
          <div className="flex gap-2 mt-6">
            <button className={btnCls} onClick={startEditCompany}>
              Изменить
            </button>
            <button className={dangerCls} onClick={deleteCompany}>
              Удалить
            </button>
          </div>
        )}
      </div>

      {(editCompany || isNew) && (
        <section className="glass rounded-xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Название *" value={fName} onChange={(e) => setFName(e.target.value)} />
            <input className={inputCls} placeholder="Версия сервера" value={fServer} onChange={(e) => setFServer(e.target.value)} />
            <input className={inputCls} placeholder="Версия КПЛ" value={fKpl} onChange={(e) => setFKpl(e.target.value)} />
            <input className={inputCls} type="number" placeholder="Контуры" value={fContours} onChange={(e) => setFContours(e.target.value)} />
            <input className={inputCls} placeholder="Торговые группы" value={fGroups} onChange={(e) => setFGroups(e.target.value)} />
            <input className={inputCls} placeholder="Статус версии" value={fStatus} onChange={(e) => setFStatus(e.target.value)} />
            <textarea
              className={`${inputCls} col-span-2`}
              rows={3}
              placeholder="Примечания"
              value={fNotes}
              onChange={(e) => setFNotes(e.target.value)}
            />
            <label className="col-span-2 flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                className="accent-bronze"
                checked={fActive}
                onChange={(e) => setFActive(e.target.checked)}
              />
              Завод активен
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="px-4 py-2 rounded-lg bg-bronze text-bg hover:bg-sand transition-colors text-sm"
              onClick={saveCompany}
            >
              Сохранить
            </button>
            {!isNew && (
              <button className={btnCls} onClick={() => setEditCompany(false)}>
                Отмена
              </button>
            )}
          </div>
        </section>
      )}

      {!isNew && company && (
        <>
          <section className="glass rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <InfoRow label="Версия сервера" value={company.server_version} />
              <InfoRow label="Версия КПЛ" value={company.kpl_version} />
              <InfoRow label="Контуры" value={company.contours_count?.toString()} />
              <InfoRow label="Торговые группы" value={company.trade_groups_raw} />
            </div>
            {company.version_status && (
              <p className="mt-4 text-sm">
                <span className="text-muted">Статус: </span>
                <span className="text-ink">{company.version_status}</span>
              </p>
            )}
            {company.version_notes && (
              <p className="mt-3 text-sm text-muted whitespace-pre-wrap">{company.version_notes}</p>
            )}
          </section>

          <section className="glass rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-ink mb-4">Дополнительные данные</h2>
            <KeyValueEditor
              items={companyFields}
              isAdmin={isAdmin}
              onSave={saveCompanyField}
              onDelete={deleteCompanyField}
            />
          </section>

          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-ink">Подключения</h2>
              {isAdmin && (
                <button className={btnCls} onClick={() => openConnEditor('new')}>
                  + Добавить подключение
                </button>
              )}
            </div>

            {connections.length === 0 && (
              <EmptyState
                icon="🔌"
                title="Подключений пока нет"
                hint={isAdmin ? 'нажми «+ Добавить подключение», чтобы создать первое' : undefined}
              />
            )}

            {isAdmin && editConn === 'new' && connForm}

            <div className="space-y-4">
              {connections.map((conn) => (
                <div key={conn.id} className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-ink font-medium">{conn.title ?? 'Подключение'}</h3>
                      <span className="text-xs uppercase tracking-wide text-bronze border border-bronze/40 rounded px-1.5 py-0.5">
                        {conn.type}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button className={btnCls} onClick={() => openConnEditor(conn)}>
                          Изменить
                        </button>
                        <button className={dangerCls} onClick={() => deleteConnection(conn.id)}>
                          Удалить
                        </button>
                      </div>
                    )}
                  </div>

                  {isAdmin && editConn === conn.id && connForm}

                  <div className="space-y-2">
                    <FieldRow label="Адрес" value={conn.address} />
                    <FieldRow label="Пользователь" value={conn.username} />
                    <FieldRow label="Пароль" value={conn.password} />
                    <KeyValueEditor
                      items={connFields.filter((f) => f.connection_id === conn.id)}
                      isAdmin={isAdmin}
                      onSave={(p) => saveConnField(conn.id, p)}
                      onDelete={deleteConnField}
                    />
                    {conn.notes && (
                      <p className="text-sm text-muted whitespace-pre-wrap pt-2">{conn.notes}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      {conn.checked_at ? (
                        <span className="text-xs text-sage">
                          проверено {new Date(conn.checked_at).toLocaleDateString('ru-RU')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted/60">не проверено</span>
                      )}
                      {isAdmin && (
                        <button className={btnCls} onClick={() => markChecked(conn.id)}>
                          ✓ проверено сегодня
                        </button>
                      )}
                    </div>
                    <LaunchButtons conn={conn} companyName={company.name} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-xl p-6">
            <h2 className="font-semibold text-ink mb-4">История и заметки</h2>
            {isAdmin && (
              <div className="mb-4">
                <textarea
                  className={inputCls}
                  rows={2}
                  placeholder="Новая заметка…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button className={`${btnCls} mt-2`} onClick={addNote}>
                  Добавить заметку
                </button>
              </div>
            )}
            {history.length === 0 && <EmptyState icon="📝" title="Заметок пока нет" />}
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="text-sm flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted text-xs mb-1">
                      {new Date(h.created_at).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-ink whitespace-pre-wrap">{h.content}</p>
                  </div>
                  {isAdmin && (
                    <button className={dangerCls} onClick={() => deleteNote(h.id)}>
                      Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <p>
      <span className="text-muted">{label}: </span>
      <span className="text-ink">{value || '—'}</span>
    </p>
  )
}

function FieldRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <p className="text-sm">
      <span className="text-muted">{label}: </span>
      <span className="text-ink break-all font-mono text-[13px]">{value}</span>
      <CopyButton text={value} />
    </p>
  )
}