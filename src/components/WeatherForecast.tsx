import { mockWeatherData } from '../data/mockWeather'

const WeatherForecast = () => {
  const { location, current, forecast } = mockWeatherData

  return (
    <div className="weather-forecast">
      <h2>Weather Forecast</h2>
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

