import { supabase } from '../../lib/supabase'
import { handleError } from '../../shared/lib/errors'
import type { Duty, Person } from '../../shared/types'
import { log } from '../../shared/lib/audit'
import { todayKey } from './calendar'

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
    void log('save_duty', draft.duty_date)
  return !handleError(error, 'save duty')
}

export async function removeDuty(dutyDate: string): Promise<boolean> {
  const { error } = await supabase.from('duty_assignments').delete().eq('duty_date', dutyDate)
  void log('delete_duty', dutyDate)
  return !handleError(error, 'delete duty')
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
    void log('save_person', draft.name)
  return !handleError(error, 'save person')
}

export async function removePerson(id: string): Promise<boolean> {
  const { error: dutiesError } = await supabase.from('duty_assignments').delete().eq('person_id', id)
  if (handleError(dutiesError, 'delete person duties')) return false
  const { error: personError } = await supabase.from('people').delete().eq('id', id)
  void log('delete_person', id)
  return !handleError(personError, 'delete person')
}