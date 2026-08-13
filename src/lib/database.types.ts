export type Database = {
  public: {
    Tables: {
            audit_log: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          user_name: string
          action: string
          entity: string | null
          details: Record<string, unknown>
          ip: string | null
          user_agent: string | null
          device_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          user_name?: string
          action: string
          entity?: string | null
          details?: Record<string, unknown>
          ip?: string | null
          user_agent?: string | null
          device_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          user_name?: string
          action?: string
          entity?: string | null
          details?: Record<string, unknown>
          ip?: string | null
          user_agent?: string | null
          device_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          aliases?: string[]
          server_version?: string | null
          kpl_version?: string | null
          contours_count?: number | null
          trade_groups_raw?: string | null
          version_status?: string | null
          version_status_type?: string | null
          version_notes?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          aliases?: string[]
          server_version?: string | null
          kpl_version?: string | null
          contours_count?: number | null
          trade_groups_raw?: string | null
          version_status?: string | null
          version_status_type?: string | null
          version_notes?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      connections: {
        Row: {
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
          checked_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title?: string | null
          type: string
          address?: string | null
          username?: string | null
          password?: string | null
          config_url?: string | null
          web_url?: string | null
          notes?: string | null
          sort_order?: number
          checked_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          title?: string | null
          type?: string
          address?: string | null
          username?: string | null
          password?: string | null
          config_url?: string | null
          web_url?: string | null
          notes?: string | null
          sort_order?: number
          checked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'connections_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      connection_fields: {
        Row: {
          id: string
          connection_id: string
          label: string
          value: string
          sort_order: number
        }
        Insert: {
          id?: string
          connection_id: string
          label: string
          value: string
          sort_order?: number
        }
        Update: {
          id?: string
          connection_id?: string
          label?: string
          value?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'connection_fields_connection_id_fkey'
            columns: ['connection_id']
            isOneToOne: false
            referencedRelation: 'connections'
            referencedColumns: ['id']
          }
        ]
      }
      company_fields: {
        Row: {
          id: string
          company_id: string
          label: string
          value: string
          sort_order: number
        }
        Insert: {
          id?: string
          company_id: string
          label: string
          value: string
          sort_order?: number
        }
        Update: {
          id?: string
          company_id?: string
          label?: string
          value?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'company_fields_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      company_history: {
        Row: {
          id: string
          company_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'company_history_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          }
        ]
      }
      people: {
        Row: {
          id: string
          name: string
          full_name: string | null
          birth_date: string | null
          can_duty: boolean
        }
        Insert: {
          id?: string
          name: string
          full_name?: string | null
          birth_date?: string | null
          can_duty?: boolean
        }
        Update: {
          id?: string
          name?: string
          full_name?: string | null
          birth_date?: string | null
          can_duty?: boolean
        }
        Relationships: []
      }
      duty_assignments: {
        Row: {
          id: string
          duty_date: string
          person_id: string
          overtime_hours: number
          note: string | null
        }
        Insert: {
          id?: string
          duty_date: string
          person_id: string
          overtime_hours?: number
          note?: string | null
        }
        Update: {
          id?: string
          duty_date?: string
          person_id?: string
          overtime_hours?: number
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'duty_assignments_person_id_fkey'
            columns: ['person_id']
            isOneToOne: false
            referencedRelation: 'people'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}