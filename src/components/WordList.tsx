import { useState, useEffect } from 'react'
import './WordList.css'

interface Word {
  id: string
  word: string
  translation: string
  imageUrl: string
  dateAdded: string
}

// 简化的英文到繁体中文翻译字典（可以后续扩展或使用API）
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
  
  // 首先检查本地字典
  if (wordDictionary[lowerWord]) {
    return Promise.resolve(wordDictionary[lowerWord])
  }
  
  // 如果本地字典没有，尝试使用在线翻译API
  // 这里使用免费的Google Translate API（需要代理或CORS解决方案）
  // 作为备用方案，我们返回一个占位符
  return fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`)
    .then(response => response.json())
    .then(data => {
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText
      }
      return word // 如果翻译失败，返回原词
    })
    .catch(() => {
      // 如果API调用失败，返回原词或提示
      return `[${word}]`
    })
}

// 获取单词图片
function getWordImage(word: string): string {
  // 使用placeholder.com作为备用图片源，显示单词文字
  // 在实际使用中，可以替换为专业的图片API服务
  const wordText = word.charAt(0).toUpperCase() + word.slice(1)
  return `https://via.placeholder.com/400x300/4682B4/FFFFFF?text=${encodeURIComponent(wordText)}`
}

function WordList() {
  const [words, setWords] = useState<Word[]>([])
  const [inputWord, setInputWord] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [loadingWord, setLoadingWord] = useState<string | null>(null)

  // 从localStorage加载单词
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
      }
    }
  }, [])

  // 保存单词到localStorage
  useEffect(() => {
    localStorage.setItem('aiden-words', JSON.stringify(words))
  }, [words])

  // 添加新单词
  const handleAddWord = async () => {
    const wordToAdd = inputWord.trim().toLowerCase()
    
    if (!wordToAdd) {
      alert('請輸入一個單詞')
      return
    }

    // 检查单词是否已存在
    if (words.some(w => w.word.toLowerCase() === wordToAdd)) {
      alert('這個單詞已經在列表中了！')
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
      alert('添加單詞時出錯，請重試')
    } finally {
      setIsAdding(false)
      setLoadingWord(null)
    }
  }

  // 删除单词
  const handleDeleteWord = (id: string) => {
    if (confirm('確定要刪除這個單詞嗎？')) {
      setWords(words.filter(w => w.id !== id))
    }
  }

  // 播放单词读音
  const handlePronounce = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8 // 稍微慢一点，适合学习
      speechSynthesis.speak(utterance)
    } else {
      alert('您的瀏覽器不支持語音功能')
    }
  }

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAdding) {
      handleAddWord()
    }
  }

  return (
    <div className="word-list">
      <div className="word-list-header">
        <h2>📚 英文單詞學習</h2>
        <p className="word-list-subtitle">記錄不會的單詞，一起學習吧！</p>
      </div>

      <div className="add-word-section">
        <div className="add-word-input-container">
          <input
            type="text"
            className="add-word-input"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="輸入英文單詞..."
            disabled={isAdding}
          />
          <button
            className="add-word-button"
            onClick={handleAddWord}
            disabled={isAdding || !inputWord.trim()}
          >
            {isAdding ? '添加中...' : '+ 添加單詞'}
          </button>
        </div>
        {loadingWord && (
          <p className="loading-message">正在添加 "{loadingWord}"...</p>
        )}
      </div>

      <div className="words-container">
        {words.length === 0 ? (
          <div className="empty-state">
            <p>還沒有記錄單詞。在上方輸入單詞開始學習吧！</p>
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
                      // 如果图片加载失败，使用占位符
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
                      title="刪除單詞"
                    >
                      ×
                    </button>
                  </div>
                  <p className="word-translation">{word.translation}</p>
                  <button
                    className="pronounce-button"
                    onClick={() => handlePronounce(word.word)}
                    title="播放讀音"
                  >
                    🔊 播放讀音
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

