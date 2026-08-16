import { supabase } from '../../lib/supabase'
import { handleError } from '../../shared/lib/errors'
import { log } from '../../shared/lib/audit'
import type { Duty, Person, Vacation } from '../../shared/types'
import { currentDutyDateKey, todayKey } from './calendar'

export async function fetchPeople(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').order('name')
  if (handleError(error, 'load people')) return []
  return (data ?? []) as Person[]
}

export async function fetchDuties(): Promise<Duty[]> {
  const { data, error } = await supabase
    .from('duty_assignments')
    .select('*, person:people(id, name, full_name, birth_date, can_duty)')
    .order('duty_date')
  if (handleError(error, 'load duties')) return []
  return (data ?? []) as Duty[]
}

export async function fetchTodayDutyName(): Promise<string | null> {
  const { data, error } = await supabase
    .from('duty_assignments')
    .select('person:people(name)')
    .eq('duty_date', todayKey())
    .maybeSingle()
  if (handleError(error, 'load today duty')) return null
  return (data?.person as { name: string } | null)?.name ?? null
}

// Кто дежурит прямо сейчас (смена с 8:00 до 8:00).
export async function fetchCurrentDutyName(): Promise<string | null> {
  const { data, error } = await supabase
    .from('duty_assignments')
    .select('person:people(name)')
    .eq('duty_date', currentDutyDateKey())
    .maybeSingle()
  if (handleError(error, 'load current duty')) return null
  return (data?.person as { name: string } | null)?.name ?? null
}

export interface DutyDraft {
  duty_date: string
  person_id: string
  overtime_hours: number
  note: string | null
}

export async function upsertDuty(draft: DutyDraft): Promise<boolean> {
  const { error } = await supabase
    .from('duty_assignments')
    .upsert(draft, { onConflict: 'duty_date' })
  if (handleError(error, 'save duty')) return false
  void log('save_duty', draft.duty_date)
  return true
}

export async function removeDuty(dutyDate: string): Promise<boolean> {
  const { error } = await supabase.from('duty_assignments').delete().eq('duty_date', dutyDate)
  if (handleError(error, 'delete duty')) return false
  void log('delete_duty', dutyDate)
  return true
}

export interface PersonDraft {
  name: string
  full_name: string | null
  birth_date: string | null
  can_duty: boolean
}

export async function savePerson(draft: PersonDraft, id?: string): Promise<boolean> {
  const { error } = id
    ? await supabase.from('people').update(draft).eq('id', id)
    : await supabase.from('people').insert(draft)
  if (handleError(error, 'save person')) return false
  void log('save_person', draft.name)
  return true
}

export async function removePerson(id: string): Promise<boolean> {
  const { error: dutiesError } = await supabase.from('duty_assignments').delete().eq('person_id', id)
  if (handleError(dutiesError, 'delete person duties')) return false
  const { error: personError } = await supabase.from('people').delete().eq('id', id)
  if (handleError(personError, 'delete person')) return false
  void log('delete_person', id)
  return true
}

// ---------- Отпуска ----------

export async function fetchVacations(): Promise<Vacation[]> {
  const { data, error } = await supabase
    .from('vacations')
    .select('*, person:people(id, name, full_name, birth_date, can_duty)')
    .order('date_start')
  if (handleError(error, 'load vacations')) return []
  return (data ?? []) as Vacation[]
}

export interface VacationDraft {
  person_id: string
  date_start: string
  date_end: string
  note: string | null
}

export async function saveVacation(draft: VacationDraft, id?: string): Promise<boolean> {
  const { error } = id
    ? await supabase.from('vacations').update(draft).eq('id', id)
    : await supabase.from('vacations').insert(draft)
  if (handleError(error, 'save vacation')) return false
  void log('save_vacation', draft.date_start)
  return true
}

export async function removeVacation(id: string): Promise<boolean> {
  const { error } = await supabase.from('vacations').delete().eq('id', id)
  if (handleError(error, 'delete vacation')) return false
  void log('delete_vacation', id)
  return true
}