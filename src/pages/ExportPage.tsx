import { useState } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

export default function ExportPage() {
  const [busy, setBusy] = useState(false)

  async function exportAll() {
    setBusy(true)
    try {
      const [c, conn, cf, gf, h, p, d] = await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('connections').select('*, company:companies(name)').order('sort_order'),
        supabase
          .from('connection_fields')
          .select('label, value, connection:connections(title, company:companies(name))'),
        supabase.from('company_fields').select('label, value, company:companies(name)'),
        supabase.from('company_history').select('content, created_at, company:companies(name)').order('created_at'),
        supabase.from('people').select('*').order('name'),
        supabase.from('duty_assignments').select('duty_date, overtime_hours, note, person:people(name)').order('duty_date'),
      ])

      const wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([
          ['Название', 'Алиасы', 'Версия сервера', 'Версия КПЛ', 'Контуры', 'Торговые группы', 'Статус версии', 'Примечание', 'Активен'],
          ...((c.data as any[]) ?? []).map((x) => [
            x.name,
            (x.aliases ?? []).join(', '),
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
          ...((conn.data as any[]) ?? []).map((x) => [
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
          ...((cf.data as any[]) ?? []).map((x) => [
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
          ...((gf.data as any[]) ?? []).map((x) => [x.company?.name ?? '', x.label, x.value]),
        ]),
        'Поля заводов'
      )

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([
          ['Завод', 'Дата', 'Текст'],
          ...((h.data as any[]) ?? []).map((x) => [
            x.company?.name ?? '',
            new Date(x.created_at).toLocaleDateString('ru-RU'),
            x.content,
          ]),
        ]),
        'История'
      )

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([
          ['Имя', 'Полное имя', 'День рождения'],
          ...((p.data as any[]) ?? []).map((x) => [x.name, x.full_name ?? '', x.birth_date ?? '']),
        ]),
        'Люди'
      )

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([
          ['Дата', 'Дежурный', 'Часы переработки', 'Примечание'],
          ...((d.data as any[]) ?? []).map((x) => [
            new Date(x.duty_date).toLocaleDateString('ru-RU'),
            x.person?.name ?? '',
            x.overtime_hours,
            x.note ?? '',
          ]),
        ]),
        'Дежурства'
      )

      XLSX.writeFile(wb, `IPM_Connections_полный_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-md bg-card border border-line rounded-xl p-8 text-center">
      <h1 className="font-semibold text-xl text-ink mb-2">Экспорт данных</h1>
      <p className="text-muted text-sm mb-6">
        Полный файл Excel: заводы, подключения с паролями, дополнительные поля, история, сотрудники и дежурства.
      </p>
      <button
        onClick={exportAll}
        disabled={busy}
        className="px-5 py-2.5 rounded-lg bg-bronze text-bg font-medium hover:bg-sand transition-colors disabled:opacity-50"
      >
        {busy ? 'Готовим…' : 'Скачать .xlsx'}
      </button>
    </div>
  )
}