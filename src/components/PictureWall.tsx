import { useState, useEffect } from 'react'
import { fetchPictures, savePicture, deletePicture, type Picture } from '../lib/supabaseService'

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
        const supabasePictures = await fetchPictures()
        if (supabasePictures.length > 0) {
          // Convert Supabase Picture to LocalPicture
          const localPictures: LocalPicture[] = supabasePictures.map(p => ({
            id: p.id,
            url: p.url,
            title: p.title,
            isUploaded: p.isUploaded
          }))
          setPictures(localPictures)
          // Also save to localStorage as backup
          savePicturesToLocal(localPictures)
        } else {
          // Fallback to localStorage
          const savedPictures = localStorage.getItem('aiden-picture-wall')
          if (savedPictures) {
            try {
              const uploadedPictures = JSON.parse(savedPictures)
              setPictures(uploadedPictures)
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
              // Reload from Supabase after migration
              const migratedPictures = await fetchPictures()
              const localPictures: LocalPicture[] = migratedPictures.map(p => ({
                id: p.id,
                url: p.url,
                title: p.title,
                isUploaded: p.isUploaded
              }))
              setPictures(localPictures)
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
      alert('请至少选择一张图片上传')
      return
    }

    setIsUploading(true)
    try {
      const newPictures: Promise<LocalPicture>[] = selectedFiles.map((file, index) => {
        const reader = new FileReader()
        const id = `uploaded-${Date.now()}-${index}`
        
        return new Promise<LocalPicture>((resolve, reject) => {
          reader.onload = (event) => {
            resolve({
              id,
              url: event.target?.result as string,
              title: selectedFiles.length === 1 ? uploadTitle : `${uploadTitle || '上传的图片'} ${index + 1}`,
              isUploaded: true
            })
          }
          reader.onerror = () => {
            reject(new Error(`读取文件失败: ${file.name}`))
          }
          reader.readAsDataURL(file)
        })
      })

      const uploadedPictures = await Promise.all(newPictures)
      
      // Save to Supabase
      const savePromises = uploadedPictures.map(async (pic) => {
        const supabasePic: Picture = {
          id: pic.id,
          url: pic.url,
          title: pic.title,
          isUploaded: pic.isUploaded !== false
        }
        const success = await savePicture(supabasePic)
        if (!success) {
          throw new Error(`保存图片 ${pic.title || pic.id} 到数据库失败`)
        }
        return pic
      })

      await Promise.all(savePromises)
      
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
      setSelectedFiles([])
      setUploadTitle('')
      setShowUploadForm(false)
      alert(`成功上传 ${uploadedPictures.length} 张图片！`)
    } catch (error) {
      console.error('Error uploading pictures:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeletePicture = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const picture = pictures.find(p => p.id === id)
    const pictureTitle = picture?.title || '这张照片'
    if (confirm(`确定要删除 ${pictureTitle} 吗？此操作无法撤销。`)) {
      try {
        const success = await deletePicture(id)
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
          alert('删除失败，请稍后重试')
        }
      } catch (error) {
        console.error('Error deleting picture:', error)
        alert('删除时发生错误，请稍后重试')
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
            {isUploading ? '上传中...' : '上传图片'}
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>加载图片中...</p>
        </div>
      ) : (
        <>
          {pictures.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <p>还没有上传任何图片</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>点击上方按钮开始上传</p>
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
                    title="删除照片"
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

