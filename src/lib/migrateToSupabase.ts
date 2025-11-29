// Migration utility to move data from localStorage to Supabase
import { supabase } from './supabase'

export async function migrateAllData() {
  console.log('Starting migration from localStorage to Supabase...')
  
  try {
    // 1. Migrate Words
    const wordsData = localStorage.getItem('aiden-words-v2')
    if (wordsData) {
      const words = JSON.parse(wordsData)
      if (Array.isArray(words) && words.length > 0) {
        const wordsToInsert = words.map((w: any) => ({
          id: w.id,
          word: w.word,
          translation: w.translation,
          type: w.type,
          date_added: w.dateAdded || new Date().toISOString(),
          level: w.level || null,
          needs_review: w.needsReview || false,
          last_reviewed: w.lastReviewed || null
        }))
        
        const { error } = await supabase.from('words').upsert(wordsToInsert, { onConflict: 'id' })
        if (error) {
          console.error('Error migrating words:', error)
        } else {
          console.log(`Migrated ${wordsToInsert.length} words`)
        }
      }
    }

    // 2. Migrate Spelling History
    const spellingHistoryData = localStorage.getItem('aiden-spelling-history')
    if (spellingHistoryData) {
      const history = JSON.parse(spellingHistoryData)
      const historyEntries = Object.values(history).map((h: any) => ({
        word: h.word,
        attempts: h.attempts || [],
        total_errors: h.totalErrors || 0,
        last_attempt_date: h.lastAttemptDate || new Date().toISOString().split('T')[0],
        mastered: h.mastered || false
      }))
      
      if (historyEntries.length > 0) {
        const { error } = await supabase.from('spelling_history').upsert(historyEntries, { onConflict: 'word' })
        if (error) {
          console.error('Error migrating spelling history:', error)
        } else {
          console.log(`Migrated ${historyEntries.length} spelling history entries`)
        }
      }
    }

    // 3. Migrate Recognition History
    const recognitionHistoryData = localStorage.getItem('aiden-recognition-history')
    if (recognitionHistoryData) {
      const history = JSON.parse(recognitionHistoryData)
      const historyEntries = Object.values(history).map((h: any) => ({
        word: h.word,
        view_dates: h.attempts?.map((a: any) => a.date) || [],
        total_views: h.totalViews || 0,
        last_viewed_date: h.lastViewDate || new Date().toISOString().split('T')[0],
        first_viewed_date: h.firstViewDate || new Date().toISOString().split('T')[0]
      }))
      
      if (historyEntries.length > 0) {
        const { error } = await supabase.from('recognition_history').upsert(historyEntries, { onConflict: 'word' })
        if (error) {
          console.error('Error migrating recognition history:', error)
        } else {
          console.log(`Migrated ${historyEntries.length} recognition history entries`)
        }
      }
    }

    // 4. Migrate Bank Entries
    const bankData = localStorage.getItem('aiden-bank-entries')
    if (bankData) {
      const entries = JSON.parse(bankData)
      if (Array.isArray(entries) && entries.length > 0) {
        const { error } = await supabase.from('bank_entries').upsert(entries.map((e: any) => ({
          id: e.id,
          date: e.date,
          amount: e.amount,
          description: e.description,
          category: e.category
        })), { onConflict: 'id' })
        if (error) {
          console.error('Error migrating bank entries:', error)
        } else {
          console.log(`Migrated ${entries.length} bank entries`)
        }
      }
    }

    // 5. Migrate Parent Feedback
    const feedbackData = localStorage.getItem('aiden-parent-feedback')
    if (feedbackData) {
      const feedback = JSON.parse(feedbackData)
      const feedbackEntries = Object.entries(feedback).map(([date, data]: [string, any]) => ({
        date,
        dad_accuracy: data.dad?.accuracy || null,
        dad_attitude: data.dad?.attitude || null,
        mom_accuracy: data.mom?.accuracy || null,
        mom_attitude: data.mom?.attitude || null
      }))
      
      if (feedbackEntries.length > 0) {
        const { error } = await supabase.from('parent_feedback').upsert(feedbackEntries, { onConflict: 'date' })
        if (error) {
          console.error('Error migrating parent feedback:', error)
        } else {
          console.log(`Migrated ${feedbackEntries.length} parent feedback entries`)
        }
      }
    }

    // 6. Migrate Pictures
    const picturesData = localStorage.getItem('aiden-picture-wall')
    if (picturesData) {
      const pictures = JSON.parse(picturesData)
      if (Array.isArray(pictures) && pictures.length > 0) {
        const { error } = await supabase.from('pictures').upsert(pictures.map((p: any) => ({
          id: p.id,
          url: p.url,
          title: p.title || null,
          is_uploaded: p.isUploaded !== false
        })), { onConflict: 'id' })
        if (error) {
          console.error('Error migrating pictures:', error)
        } else {
          console.log(`Migrated ${pictures.length} pictures`)
        }
      }
    }

    console.log('Migration completed!')
    return { success: true }
  } catch (error) {
    console.error('Migration error:', error)
    return { success: false, error }
  }
}

