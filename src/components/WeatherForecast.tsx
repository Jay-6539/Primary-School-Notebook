import { useState, useEffect } from 'react'
import { WeatherData } from '../data/mockWeather'
import { mockWeatherData } from '../data/mockWeather'

const QWEN_API_KEY = 'sk-559d7b08f3b445b2aa414dd5e9985143'
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

// Map weather conditions to emoji icons
const getWeatherIcon = (condition: string): string => {
  const lower = condition.toLowerCase()
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️'
  if (lower.includes('cloudy') || lower.includes('overcast')) return '☁️'
  if (lower.includes('partly cloudy')) return '⛅'
  if (lower.includes('rain') || lower.includes('shower')) return '🌧️'
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️'
  if (lower.includes('snow')) return '❄️'
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️'
  return '🌤️'
}

// Parse Qwen's weather response into structured data
const parseWeatherResponse = (response: string, location: string = 'Hong Kong'): WeatherData | null => {
  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '')
    }
    
    // Try to extract JSON from the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.location && parsed.current && parsed.forecast) {
        // Add icons to the parsed data
        return {
          location: parsed.location,
          current: {
            ...parsed.current,
            icon: getWeatherIcon(parsed.current.condition),
          },
          forecast: parsed.forecast.map((day: any) => ({
            ...day,
            icon: getWeatherIcon(day.condition),
          })),
        }
      }
    }

    // Fallback: try to extract information from text
    const tempMatch = response.match(/(\d+)\s*°?C|(\d+)\s*degrees?/i)
    const conditionMatch = response.match(/(sunny|cloudy|rainy|partly cloudy|clear|overcast|storm|snow)/i)
    
    if (tempMatch || conditionMatch) {
      const temperature = tempMatch ? parseInt(tempMatch[1] || tempMatch[2]) : 22
      const condition = conditionMatch ? conditionMatch[1] : 'Partly Cloudy'
      
      return {
        location,
        current: {
          temperature,
          condition,
          icon: getWeatherIcon(condition),
          humidity: 65,
          windSpeed: 15,
        },
        forecast: mockWeatherData.forecast.map((day, index) => ({
          ...day,
          high: temperature + (index % 3),
          low: temperature - 3 - (index % 2),
          condition: index === 0 ? condition : day.condition,
          icon: index === 0 ? getWeatherIcon(condition) : day.icon,
        })),
      }
    }
    
    return null
  } catch (error) {
    console.error('Error parsing weather response:', error)
    return null
  }
}

const WeatherForecast = () => {
  const [weatherData, setWeatherData] = useState<WeatherData>(mockWeatherData)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchWeatherFromQwen = async () => {
    setIsLoading(true)
    try {
      const today = new Date()
      const dates = Array.from({ length: 5 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() + i)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

      const prompt = `Provide current weather for Hong Kong in this exact JSON format (no other text):
{
  "location": "Hong Kong",
  "current": {
    "temperature": 22,
    "condition": "Partly Cloudy",
    "humidity": 65,
    "windSpeed": 15
  },
  "forecast": [
    { "day": "Today", "date": "${dates[0]}", "high": 24, "low": 18, "condition": "Partly Cloudy" },
    { "day": "Tomorrow", "date": "${dates[1]}", "high": 26, "low": 20, "condition": "Sunny" },
    { "day": "Day 3", "date": "${dates[2]}", "high": 23, "low": 19, "condition": "Cloudy" },
    { "day": "Day 4", "date": "${dates[3]}", "high": 25, "low": 21, "condition": "Sunny" },
    { "day": "Day 5", "date": "${dates[4]}", "high": 22, "low": 18, "condition": "Rainy" }
  ]
}

Update the values based on realistic Hong Kong weather. Return ONLY the JSON object, no explanations.`

      const response = await fetch(QWEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const qwenResponse = data.choices?.[0]?.message?.content || ''
      
      // Try to parse the response
      const parsed = parseWeatherResponse(qwenResponse, 'Hong Kong')
      
      if (parsed) {
        setWeatherData(parsed)
        setLastUpdate(new Date())
      } else {
        console.warn('Could not parse weather data from Qwen, using mock data')
      }
    } catch (error) {
      console.error('Error fetching weather from Qwen:', error)
      // Keep using mock data on error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch weather on component mount
  useEffect(() => {
    fetchWeatherFromQwen()
    
    // Refresh every 30 minutes
    const interval = setInterval(() => {
      fetchWeatherFromQwen()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const { location, current, forecast } = weatherData

  return (
    <div className="weather-forecast section-card">
      <div className="page-title">
        <h2>Weather Forecast</h2>
        <p>Daily update powered by Qwen</p>
        <div className="weather-title-actions">
          {lastUpdate && (
            <span className="muted-text">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className="primary-btn" onClick={fetchWeatherFromQwen} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      <div className="weather-container">
        <div className="current-weather">
          <h3>Current Weather - {location}</h3>
          <div className="current-weather-card">
            <div className="weather-icon-large">{current.icon}</div>
            <div className="weather-temp-large">{current.temperature}°C</div>
            <div className="weather-condition">{current.condition}</div>
            <div className="weather-details">
              <div className="detail-item">
                <span className="detail-label">Humidity:</span>
                <span className="detail-value">{current.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Wind Speed:</span>
                <span className="detail-value">{current.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forecast-section">
          <h3>5-Day Forecast</h3>
          <div className="forecast-list">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <div className="forecast-day">{day.day}</div>
                <div className="forecast-date">{day.date}</div>
                <div className="forecast-icon">{day.icon}</div>
                <div className="forecast-temps">
                  <span className="temp-high">{day.high}°</span>
                  <span className="temp-low">{day.low}°</span>
                </div>
                <div className="forecast-condition">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherForecast

