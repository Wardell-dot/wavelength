import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import TrackCard from '../components/TrackCard'
import SkeletonCard from '../components/SkeletonCard'
import { usePlayerContext } from '../PlayerContext'
import { searchTracks, searchArtists } from '../spotify'

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [tracks, setTracks] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const player = usePlayerContext()
  const navigate = useNavigate()
  const debounceRef = useRef(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (!q) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSearched(true)
      try {
        const [t, a] = await Promise.all([searchTracks(q, 12), searchArtists(q, 6)])
        setTracks(t)
        setArtists(a)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [searchParams])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchParams({ q: query.trim() })
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1 className="page-title">Search</h1>
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" type="text" placeholder="Artists, tracks, albums..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          </div>
          <button className="search-btn" type="submit">Search</button>
        </form>
      </div>

      {loading && (
        <div className="page-content">
          <div className="genre-row-scroll">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {!loading && searched && tracks.length === 0 && artists.length === 0 && (
        <div className="page-content"><p className="empty-msg">No results for &quot;{searchParams.get('q')}&quot;</p></div>
      )}

      {!loading && (artists.length > 0 || tracks.length > 0) && (
        <div className="page-content">
          {artists.length > 0 && (
            <section className="genre-row">
              <div className="genre-row-header"><h2 className="genre-row-title">Artists</h2></div>
              <div className="genre-row-scroll">
                {artists.map((a, i) => (
                  <motion.div key={a.id} className="similar-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => navigate(`/artist/${a.id}`)}>
                    <div className="similar-card-art similar-card-art--circle">
                      {a.image ? <img src={a.image} alt={a.name} /> : <div className="similar-card-no-img">♪</div>}
                    </div>
                    <p className="similar-card-name">{a.name}</p>
                    <p className="similar-card-label">Artist</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {tracks.length > 0 && (
            <section className="genre-row">
              <div className="genre-row-header"><h2 className="genre-row-title">Tracks</h2></div>
              <div className="genre-row-scroll">
                {tracks.map((track, i) => (
                  <TrackCard key={track.id} track={track} index={i} onPlay={player.play} currentTrack={player.currentTrack} isPlaying={player.isPlaying} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default Search