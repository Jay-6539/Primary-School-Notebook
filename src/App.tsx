import { useState } from 'react'
import PersonalInfo from './components/PersonalInfo'
import ParentFeedback from './components/ParentFeedback'
import ChatBot from './components/ChatBot'
import VideoGallery from './components/VideoGallery'
import WeatherForecast from './components/WeatherForecast'
import PictureWall from './components/PictureWall'
import ExamRecords from './components/ExamRecords'
import WordList from './components/WordList'
import Bank from './components/Bank'
import './styles/App.css'

function App() {
  const [activeSection, setActiveSection] = useState<string>('home')

  return (
    <div className="app">
      <header className="header">
        <h1>Welcome to Aiden's Website!</h1>
        <nav className="nav">
          <button 
            className={activeSection === 'home' ? 'active' : ''}
            onClick={() => setActiveSection('home')}
          >
            Home
          </button>
          <button 
            className={activeSection === 'chat' ? 'active' : ''}
            onClick={() => setActiveSection('chat')}
          >
            Chat with Little Si
          </button>
          <button 
            className={activeSection === 'videos' ? 'active' : ''}
            onClick={() => setActiveSection('videos')}
          >
            UNO Game
          </button>
          <button 
            className={activeSection === 'weather' ? 'active' : ''}
            onClick={() => setActiveSection('weather')}
          >
            Weather
          </button>
          <button 
            className={activeSection === 'pictures' ? 'active' : ''}
            onClick={() => setActiveSection('pictures')}
          >
            Picture Wall
          </button>
          <button 
            className={activeSection === 'exams' ? 'active' : ''}
            onClick={() => setActiveSection('exams')}
          >
            Exam Records
          </button>
          <button 
            className={activeSection === 'words' ? 'active' : ''}
            onClick={() => setActiveSection('words')}
          >
            English Words
          </button>
          <button 
            className={activeSection === 'bank' ? 'active' : ''}
            onClick={() => setActiveSection('bank')}
          >
            Aiden Bank
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeSection === 'home' && (
          <div className="home-section">
            <div className="cover-photo-container">
              <img 
                src="/cover-photo.jpg" 
                alt="Family Photo" 
                className="cover-photo"
              />
            </div>
            <PersonalInfo />
            <ParentFeedback />
          </div>
        )}
        {activeSection === 'chat' && <ChatBot />}
        {activeSection === 'videos' && <VideoGallery />}
        {activeSection === 'weather' && <WeatherForecast />}
        {activeSection === 'pictures' && <PictureWall />}
        {activeSection === 'exams' && <ExamRecords />}
        {activeSection === 'words' && <WordList />}
        {activeSection === 'bank' && <Bank />}
      </main>

      <footer className="footer">
        <p>Made with ❤️ for Aiden</p>
      </footer>
    </div>
  )
}

export default App

