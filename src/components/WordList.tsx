import { useState, useEffect, useMemo } from 'react'
import './WordList.css'
import { fetchWords, saveWord, deleteWord, fetchSpellingHistory, saveSpellingHistory, fetchRecognitionHistory, saveRecognitionHistory, type Word } from '../lib/supabaseService'

type WordType = 'recognition' | 'spelling'
type WordLevel = 'starters' | 'movers' | 'flyers'

interface SpellingAttempt {
  date: string
  correct: boolean
}

interface SpellingHistory {
  word: string
  attempts: SpellingAttempt[]
  totalErrors: number
  lastAttemptDate: string
  mastered: boolean // If last attempt was correct, mark as mastered
}

interface RecognitionHistory {
  word: string
  viewDates: string[] // Dates when the word was viewed/practiced
  totalViews: number
  lastViewedDate: string
  firstViewedDate: string
}

// Cambridge English word lists (sample - you can expand this)
const SPELLING_WORD_BANKS: Record<WordLevel, string[]> = {
  starters: [
    'apple', 'banana', 'cat', 'dog', 'elephant', 'fish', 'bird', 'house', 'book', 'pen',
    'red', 'blue', 'green', 'yellow', 'big', 'small', 'happy', 'sad', 'good', 'bad',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'mum', 'dad', 'brother', 'sister', 'friend', 'teacher', 'school', 'class', 'desk', 'chair'
  ],
  movers: [
    'animal', 'beautiful', 'careful', 'dangerous', 'exciting', 'famous', 'garden', 'hospital',
    'important', 'journey', 'kitchen', 'library', 'mountain', 'nature', 'ocean', 'perfect',
    'question', 'restaurant', 'scientist', 'terrible', 'umbrella', 'village', 'wonderful',
    'exercise', 'yesterday', 'zebra', 'adventure', 'butterfly', 'calendar', 'dinosaur'
  ],
  flyers: [
    'accident', 'brilliant', 'comfortable', 'discover', 'environment', 'furniture', 'government',
    'happiness', 'instrument', 'knowledge', 'language', 'medicine', 'necessary', 'opportunity',
    'pollution', 'qualification', 'responsible', 'temperature', 'university', 'volunteer',
    'weather', 'xylophone', 'yesterday', 'zoology', 'archaeology', 'biography', 'chemistry'
  ]
}

const wordDictionary: Record<string, string> = {
  'apple': '蘋果', 'banana': '香蕉', 'cat': '貓', 'dog': '狗', 'elephant': '大象',
  'bird': '鳥', 'fish': '魚', 'house': '房子', 'school': '學校', 'book': '書',
  'pen': '筆', 'red': '紅色', 'blue': '藍色', 'green': '綠色', 'yellow': '黃色',
  'big': '大的', 'small': '小的', 'happy': '快樂', 'sad': '傷心', 'good': '好的',
  'bad': '壞的', 'one': '一', 'two': '二', 'three': '三', 'four': '四', 'five': '五'
}

