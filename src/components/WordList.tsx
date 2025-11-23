import { useState, useEffect } from 'react'
import './WordList.css'

interface Word {
  id: string
  word: string
  translation: string
  imageUrl: string
  dateAdded: string
}

// English to Traditional Chinese translation dictionary
const wordDictionary: Record<string, string> = {
  // 动物
  'apple': '蘋果',
  'banana': '香蕉',
  'cat': '貓',
  'dog': '狗',
  'elephant': '大象',
  'bird': '鳥',
  'fish': '魚',
  'rabbit': '兔子',
  'horse': '馬',
  'cow': '牛',
  'pig': '豬',
  'chicken': '雞',
  
  // 物体
  'house': '房子',
  'school': '學校',
  'book': '書',
  'water': '水',
  'sun': '太陽',
  'moon': '月亮',
  'star': '星星',
  'tree': '樹',
  'flower': '花',
  'car': '汽車',
  'bicycle': '自行車',
  'pen': '筆',
  'pencil': '鉛筆',
  'table': '桌子',
  'chair': '椅子',
  'bed': '床',
  'window': '窗戶',
  'door': '門',
  
  // 颜色
  'red': '紅色',
  'blue': '藍色',
  'green': '綠色',
  'yellow': '黃色',
  'orange': '橙色',
  'purple': '紫色',
  'pink': '粉色',
  'black': '黑色',
  'white': '白色',
  
  // 情感和形容词
  'friend': '朋友',
  'happy': '快樂',
  'sad': '傷心',
  'love': '愛',
  'big': '大的',
  'small': '小的',
  'hot': '熱的',
  'cold': '冷的',
  'good': '好的',
  'bad': '壞的',
  
  // 身体部位
  'head': '頭',
  'eye': '眼睛',
  'nose': '鼻子',
  'mouth': '嘴巴',
  'hand': '手',
  'foot': '腳',
  
  // 食物
  'bread': '麵包',
  'milk': '牛奶',
  'egg': '雞蛋',
  'rice': '米飯',
  'meat': '肉',
  'fruit': '水果',
  'vegetable': '蔬菜',
}

// 获取单词翻译（简体转繁体）
function getTranslation(word: string): Promise<string> {
  const lowerWord = word.toLowerCase().trim()
  
    // First check local dictionary
    if (wordDictionary[lowerWord]) {
      return Promise.resolve(wordDictionary[lowerWord])
    }
    
    // If not in local dictionary, try online translation API
    // Using free MyMemory Translation API as fallback
  return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`)
    .then(response => response.json())
    .then(data => {
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText
      }
      return word // If translation fails, return original word
    })
    .catch((_error) => {
      // If API call fails, return original word with brackets
      return `[${word}]`
    })
}

// 获取单词图片
function getWordImage(word: string): string {
  // Use placeholder.com as image source, displaying word text
  // Can be replaced with professional image API service
  const wordText = word.charAt(0).toUpperCase() + word.slice(1)
  return `https://via.placeholder.com/400x300/4682B4/FFFFFF?text=${encodeURIComponent(wordText)}`
}

function WordList() {
  const [words, setWords] = useState<Word[]>([])
  const [inputWord, setInputWord] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingWord, setLoadingWord] = useState<string | null>(null)

  // Load words from localStorage
  useEffect(() => {
    const savedWords = localStorage.getItem('aiden-words')
    if (savedWords) {
      try {
        const parsedWords = JSON.parse(savedWords)
        if (Array.isArray(parsedWords)) {
          setWords(parsedWords)
        }
      } catch (error) {
        console.error('Failed to load words:', error)
        setWords([])
        // error is used in console.error, so it's fine
      }
    }
  }, [])

  // Save words to localStorage
  useEffect(() => {
    localStorage.setItem('aiden-words', JSON.stringify(words))
  }, [words])

  // Add new word
  const handleAddWord = async () => {
    const wordToAdd = inputWord.trim().toLowerCase()
    
    if (!wordToAdd) {
      alert('Please enter a word')
      return
    }

    // Check if word already exists
    if (words.some(w => w.word.toLowerCase() === wordToAdd)) {
      alert('This word is already in the list!')
      setInputWord('')
      return
    }

    setIsAdding(true)
    setLoadingWord(wordToAdd)

    try {
      // 获取翻译
      const translation = await getTranslation(wordToAdd)
      
      // 获取图片URL
      const imageUrl = getWordImage(wordToAdd)
      
      const newWord: Word = {
        id: Date.now().toString(),
        word: inputWord.trim(),
        translation: translation,
        imageUrl: imageUrl,
        dateAdded: new Date().toISOString()
      }

      setWords([...words, newWord])
      setInputWord('')
    } catch (error) {
      console.error('Failed to add word:', error)
      alert('Failed to add word. Please try again.')
    } finally {
      setIsAdding(false)
      setLoadingWord(null)
    }
  }

  // Delete word
  const handleDeleteWord = (id: string) => {
    if (confirm('Are you sure you want to delete this word?')) {
      setWords(words.filter(w => w.id !== id))
    }
  }

  // Pronounce word
  const handlePronounce = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8 // Slightly slower for learning
      speechSynthesis.speak(utterance)
    } else {
      alert('Your browser does not support speech synthesis')
    }
  }

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAdding) {
      handleAddWord()
    }
  }

  return (
    <div className="word-list">
      <div className="word-list-header">
        <h2>📚 English Words Learning</h2>
        <p className="word-list-subtitle">Record and learn English words with translations</p>
      </div>

      <div className="add-word-section">
        <div className="add-word-input-container">
          <input
            type="text"
            className="add-word-input"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter an English word..."
            disabled={isAdding}
          />
          <button
            className="add-word-button"
            onClick={handleAddWord}
            disabled={isAdding || !inputWord.trim()}
          >
            {isAdding ? 'Adding...' : '+ Add Word'}
          </button>
        </div>
        {loadingWord && (
          <p className="loading-message">Adding "{loadingWord}"...</p>
        )}
      </div>

      <div className="words-container">
        {words.length === 0 ? (
          <div className="empty-state">
            <p>No words recorded yet. Enter a word above to get started!</p>
          </div>
        ) : (
          <div className="words-grid">
            {words.map(word => (
              <div key={word.id} className="word-card">
                <div className="word-image-container">
                  <img
                    src={word.imageUrl}
                    alt={word.word}
                    onError={(e) => {
                      // If image fails to load, use placeholder
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/400x300/4682B4/FFFFFF?text=${encodeURIComponent(word.word)}`
                    }}
                  />
                </div>
                <div className="word-content">
                  <div className="word-header">
                    <h3 className="word-text">{word.word}</h3>
                    <button
                      className="delete-word-btn"
                      onClick={() => handleDeleteWord(word.id)}
                      title="Delete word"
                    >
                      ×
                    </button>
                  </div>
                  <p className="word-translation">{word.translation}</p>
                  <button
                    className="pronounce-button"
                    onClick={() => handlePronounce(word.word)}
                    title="Pronounce word"
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WordList

