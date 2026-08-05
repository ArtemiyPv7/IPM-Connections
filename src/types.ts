export interface Company {
  id: string
  name: string
  aliases: string[]
  server_version: string | null
  kpl_version: string | null
  contours_count: number | null
  trade_groups_raw: string | null
  version_status: string | null
  version_status_type: string | null
  version_notes: string | null
  is_active: boolean
}

export interface Connection {
  id: string
  company_id: string
  title: string | null
  type: string
  address: string | null
  username: string | null
  password: string | null
  config_url: string | null
  web_url: string | null
  notes: string | null
  sort_order: number
}

export interface KeyValue {
  id: string
  label: string
  value: string
  connection_id?: string
  company_id?: string
}

export interface HistoryEntry {
  id: string
  content: string
  created_at: string
}