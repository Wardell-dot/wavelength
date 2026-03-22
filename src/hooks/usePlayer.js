import { useState, useRef, useEffect } from 'react'

function usePlayer() {
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => { setIsPlaying(false); setProgress(0) }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
  }, [])

  const play = (track) => {
    const audio = audioRef.current
    if (!audio) return

    if (!track.previewUrl) {
      setCurrentTrack(track)
      return
    }

    if (currentTrack?.trackId === track.trackId) {
      if (isPlaying) { audio.pause(); setIsPlaying(false) }
      else { audio.play(); setIsPlaying(true) }
      return
    }

    audio.pause()
    audio.src = track.previewUrl
    audio.load()
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgress(0)
    setDuration(0)
  }

  const pause = () => { audioRef.current?.pause(); setIsPlaying(false) }
  const resume = () => { audioRef.current?.play(); setIsPlaying(true) }
  const seek = (time) => {
    if (audioRef.current) audioRef.current.currentTime = time
    setProgress(time)
  }

  return { currentTrack, isPlaying, progress, duration, play, pause, resume, seek }
}

export default usePlayer