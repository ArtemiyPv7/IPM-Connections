import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import { handleError } from '../../shared/lib/errors'
import { formatDateRu } from '../../shared/lib/format'

export async function buildFullWorkbook(): Promise<boolean> {
  const [c, conn, cf, gf, h, p, d] = await Promise.all([
    supabase.from('companies').select('*').order('name'),
    supabase.from('connections').select('*, company:companies(name)').order('sort_order'),
    supabase
      .from('connection_fields')
      .select('label, value, connection:connections(title, company:companies(name))')
      .order('sort_order'),
    supabase.from('company_fields').select('label, value, company:companies(name)').order('sort_order'),
    supabase
      .from('company_history')
      .select('content, created_at, company:companies(name)')
      .order('created_at'),
    supabase.from('people').select('*').order('name'),
    supabase
      .from('duty_assignments')
      .select('duty_date, overtime_hours, note, person:people(name)')
      .order('duty_date'),
  ])

  if (
    handleError(c.error, 'export: companies') ||
    handleError(conn.error, 'export: connections') ||
    handleError(cf.error, 'export: connection fields') ||
    handleError(gf.error, 'export: company fields') ||
    handleError(h.error, 'export: history') ||
    handleError(p.error, 'export: people') ||
    handleError(d.error, 'export: duties')
  ) {
    return false
  }

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Название', 'Алиасы', 'Версия сервера', 'Версия КПЛ', 'Контуры', 'Торговые группы', 'Статус версии', 'Примечание', 'Активен'],
      ...(c.data ?? []).map((x) => [
        x.name,
        x.aliases.join(', '),
        x.server_version ?? '',
        x.kpl_version ?? '',
        x.contours_count ?? '',
        x.trade_groups_raw ?? '',
        x.version_status ?? '',
        x.version_notes ?? '',
        x.is_active ? 'да' : 'нет',
      ]),
    ]),
    'Предприятия'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Завод', 'Название', 'Тип', 'Адрес', 'Пользователь', 'Пароль', 'Конфиг', 'Веб', 'Примечание'],
      ...(conn.data ?? []).map((x) => [
        x.company?.name ?? '',
        x.title ?? '',
        x.type,
        x.address ?? '',
        x.username ?? '',
        x.password ?? '',
        x.config_url ?? '',
        x.web_url ?? '',
        x.notes ?? '',
      ]),
    ]),
    'Подключения'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Завод', 'Подключение', 'Поле', 'Значение'],
      ...(cf.data ?? []).map((x) => [
        x.connection?.company?.name ?? '',
        x.connection?.title ?? '',
        x.label,
        x.value,
      ]),
    ]),
    'Поля подключений'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Завод', 'Поле', 'Значение'],
      ...(gf.data ?? []).map((x) => [x.company?.name ?? '', x.label, x.value]),
    ]),
    'Поля заводов'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Завод', 'Дата', 'Текст'],
      ...(h.data ?? []).map((x) => [x.company?.name ?? '', formatDateRu(x.created_at), x.content]),
    ]),
    'История'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Имя', 'Полное имя', 'День рождения'],
      ...(p.data ?? []).map((x) => [x.name, x.full_name ?? '', x.birth_date ?? '']),
    ]),
    'Люди'
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet([
      ['Дата', 'Дежурный', 'Часы переработки', 'Примечание'],
      ...(d.data ?? []).map((x) => [
        formatDateRu(x.duty_date),
        x.person?.name ?? '',
        x.overtime_hours,
        x.note ?? '',
      ]),
    ]),
    'Дежурства'
  )

  XLSX.writeFile(wb, `IPM_Connections_полный_${new Date().toISOString().slice(0, 10)}.xlsx`)
  return true
}