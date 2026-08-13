import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addHistoryNote,
  createCompany,
  deleteCompany,
  deleteCompanyField,
  deleteConnection,
  deleteConnectionField,
  deleteHistoryNote,
  fetchCompanyBundle,
  markConnectionChecked,
  saveCompanyField,
  saveConnection,
  saveConnectionField,
  updateCompany,
  type CompanyBundle,
  type ConnectionDraft,
  type FieldDraft,
} from '../features/companies/api'
import CompanyForm from '../features/companies/components/CompanyForm'
import ConnectionCard from '../features/companies/components/ConnectionCard'
import ConnectionForm from '../features/companies/components/ConnectionForm'
import HistorySection from '../features/companies/components/HistorySection'
import { toast } from '../lib/toast'
import { log } from '../shared/lib/audit'
import { usePageTitle } from '../shared/hooks/usePageTitle'
import { useRole } from '../shared/hooks/useRole'
import { pushRecent } from '../shared/lib/storage'
import EmptyState from '../shared/ui/EmptyState'
import { CompanySkeleton } from '../shared/ui/Skeleton'
import KeyValueEditor from '../shared/ui/KeyValueEditor'
import { btnCls, dangerCls } from '../shared/ui/styles'

export default function CompanyPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const role = useRole()
  const isAdmin = role === 'admin'

  const [bundle, setBundle] = useState<CompanyBundle | null>(null)
  const [editCompany, setEditCompany] = useState(isNew)
  const [editConn, setEditConn] = useState<string | null>(null)
  const loggedView = useRef<string | null>(null)

  const company = bundle?.company ?? null
  const connections = bundle?.connections ?? []
  const connFields = bundle?.connFields ?? []
  const companyFields = bundle?.companyFields ?? []
  const history = bundle?.history ?? []

  usePageTitle(
    company
      ? `${company.name} — IPM Connections`
      : isNew
        ? 'Новый завод — IPM Connections'
        : 'IPM Connections'
  )

  async function load() {
    if (isNew) return
    const b = await fetchCompanyBundle(id)
    setBundle(b)
    if (b?.company) {
      pushRecent(b.company.id)
      if (loggedView.current !== b.company.id) {
        loggedView.current = b.company.id
        void log('view_company', b.company.name)
      }
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function handleCompanySubmit(payload: Parameters<typeof createCompany>[0]) {
    if (isNew) {
      const newId = await createCompany(payload)
      if (!newId) return
      setEditCompany(false)
      toast('Сохранено')
      navigate(`/company/${newId}`)
      return
    }
    if (!(await updateCompany(id, payload))) return
    setEditCompany(false)
    toast('Сохранено')
    load()
  }

  async function handleDeleteCompany() {
    if (!window.confirm('Удалить завод вместе со всеми подключениями и полями?')) return
    if (!(await deleteCompany(id))) return
    toast('Завод удалён')
    navigate('/')
  }

  async function handleConnectionSubmit(draft: ConnectionDraft, connId?: string) {
    if (!(await saveConnection(id, draft, connId))) return
    setEditConn(null)
    toast('Подключение сохранено')
    load()
  }

  async function handleDeleteConnection(connId: string) {
    if (!window.confirm('Удалить подключение?')) return
    if (!(await deleteConnection(connId))) return
    toast('Подключение удалено')
    load()
  }

  async function handleMarkChecked(connId: string) {
    if (!(await markConnectionChecked(connId))) return
    toast('Отметка «проверено» обновлена')
    load()
  }

  async function handleSaveCompanyField(p: FieldDraft) {
    if (!(await saveCompanyField(id, p))) return
    load()
  }

  async function handleDeleteCompanyField(fid: string) {
    if (!(await deleteCompanyField(fid))) return
    load()
  }

  async function handleSaveConnField(connId: string, p: FieldDraft) {
    if (!(await saveConnectionField(connId, p))) return
    load()
  }

  async function handleDeleteConnField(fid: string) {
    if (!(await deleteConnectionField(fid))) return
    load()
  }

  async function handleAddNote(content: string) {
    if (!(await addHistoryNote(id, content))) return
    toast('Заметка добавлена')
    load()
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm('Удалить заметку?')) return
    if (!(await deleteHistoryNote(noteId))) return
    load()
  }

  if (isNew && !isAdmin) return <p className="text-gray">Недостаточно прав.</p>
  if (!isNew && !company) return <CompanySkeleton />

  return (
    <div className="max-w-3xl animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-gray hover:text-sky transition-colors">
            ← к списку
          </Link>
          <h1 className="font-semibold text-3xl text-sky mt-2 mb-6">
            {isNew ? 'Новый завод' : company!.name}
          </h1>
        </div>
        {isAdmin && !isNew && (
          <div className="flex gap-2 mt-6">
            <button className={btnCls} onClick={() => setEditCompany(true)}>
              Изменить
            </button>
            <button className={dangerCls} onClick={handleDeleteCompany}>
              Удалить
            </button>
          </div>
        )}
      </div>

      {(editCompany || isNew) && (
        <CompanyForm
          initial={company}
          onSubmit={handleCompanySubmit}
          onCancel={isNew ? undefined : () => setEditCompany(false)}
        />
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
                <span className="text-gray">Статус: </span>
                <span className="text-white">{company.version_status}</span>
              </p>
            )}
            {company.version_notes && (
              <p className="mt-3 text-sm text-gray whitespace-pre-wrap">{company.version_notes}</p>
            )}
          </section>

          <section className="glass rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-white mb-4">Дополнительные данные</h2>
            <KeyValueEditor
              items={companyFields}
              isAdmin={isAdmin}
              onSave={handleSaveCompanyField}
              onDelete={handleDeleteCompanyField}
              auditContext={company.name}
            />
          </section>

          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-white">Подключения</h2>
              {isAdmin && (
                <button className={btnCls} onClick={() => setEditConn('new')}>
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

            {isAdmin && editConn === 'new' && (
              <ConnectionForm
                initial={null}
                defaultSort={connections.length + 1}
                onSubmit={(d) => handleConnectionSubmit(d)}
                onCancel={() => setEditConn(null)}
              />
            )}

            <div className="space-y-4">
              {connections.map((conn) => (
                <div key={conn.id}>
                  {isAdmin && editConn === conn.id && (
                    <ConnectionForm
                      initial={conn}
                      defaultSort={conn.sort_order}
                      onSubmit={(d) => handleConnectionSubmit(d, conn.id)}
                      onCancel={() => setEditConn(null)}
                    />
                  )}
                  <ConnectionCard
                    conn={conn}
                    fields={connFields.filter((f) => f.connection_id === conn.id)}
                    companyName={company.name}
                    isAdmin={isAdmin}
                    onEdit={() => setEditConn(conn.id)}
                    onDelete={() => handleDeleteConnection(conn.id)}
                    onMarkChecked={() => handleMarkChecked(conn.id)}
                    onSaveField={(p) => handleSaveConnField(conn.id, p)}
                    onDeleteField={handleDeleteConnField}
                  />
                </div>
              ))}
            </div>
          </section>

          <HistorySection
            history={history}
            isAdmin={isAdmin}
            onAdd={handleAddNote}
            onDelete={handleDeleteNote}
          />
        </>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <p>
      <span className="text-gray">{label}: </span>
      <span className="text-white">{value || '—'}</span>
    </p>
  )
}