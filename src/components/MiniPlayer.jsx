// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'

function MiniPlayer({ track, isPlaying, progress, duration, onPlayPause, onSeek }) {
  if (!track) return null

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const pct = duration ? (progress / duration) * 100 : 0

  return (
    <AnimatePresence>
      <motion.div
        className="mini-player"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        <div className="mini-player-inner">
          <div className="mini-player-left">
            <div className="mini-player-art">
              {track.artworkUrl100
                ? <img src={track.artworkUrl100} alt={track.trackName} />
                : <div className="mini-player-no-art">♪</div>}
            </div>
            <div className="mini-player-info">
              <span className="mini-player-title">{track.trackName}</span>
              <span className="mini-player-artist">{track.artistName}</span>
            </div>
          </div>

          <div className="mini-player-center">
            <button className="mini-player-btn" onClick={onPlayPause}>
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                  <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.14v14l11-7-11-7z"/>
                </svg>
              )}
            </button>
          </div>

          <div className="mini-player-right">
            <span className="mini-player-time">{fmt(progress)}</span>
            <div
              className="mini-player-track"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                onSeek(((e.clientX - rect.left) / rect.width) * duration)
              }}
            >
              <div className="mini-player-track-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="mini-player-time">{fmt(duration)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default MiniPlayer