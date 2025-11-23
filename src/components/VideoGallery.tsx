import { useState } from 'react'
import { videos, Video } from '../data/videos'

const VideoGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(videos[0])

  return (
    <div className="video-gallery">
      <h2>Favorite Videos</h2>
      <div className="video-container">
        <div className="video-player">
          {selectedVideo && (
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
          {selectedVideo && (
            <div className="video-info">
              <h3>{selectedVideo.title}</h3>
              {selectedVideo.description && <p>{selectedVideo.description}</p>}
            </div>
          )}
        </div>
        <div className="video-list">
          <h3>More Videos</h3>
          {videos.map((video) => (
            <div
              key={video.id}
              className={`video-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
              onClick={() => setSelectedVideo(video)}
            >
              <div className="video-thumbnail">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                />
              </div>
              <div className="video-item-info">
                <h4>{video.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoGallery

