import { supabase } from '../../lib/supabase'
import { log } from '../../shared/lib/audit'

const ACCOUNTS = ['admin@ipm.local', 'support@ipm.local', 'dev@ipm.local']

export async function loginWithPassword(password: string): Promise<boolean> {
  for (const email of ACCOUNTS) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      void log('login_success', email)
      return true
    }
  }
  void log('login_failed')
  return false
}