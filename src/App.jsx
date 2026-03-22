import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import MiniPlayer from './components/MiniPlayer'
import Home from './pages/Home'
import Search from './pages/Search'
import Artist from './pages/Artist'
import Favourites from './pages/Favourites'
import usePlayer from './hooks/usePlayer'
import { PlayerContext } from './PlayerContext'

function AppInner() {
  const player = usePlayer()

  return (
    <PlayerContext.Provider value={player}>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/favourites" element={<Favourites />} />
          </Routes>
        </main>
      </div>
      <MiniPlayer
        track={player.currentTrack}
        isPlaying={player.isPlaying}
        progress={player.progress}
        duration={player.duration}
        onPlayPause={() => player.isPlaying ? player.pause() : player.resume()}
        onSeek={player.seek}
      />
    </PlayerContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter basename="/wavelength/">
      <AppInner />
    </BrowserRouter>
  )
}

export default App