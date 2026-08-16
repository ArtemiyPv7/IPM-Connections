import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../shared/lib/supabase'
import {
  buildLoginByDays,
  buildTopCompanies,
  buildUserCopyStats,
} from './stats'
import type { AuditRowLite } from './stats'

// Сколько последних событий берём для мини-дашборда.
const AUDIT_LIMIT = 2000

export default function DevDashboard() {
  const [rows, setRows] = useState<AuditRowLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { data, error } = await supabase
          .from('audit_log')
          .select('created_at, user_name, action, entity')
          .order('created_at', { ascending: false })
          .limit(AUDIT_LIMIT)
        if (error) {
          console.error('[IPM] dashboard:', error.message)
        }
        if (!cancelled) {
          setRows((data ?? []) as AuditRowLite[])
        }
      } catch (error) {
        console.error('[IPM] dashboard:', error)
        if (!cancelled) {
          setRows([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const loginByDays = useMemo(() => buildLoginByDays(rows, 14), [rows])
  const topCompanies = useMemo(() => buildTopCompanies(rows, 5), [rows])
  const userCopies = useMemo(() => buildUserCopyStats(rows, 8), [rows])
  const maxLogins = Math.max(...loginByDays.map((day) => day.count), 1)
  const maxCompanyTotal = Math.max(...topCompanies.map((item) => item.total), 1)
  const maxUserCopies = Math.max(...userCopies.map((item) => item.copies), 1)
  const totalLogins = loginByDays.reduce((sum, day) => sum + day.count, 0)

  return (
    <section className="mb-8 animate-rise">
      <h2 className="font-semibold text-xl text-sky mb-4">Мини-дашборд</h2>
      {loading ? (
        <p className="text-gray">Загрузка…</p>
      ) : rows.length === 0 ? (
        <p className="text-gray">Событий пока нет.</p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {/* Входы по дням */}
          <div className="card rounded-xl p-6">
            <h3 className="text-ink font-semibold mb-4">Входы за 14 дней</h3>
            <div className="h-32 flex items-end gap-1">
              {loginByDays.map((day) => (
                // group на всей колонке: подсказка появляется при наведении
                // в любое место колонки, а не только на сам столбик.
                <div key={day.key} className="group flex-1 h-full flex flex-col justify-end">
                  <div
                    className="relative w-full rounded-t bg-sky/70 group-hover:bg-sky transition-colors"
                    style={{
                      height: day.count === 0 ? '2px' : `${(day.count / maxLogins) * 100}%`,
                    }}
                  >
                    {/* Всплывающая подсказка над столбиком */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-ink/10 bg-paper/90 px-2 py-1 text-xs text-ink opacity-0 transition-opacity group-hover:opacity-100">
                      {day.label} · входов: {day.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Ось дат: короткие метки, чтобы всё помещалось */}
            <div className="flex gap-1 mt-2">
              {loginByDays.map((day) => (
                <div
                  key={day.key}
                  title={day.label}
                  className="flex-1 text-center text-[10px] text-gray whitespace-nowrap"
                >
                  {day.tick}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray mt-3">Всего входов за период: {totalLogins}</p>
          </div>

          {/* Топ заводов */}
          <div className="card rounded-xl p-6">
            <h3 className="text-ink font-semibold mb-4">
              Топ-5 заводов по просмотрам/копированиям
            </h3>
            {topCompanies.length === 0 ? (
              <p className="text-sm text-gray">Нет данных.</p>
            ) : (
              <div className="space-y-4">
                {topCompanies.map((item) => (
                  <div key={item.company}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-ink truncate min-w-0">{item.company}</span>
                      <span className="text-xs text-gray whitespace-nowrap">
                        {item.views} просм. · {item.copies} копир.
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded bg-ink/10 overflow-hidden">
                      <div
                        className="h-full bg-blue/70"
                        style={{ width: `${(item.total / maxCompanyTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кто и сколько копирует */}
          <div className="card rounded-xl p-6">
            <h3 className="text-ink font-semibold mb-4">Кто и сколько копирует</h3>
            {userCopies.length === 0 ? (
              <p className="text-sm text-gray">Нет данных.</p>
            ) : (
              <div className="space-y-4">
                {userCopies.map((item) => (
                  <div key={item.user}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-ink truncate min-w-0">{item.user}</span>
                      <span className="text-xs text-gray whitespace-nowrap">{item.copies}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded bg-ink/10 overflow-hidden">
                      <div
                        className="h-full bg-green/70"
                        style={{ width: `${(item.copies / maxUserCopies) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}