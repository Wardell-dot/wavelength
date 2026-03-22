import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { usePlayerContext } from '../PlayerContext'

function Favourites() {
  const [favourites, setFavourites] = useState(() =>
    JSON.parse(localStorage.getItem('wavelength-favourites') || '[]')
  )
  const navigate = useNavigate()
  const player = usePlayerContext()

  const remove = (id) => {
    const updated = favourites.filter(f => f.id !== id)
    localStorage.setItem('wavelength-favourites', JSON.stringify(updated))
    setFavourites(updated)
  }

  const handlePlay = (item) => {
    player.play({
      trackId: item.id,
      trackName: item.name,
      artistName: item.artistName,
      artworkUrl100: item.image,
      previewUrl: item.previewUrl,
    })
  }

  return (
    <div className="favourites-page">
      <div className="search-header">
        <h1 className="page-title">Favourites</h1>
        {favourites.length > 0 && <p className="page-subtitle">{favourites.length} saved</p>}
      </div>

      {favourites.length === 0 && (
        <div className="page-content">
          <div className="empty-state">
            <p className="empty-msg">Nothing saved yet. Hover over any track and tap the heart.</p>
            <button className="hero-play-btn" onClick={() => navigate('/')}>Discover Music</button>
          </div>
        </div>
      )}

      <div className="page-content">
        <div className="fav-grid">
          {favourites.map((item, i) => {
            const isActive = player.currentTrack?.trackId === item.id && player.isPlaying
            return (
              <motion.div
                key={item.id}
                className="fav-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="fav-card-art-wrap" onClick={() => item.artistId && navigate(`/artist/${item.artistId}`)}>
                  {item.image
                    ? <img src={item.image} alt={item.name} className="track-card-art" />
                    : <div className="track-card-no-art">♪</div>}
                  <div className={`track-card-overlay track-card-overlay--show`}>
                    <button
                      className={`track-card-play-btn ${isActive ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handlePlay(item) }}
                    >
                      {isActive ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                          <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5.14v14l11-7-11-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="track-card-info">
                  <p className="track-card-name">{item.name}</p>
                  <p className="track-card-artist" style={{ cursor: 'pointer' }} onClick={() => item.artistId && navigate(`/artist/${item.artistId}`)}>
                    {item.artistName}
                  </p>
                  <button className="fav-remove-btn" onClick={() => remove(item.id)}>Remove</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Favourites