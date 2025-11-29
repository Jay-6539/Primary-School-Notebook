import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sugwnzvsntqcpbegieeu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1Z3duenZzbnRxY3BiZWdpZWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjYxNzIsImV4cCI6MjA4MDAwMjE3Mn0.E09EBzbT3TZSPJBYGOYf1u0i-8RBpRnfIae7taBgAzw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Word {
  id: string
  word: string
  translation: string
  type: 'recognition' | 'spelling'
  date_added: string
  level?: 'starters' | 'movers' | 'flyers'
  needs_review?: boolean
  last_reviewed?: string
  created_at?: string
  updated_at?: string
}

export interface SpellingHistory {
  id: string
  word: string
  attempts: any // JSON array of SpellingAttempt
  total_errors: number
  last_attempt_date: string
  mastered: boolean
  created_at?: string
  updated_at?: string
}

export interface RecognitionHistory {
  id: string
  word: string
  view_dates: string[] // JSON array
  total_views: number
  last_viewed_date: string
  first_viewed_date: string
  created_at?: string
  updated_at?: string
}

export interface BankEntry {
  id: string
  date: string
  amount: number
  description: string
  category: 'reward' | 'red-packet' | 'gift' | 'other'
  created_at?: string
  updated_at?: string
}

export interface ParentFeedback {
  id: string
  date: string
  dad_accuracy: 'good' | 'bad' | null
  dad_attitude: 'good' | 'bad' | null
  mom_accuracy: 'good' | 'bad' | null
  mom_attitude: 'good' | 'bad' | null
  created_at?: string
  updated_at?: string
}

export interface Picture {
  id: string
  url: string
  title?: string
  is_uploaded: boolean
  created_at?: string
  updated_at?: string
}

