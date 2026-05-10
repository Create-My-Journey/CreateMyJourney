import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'

const app  = express()
const PORT = 3001

const API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!API_KEY) {
  console.error('❌  GOOGLE_MAPS_API_KEY is not set. Add it to your .env file.')
  process.exit(1)
}

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

// ── Text search (used by attractions, accommodation, restaurants) ──
async function textSearch(location, type, limit) {
  const query = `${type.replace(/_/g, ' ')} in ${location}`
  const url = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`
  const res  = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status} — ${data.error_message ?? ''}`)
  }
  return (data.results ?? []).slice(0, limit)
}

// GET /api/places/search?location=Tokyo,Japan&type=tourist_attraction&limit=12
app.get('/api/places/search', async (req, res) => {
  const { location, type, limit = '12' } = req.query
  if (!location || !type) return res.status(400).json({ error: 'location and type are required' })

  try {
    const results = await textSearch(location, type, parseInt(limit, 10))
    res.json({ results })
  } catch (err) {
    console.error('/api/places/search error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/places/autocomplete?input=toky
app.get('/api/places/autocomplete', async (req, res) => {
  const { input } = req.query
  if (!input || input.trim().length < 2) return res.json({ predictions: [] })

  try {
    const url = `${PLACES_BASE}/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${API_KEY}`
    const r    = await fetch(url)
    const data = await r.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Autocomplete API error: ${data.status} — ${data.error_message ?? ''}`)
    }

    const predictions = (data.predictions ?? []).slice(0, 6).map(p => ({
      placeId:     p.place_id,
      description: p.description,
    }))
    res.json({ predictions })
  } catch (err) {
    console.error('/api/places/autocomplete error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/places/photo?ref=<photo_reference>&maxWidth=440
app.get('/api/places/photo', async (req, res) => {
  const { ref, maxWidth = '440' } = req.query
  if (!ref) return res.status(400).json({ error: 'ref is required' })

  try {
    const url      = `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photoreference=${encodeURIComponent(ref)}&key=${API_KEY}`
    const photoRes = await fetch(url)
    if (!photoRes.ok) return res.status(photoRes.status).send('Photo fetch failed')

    res.set('Content-Type', photoRes.headers.get('content-type') ?? 'image/jpeg')
    res.set('Cache-Control', 'public, max-age=86400')
    photoRes.body.pipe(res)
  } catch (err) {
    console.error('/api/places/photo error:', err.message)
    res.status(500).send('Photo proxy error')
  }
})

app.listen(PORT, () => {
  console.log(`✅  Places proxy running at http://localhost:${PORT}`)
})