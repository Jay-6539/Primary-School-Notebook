import { useState, useEffect } from 'react'
import './VideoGallery.css'

type Player = 'mama' | 'baba' | 'aiden'

interface PlayerScore {
  player: Player
  stars: number
  moons: number
  suns: number
  totalWins: number
}

const PLAYER_LABELS: Record<Player, string> = {
  mama: 'Mama',
  baba: 'Baba',
  aiden: 'Aiden'
}

const UNO_IMAGE_URL =
  'https://www.toysrus.com.hk/dw/image/v2/BDGJ_PRD/on/demandware.static/-/Sites-master-catalog-toysrus/default/dwdb1318cd/1/2/4/8/12489433f2ff87dff39e30006c9ccfbf2529d82f_45918_02.jpg?sw=500&sh=500&q=75'

const PLAYER_EMOJIS: Record<Player, string> = {
  mama: '👩',
  baba: '👨',
  aiden: '👦'
}

const LOCAL_STORAGE_KEY = 'uno-game-scores'

const VideoGallery = () => {
  const [scores, setScores] = useState<PlayerScore[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback to default
      }
    }
    return [
      { player: 'mama', stars: 0, moons: 0, suns: 0, totalWins: 0 },
      { player: 'baba', stars: 0, moons: 0, suns: 0, totalWins: 0 },
      { player: 'aiden', stars: 0, moons: 0, suns: 0, totalWins: 0 }
    ]
  })

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scores))
  }, [scores])

  const handleWin = (player: Player) => {
    setScores(prevScores => {
      const newScores = prevScores.map(score => {
        if (score.player === player) {
          let newStars = score.stars + 1
          let newMoons = score.moons
          let newSuns = score.suns
          
          // Convert 5 stars to 1 moon
          if (newStars >= 5) {
            newMoons += Math.floor(newStars / 5)
            newStars = newStars % 5
          }
          
          // Convert 5 moons to 1 sun
          if (newMoons >= 5) {
            newSuns += Math.floor(newMoons / 5)
            newMoons = newMoons % 5
          }
          
          return {
            ...score,
            stars: newStars,
            moons: newMoons,
            suns: newSuns,
            totalWins: score.totalWins + 1
          }
        }
        return score
      })
      return newScores
    })
  }

  const handleReset = (player: Player) => {
    if (confirm(`Reset ${PLAYER_LABELS[player]}'s score?`)) {
      setScores(prevScores =>
        prevScores.map(score =>
          score.player === player
            ? { ...score, stars: 0, moons: 0, suns: 0, totalWins: 0 }
            : score
        )
      )
    }
  }

  const renderBadges = (score: PlayerScore) => {
    const badges = []
    
    // Add suns
    for (let i = 0; i < score.suns; i++) {
      badges.push(<span key={`sun-${i}`} className="badge sun">☀️</span>)
    }
    
    // Add moons
    for (let i = 0; i < score.moons; i++) {
      badges.push(<span key={`moon-${i}`} className="badge moon">🌙</span>)
    }
    
    // Add stars
    for (let i = 0; i < score.stars; i++) {
      badges.push(<span key={`star-${i}`} className="badge star">⭐</span>)
    }
    
    return badges.length > 0 ? badges : <span className="no-badges">No wins yet</span>
  }

  return (
    <div className="uno-game section-card">
      <div className="page-title">
        <h2>UNO Game Score</h2>
        <p>Click on a player to record a win!</p>
        <div className="page-image">
          <img src={UNO_IMAGE_URL} alt="UNO card deck" />
        </div>
      </div>
      
      <div className="players-grid">
        {scores.map(score => (
          <div key={score.player} className="player-card">
            <div className="player-header">
              <span className="player-emoji">{PLAYER_EMOJIS[score.player]}</span>
              <h3>{PLAYER_LABELS[score.player]}</h3>
            </div>
            
            <div className="player-badges">
              {renderBadges(score)}
            </div>
            
            <div className="player-stats">
              <div className="stat-item">
                <span className="stat-label">Total Wins:</span>
                <span className="stat-value">{score.totalWins}</span>
              </div>
              <div className="stat-breakdown">
                {score.suns > 0 && <span>{score.suns} ☀️</span>}
                {score.moons > 0 && <span>{score.moons} 🌙</span>}
                {score.stars > 0 && <span>{score.stars} ⭐</span>}
              </div>
            </div>
            
            <div className="player-actions">
              <button
                className="win-button"
                onClick={() => handleWin(score.player)}
              >
                + Win
              </button>
              <button
                className="reset-button"
                onClick={() => handleReset(score.player)}
              >
                Reset
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="rules-info">
        <h3>Rules</h3>
        <ul>
          <li>⭐ 1 win = 1 star</li>
          <li>🌙 5 stars = 1 moon</li>
          <li>☀️ 5 moons = 1 sun</li>
        </ul>
      </div>
    </div>
  )
}

export default VideoGallery
