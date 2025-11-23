import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

const QWEN_API_KEY = 'sk-559d7b08f3b445b2aa414dd5e9985143'
// Qwen API endpoint - using DashScope format
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

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
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    try {
      // Build conversation history for context
      const conversationMessages = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))

      // Add current user message
      conversationMessages.push({
        role: 'user',
        content: userMessage
      })

      // Add system prompt
      const systemPrompt = "You are Little Si, a friendly AI companion for Aiden, a 6-year-old student at St. Paul College Primary School. Be cheerful, encouraging, and age-appropriate. Keep responses concise and engaging."

      const response = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo', // or 'qwen-plus', 'qwen-max' depending on your subscription
          input: {
            messages: [
              { role: 'system', content: systemPrompt },
              ...conversationMessages
            ]
          },
          parameters: {
            temperature: 0.7,
            max_tokens: 500,
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Extract response text from Qwen API response
      // Try different response formats
      if (data.output) {
        // DashScope format
        if (data.output.choices && data.output.choices.length > 0) {
          return data.output.choices[0].message?.content?.trim() || data.output.choices[0].text?.trim() || ''
        }
        if (data.output.text) {
          return data.output.text.trim()
        }
      }
      // OpenAI compatible format
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message?.content?.trim() || ''
      }
      // Direct text response
      if (data.text) {
        return data.text.trim()
      }
      
      throw new Error('Unexpected API response format')
    } catch (error) {
      console.error('Error calling Qwen API:', error)
      // Fallback to a friendly error message
      return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!"
    }
  }

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return

    const userMessage: Message = {
      id: messages.length,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsLoading(true)

    try {
      const aiResponseText = await getAIResponse(currentInput, messages)
      
      const aiResponse: Message = {
        id: messages.length + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorResponse: Message = {
        id: messages.length + 1,
        text: "I'm sorry, something went wrong. Please try again!",
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
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
        <button className="send-button" onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ChatBot

