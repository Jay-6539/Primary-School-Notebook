// Supabase service layer for data operations
import { supabase } from './supabase'

// Component-level types (matching component interfaces)
export interface Word {
  id: string
  word: string
  translation: string
  type: 'recognition' | 'spelling'
  dateAdded: string
  level?: 'starters' | 'movers' | 'flyers'
  needsReview?: boolean
  lastReviewed?: string
}

export interface SpellingHistory {
  word: string
  attempts: any[]
  totalErrors: number
  lastAttemptDate: string
  mastered: boolean
}

export interface RecognitionHistory {
  word: string
  viewDates: string[]
  totalViews: number
  lastViewedDate: string
  firstViewedDate: string
}

export interface BankEntry {
  id: string
  date: string
  amount: number
  description: string
  category: 'reward' | 'red-packet' | 'gift' | 'other'
}

export interface Picture {
  id: string
  url: string
  title?: string
  isUploaded: boolean
}

// Words operations
export async function fetchWords(): Promise<Word[]> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('date_added', { ascending: false })
  
  if (error) {
    console.error('Error fetching words:', error)
    return []
  }
  
  return data.map(w => ({
    id: w.id,
    word: w.word,
    translation: w.translation,
    type: w.type as 'recognition' | 'spelling',
    dateAdded: w.date_added,
    level: w.level as 'starters' | 'movers' | 'flyers' | undefined,
    needsReview: w.needs_review || false,
    lastReviewed: w.last_reviewed || undefined
  }))
}

export async function saveWord(word: Word): Promise<boolean> {
  const { error } = await supabase
    .from('words')
    .upsert({
      id: word.id,
      word: word.word,
      translation: word.translation,
      type: word.type,
      date_added: word.dateAdded,
      level: word.level || null,
      needs_review: word.needsReview || false,
      last_reviewed: word.lastReviewed || null
    }, { onConflict: 'id' })
  
  if (error) {
    console.error('Error saving word:', error)
    return false
  }
  return true
}

export async function deleteWord(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('words')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting word:', error)
    return false
  }
  return true
}

// Spelling history operations
export async function fetchSpellingHistory(): Promise<Record<string, SpellingHistory>> {
  const { data, error } = await supabase
    .from('spelling_history')
    .select('*')
  
  if (error) {
    console.error('Error fetching spelling history:', error)
    return {}
  }
  
  const history: Record<string, SpellingHistory> = {}
  data.forEach(h => {
    history[h.word.toLowerCase()] = {
      word: h.word,
      attempts: h.attempts || [],
      totalErrors: h.total_errors || 0,
      lastAttemptDate: h.last_attempt_date,
      mastered: h.mastered || false
    }
  })
  
  return history
}

export async function saveSpellingHistory(history: Record<string, SpellingHistory>): Promise<boolean> {
  if (Object.keys(history).length === 0) return true
  
  const entries = Object.values(history).map(h => ({
    word: h.word,
    attempts: h.attempts || [],
    total_errors: h.totalErrors || 0,
    last_attempt_date: h.lastAttemptDate || new Date().toISOString().split('T')[0],
    mastered: h.mastered || false
  }))
  
  const { error } = await supabase
    .from('spelling_history')
    .upsert(entries, { onConflict: 'word' })
  
  if (error) {
    console.error('Error saving spelling history:', error)
    return false
  }
  return true
}

// Recognition history operations
export async function fetchRecognitionHistory(): Promise<Record<string, RecognitionHistory>> {
  const { data, error } = await supabase
    .from('recognition_history')
    .select('*')
  
  if (error) {
    console.error('Error fetching recognition history:', error)
    return {}
  }
  
  const history: Record<string, RecognitionHistory> = {}
  data.forEach(h => {
    history[h.word.toLowerCase()] = {
      word: h.word,
      viewDates: h.view_dates || [],
      totalViews: h.total_views || 0,
      lastViewedDate: h.last_viewed_date,
      firstViewedDate: h.first_viewed_date
    }
  })
  
  return history
}

export async function saveRecognitionHistory(history: Record<string, RecognitionHistory>): Promise<boolean> {
  if (Object.keys(history).length === 0) return true
  
  const entries = Object.values(history).map(h => ({
    word: h.word,
    view_dates: h.viewDates || [],
    total_views: h.totalViews || 0,
    last_viewed_date: h.lastViewedDate || new Date().toISOString().split('T')[0],
    first_viewed_date: h.firstViewedDate || new Date().toISOString().split('T')[0]
  }))
  
  const { error } = await supabase
    .from('recognition_history')
    .upsert(entries, { onConflict: 'word' })
  
  if (error) {
    console.error('Error saving recognition history:', error)
    return false
  }
  return true
}

// Bank operations
export async function fetchBankEntries(): Promise<BankEntry[]> {
  const { data, error } = await supabase
    .from('bank_entries')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching bank entries:', error)
    return []
  }
  
  return data.map(e => ({
    id: e.id,
    date: e.date,
    amount: parseFloat(e.amount),
    description: e.description,
    category: e.category as 'reward' | 'red-packet' | 'gift' | 'other'
  }))
}

export async function saveBankEntry(entry: BankEntry): Promise<boolean> {
  const { error } = await supabase
    .from('bank_entries')
    .upsert({
      id: entry.id,
      date: entry.date,
      amount: entry.amount,
      description: entry.description,
      category: entry.category
    }, { onConflict: 'id' })
  
  if (error) {
    console.error('Error saving bank entry:', error)
    return false
  }
  return true
}

export async function deleteBankEntry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('bank_entries')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting bank entry:', error)
    return false
  }
  return true
}

// Parent feedback operations
export async function fetchParentFeedback(): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .from('parent_feedback')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching parent feedback:', error)
    return {}
  }
  
  const feedback: Record<string, any> = {}
  data.forEach(f => {
    feedback[f.date] = {
      dad: {
        accuracy: f.dad_accuracy,
        attitude: f.dad_attitude
      },
      mom: {
        accuracy: f.mom_accuracy,
        attitude: f.mom_attitude
      }
    }
  })
  
  return feedback
}

export async function saveParentFeedback(date: string, feedback: any): Promise<boolean> {
  const { error } = await supabase
    .from('parent_feedback')
    .upsert({
      date,
      dad_accuracy: feedback.dad?.accuracy || null,
      dad_attitude: feedback.dad?.attitude || null,
      mom_accuracy: feedback.mom?.accuracy || null,
      mom_attitude: feedback.mom?.attitude || null
    }, { onConflict: 'date' })
  
  if (error) {
    console.error('Error saving parent feedback:', error)
    return false
  }
  return true
}

// Picture operations
export async function fetchPictures(): Promise<Picture[]> {
  const { data, error } = await supabase
    .from('pictures')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching pictures:', error)
    return []
  }
  
  return data.map(p => ({
    id: p.id,
    url: p.url,
    title: p.title || undefined,
    isUploaded: p.is_uploaded !== false
  }))
}

export async function savePicture(picture: Picture): Promise<boolean> {
  const { error } = await supabase
    .from('pictures')
    .upsert({
      id: picture.id,
      url: picture.url,
      title: picture.title || null,
      is_uploaded: picture.isUploaded !== false
    }, { onConflict: 'id' })
  
  if (error) {
    console.error('Error saving picture:', error)
    return false
  }
  return true
}

export async function deletePicture(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pictures')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting picture:', error)
    return false
  }
  return true
}

