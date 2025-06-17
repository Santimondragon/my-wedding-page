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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          invitation_id: string
          name: string
          rsvp: boolean | null
          menu: 1 | 2 | 3 | null
          is_special_guest: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invitation_id: string
          name: string
          rsvp?: boolean | null
          menu?: 1 | 2 | 3 | null
          is_special_guest?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invitation_id?: string
          name?: string
          rsvp?: boolean | null
          menu?: 1 | 2 | 3 | null
          is_special_guest?: boolean
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