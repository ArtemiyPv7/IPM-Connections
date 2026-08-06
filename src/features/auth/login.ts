import { supabase } from '../../lib/supabase'

const ACCOUNTS = ['admin@ipm.local', 'support@ipm.local']

export async function loginWithPassword(password: string): Promise<boolean> {
  for (const email of ACCOUNTS) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return true
  }
  return false
}