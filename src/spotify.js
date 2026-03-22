// iTunes-based music data

export async function getTopTracks(limit = 12) {
  const res = await fetch(`https://itunes.apple.com/us/rss/topsongs/limit=${limit}/json`)
  const data = await res.json()
  const entries = data?.feed?.entry || []
  return entries.map(e => ({
    id: e.id?.attributes?.['im:id'],
    name: e['im:name']?.label,
    artistName: e['im:artist']?.label,
    artistId: e['im:artist']?.attributes?.href?.split('/id')?.[1]?.split('?')?.[0],
    image: e['im:image']?.[2]?.label?.replace('170x170', '400x400'),
    previewUrl: e.link?.find?.(l => l?.attributes?.type === 'audio/x-m4a')?.attributes?.href || null,
    album: e['im:collection']?.['im:name']?.label || '',
  })).filter(t => t.id && t.image)
}

export async function getGenreTracks(searchTerm, limit = 12) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=${limit * 2}&sort=recent`
  const res = await fetch(url)
  const data = await res.json()
  return (data?.results || [])
    .filter(t => t.artworkUrl100 && t.previewUrl)
    .slice(0, limit)
    .map(t => ({
      id: String(t.trackId),
      name: t.trackName,
      artistName: t.artistName,
      artistId: String(t.artistId),
      image: t.artworkUrl100?.replace('100x100', '400x400'),
      previewUrl: t.previewUrl || null,
      album: t.collectionName,
    }))
}

export async function searchTracks(query, limit = 12) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
  const res = await fetch(url)
  const data = await res.json()
  return (data?.results || []).map(t => ({
    id: String(t.trackId),
    name: t.trackName,
    artistName: t.artistName,
    artistId: String(t.artistId),
    image: t.artworkUrl100?.replace('100x100', '400x400'),
    previewUrl: t.previewUrl || null,
    album: t.collectionName,
  })).filter(t => t.image)
}

export async function searchArtists(query, limit = 6) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=${limit}`
  const res = await fetch(url)
  const data = await res.json()
  const artists = data?.results || []
  const enriched = await Promise.all(
    artists.slice(0, 6).map(async a => {
      try {
        const albumRes = await fetch(`https://itunes.apple.com/lookup?id=${a.artistId}&entity=album&limit=1`)
        const albumData = await albumRes.json()
        const album = albumData?.results?.find(r => r.wrapperType === 'collection')
        return { id: String(a.artistId), name: a.artistName, image: album?.artworkUrl100?.replace('100x100', '400x400') || null, genre: a.primaryGenreName }
      } catch {
        return { id: String(a.artistId), name: a.artistName, image: null, genre: '' }
      }
    })
  )
  return enriched.filter(a => a.image)
}

export async function getArtistTopTracks(artistId, limit = 10) {
  const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=${limit}`
  const res = await fetch(url)
  const data = await res.json()
  return (data?.results || [])
    .filter(r => r.wrapperType === 'track')
    .map(t => ({
      id: String(t.trackId),
      name: t.trackName,
      artistName: t.artistName,
      artistId: String(t.artistId),
      image: t.artworkUrl100?.replace('100x100', '400x400'),
      previewUrl: t.previewUrl || null,
      album: t.collectionName,
      duration: t.trackTimeMillis,
    })).filter(t => t.image)
}

export async function getArtistInfo(artistId) {
  const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=8`
  const res = await fetch(url)
  const data = await res.json()
  const results = data?.results || []
  const artist = results.find(r => r.wrapperType === 'artist')
  const albums = results.filter(r => r.wrapperType === 'collection')
  return { artist, albums }
}