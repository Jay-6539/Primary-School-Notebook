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
      alert('请至少选择一张图片上传')
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
        const title = selectedFiles.length === 1 ? uploadTitle : `${uploadTitle || '上传的图片'} ${index + 1}`

        try {
          console.log(`正在上传第 ${index + 1}/${selectedFiles.length} 张图片: ${file.name}`)
          
          // Upload to Storage
          const storageUrl = await uploadPictureToStorage(file, fileName)
          if (!storageUrl) {
            const errorMsg = `上传文件 ${file.name} 到存储失败。请检查：1) Storage bucket "pictures" 是否存在 2) 权限策略是否已设置 3) 浏览器控制台的错误信息`
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
            const errorMsg = `保存图片 ${picture.title || picture.id} 到数据库失败`
            console.error(errorMsg)
            uploadErrors.push(errorMsg)
            continue
          }

          uploadedPictures.push(picture)
          console.log(`图片 ${file.name} 已保存到数据库`)
        } catch (error) {
          const errorMsg = `上传 ${file.name} 时出错: ${error instanceof Error ? error.message : '未知错误'}`
          console.error(errorMsg, error)
          uploadErrors.push(errorMsg)
        }
      }

      if (uploadErrors.length > 0) {
        alert(`部分图片上传失败：\n${uploadErrors.join('\n')}\n\n请检查浏览器控制台获取详细信息。`)
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
          alert(`成功上传 ${uploadedPictures.length} 张图片！`)
        } else {
          alert(`成功上传 ${uploadedPictures.length}/${selectedFiles.length} 张图片。${uploadErrors.length} 张失败。`)
        }
      } else {
        alert(`所有图片上传失败。请检查：\n1. Storage bucket "pictures" 是否存在\n2. 权限策略是否已正确设置\n3. 浏览器控制台的错误信息\n\n错误详情：\n${uploadErrors.join('\n')}`)
      }
      
      setSelectedFiles([])
      setUploadTitle('')
      setShowUploadForm(false)
    } catch (error) {
      console.error('Error uploading pictures:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查浏览器控制台获取详细信息。`)
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

