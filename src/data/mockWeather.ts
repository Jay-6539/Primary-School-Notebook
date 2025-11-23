export interface WeatherData {
  location: string
  current: {
    temperature: number
    condition: string
    icon: string
    humidity: number
    windSpeed: number
  }
  forecast: {
    day: string
    date: string
    high: number
    low: number
    condition: string
    icon: string
  }[]
}

export const mockWeatherData: WeatherData = {
  location: 'Hong Kong',
  current: {
    temperature: 22,
    condition: 'Partly Cloudy',
    icon: '⛅',
    humidity: 65,
    windSpeed: 15,
  },
  forecast: [
    {
      day: 'Today',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: 24,
      low: 18,
      condition: 'Partly Cloudy',
      icon: '⛅',
    },
    {
      day: 'Tomorrow',
      date: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: 26,
      low: 20,
      condition: 'Sunny',
      icon: '☀️',
    },
    {
      day: 'Day 3',
      date: new Date(Date.now() + 172800000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: 23,
      low: 19,
      condition: 'Cloudy',
      icon: '☁️',
    },
    {
      day: 'Day 4',
      date: new Date(Date.now() + 259200000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: 25,
      low: 21,
      condition: 'Sunny',
      icon: '☀️',
    },
    {
      day: 'Day 5',
      date: new Date(Date.now() + 345600000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      high: 22,
      low: 18,
      condition: 'Rainy',
      icon: '🌧️',
    },
  ],
}

