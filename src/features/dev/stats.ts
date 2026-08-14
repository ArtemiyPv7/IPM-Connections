import { dateKey, pad } from '../../shared/lib/format'

// Минимальный набор полей из audit_log, который нужен для дашборда.
export interface AuditRowLite {
  created_at: string
  user_name: string
  action: string
  entity: string | null
}

export interface LoginDayStat {
  key: string
  // Полная дата «дд.мм» — для подсказок.
  label: string
  // Компактная метка оси: только день, полная дата — в начале периода и при смене месяца.
  tick: string
  count: number
}

export interface CompanyStat {
  company: string
  views: number
  copies: number
  total: number
}

export interface UserCopyStat {
  user: string
  copies: number
}

const UNKNOWN_COMPANY = 'Прочее'

// В audit_log entity часто имеет вид: "Завод · Подключение · Поле".
// Поэтому названием завода считаем первую часть до разделителя.
function companyFromEntity(entity: string | null): string {
  if (!entity || entity === 'значение') return UNKNOWN_COMPANY

  const firstPart = entity.split(' · ')[0]?.trim()
  return firstPart || UNKNOWN_COMPANY
}

// Количество успешных входов за последние daysCount дней.
export function buildLoginByDays(rows: AuditRowLite[], daysCount = 14): LoginDayStat[] {
  const counts = new Map<string, number>()

  for (const row of rows) {
    if (row.action !== 'login_success') continue

    const date = new Date(row.created_at)
    const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate())
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const result: LoginDayStat[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let prevMonth: number | null = null

  // Идём от самого старого дня к сегодняшнему, чтобы график читался слева направо.
  for (let i = daysCount - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const month = date.getMonth()
    const key = dateKey(date.getFullYear(), month, date.getDate())
    const full = `${pad(date.getDate())}.${pad(month + 1)}`

    // Полная дата только в начале периода и при смене месяца — иначе ось не вмещается.
    const tick = prevMonth === null || month !== prevMonth ? full : pad(date.getDate())
    prevMonth = month

    result.push({
      key,
      label: full,
      tick,
      count: counts.get(key) ?? 0,
    })
  }

  return result
}

// Топ заводов по просмотрам и копированиям.
export function buildTopCompanies(rows: AuditRowLite[], limit = 5): CompanyStat[] {
  const map = new Map<string, { views: number; copies: number }>()

  for (const row of rows) {
    if (row.action !== 'view_company' && row.action !== 'copy') continue

    const company = companyFromEntity(row.entity)
    const current = map.get(company) ?? { views: 0, copies: 0 }

    if (row.action === 'view_company') {
      current.views += 1
    } else {
      current.copies += 1
    }

    map.set(company, current)
  }

  return Array.from(map.entries())
    .map(([company, stat]) => ({
      company,
      views: stat.views,
      copies: stat.copies,
      total: stat.views + stat.copies,
    }))
    .sort((a, b) => b.total - a.total || b.views - a.views)
    .slice(0, limit)
}

// Кто и сколько раз копировал значения.
export function buildUserCopyStats(rows: AuditRowLite[], limit = 8): UserCopyStat[] {
  const map = new Map<string, number>()

  for (const row of rows) {
    if (row.action !== 'copy') continue

    const user = row.user_name || 'unknown'
    map.set(user, (map.get(user) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([user, copies]) => ({ user, copies }))
    .sort((a, b) => b.copies - a.copies)
    .slice(0, limit)
}