import { useEffect, useMemo, useState } from 'react'
import './ParentFeedback.css'

type Parent = 'dad' | 'mom'
type Metric = 'accuracy' | 'attitude'
type FeedbackStatus = 'good' | 'bad' | null

interface ParentMetrics {
  accuracy: FeedbackStatus
  attitude: FeedbackStatus
}

interface DailyFeedback {
  dad: ParentMetrics
  mom: ParentMetrics
}

type FeedbackHistory = Record<string, DailyFeedback>

const FEEDBACK_STORAGE_KEY = 'aiden-parent-feedback'
const BANK_STORAGE_KEY = 'aiden-bank-entries'
const BANK_REWARD_AMOUNT = 2

const PARENT_LABELS: Record<Parent, string> = {
  dad: 'Dad',
  mom: 'Mom'
}

const METRIC_LABELS: Record<Metric, string> = {
  accuracy: 'Accuracy',
  attitude: 'Attitude'
}

const METRIC_DESCRIPTIONS: Record<Metric, string> = {
  accuracy: 'Did Aiden complete tasks carefully?',
  attitude: 'Was Aiden kind and respectful?'
}

const createEmptyFeedback = (): DailyFeedback => ({
  dad: { accuracy: null, attitude: null },
  mom: { accuracy: null, attitude: null }
})

const loadFeedbackHistory = (): FeedbackHistory => {
  try {
    const saved = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    if (!saved) return {}
    return JSON.parse(saved)
  } catch (error) {
    console.error('Failed to load feedback history', error)
    return {}
  }
}

const ParentFeedback = () => {
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [feedbackData, setFeedbackData] = useState<FeedbackHistory>(() => loadFeedbackHistory())
  const [rewardMessage, setRewardMessage] = useState('')

  const todayFeedback = feedbackData[todayKey] ?? createEmptyFeedback()

  useEffect(() => {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbackData))
  }, [feedbackData])

  const addBankReward = (description: string) => {
    try {
      const savedBank = localStorage.getItem(BANK_STORAGE_KEY)
      const bankEntries = savedBank ? JSON.parse(savedBank) : []
      const newEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        amount: BANK_REWARD_AMOUNT,
        description,
        category: 'reward'
      }
      const updatedBank = [newEntry, ...bankEntries]
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(updatedBank))
      setRewardMessage(`+HK$${BANK_REWARD_AMOUNT} added to Aiden Bank`)
      setTimeout(() => setRewardMessage(''), 3000)
    } catch (error) {
      console.error('Failed to add reward to bank', error)
    }
  }

  const handleStatusChange = (parent: Parent, metric: Metric, status: 'good' | 'bad') => {
    setFeedbackData((prev) => {
      const currentDay = prev[todayKey] ?? createEmptyFeedback()
      const previousStatus = currentDay[parent][metric]
      if (previousStatus === status) return prev

      const updatedDay: DailyFeedback = {
        ...currentDay,
        [parent]: {
          ...currentDay[parent],
          [metric]: status
        }
      }

      const nextData = {
        ...prev,
        [todayKey]: updatedDay
      }

      if (status === 'good' && previousStatus !== 'good') {
        addBankReward(`${PARENT_LABELS[parent]} marked ${METRIC_LABELS[metric]} as good`)
      }

      return nextData
    })
  }

  const historyEntries = useMemo(() => {
    return Object.entries(feedbackData)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
  }, [feedbackData])

  const formatDisplayDate = (key: string) => {
    const date = new Date(key)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <section className="parent-feedback section-card">
      <div className="page-title">
        <h2>Parent Scorecard</h2>
        <p>Dad and Mom mark today’s accuracy and attitude. Each “Good” adds HK$2 to Aiden Bank.</p>
        {rewardMessage && <span className="reward-badge">{rewardMessage}</span>}
      </div>

      <div className="feedback-grid">
        {(Object.keys(PARENT_LABELS) as Parent[]).map((parent) => (
          <div key={parent} className="parent-card">
            <h3>{PARENT_LABELS[parent]}</h3>
            {(Object.keys(METRIC_LABELS) as Metric[]).map((metric) => {
              const status = todayFeedback[parent][metric]
              return (
                <div key={metric} className="metric-row">
                  <div>
                    <p className="metric-title">{METRIC_LABELS[metric]}</p>
                    <p className="metric-description">{METRIC_DESCRIPTIONS[metric]}</p>
                  </div>
                  <div className="metric-actions">
                    <button
                      className={`metric-btn ${status === 'good' ? 'selected good' : ''}`}
                      onClick={() => handleStatusChange(parent, metric, 'good')}
                    >
                      Good
                    </button>
                    <button
                      className={`metric-btn ${status === 'bad' ? 'selected bad' : ''}`}
                      onClick={() => handleStatusChange(parent, metric, 'bad')}
                    >
                      Needs Work
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {historyEntries.length > 0 && (
        <div className="history-panel">
          <h4>Recent Check-ins</h4>
          <div className="history-list">
            {historyEntries.map(([dateKey, record]) => (
              <div key={dateKey} className="history-row">
                <div className="history-date">
                  <span>{formatDisplayDate(dateKey)}</span>
                  <small>{dateKey}</small>
                </div>
                <div className="history-status">
                  {(Object.keys(PARENT_LABELS) as Parent[]).map((parent) => (
                    <div key={parent} className="history-parent">
                      <span className="parent-label">{PARENT_LABELS[parent]}</span>
                      {(Object.keys(METRIC_LABELS) as Metric[]).map((metric) => {
                        const status = record[parent][metric]
                        return (
                          <span
                            key={`${parent}-${metric}`}
                            className={`status-chip ${
                              status === 'good' ? 'chip-good' : status === 'bad' ? 'chip-bad' : 'chip-empty'
                            }`}
                          >
                            {METRIC_LABELS[metric][0]}
                          </span>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default ParentFeedback

