import { useEffect, useMemo, useState } from 'react'
import './Bank.css'
import { fetchBankEntries, saveBankEntry, deleteBankEntry } from '../lib/supabaseService'

type BankCategory = 'reward' | 'red-packet' | 'gift' | 'other'

interface BankEntry {
  id: string
  date: string
  amount: number
  description: string
  category: BankCategory
}

const CATEGORY_LABELS: Record<BankCategory, string> = {
  reward: 'Reward',
  'red-packet': 'Red Packet',
  gift: 'Gift',
  other: 'Other'
}

const LOCAL_STORAGE_KEY = 'aiden-bank-entries'

const formatCurrency = (amount: number) =>
  `HK$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const Bank = () => {
  const [entries, setEntries] = useState<BankEntry[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<BankCategory>('reward')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const supabaseEntries = await fetchBankEntries()
        if (supabaseEntries.length > 0) {
          setEntries(supabaseEntries)
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
          if (saved) {
            try {
              const localEntries = JSON.parse(saved)
              setEntries(localEntries)
              // Migrate to Supabase
              for (const entry of localEntries) {
                await saveBankEntry(entry)
              }
            } catch (err) {
              console.error('Failed to parse bank entries from storage', err)
            }
          }
        }
      } catch (error) {
        console.error('Error loading bank entries:', error)
        // Fallback to localStorage
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (saved) {
          try {
            setEntries(JSON.parse(saved))
          } catch (err) {
            console.error('Failed to parse bank entries from storage', err)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Sync to localStorage and Supabase
  useEffect(() => {
    if (entries.length >= 0 && !isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(entries))
    }
  }, [entries, isLoading])

  const balance = useMemo(
    () => entries.reduce((total, entry) => total + entry.amount, 0),
    [entries]
  )

  const handleAddEntry = async () => {
    setError('')
    const parsedAmount = parseFloat(amount)

    if (!description.trim()) {
      setError('Please enter a description.')
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number.')
      return
    }

    const newEntry: BankEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: parsedAmount,
      description: description.trim(),
      category
    }

    const success = await saveBankEntry(newEntry)
    if (success) {
      setEntries((prev) => [newEntry, ...prev])
      setDescription('')
      setAmount('')
      setCategory('reward')
    } else {
      setError('Failed to save entry to database')
    }
  }

  const handleQuickAdd = async (value: number, label: string) => {
    const newEntry: BankEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount: value,
      description: label,
      category: 'reward'
    }
    const success = await saveBankEntry(newEntry)
    if (success) {
      setEntries((prev) => [newEntry, ...prev])
    } else {
      alert('Failed to save entry to database')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    const success = await deleteBankEntry(id)
    if (success) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    } else {
      alert('Failed to delete entry from database')
    }
  }

  return (
    <div className="bank section-card">
      <div className="page-title">
        <h2>Aiden Bank</h2>
        <p>Track every reward, red packet, and gift</p>
        <div className="balance-card">
          <span className="balance-label">Current Balance</span>
          <span className="balance-value">{formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="bank-grid">
        <div className="bank-form">
          <h3>Add New Entry</h3>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Homework reward, Birthday red packet"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Amount (HK$)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as BankCategory)}>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-btn" onClick={handleAddEntry}>
            Add to Bank
          </button>

          <div className="quick-add-section">
            <p>Quick Add</p>
            <div className="quick-buttons">
              {[10, 20, 50, 100].map((value) => (
                <button key={value} onClick={() => handleQuickAdd(value, `Quick reward +$${value}`)}>
                  +HK$ {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bank-history">
          <div className="history-header">
            <h3>Recent Entries</h3>
            <span>{entries.length} record{entries.length === 1 ? '' : 's'}</span>
          </div>
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>No entries yet. Add the first reward to get started!</p>
            </div>
          ) : (
            <div className="history-list">
              {entries.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div>
                    <p className="history-description">{entry.description}</p>
                    <p className="history-meta">
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span className={`tag tag-${entry.category}`}>{CATEGORY_LABELS[entry.category]}</span>
                    </p>
                  </div>
                  <div className="history-amount">
                    <span>{formatCurrency(entry.amount)}</span>
                    <button className="delete-btn" onClick={() => handleDeleteEntry(entry.id)}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Bank

