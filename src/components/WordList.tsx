import { useState, useEffect, useMemo } from 'react'
import './WordList.css'

type WordType = 'recognition' | 'spelling'
type WordLevel = 'starters' | 'movers' | 'flyers'

interface Word {
  id: string
  word: string
  translation: string
  type: WordType
  dateAdded: string
  level?: WordLevel // For spelling words
  needsReview?: boolean // For spelling words that need review
  lastReviewed?: string
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
  const [words, setWords] = useState<Word[]>(() => {
    try {
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (savedV2) {
        return JSON.parse(savedV2)
      }

      const legacy = localStorage.getItem('aiden-words')
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy)
        if (Array.isArray(parsedLegacy)) {
          const migrated: Word[] = parsedLegacy.map((item: any) => ({
            id: item.id || Date.now().toString(),
            word: item.word,
            translation: item.translation || wordDictionary[item.word?.toLowerCase()] || item.word,
            type: 'recognition',
            dateAdded: item.dateAdded || new Date().toISOString()
          }))
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated))
          return migrated
        }
      }
    } catch (error) {
      console.error('Failed to load words:', error)
    }
    return []
  })
  const [inputWord, setInputWord] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [todaySpellingWords, setTodaySpellingWords] = useState<string[]>([])
  const [currentSpellingIndex, setCurrentSpellingIndex] = useState(0)
  const [spellingResults, setSpellingResults] = useState<Record<string, boolean>>({})

  const LOCAL_STORAGE_KEY = 'aiden-words-v2'
  const SPELLING_SESSION_KEY = 'spelling-session'

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(words))
  }, [words])

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
    const reviewWords = words
      .filter(w => w.type === 'spelling' && w.needsReview)
      .map(w => w.word)
    
    // Mix review words with new random words
    const shuffled = [...allWords].sort(() => Math.random() - 0.5)
    const selected = [...new Set([...reviewWords.slice(0, 3), ...shuffled])].slice(0, 10)
    
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
        id: Date.now().toString(),
        word: inputWord.trim(),
        translation,
        type: 'recognition',
        dateAdded: new Date().toISOString()
      }
      setWords([...words, newWord])
      setInputWord('')
    } catch (error) {
      alert('Failed to add word')
    } finally {
      setIsAdding(false)
    }
  }

  const handleSpellingResult = (word: string, correct: boolean) => {
    const newResults = { ...spellingResults, [word]: correct }
    setSpellingResults(newResults)

    // Update or create word record
    const existing = words.find(w => w.word.toLowerCase() === word.toLowerCase() && w.type === 'spelling')
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
        translation: wordDictionary[word.toLowerCase()] || word,
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

  const handleDeleteWord = (id: string) => {
    if (confirm('Delete this word?')) {
      setWords(words.filter(w => w.id !== id))
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
                  </div>
                  <button className="delete-btn-small" onClick={() => handleDeleteWord(word.id)}>×</button>
                </div>
              ))
            )}
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
                <h3>{currentSpellingWord}</h3>
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
                    </div>
                    <button className="delete-btn-small" onClick={() => handleDeleteWord(word.id)}>×</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WordList
