import * as XLSX from 'xlsx'
import { pad } from '../../shared/lib/format'
import type { Duty } from '../../shared/types'

export function exportMonthDuties(year: number, month: number, duties: Duty[]) {
  const prefix = `${year}-${pad(month + 1)}`
  const monthDuties = duties.filter((d) => d.duty_date.startsWith(prefix))

  const rows: (string | number)[][] = [['Дата', 'Дежурный', 'Часы переработки', 'Примечание']]
  for (const d of monthDuties) {
    rows.push([
      new Date(d.duty_date).toLocaleDateString('ru-RU'),
      d.person?.name ?? '—',
      d.overtime_hours,
      d.note ?? '',
    ])
  }

  const totals = new Map<string, number>()
  for (const d of monthDuties) {
    const name = d.person?.name ?? '—'
    totals.set(name, (totals.get(name) ?? 0) + Number(d.overtime_hours))
  }
  rows.push([])
  rows.push(['Итого по часам'])
  for (const [name, hours] of totals) rows.push([name, hours])

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Дежурства')
  XLSX.writeFile(wb, `Дежурства_${year}-${pad(month + 1)}.xlsx`)
}