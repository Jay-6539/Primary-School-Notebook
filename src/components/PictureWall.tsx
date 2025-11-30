import { useState, useEffect } from 'react'
import { fetchPictures, savePicture, deletePicture, uploadPictureToStorage, type Picture } from '../lib/supabaseService'

interface LocalPicture {
  id: string
  url: string
  title?: string
  isUploaded?: boolean // To distinguish uploaded images from default ones
}

const PictureWall = () => {
  const [pictures, setPictures] = useState<LocalPicture[]>([])
  const [selectedPicture, setSelectedPicture] = useState<LocalPicture | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load uploaded pictures from Supabase on mount
  useEffect(() => {
    const loadPictures = async () => {
      setIsLoading(true)
      try {
        console.log('Loading pictures from Supabase...')
        const supabasePictures = await fetchPictures()
        
        if (supabasePictures.length > 0) {
          // Convert Supabase Picture to LocalPicture
          const localPictures: LocalPicture[] = supabasePictures.map(p => ({
            id: p.id,
            url: p.url,
            title: p.title,
            isUploaded: p.isUploaded
          }))
          console.log(`Loaded ${localPictures.length} pictures from Supabase`)
          setPictures(localPictures)
          // Also save to localStorage as backup
          savePicturesToLocal(localPictures)
        } else {
          console.log('No pictures in Supabase, checking localStorage...')
          // Fallback to localStorage (for migration)
          const savedPictures = localStorage.getItem('aiden-picture-wall')
          if (savedPictures) {
            try {
              const uploadedPictures = JSON.parse(savedPictures)
              console.log(`Found ${uploadedPictures.length} pictures in localStorage, migrating...`)
              
              // Only migrate if they are base64 (old format), not Storage URLs
              const needsMigration = uploadedPictures.some((p: LocalPicture) => 
                p.url && p.url.startsWith('data:image')
              )
              
              if (needsMigration) {
                console.log('Detected base64 images, skipping migration (use Storage upload instead)')
                setPictures([])
              } else {
                // These are already Storage URLs, just save to database
                for (const pic of uploadedPictures) {
                  const supabasePic: Picture = {
                    id: pic.id,
                    url: pic.url,
                    title: pic.title,
                    isUploaded: pic.isUploaded !== false
                  }
                  await savePicture(supabasePic)
                }
                // Reload from Supabase after migration
                const migratedPictures = await fetchPictures()
                const localPictures: LocalPicture[] = migratedPictures.map(p => ({
                  id: p.id,
                  url: p.url,
                  title: p.title,
                  isUploaded: p.isUploaded
                }))
                setPictures(localPictures)
              }
            } catch (e) {
              console.error('Error loading saved pictures:', e)
            }
          } else {
            console.log('No pictures found in localStorage either')
          }
        }
      } catch (error) {
        console.error('Error loading pictures:', error)
        // Fallback to localStorage
        const savedPictures = localStorage.getItem('aiden-picture-wall')
        if (savedPictures) {
          try {
            const uploadedPictures = JSON.parse(savedPictures)
            setPictures(uploadedPictures)
          } catch (e) {
            console.error('Error loading saved pictures:', e)
          }
        }
      } finally {
        setIsLoading(false)
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image to upload')
      return
    }

    setIsUploading(true)
    const uploadErrors: string[] = []
    
    try {
      console.log(`开始上传 ${selectedFiles.length} 张图片...`)
      
      // Upload files to Supabase Storage one by one to catch individual errors
      const uploadedPictures: LocalPicture[] = []
      
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index]
        // Generate UUID v4 format for database ID
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
        }
        const id = generateUUID()
        const fileExtension = file.name.split('.').pop() || 'jpg'
        const fileName = `uploaded-${Date.now()}-${index}.${fileExtension}`
        const title = selectedFiles.length === 1 ? uploadTitle : `${uploadTitle || 'Uploaded image'} ${index + 1}`

        try {
          console.log(`正在上传第 ${index + 1}/${selectedFiles.length} 张图片: ${file.name}`)
          
          // Upload to Storage
          const storageUrl = await uploadPictureToStorage(file, fileName)
          if (!storageUrl) {
            const errorMsg = `Failed to upload ${file.name} to storage. Please check: 1) Storage bucket "pictures" exists 2) Permission policies are set 3) Browser console for error details`
            console.error(errorMsg)
            uploadErrors.push(errorMsg)
            continue
          }

          console.log(`图片 ${file.name} 上传成功，URL: ${storageUrl}`)

          const picture: LocalPicture = {
            id,
            url: storageUrl,
            title,
            isUploaded: true
          }

          // Save picture metadata to database
          const supabasePic: Picture = {
            id: picture.id,
            url: picture.url,
            title: picture.title,
            isUploaded: picture.isUploaded !== false
          }
          
          const success = await savePicture(supabasePic)
          if (!success) {
            const errorMsg = `Failed to save picture ${picture.title || picture.id} to database`
            console.error(errorMsg)
            uploadErrors.push(errorMsg)
            continue
          }

          uploadedPictures.push(picture)
          console.log(`图片 ${file.name} 已保存到数据库`)
        } catch (error) {
          const errorMsg = `Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg, error)
          uploadErrors.push(errorMsg)
        }
      }

      if (uploadErrors.length > 0) {
        alert(`Some images failed to upload:\n${uploadErrors.join('\n')}\n\nPlease check the browser console for detailed information.`)
      }

      if (uploadedPictures.length > 0) {
        // Reload from Supabase to ensure sync
        const allPictures = await fetchPictures()
        const localPictures: LocalPicture[] = allPictures.map(p => ({
          id: p.id,
          url: p.url,
          title: p.title,
          isUploaded: p.isUploaded
        }))
        
        setPictures(localPictures)
        savePicturesToLocal(localPictures)
        
        if (uploadedPictures.length === selectedFiles.length) {
          alert(`Successfully uploaded ${uploadedPictures.length} image(s)!`)
        } else {
          alert(`Successfully uploaded ${uploadedPictures.length}/${selectedFiles.length} image(s). ${uploadErrors.length} failed.`)
        }
      } else {
        alert(`All images failed to upload. Please check:\n1. Storage bucket "pictures" exists\n2. Permission policies are correctly set\n3. Browser console for error details\n\nError details:\n${uploadErrors.join('\n')}`)
      }
      
      setSelectedFiles([])
      setUploadTitle('')
      setShowUploadForm(false)
    } catch (error) {
      console.error('Error uploading pictures:', error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the browser console for detailed information.`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePicture = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const picture = pictures.find(p => p.id === id)
    const pictureTitle = picture?.title || 'this picture'
    if (confirm(`Are you sure you want to delete ${pictureTitle}? This action cannot be undone.`)) {
      try {
        const success = await deletePicture(id, picture?.url)
        if (success) {
          // Reload from Supabase to ensure sync
          const allPictures = await fetchPictures()
          const localPictures: LocalPicture[] = allPictures.map(p => ({
            id: p.id,
            url: p.url,
            title: p.title,
            isUploaded: p.isUploaded
          }))
          setPictures(localPictures)
          savePicturesToLocal(localPictures)
        } else {
          alert('Failed to delete. Please try again later.')
        }
      } catch (error) {
        console.error('Error deleting picture:', error)
        alert('An error occurred while deleting. Please try again later.')
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
          <button 
            className="upload-submit-btn" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Pictures'}
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading images...</p>
        </div>
      ) : (
        <>
          {pictures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>No images uploaded yet</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click the button above to start uploading</p>
            </div>
          ) : (
            <div className="picture-grid">
              {pictures.map((picture) => (
                <div
                  key={picture.id}
                  className="picture-item"
                  onClick={() => setSelectedPicture(picture)}
                >
                  <button
                    className="delete-picture-btn"
                    onClick={(e) => handleDeletePicture(picture.id, e)}
                    title="Delete photo"
                  >
                    ×
                  </button>
                  <img src={picture.url} alt={picture.title || 'Picture'} />
                  {picture.title && <div className="picture-title">{picture.title}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

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

