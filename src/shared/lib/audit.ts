import { supabase } from '../../lib/supabase'

const DEVICE_KEY = 'ipm_device_id'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

let cachedIp: string | null = null

async function getIp(): Promise<string | null> {
  if (cachedIp) return cachedIp
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const json = (await res.json()) as { ip: string }
    cachedIp = json.ip
    return cachedIp
  } catch {
    return null
  }
}

export async function log(action: string, entity?: string, details?: Record<string, unknown>) {
  const { data } = await supabase.auth.getUser()
  const ip = await getIp()
  const { error } = await supabase.from('audit_log').insert({
    user_id: data.user?.id ?? null,
    user_name: data.user?.email ?? 'anonymous',
    action,
    entity: entity ?? null,
    details: details ?? {},
    ip,
    user_agent: navigator.userAgent,
    device_id: getDeviceId(),
  })
  if (error) console.error('[IPM] audit:', error.message)
}