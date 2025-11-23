import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! I'm Little Si! How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Keyword-based responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! Nice to meet you! How are you doing today?"
    }
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great! Thanks for asking! How about you?"
    }
    if (lowerMessage.includes('name')) {
      return "I'm Little Si! I'm here to chat with you and help you have fun!"
    }
    if (lowerMessage.includes('school') || lowerMessage.includes('class')) {
      return "I heard you go to St. Paul College Primary School in Junior 1C! That sounds exciting!"
    }
    if (lowerMessage.includes('drawing') || lowerMessage.includes('draw')) {
      return "Drawing is so much fun! I'd love to see your artwork someday!"
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('read')) {
      return "Reading books is wonderful! What's your favorite book? I love stories too!"
    }
    if (lowerMessage.includes('tom') && lowerMessage.includes('jerry')) {
      return "Tom and Jerry is so funny! I love watching their adventures together!"
    }
    if (lowerMessage.includes('weather')) {
      return "You can check the weather forecast in the Weather section! It's always good to know if you need an umbrella!"
    }
    if (lowerMessage.includes('thank')) {
      return "You're welcome! I'm always happy to help!"
    }
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      return "Goodbye! Have a wonderful day! Come back and chat anytime!"
    }

    // Default responses
    const defaultResponses = [
      "That's interesting! Tell me more about it!",
      "Wow! I'd love to learn more about that!",
      "That sounds fun! What else do you like?",
      "I'm here to chat with you! What would you like to talk about?",
      "That's cool! Do you want to share more?",
      "I'm listening! Tell me more!",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSend = () => {
    if (inputText.trim() === '') return

    const userMessage: Message = {
      id: messages.length,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 1,
        text: getAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot">
      <div className="chat-header">
        <h2>Chat with Little Si</h2>
        <p className="chat-subtitle">Your friendly AI companion!</p>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.sender === 'ai' && (
                <span className="ai-name">Little Si:</span>
              )}
              <span className="message-text">{message.text}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatBot

