import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import SkeletonCard from '../components/SkeletonCard'
import { usePlayerContext } from '../PlayerContext'

async function resolveArtistId(id) {
  const isNumeric = /^\d+$/.test(id)

  if (!isNumeric) {
    const decodedName = decodeURIComponent(id)
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(decodedName)}&entity=musicArtist&limit=1`)
    const data = await res.json()
    const found = data?.results?.[0]
    return found ? String(found.artistId) : null
  }

  // Numeric — verify by getting artist name then re-searching
  const checkRes = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song&limit=1`).then(r => r.json())
  const artistName = checkRes?.results?.find(r => r.wrapperType === 'track')?.artistName
  if (!artistName) return id

  const searchRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`).then(r => r.json())
  const found = searchRes?.results?.[0]
  return found ? String(found.artistId) : id
}

async function getArtistData(artistId) {
  const [tracksRes, albumsRes] = await Promise.all([
    fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=10`).then(r => r.json()),
    fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=8`).then(r => r.json()),
  ])

  const tracks = (tracksRes?.results || [])
    .filter(r => r.wrapperType === 'track')
    .map(t => ({
      id: String(t.trackId),
      name: t.trackName,
      artistName: t.artistName,
      image: t.artworkUrl100?.replace('100x100', '400x400'),
      previewUrl: t.previewUrl || null,
      album: t.collectionName,
      duration: t.trackTimeMillis,
    })).filter(t => t.image)

  const albums = (albumsRes?.results || []).filter(r => r.wrapperType === 'collection')

  return { tracks, albums }
}

function Artist() {
  const { id } = useParams()
  const navigate = useNavigate()
  const player = usePlayerContext()
  const [artistName, setArtistName] = useState('')
  const [albums, setAlbums] = useState([])
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const resolvedId = await resolveArtistId(id)
        if (!resolvedId || cancelled) { if (!cancelled) setLoading(false); return }

        const { tracks: t, albums: a } = await getArtistData(resolvedId)
        if (cancelled) return

        const name = t[0]?.artistName || a[0]?.artistName || ''
        setArtistName(name)
        setTracks(t)
        setAlbums(a)
        setLoading(false)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="artist-page">
        <div className="artist-hero-skeleton" />
        <div className="page-content">
          <div className="genre-row-scroll">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        </div>
      </div>
    )
  }

  const artistImg = tracks[0]?.image || albums[0]?.artworkUrl100?.replace('100x100', '400x400')

  return (
    <div className="artist-page">
      <div className="artist-hero" style={artistImg ? { '--artist-bg': `url(${artistImg})` } : {}}>
        <div className="artist-hero-bg" />
        <div className="artist-hero-overlay" />
        <div className="artist-hero-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <p className="artist-eyebrow">Artist</p>
          <h1 className="artist-name">{artistName || 'Artist'}</h1>
        </div>
      </div>

      <div className="page-content">
        {tracks.length > 0 && (
          <section className="artist-section">
            <h2 className="section-title">Popular Tracks</h2>
            <div className="top-tracks-list">
              {tracks.map((track, i) => {
                const isActive = player.currentTrack?.trackId === track.id
                return (
                  <motion.div
                    key={track.id}
                    className={`top-track-row ${isActive ? 'top-track-row--active' : ''}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <span className="top-track-num">{i + 1}</span>
                    <div className="top-track-thumb">
                      {track.image && <img src={track.image} alt={track.name} />}
                    </div>
                    <button
                      className="top-track-play"
                      onClick={() => player.play({ trackId: track.id, trackName: track.name, artistName: track.artistName, artworkUrl100: track.image, previewUrl: track.previewUrl })}
                    >
                      {isActive && player.isPlaying ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                      )}
                    </button>
                    <div className="top-track-info">
                      <span className="top-track-name">{track.name}</span>
                      <span className="top-track-album">{track.album}</span>
                    </div>
                    <span className="top-track-plays">
                      {track.duration ? `${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}` : ''}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {albums.length > 0 && (
          <section className="artist-section">
            <h2 className="section-title">Albums</h2>
            <div className="genre-row-scroll" style={{ padding: 0 }}>
              {albums.map((album, i) => (
                <motion.div key={album.collectionId} className="similar-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="similar-card-art">
                    {album.artworkUrl100
                      ? <img src={album.artworkUrl100.replace('100x100', '400x400')} alt={album.collectionName} />
                      : <div className="similar-card-no-img">♪</div>}
                  </div>
                  <p className="similar-card-name">{album.collectionName}</p>
                  <p className="similar-card-label">{album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'Album'}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Artist