export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'guest';

export type InvitationStatus = 'pending' | 'confirmed' | 'declined';

export interface Database {
  public: {
    Tables: {
      invitations: {
        Row: {
          id: string
          title: string
          created_at: string
          updated_at: string
          is_special_invitation: boolean
          is_sent: boolean
        }
        Insert: {
          id?: string
          title: string
          created_at?: string
          updated_at?: string
          is_special_invitation?: boolean
          is_sent?: boolean
        }
        Update: {
          id?: string
          title?: string
          created_at?: string
          updated_at?: string
          is_special_invitation?: boolean
          is_sent?: boolean
        }
      }
      guests: {
        Row: {
          id: string
          invitation_id: string
          name: string
          rsvp: boolean | null
          menu: 1 | 2 | 3 | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invitation_id: string
          name: string
          rsvp?: boolean | null
          menu?: 1 | 2 | 3 | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invitation_id?: string
          name?: string
          rsvp?: boolean | null
          menu?: 1 | 2 | 3 | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
    }
  }
} 