const KEY = import.meta.env.VITE_OMDB_API_KEY as string | undefined

/** Fetch poster URL for a given imdbID from OMDB. Returns null if unavailable. */
export async function fetchPoster(imdbId: string): Promise<string | null> {
  if (!KEY || !imdbId) return null
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${KEY}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.Poster && data.Poster !== 'N/A' ? (data.Poster as string) : null
  } catch {
    return null
  }
}
