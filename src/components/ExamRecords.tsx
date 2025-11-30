import { useState, useEffect } from 'react'
import './ExamRecords.css'

interface ExamRecord {
  id: string
  title: string
  subject: string
  date: string
  score?: string
  images: string[] // Base64 encoded images
  notes?: string
}

function ExamRecords() {
  const [records, setRecords] = useState<ExamRecord[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<ExamRecord>>({
    title: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    score: '',
    notes: '',
    images: []
  })
  // Load records from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('aiden-exam-records')
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords))
    }
  }, [])

  // Save records to localStorage whenever records change
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('aiden-exam-records', JSON.stringify(records))
    }
  }, [records])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Convert files to base64
    const imagePromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          resolve(event.target?.result as string)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises).then(base64Images => {
      setNewRecord(prev => ({
        ...prev,
        images: [...(prev.images || []), ...base64Images]
      }))
    })
  }

  const handleRemoveImage = (index: number) => {
    setNewRecord(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }))
  }

  const handleAddRecord = () => {
    if (!newRecord.title || !newRecord.subject || !newRecord.date) {
      alert('Please fill in all required fields (Title, Subject, Date)')
      return
    }

    const record: ExamRecord = {
      id: Date.now().toString(),
      title: newRecord.title!,
      subject: newRecord.subject!,
      date: newRecord.date!,
      score: newRecord.score,
      images: newRecord.images || [],
      notes: newRecord.notes
    }

    setRecords([...records, record])
    setNewRecord({
      title: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      score: '',
      notes: '',
      images: []
    })
    setShowAddForm(false)
  }

  const handleDeleteRecord = (id: string) => {
    if (confirm('Are you sure you want to delete this exam record?')) {
      setRecords(records.filter(record => record.id !== id))
    }
  }

  return (
    <div className="exam-records section-card">
      <div className="page-title">
        <h2>Exam Records</h2>
        <p>Store every exam result, notes, and photos here</p>
        <button 
          className="primary-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add New Exam'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-record-form">
          <h3>Add New Exam Record</h3>
          <div className="form-group">
            <label>Exam Title *</label>
            <input
              type="text"
              value={newRecord.title}
              onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
              placeholder="e.g., Mid-term Test, Final Exam"
            />
          </div>
          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              value={newRecord.subject}
              onChange={(e) => setNewRecord({...newRecord, subject: e.target.value})}
              placeholder="e.g., Mathematics, English"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Score (Optional)</label>
              <input
                type="text"
                value={newRecord.score}
                onChange={(e) => setNewRecord({...newRecord, score: e.target.value})}
                placeholder="e.g., 95/100, A+"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              value={newRecord.notes}
              onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
              placeholder="Add any notes about this exam..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Upload Exam Paper Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="file-input"
            />
            {newRecord.images && newRecord.images.length > 0 && (
              <div className="image-preview-container">
                {newRecord.images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image} alt={`Preview ${index + 1}`} />
                    <button
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="submit-btn" onClick={handleAddRecord}>
            Save Exam Record
          </button>
        </div>
      )}

      <div className="records-list">
        {records.length === 0 ? (
          <div className="empty-state">
            <p>No exam records yet. Click "Add New Exam" to get started!</p>
          </div>
        ) : (
          records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(record => (
              <div key={record.id} className="record-card">
                <div className="record-header">
                  <div>
                    <h3>{record.title}</h3>
                    <p className="record-meta">
                      <span className="subject">{record.subject}</span>
                      <span className="date">{new Date(record.date).toLocaleDateString()}</span>
                      {record.score && <span className="score">Score: {record.score}</span>}
                    </p>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    🗑️
                  </button>
                </div>
                {record.notes && (
                  <p className="record-notes">{record.notes}</p>
                )}
                {record.images && record.images.length > 0 && (
                  <div className="record-images">
                    {record.images.map((image, index) => (
                      <div key={index} className="record-image">
                        <img 
                          src={image} 
                          alt={`${record.title} - Page ${index + 1}`}
                          onClick={() => {
                            // Open image in full screen
                            const newWindow = window.open()
                            if (newWindow) {
                              newWindow.document.write(`<img src="${image}" style="max-width:100%;height:auto;" />`)
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default ExamRecords


