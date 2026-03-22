import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

function useFavourites() {
  const [favs, setFavs] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('wavelength-favourites') || '[]')
    return new Set(saved.map(f => f.id))
  })

  const toggle = (track) => {
    const saved = JSON.parse(localStorage.getItem('wavelength-favourites') || '[]')
    const newSet = new Set(favs)
    if (newSet.has(track.id)) {
      const updated = saved.filter(f => f.id !== track.id)
      localStorage.setItem('wavelength-favourites', JSON.stringify(updated))
      newSet.delete(track.id)
    } else {
      // Save previewUrl so Favourites page can play without extra fetch
      saved.push({
        id: track.id,
        name: track.name,
        artistName: track.artistName,
        artistId: track.artistId,
        image: track.image,
        previewUrl: track.previewUrl || null,
      })
      localStorage.setItem('wavelength-favourites', JSON.stringify(saved))
      newSet.add(track.id)
    }
    setFavs(newSet)
  }

  return { favs, toggle }
}

function TrackCard({ track, index, onPlay, currentTrack, isPlaying }) {
  const [hovered, setHovered] = useState(false)
  const { favs, toggle } = useFavourites()
  const navigate = useNavigate()

  if (!track) return null

  const isActive = currentTrack?.trackId === track.id && isPlaying
  const isFaved = favs.has(track.id)

  const handlePlay = (e) => {
    e.stopPropagation()
    onPlay({ trackId: track.id, trackName: track.name, artistName: track.artistName, artworkUrl100: track.image, previewUrl: track.previewUrl })
  }

  const handleFav = (e) => {
    e.stopPropagation()
    toggle(track)
  }

  return (
    <motion.div
      className={`track-card ${isActive ? 'track-card--active' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => track.artistId && navigate(`/artist/${track.artistId}`)}
    >
      <div className="track-card-art-wrap">
        {track.image
          ? <img src={track.image} alt={track.name} className="track-card-art" />
          : <div className="track-card-no-art">♪</div>}
        <div className={`track-card-overlay ${hovered || isActive ? 'track-card-overlay--show' : ''}`}>
          <button className={`track-card-play-btn ${isActive ? 'active' : ''}`} onClick={handlePlay}>
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
        <button
          className={`track-card-fav ${isFaved ? 'track-card-fav--active' : ''} ${hovered || isFaved ? 'track-card-fav--show' : ''}`}
          onClick={handleFav}
          aria-label={isFaved ? 'Remove from favourites' : 'Add to favourites'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={isFaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <div className="track-card-info">
        <p className="track-card-name">{track.name}</p>
        <p className="track-card-artist">{track.artistName}</p>
      </div>
    </motion.div>
  )
}

export default TrackCard