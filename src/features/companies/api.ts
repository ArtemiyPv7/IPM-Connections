import { supabase } from '../../lib/supabase'
import { handleError } from '../../shared/lib/errors'
import type { Company } from '../../shared/types'

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase.from('companies').select('*').order('name')
  if (handleError(error, 'load companies')) return []
  return (data ?? []) as Company[]
}