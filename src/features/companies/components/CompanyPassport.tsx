import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
} from '../api'
import { useFavorites } from '../hooks'
import { groupParts } from '../groups'
import ChainCard from './ChainCard'
import CompanyForm from './CompanyForm'
import ConnectionCard from './ConnectionCard'
import ConnectionForm from './ConnectionForm'
import FilesLinksSection from './FilesLinksSection'
import HistorySection from './HistorySection'
import { toast } from '../../../shared/lib/toast'
import { log } from '../../../shared/lib/audit'
import { usePageTitle } from '../../../shared/hooks/usePageTitle'
import { useRole } from '../../../shared/hooks/useRole'
import type { Connection } from '../../../shared/types'
import EmptyState from '../../../shared/ui/EmptyState'
import Modal from '../../../shared/ui/Modal'
import { CompanySkeleton } from '../../../shared/ui/Skeleton'
import KeyValueEditor from '../../../shared/ui/KeyValueEditor'
import { btnCls, dangerCls } from '../../../shared/ui/styles'

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-gray mb-3">{children}</h2>
  )
}

export default function CompanyPassport() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const role = useRole()
  const isAdmin = role === 'admin'
  const { favorites, toggle } = useFavorites()
  const [bundle, setBundle] = useState<CompanyBundle | null>(null)
  const [editCompany, setEditCompany] = useState(false)
  const [editConn, setEditConn] = useState<string | null>(null)
  const loggedView = useRef<string | null>(null)

  const company = bundle?.company ?? null
  const connections = bundle?.connections ?? []
  const connFields = bundle?.connFields ?? []
  const companyFields = bundle?.companyFields ?? []
  const history = bundle?.history ?? []

  const standalone = connections.filter((c) => !c.chain_id)
  const chainGroups: { id: string; steps: Connection[] }[] = []
  for (const c of connections) {
    if (!c.chain_id) continue
    const group = chainGroups.find((g) => g.id === c.chain_id)
    if (group) group.steps.push(c)
    else chainGroups.push({ id: c.chain_id, steps: [c] })
  }
  for (const g of chainGroups) {
    g.steps.sort((a, b) => a.chain_step - b.chain_step || a.sort_order - b.sort_order)
  }
  const chainSuggestions = chainGroups.map((g) => g.id)

  usePageTitle(
    company
      ? `${company.name} — IPM Connections`
      : isNew
        ? 'Новый завод — IPM Connections'
        : 'IPM Connections'
  )

  const load = useCallback(async () => {
    if (isNew) return
    const b = await fetchCompanyBundle(id)
    setBundle(b)
    if (b?.company && loggedView.current !== b.company.id) {
      loggedView.current = b.company.id
      void log('view_company', b.company.name)
    }
  }, [id, isNew])

  useEffect(() => {
    void load()
  }, [load])

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
    void load()
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
    void load()
  }

  async function handleDeleteConnection(connId: string) {
    if (!window.confirm('Удалить подключение?')) return
    if (!(await deleteConnection(connId))) return
    toast('Подключение удалено')
    void load()
  }

  async function handleMarkChecked(connId: string) {
    if (!(await markConnectionChecked(connId))) return
    toast('Отметка «проверено» обновлена')
    void load()
  }

  async function handleSaveCompanyField(p: FieldDraft) {
    if (!(await saveCompanyField(id, p))) return
    void load()
  }

  async function handleDeleteCompanyField(fid: string) {
    if (!(await deleteCompanyField(fid))) return
    void load()
  }

  async function handleSaveConnField(connId: string, p: FieldDraft) {
    if (!(await saveConnectionField(connId, p))) return
    void load()
  }

  async function handleDeleteConnField(fid: string) {
    if (!(await deleteConnectionField(fid))) return
    void load()
  }

  async function handleAddNote(content: string) {
    if (!(await addHistoryNote(id, content))) return
    toast('Заметка добавлена')
    void load()
  }

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm('Удалить заметку?')) return
    if (!(await deleteHistoryNote(noteId))) return
    void load()
  }

  if (isNew) {
    if (role === null) return null
    if (!isAdmin) return <p className="text-gray">Недостаточно прав.</p>
    return (
      <Modal title="Новый завод" onClose={() => navigate('/')}>
        <CompanyForm initial={null} onSubmit={handleCompanySubmit} onCancel={() => navigate('/')} />
      </Modal>
    )
  }

  if (role === null) return <CompanySkeleton />
  if (!company) return <CompanySkeleton />

  const isFavorite = favorites.includes(company.id)
  const groupChips = groupParts(company.trade_groups_raw ?? null)
  const editingConnection =
    editConn === 'new' ? null : (connections.find((c) => c.id === editConn) ?? null)

  return (
    <div className="animate-pop">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-semibold text-2xl sm:text-3xl text-ink truncate">{company.name}</h1>
          <button
            onClick={() => toggle(company.id)}
            title={isFavorite ? 'Убрать из избранного' : 'В избранное'}
            className={`text-xl leading-none transition-colors shrink-0 ${
              isFavorite ? 'text-sky' : 'text-gray/40 hover:text-sky'
            }`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          {!company.is_active && (
            <span className="text-xs text-red border border-red/40 rounded px-1.5 py-0.5 whitespace-nowrap">
              не работает
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2 shrink-0">
            <button className={btnCls} onClick={() => setEditCompany(true)}>
              Изменить
            </button>
            <button className={dangerCls} onClick={handleDeleteCompany}>
              Удалить
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="chip font-mono text-ink">
          Сервер / КПЛ: {company.server_version ?? '—'} / {company.kpl_version ?? '—'}
        </span>
        {company.contours_count != null && (
          <span className="chip text-ink">Контуры: {company.contours_count}</span>
        )}
        {groupChips.map((g) => (
          <span key={g} className="chip text-ink">
            {g}
          </span>
        ))}
        {company.version_status && <span className="chip text-ink">{company.version_status}</span>}
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Способы подключения</SectionTitle>
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
            hint={isAdmin ? 'нажми «+ Добавить подключение»' : undefined}
          />
        )}
        <div className="grid gap-4 min-[1100px]:grid-cols-2">
          {standalone.map((conn) => (
            <ConnectionCard
              key={conn.id}
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
          ))}
          {chainGroups.map((g) => (
            <ChainCard
              key={g.id}
              steps={g.steps}
              connFields={connFields}
              companyName={company.name}
              isAdmin={isAdmin}
              onEdit={(cid) => setEditConn(cid)}
              onDelete={handleDeleteConnection}
              onMarkChecked={handleMarkChecked}
              onSaveField={handleSaveConnField}
              onDeleteField={handleDeleteConnField}
            />
          ))}
        </div>
      </section>

      {(companyFields.length > 0 || isAdmin) && (
        <section className="mb-8">
          <SectionTitle>Дополнительно</SectionTitle>
          <div className="card rounded-xl p-5">
            <KeyValueEditor
              items={companyFields}
              isAdmin={isAdmin}
              onSave={handleSaveCompanyField}
              onDelete={handleDeleteCompanyField}
              auditContext={company.name}
            />
          </div>
        </section>
      )}

      <div className="mb-8">
        <FilesLinksSection connections={connections} />
      </div>

      <HistorySection
        history={history}
        isAdmin={isAdmin}
        versionNotes={company.version_notes}
        onAdd={handleAddNote}
        onDelete={handleDeleteNote}
      />

      {isAdmin && editCompany && (
        <Modal title={`Изменить завод · ${company.name}`} onClose={() => setEditCompany(false)}>
          <CompanyForm
            initial={company}
            onSubmit={handleCompanySubmit}
            onCancel={() => setEditCompany(false)}
          />
        </Modal>
      )}

      {isAdmin && editConn && (
        <Modal
          title={editConn === 'new' ? 'Новое подключение' : 'Изменить подключение'}
          onClose={() => setEditConn(null)}
          wide
        >
          <ConnectionForm
            initial={editingConnection}
            defaultSort={editingConnection?.sort_order ?? connections.length + 1}
            chainSuggestions={chainSuggestions}
            onSubmit={(d) => handleConnectionSubmit(d, editConn === 'new' ? undefined : editConn)}
            onCancel={() => setEditConn(null)}
          />
        </Modal>
      )}
    </div>
  )
}