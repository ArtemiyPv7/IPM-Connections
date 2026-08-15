import { supabase } from '../../lib/supabase'
import { handleError } from '../../shared/lib/errors'
import { log } from '../../shared/lib/audit'
import type { Company, Connection, HistoryEntry, KeyValue } from '../../shared/types'

// ---------- Запросы ----------

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from('companies').select('*').order('name')
  if (handleError(error, 'load companies')) return []
  return (data ?? []) as Company[]
}

export interface CompanyBundle {
  company: Company | null
  connections: Connection[]
  connFields: KeyValue[]
  companyFields: KeyValue[]
  history: HistoryEntry[]
}

export async function fetchCompanyBundle(id: string): Promise<CompanyBundle | null> {
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
  if (
    handleError(c.error, 'load company') ||
    handleError(conn.error, 'load connections') ||
    handleError(cf.error, 'load connection fields') ||
    handleError(gf.error, 'load company fields') ||
    handleError(h.error, 'load history')
  ) {
    return null
  }
  return {
    company: (c.data as Company) ?? null,
    connections: (conn.data as Connection[]) ?? [],
    connFields: (cf.data as KeyValue[]) ?? [],
    companyFields: (gf.data as KeyValue[]) ?? [],
    history: (h.data as HistoryEntry[]) ?? [],
  }
}

// ---------- Полезные нагрузки ----------

export interface CompanyPayload {
  name: string
  server_version: string | null
  kpl_version: string | null
  contours_count: number | null
  trade_groups_raw: string | null
  version_status: string | null
  version_notes: string | null
  is_active: boolean
}

export interface ConnectionDraft {
  title: string | null
  type: string
  address: string | null
  username: string | null
  password: string | null
  config_url: string | null
  web_url: string | null
  notes: string | null
  sort_order: number
}

export interface FieldDraft {
  id?: string
  label: string
  value: string
  is_secret?: boolean
}

// ---------- Мутации: завод ----------

export async function createCompany(payload: CompanyPayload): Promise<string | null> {
  const { data, error } = await supabase.from('companies').insert(payload).select().single()
  if (handleError(error, 'create company')) return null
  void log('create_company', payload.name)
  return data?.id ?? null
}

export async function updateCompany(id: string, payload: CompanyPayload): Promise<boolean> {
  const { error } = await supabase.from('companies').update(payload).eq('id', id)
  if (handleError(error, 'update company')) return false
  void log('update_company', payload.name)
  return true
}

export async function deleteCompany(id: string): Promise<boolean> {
  const { error } = await supabase.from('companies').delete().eq('id', id)
  if (handleError(error, 'delete company')) return false
  void log('delete_company', id)
  return true
}

// ---------- Мутации: подключения ----------

export async function saveConnection(
  companyId: string,
  draft: ConnectionDraft,
  id?: string
): Promise<boolean> {
  const payload = { ...draft, company_id: companyId }
  const { error } = id
    ? await supabase.from('connections').update(payload).eq('id', id)
    : await supabase.from('connections').insert(payload)
  if (handleError(error, 'save connection')) return false
  void log('save_connection', draft.title ?? draft.type)
  return true
}

export async function deleteConnection(id: string): Promise<boolean> {
  const { error } = await supabase.from('connections').delete().eq('id', id)
  if (handleError(error, 'delete connection')) return false
  void log('delete_connection', id)
  return true
}

export async function markConnectionChecked(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('connections')
    .update({ checked_at: new Date().toISOString() })
    .eq('id', id)
  if (handleError(error, 'mark connection checked')) return false
  void log('mark_checked', id)
  return true
}

// ---------- Мутации: доп. поля ----------

export async function saveCompanyField(companyId: string, p: FieldDraft): Promise<boolean> {
  const payload = { label: p.label, value: p.value, is_secret: p.is_secret ?? false }
  const { error } = p.id
    ? await supabase.from('company_fields').update(payload).eq('id', p.id)
    : await supabase.from('company_fields').insert({ company_id: companyId, ...payload })
  return !handleError(error, 'save company field')
}

export async function deleteCompanyField(id: string): Promise<boolean> {
  const { error } = await supabase.from('company_fields').delete().eq('id', id)
  return !handleError(error, 'delete company field')
}

export async function saveConnectionField(connectionId: string, p: FieldDraft): Promise<boolean> {
  const payload = { label: p.label, value: p.value, is_secret: p.is_secret ?? false }
  const { error } = p.id
    ? await supabase.from('connection_fields').update(payload).eq('id', p.id)
    : await supabase.from('connection_fields').insert({ connection_id: connectionId, ...payload })
  return !handleError(error, 'save connection field')
}

export async function deleteConnectionField(id: string): Promise<boolean> {
  const { error } = await supabase.from('connection_fields').delete().eq('id', id)
  return !handleError(error, 'delete connection field')
}

// ---------- Мутации: история ----------

export async function addHistoryNote(companyId: string, content: string): Promise<boolean> {
  const { error } = await supabase.from('company_history').insert({ company_id: companyId, content })
  return !handleError(error, 'add history note')
}

export async function deleteHistoryNote(id: string): Promise<boolean> {
  const { error } = await supabase.from('company_history').delete().eq('id', id)
  return !handleError(error, 'delete history note')
}