function getTranslation(word: string): Promise<string> {
  const lowerWord = word.toLowerCase().trim()
  if (wordDictionary[lowerWord]) {
    return Promise.resolve(wordDictionary[lowerWord])
  }
  return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`)
    .then(response => response.json())
    .then(data => data.responseData?.translatedText || word)
    .catch(() => word)
}

const WordList = () => {
  const [activeTab, setActiveTab] = useState<WordType>('recognition')
  const [words, setWords] = useState<Word[]>([])
  const [inputWord, setInputWord] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [todaySpellingWords, setTodaySpellingWords] = useState<string[]>([])
  const [currentSpellingIndex, setCurrentSpellingIndex] = useState(0)
  const [spellingResults, setSpellingResults] = useState<Record<string, boolean>>({})
  const [spellingHistory, setSpellingHistory] = useState<Record<string, SpellingHistory>>({})
  const [recognitionHistory, setRecognitionHistory] = useState<Record<string, RecognitionHistory>>({})

  const LOCAL_STORAGE_KEY = 'aiden-words-v2'
  const SPELLING_SESSION_KEY = 'spelling-session'
  const SPELLING_HISTORY_KEY = 'aiden-spelling-history'
  const RECOGNITION_HISTORY_KEY = 'aiden-recognition-history'

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Try to load from Supabase first
        const [supabaseWords, supabaseSpellingHistory, supabaseRecognitionHistory] = await Promise.all([
          fetchWords(),
          fetchSpellingHistory(),
          fetchRecognitionHistory()
        ])

        if (supabaseWords.length > 0) {
          setWords(supabaseWords)
        } else {
          // Fallback to localStorage if Supabase is empty
          const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (savedV2) {
            const localWords = JSON.parse(savedV2)
            setWords(localWords)
            // Migrate to Supabase
            for (const word of localWords) {
              await saveWord(word)
            }
          }
        }

        if (Object.keys(supabaseSpellingHistory).length > 0) {
          setSpellingHistory(supabaseSpellingHistory)
        } else {
          const saved = localStorage.getItem(SPELLING_HISTORY_KEY)
          if (saved) {
            const localHistory = JSON.parse(saved)
            setSpellingHistory(localHistory)
            await saveSpellingHistory(localHistory)
          }
        }

        if (Object.keys(supabaseRecognitionHistory).length > 0) {
          setRecognitionHistory(supabaseRecognitionHistory)
        } else {
          const saved = localStorage.getItem(RECOGNITION_HISTORY_KEY)
          if (saved) {
            const localHistory = JSON.parse(saved)
            setRecognitionHistory(localHistory)
            await saveRecognitionHistory(localHistory)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to localStorage on error
        try {
          const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (savedV2) {
            setWords(JSON.parse(savedV2))
          }
          const savedSpelling = localStorage.getItem(SPELLING_HISTORY_KEY)
          if (savedSpelling) {
            setSpellingHistory(JSON.parse(savedSpelling))
          }
          const savedRecognition = localStorage.getItem(RECOGNITION_HISTORY_KEY)
          if (savedRecognition) {
            setRecognitionHistory(JSON.parse(savedRecognition))
          }
        } catch (e) {
          console.error('Error loading from localStorage:', e)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Sync words to Supabase and localStorage
  useEffect(() => {
    if (words.length > 0 && !isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(words))
      // Sync to Supabase (debounced)
      const timeoutId = setTimeout(() => {
        words.forEach(word => saveWord(word).catch(console.error))
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [words, isLoading])

  // Sync spelling history to Supabase and localStorage
  useEffect(() => {
    if (Object.keys(spellingHistory).length > 0 && !isLoading) {
      localStorage.setItem(SPELLING_HISTORY_KEY, JSON.stringify(spellingHistory))
      const timeoutId = setTimeout(() => {
        saveSpellingHistory(spellingHistory).catch(console.error)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [spellingHistory, isLoading])

  // Sync recognition history to Supabase and localStorage
  useEffect(() => {
    if (Object.keys(recognitionHistory).length > 0 && !isLoading) {
      localStorage.setItem(RECOGNITION_HISTORY_KEY, JSON.stringify(recognitionHistory))
      const timeoutId = setTimeout(() => {
        saveRecognitionHistory(recognitionHistory).catch(console.error)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [recognitionHistory, isLoading])

  // Load or create today's spelling session
  useEffect(() => {
    const saved = localStorage.getItem(SPELLING_SESSION_KEY)
    if (saved) {
      try {
        const session = JSON.parse(saved)
        const today = new Date().toDateString()
        if (session.date === today && session.words) {
          setTodaySpellingWords(session.words)
          setSpellingResults(session.results || {})
          setCurrentSpellingIndex(session.index || 0)
        } else {
          generateTodaySpellingWords()
        }
      } catch {
        generateTodaySpellingWords()
      }
    } else {
      generateTodaySpellingWords()
    }
  }, [])

  const generateTodaySpellingWords = () => {
    const allWords = [
      ...SPELLING_WORD_BANKS.starters,
      ...SPELLING_WORD_BANKS.movers,
      ...SPELLING_WORD_BANKS.flyers
    ]
    
    // Get all mastered words to exclude them
    const masteredWords = new Set(
      Object.values(spellingHistory)
        .filter(h => h.mastered)
        .map(h => h.word.toLowerCase())
    )
    
    // Get words with errors from history (not mastered)
    const errorWords = Object.values(spellingHistory)
      .filter(h => !h.mastered && h.totalErrors > 0)
      .sort((a, b) => b.totalErrors - a.totalErrors) // Sort by error count descending
      .map(h => h.word)
    
    // Get words that need review from words list (exclude mastered)
    const reviewWords = words
      .filter(w => w.type === 'spelling' && w.needsReview && !masteredWords.has(w.word.toLowerCase()))
      .map(w => w.word)
    
    // Combine error words and review words, remove duplicates
    const priorityWords = [...new Set([...errorWords, ...reviewWords])]
    
    // Select up to 10 words: prioritize error words, then fill with random new words
    const selected: string[] = []
    const usedWords = new Set<string>()
    
    // First, add priority words (up to 10)
    for (const word of priorityWords) {
      if (selected.length >= 10) break
      const wordLower = word.toLowerCase()
      if (!usedWords.has(wordLower) && !masteredWords.has(wordLower)) {
        selected.push(word)
        usedWords.add(wordLower)
      }
    }
    
    // Fill remaining slots with random words from word banks (exclude mastered words)
    const availableWords = allWords.filter(word => !masteredWords.has(word.toLowerCase()))
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5)
    for (const word of shuffled) {
      if (selected.length >= 10) break
      const wordLower = word.toLowerCase()
      if (!usedWords.has(wordLower)) {
        selected.push(word)
        usedWords.add(wordLower)
      }
    }
    
    setTodaySpellingWords(selected)
    setCurrentSpellingIndex(0)
    setSpellingResults({})
    
    localStorage.setItem(SPELLING_SESSION_KEY, JSON.stringify({
      date: new Date().toDateString(),
      words: selected,
      results: {},
      index: 0
    }))
  }

  const recognitionWords = useMemo(() => 
    words.filter(w => w.type === 'recognition'),
    [words]
  )

  const spellingWords = useMemo(() => 
    words.filter(w => w.type === 'spelling'),
    [words]
  )

  const recordRecognitionView = (word: string) => {
    const today = new Date().toISOString().split('T')[0]
    const wordLower = word.toLowerCase()
    const existingHistory = recognitionHistory[wordLower]
    
    let updatedHistory: RecognitionHistory
    if (existingHistory) {
      // Add today's date if not already recorded
      const viewDates = existingHistory.viewDates.includes(today)
        ? existingHistory.viewDates
        : [...existingHistory.viewDates, today]
      
      updatedHistory = {
        word: word,
        viewDates,
        totalViews: viewDates.length,
        lastViewedDate: today,
        firstViewedDate: existingHistory.firstViewedDate
      }
    } else {
      // Create new history entry
      updatedHistory = {
        word: word,
        viewDates: [today],
        totalViews: 1,
        lastViewedDate: today,
        firstViewedDate: today
      }
    }
    
    setRecognitionHistory({
      ...recognitionHistory,
      [wordLower]: updatedHistory
    })
  }

  const handleAddRecognitionWord = async () => {
    const wordToAdd = inputWord.trim().toLowerCase()
    if (!wordToAdd || words.some(w => w.word.toLowerCase() === wordToAdd && w.type === 'recognition')) {
      alert('Please enter a valid word that is not already in the list')
      return
    }

    setIsAdding(true)
    try {
      const translation = await getTranslation(wordToAdd)
      const newWord: Word = {
        id: crypto.randomUUID(),
        word: inputWord.trim(),
        translation,
        type: 'recognition',
        dateAdded: new Date().toISOString()
      }
      // Save to Supabase first
      const success = await saveWord(newWord)
      if (success) {
        setWords([...words, newWord])
        setInputWord('')
        // Record initial view when word is added
        recordRecognitionView(inputWord.trim())
      } else {
        alert('Failed to save word to database')
      }
    } catch (error) {
      console.error('Error adding word:', error)
      alert('Failed to add word')
    } finally {
      setIsAdding(false)
    }
  }

  const handleSpellingResult = (word: string, correct: boolean) => {
    const newResults = { ...spellingResults, [word]: correct }
    setSpellingResults(newResults)

    // Record spelling history
    const today = new Date().toISOString().split('T')[0]
    const wordLower = word.toLowerCase()
    const existingHistory = spellingHistory[wordLower]
    
    const newAttempt: SpellingAttempt = {
      date: today,
      correct
    }
    
    let updatedHistory: SpellingHistory
    if (existingHistory) {
      // Add new attempt to existing history
      const updatedAttempts = [...existingHistory.attempts, newAttempt]
      const totalErrors = updatedAttempts.filter(a => !a.correct).length
      updatedHistory = {
        word: word,
        attempts: updatedAttempts,
        totalErrors,
        lastAttemptDate: today,
        mastered: correct // If current attempt is correct, mark as mastered
      }
    } else {
      // Create new history entry
      updatedHistory = {
        word: word,
        attempts: [newAttempt],
        totalErrors: correct ? 0 : 1,
        lastAttemptDate: today,
        mastered: correct
      }
    }
    
    setSpellingHistory({
      ...spellingHistory,
      [wordLower]: updatedHistory
    })

    // Update or create word record
    const existing = words.find(w => w.word.toLowerCase() === wordLower && w.type === 'spelling')
    if (existing) {
      setWords(words.map(w => 
        w.id === existing.id
          ? { ...w, needsReview: !correct, lastReviewed: new Date().toISOString() }
          : w
      ))
    } else if (!correct) {
      // Add to spelling words if incorrect
      const newWord: Word = {
        id: Date.now().toString(),
        word: word,
        translation: wordDictionary[wordLower] || word,
        type: 'spelling',
        dateAdded: new Date().toISOString(),
        needsReview: true,
        lastReviewed: new Date().toISOString()
      }
      setWords([...words, newWord])
    }

    // Move to next word
    if (currentSpellingIndex < todaySpellingWords.length - 1) {
      setCurrentSpellingIndex(currentSpellingIndex + 1)
      localStorage.setItem(SPELLING_SESSION_KEY, JSON.stringify({
        date: new Date().toDateString(),
        words: todaySpellingWords,
        results: newResults,
        index: currentSpellingIndex + 1
      }))
    } else {
      alert('Spelling session completed!')
    }
  }

  const handleDeleteWord = async (id: string) => {
    if (confirm('Delete this word?')) {
      const success = await deleteWord(id)
      if (success) {
        setWords(words.filter(w => w.id !== id))
      } else {
        alert('Failed to delete word from database')
      }
    }
  }

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Your browser does not support text-to-speech')
    }
  }

  const currentSpellingWord = todaySpellingWords[currentSpellingIndex]

  return (
    <div className="word-list section-card">
      <div className="page-title">
        <h2>📚 English Words</h2>
        <p>Switch between recognition words and daily spelling practice</p>
      </div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'recognition' ? 'active' : ''}`}
          onClick={() => setActiveTab('recognition')}
        >
          Recognition Words
        </button>
        <button
          className={`tab ${activeTab === 'spelling' ? 'active' : ''}`}
          onClick={() => setActiveTab('spelling')}
        >
          Spelling Practice
        </button>
      </div>

      {activeTab === 'recognition' && (
        <>
          <div className="add-word-section">
            <div className="add-word-input-container">
              <input
                type="text"
                className="add-word-input"
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isAdding && handleAddRecognitionWord()}
                placeholder="Enter a word Aiden can recognize..."
                disabled={isAdding}
              />
              <button
                className="add-word-button"
                onClick={handleAddRecognitionWord}
                disabled={isAdding || !inputWord.trim()}
              >
                {isAdding ? 'Adding...' : '+ Add'}
              </button>
            </div>
          </div>

          <div className="words-list-compact">
            {recognitionWords.length === 0 ? (
              <div className="empty-state">No recognition words yet</div>
            ) : (
              recognitionWords.map(word => (
                <div key={word.id} className="word-item-compact">
                  <div className="word-main">
                    <span className="word-text-compact">{word.word}</span>
                    <span className="word-translation-compact">{word.translation}</span>
                    <button 
                      className="speech-btn" 
                      onClick={() => {
                        speakWord(word.word)
                        recordRecognitionView(word.word)
                      }}
                      title="Play pronunciation"
                      aria-label={`Pronounce ${word.word}`}
                    >
                      🔊
                    </button>
                  </div>
                  <button className="delete-btn-small" onClick={() => handleDeleteWord(word.id)}>×</button>
                </div>
              ))
            )}
          </div>

          <div className="spelling-words-section">
            <h3>Recognition History</h3>
            <p className="history-description">Track when Aiden practices recognition words</p>
            <div className="words-list-compact">
              {Object.keys(recognitionHistory).length === 0 ? (
                <div className="empty-state">No recognition history yet. Click the 🔊 button to start tracking!</div>
              ) : (
                Object.values(recognitionHistory)
                  .sort((a, b) => {
                    // Sort by last viewed date (most recent first), then by total views
                    const dateCompare = new Date(b.lastViewedDate).getTime() - new Date(a.lastViewedDate).getTime()
                    if (dateCompare !== 0) return dateCompare
                    return b.totalViews - a.totalViews
                  })
                  .map(history => {
                    const translation = wordDictionary[history.word.toLowerCase()] || history.word
                    
                    return (
                      <div key={history.word} className="word-item-compact history-item">
                        <div className="word-main">
                          <span className="word-text-compact">{history.word}</span>
                          <span className="word-translation-compact">{translation}</span>
                          <button 
                            className="speech-btn" 
                            onClick={() => {
                              speakWord(history.word)
                              recordRecognitionView(history.word)
                            }}
                            title="Play pronunciation"
                            aria-label={`Pronounce ${history.word}`}
                          >
                            🔊
                          </button>
                          <div className="history-stats">
                            <span className="history-stat">
                              <span className="stat-label">First:</span>
                              <span className="stat-value">{new Date(history.firstViewedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                            <span className="history-stat">
                              <span className="stat-label">Last:</span>
                              <span className="stat-value">{new Date(history.lastViewedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                            <span className="history-stat">
                              <span className="stat-label">Views:</span>
                              <span className="stat-value">{history.totalViews}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'spelling' && (
        <>
          {currentSpellingWord && currentSpellingIndex < todaySpellingWords.length ? (
            <div className="spelling-session">
              <div className="spelling-progress">
                Word {currentSpellingIndex + 1} of {todaySpellingWords.length}
              </div>
              <div className="spelling-word-display">
                <div className="spelling-word-with-audio">
                  <h3>{currentSpellingWord}</h3>
                  <button 
                    className="speech-btn-large" 
                    onClick={() => speakWord(currentSpellingWord)}
                    title="Play pronunciation"
                    aria-label={`Pronounce ${currentSpellingWord}`}
                  >
                    🔊
                  </button>
                </div>
                <p>Can Aiden spell this word?</p>
              </div>
              <div className="spelling-actions">
                <button
                  className="spelling-btn correct"
                  onClick={() => handleSpellingResult(currentSpellingWord, true)}
                >
                  ✓ Correct
                </button>
                <button
                  className="spelling-btn incorrect"
                  onClick={() => handleSpellingResult(currentSpellingWord, false)}
                >
                  ✗ Needs Review
                </button>
              </div>
              <button className="reset-session-btn" onClick={generateTodaySpellingWords}>
                Start New Session
              </button>
            </div>
          ) : (
            <div className="spelling-complete">
              <h3>Spelling session completed!</h3>
              <button className="reset-session-btn" onClick={generateTodaySpellingWords}>
                Start New Session
              </button>
            </div>
          )}

          <div className="spelling-words-section">
            <h3>Words Needing Review</h3>
            <div className="words-list-compact">
              {spellingWords.filter(w => w.needsReview).length === 0 ? (
                <div className="empty-state">No words need review - great job!</div>
              ) : (
                spellingWords
                  .filter(w => w.needsReview)
                  .map(word => (
                    <div key={word.id} className="word-item-compact review-item">
                      <div className="word-main">
                        <span className="word-text-compact">{word.word}</span>
                        <span className="word-translation-compact">{word.translation}</span>
                        {word.level && <span className="word-level">{word.level}</span>}
                        <button 
                          className="speech-btn" 
                          onClick={() => speakWord(word.word)}
                          title="Play pronunciation"
                          aria-label={`Pronounce ${word.word}`}
                        >
                          🔊
                        </button>
                      </div>
                      <button className="delete-btn-small" onClick={() => handleDeleteWord(word.id)}>×</button>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="spelling-words-section">
            <h3>All Spelling Words</h3>
            <div className="words-list-compact">
              {spellingWords.length === 0 ? (
                <div className="empty-state">No spelling words yet</div>
              ) : (
                spellingWords.map(word => (
                  <div key={word.id} className={`word-item-compact ${word.needsReview ? 'needs-review' : ''}`}>
                    <div className="word-main">
                      <span className="word-text-compact">{word.word}</span>
                      <span className="word-translation-compact">{word.translation}</span>
                      {word.level && <span className="word-level">{word.level}</span>}
                      {word.needsReview && <span className="review-badge">Review</span>}
                      <button 
                        className="speech-btn" 
                        onClick={() => speakWord(word.word)}
                        title="Play pronunciation"
                        aria-label={`Pronounce ${word.word}`}
                      >
                        🔊
                      </button>
                    </div>
                    <button className="delete-btn-small" onClick={() => handleDeleteWord(word.id)}>×</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="spelling-words-section">
            <h3>Spelling History</h3>
            <p className="history-description">All words Aiden has practiced, with dates and error counts</p>
            <div className="words-list-compact">
              {Object.keys(spellingHistory).length === 0 ? (
                <div className="empty-state">No spelling history yet. Start practicing to see records here!</div>
              ) : (
                Object.values(spellingHistory)
                  .sort((a, b) => {
                    // Sort by last attempt date (most recent first), then by error count
                    const dateCompare = new Date(b.lastAttemptDate).getTime() - new Date(a.lastAttemptDate).getTime()
                    if (dateCompare !== 0) return dateCompare
                    return b.totalErrors - a.totalErrors
                  })
                  .map(history => {
                    const firstAttemptDate = history.attempts[0]?.date || history.lastAttemptDate
                    const translation = wordDictionary[history.word.toLowerCase()] || history.word
                    
                    return (
                      <div key={history.word} className={`word-item-compact history-item ${history.mastered ? 'mastered' : 'needs-practice'}`}>
                        <div className="word-main">
                          <span className="word-text-compact">{history.word}</span>
                          <span className="word-translation-compact">{translation}</span>
                          <button 
                            className="speech-btn" 
                            onClick={() => speakWord(history.word)}
                            title="Play pronunciation"
                            aria-label={`Pronounce ${history.word}`}
                          >
                            🔊
                          </button>
                          <div className="history-stats">
                            <span className="history-stat">
                              <span className="stat-label">First:</span>
                              <span className="stat-value">{new Date(firstAttemptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                            <span className="history-stat">
                              <span className="stat-label">Last:</span>
                              <span className="stat-value">{new Date(history.lastAttemptDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                            <span className="history-stat">
                              <span className="stat-label">Errors:</span>
                              <span className={`stat-value error-count ${history.totalErrors > 0 ? 'has-errors' : 'no-errors'}`}>
                                {history.totalErrors}
                              </span>
                            </span>
                            <span className="history-stat">
                              <span className="stat-label">Attempts:</span>
                              <span className="stat-value">{history.attempts.length}</span>
                            </span>
                            {history.mastered && (
                              <span className="mastered-badge">✓ Mastered</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WordList
