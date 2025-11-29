import { useState, useEffect } from 'react'
import { fetchPictures, savePicture, deletePicture, type Picture } from '../lib/supabaseService'

interface LocalPicture {
  id: string
  url: string
  title?: string
  isUploaded?: boolean // To distinguish uploaded images from default ones
}

const defaultPictures: LocalPicture[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
    title: 'Fun Drawing',
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    title: 'Reading Time',
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    title: 'School Day',
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400',
    title: 'Learning',
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
    title: 'Artwork',
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
    title: 'Story Time',
  },
]

const PictureWall = () => {
  const [pictures, setPictures] = useState<LocalPicture[]>(defaultPictures)
  const [selectedPicture, setSelectedPicture] = useState<LocalPicture | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Load uploaded pictures from Supabase on mount
  useEffect(() => {
    const loadPictures = async () => {
      try {
        const supabasePictures = await fetchPictures()
        if (supabasePictures.length > 0) {
          // Convert Supabase Picture to LocalPicture
          const localPictures: LocalPicture[] = supabasePictures.map(p => ({
            id: p.id,
            url: p.url,
            title: p.title,
            isUploaded: p.isUploaded
          }))
          setPictures([...defaultPictures, ...localPictures])
        } else {
          // Fallback to localStorage
          const savedPictures = localStorage.getItem('aiden-picture-wall')
          if (savedPictures) {
            try {
              const uploadedPictures = JSON.parse(savedPictures)
              setPictures([...defaultPictures, ...uploadedPictures])
              // Migrate to Supabase
              for (const pic of uploadedPictures) {
                const supabasePic: Picture = {
                  id: pic.id,
                  url: pic.url,
                  title: pic.title,
                  isUploaded: pic.isUploaded !== false
                }
                await savePicture(supabasePic)
              }
            } catch (e) {
              console.error('Error loading saved pictures:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error loading pictures:', error)
        // Fallback to localStorage
        const savedPictures = localStorage.getItem('aiden-picture-wall')
        if (savedPictures) {
          try {
            const uploadedPictures = JSON.parse(savedPictures)
            setPictures([...defaultPictures, ...uploadedPictures])
          } catch (e) {
            console.error('Error loading saved pictures:', e)
          }
        }
      }
    }
    loadPictures()
  }, [])

  // Save uploaded pictures to localStorage (for backward compatibility)
  const savePicturesToLocal = (newPictures: LocalPicture[]) => {
    const uploadedPictures = newPictures.filter(p => p.isUploaded)
    localStorage.setItem('aiden-picture-wall', JSON.stringify(uploadedPictures))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image to upload')
      return
    }

    const newPictures: Promise<LocalPicture>[] = selectedFiles.map((file, index) => {
      const reader = new FileReader()
      const id = `uploaded-${Date.now()}-${index}`
      
      return new Promise<LocalPicture>((resolve) => {
        reader.onload = (event) => {
          resolve({
            id,
            url: event.target?.result as string,
            title: selectedFiles.length === 1 ? uploadTitle : `${uploadTitle || 'Uploaded Image'} ${index + 1}`,
            isUploaded: true
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(newPictures).then(async (uploadedPictures) => {
      // Save to Supabase
      for (const pic of uploadedPictures) {
        const supabasePic: Picture = {
          id: pic.id,
          url: pic.url,
          title: pic.title,
          isUploaded: pic.isUploaded !== false
        }
        await savePicture(supabasePic)
      }
      const updatedPictures = [...pictures, ...uploadedPictures]
      setPictures(updatedPictures)
      savePicturesToLocal(updatedPictures)
      setSelectedFiles([])
      setUploadTitle('')
      setShowUploadForm(false)
    })
  }

  const handleDeletePicture = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this picture?')) {
      const success = await deletePicture(id)
      if (success) {
        const updatedPictures = pictures.filter(p => p.id !== id)
        setPictures(updatedPictures)
        savePicturesToLocal(updatedPictures)
      } else {
        alert('Failed to delete picture from database')
      }
    }
  }

  return (
    <div className="picture-wall section-card">
      <div className="page-title">
        <h2>Picture Wall</h2>
        <p>Click on any picture to view it larger</p>
        <button 
          className="primary-btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? 'Cancel Upload' : '+ Upload Pictures'}
        </button>
      </div>

      {showUploadForm && (
        <div className="upload-form">
          <h3>Upload New Pictures</h3>
          <div className="upload-form-group">
            <label>Picture Title (Optional)</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., My Drawing, Family Photo"
            />
          </div>
          <div className="upload-form-group">
            <label>Select Pictures</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFiles.length > 0 && (
              <p className="file-count">{selectedFiles.length} file(s) selected</p>
            )}
          </div>
          <button className="upload-submit-btn" onClick={handleUpload}>
            Upload Pictures
          </button>
        </div>
      )}
      
      <div className="picture-grid">
        {pictures.map((picture) => (
          <div
            key={picture.id}
            className="picture-item"
            onClick={() => setSelectedPicture(picture)}
          >
            {picture.isUploaded && (
              <button
                className="delete-picture-btn"
                onClick={(e) => handleDeletePicture(picture.id, e)}
                title="Delete picture"
              >
                ×
              </button>
            )}
            <img src={picture.url} alt={picture.title || 'Picture'} />
            {picture.title && <div className="picture-title">{picture.title}</div>}
          </div>
        ))}
      </div>

      {selectedPicture && (
        <div className="picture-modal" onClick={() => setSelectedPicture(null)}>
          <div className="picture-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedPicture(null)}>
              ×
            </button>
            <img src={selectedPicture.url} alt={selectedPicture.title || 'Picture'} />
            {selectedPicture.title && <h3>{selectedPicture.title}</h3>}
          </div>
        </div>
      )}
    </div>
  )
}

export default PictureWall

