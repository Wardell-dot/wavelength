import { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import TrackCard from '../components/TrackCard'
import SkeletonCard from '../components/SkeletonCard'
import ScrollRow from '../components/ScrollRow'
import { usePlayerContext } from '../PlayerContext'
import { getTopTracks, getGenreTracks } from '../spotify'

const ROWS = [
  { label: 'Top Songs Right Now', type: 'top' },
  { label: 'Hip-Hop', type: 'genre', term: 'hip hop rap 2024 2025' },
  { label: 'R&B / Soul', type: 'genre', term: 'R&B soul 2024 2025' },
  { label: 'Afrobeats', type: 'genre', term: 'afrobeats afropop burna wizkid davido 2024 2025' },
  { label: 'Pop', type: 'genre', term: 'pop hits 2024 2025' },
  { label: 'Electronic', type: 'genre', term: 'electronic dance house 2024 2025' },
  { label: 'Rock', type: 'genre', term: 'rock indie alternative 2024 2025' },
  { label: 'Jazz', type: 'genre', term: 'jazz 2024 2025' },
]

function PlaylistRow({ row, player }) {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetch = row.type === 'top'
      ? getTopTracks(12)
      : getGenreTracks(row.term, 12)

    fetch
      .then(data => { if (!cancelled) { setTracks(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [row.type, row.term])

  return (
    <section className="genre-row">
      <div className="genre-row-header">
        <h2 className="genre-row-title">{row.label}</h2>
      </div>
      <ScrollRow>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} onPlay={player.play} currentTrack={player.currentTrack} isPlaying={player.isPlaying} />
            ))}
      </ScrollRow>
    </section>
  )
}

function HeroBanner({ player }) {
  const [tracks, setTracks] = useState([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    getTopTracks(5)
      .then(data => setTracks(data.filter(t => t.image)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (tracks.length === 0) return
    const t = setInterval(() => setIndex(i => (i + 1) % tracks.length), 5000)
    return () => clearInterval(t)
  }, [tracks])

  const hero = tracks[index]

  const handlePlay = () => {
    if (!hero) return
    player.play({ trackId: hero.id, trackName: hero.name, artistName: hero.artistName, artworkUrl100: hero.image, previewUrl: hero.previewUrl })
  }

  return (
    <div className="hero-banner" style={hero?.image ? { '--hero-bg': `url(${hero.image})` } : {}}>
      <div className="hero-banner-bg" />
      <div className="hero-banner-content">
        {hero ? (
          <>
            <p className="hero-banner-eyebrow">Top Charts</p>
            <h1 className="hero-banner-title">{hero.name}</h1>
            <p className="hero-banner-artist">{hero.artistName}</p>
            <div className="hero-banner-actions">
              <button className="hero-play-btn" onClick={handlePlay}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                {hero.previewUrl ? 'Play Preview' : 'View Artist'}
              </button>
            </div>
          </>
        ) : <p className="hero-banner-eyebrow">Loading...</p>}
      </div>
      {tracks.length > 1 && (
        <div className="hero-dots">
          {tracks.map((_, i) => (
            <button key={i} className={`hero-dot ${i === index ? 'hero-dot--active' : ''}`} onClick={() => setIndex(i)} />
          ))}
        </div>
      )}
    </div>
  )
}

function Home() {
  const player = usePlayerContext()
  return (
    <div className="home-page">
      <HeroBanner player={player} />
      <div className="home-content">
        {ROWS.map(row => <PlaylistRow key={row.label} row={row} player={player} />)}
      </div>
    </div>
  )
}

export default Home