import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useRole() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || cancelled) return
      supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: p }) => {
          if (!cancelled) setRole(p?.role ?? null)
        })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return role
}