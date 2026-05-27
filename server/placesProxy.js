import 'dotenv/config'
import express from 'express'
import fetch from 'node-fetch'

const app  = express()
const PORT = 3001

// google maps
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY
if (!GOOGLE_API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY is not set. Add it to your .env file.')
  process.exit(1)
}

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

// Text search (used by attractions, accommodation, restaurants)
async function textSearch(location, type, limit) {
  const query = `${type.replace(/_/g, ' ')} in ${location}`
  const url = `${PLACES_BASE}/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`
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
    const url = `${PLACES_BASE}/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${GOOGLE_API_KEY}`
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
    const url      = `${PLACES_BASE}/photo?maxwidth=${maxWidth}&photoreference=${encodeURIComponent(ref)}&key=${GOOGLE_API_KEY}`
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

// duffel
const DUFFEL_KEY  = process.env.DUFFEL_API_KEY
const DUFFEL_BASE = 'https://api.duffel.com'

const duffelHasCredentials = () =>
  DUFFEL_KEY &&
  DUFFEL_KEY !== 'YOUR_DUFFEL_API_KEY_HERE'

// Duffel uses a static Bearer token — no OAuth flow needed!
function duffelHeaders() {
  return {
    Authorization: `Bearer ${DUFFEL_KEY}`,
    'Duffel-Version': 'v2',
    'Content-Type':  'application/json',
    Accept:          'application/json',
  }
}

async function getGoogleTransitOptions(from, to, transitMode) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&mode=transit&transit_mode=${transitMode}&alternatives=true&key=${GOOGLE_API_KEY}`
  try {
    const r = await fetch(url)
    const data = await r.json()
    if (data.status !== 'OK') return []

    return data.routes.map((route, idx) => {
      const leg = route.legs[0]
      const transitStep = leg.steps.find(s => s.travel_mode === 'TRANSIT')
      const transitDetails = transitStep?.transit_details
      
      const vType = transitDetails?.line?.vehicle?.type || ''
      const isBus = vType.includes('BUS') || vType === 'COACH'
      const isTrain = vType.includes('RAIL') || vType.includes('TRAIN') || vType === 'SUBWAY' || vType === 'TRAM'

      if (transitMode === 'bus' && !isBus) return null
      if (transitMode === 'train' && !isTrain) return null

      const provider = transitDetails?.line?.agencies?.[0]?.name || transitDetails?.line?.short_name || 'Transit Route'
      const departure = transitDetails?.departure_time?.text || '--:--'
      const arrival = transitDetails?.arrival_time?.text || '--:--'
      const duration = leg.duration.text
      const durationMins = Math.round(leg.duration.value / 60)
      
      return {
        id: `google-${transitMode}-${idx}`,
        mode: transitMode,
        provider,
        departure,
        arrival,
        duration,
        durationMins,
        price: null,
        currency: 'EUR',
        class: 'Standard',
        stops: Math.max(0, leg.steps.filter(s => s.travel_mode === 'TRANSIT').length - 1),
        isMock: false,
        isEstimate: true,
      }
    }).filter(Boolean)
  } catch (err) {
    console.error(`Google Transit error (${transitMode}):`, err.message)
    return []
  }
}


// duffle
function duffelOfferToShape(offer) {
  try {
    const slice    = offer.slices?.[0]
    const seg      = slice?.segments?.[0]
    const lastSeg  = slice?.segments?.slice(-1)[0]
    const stops    = (slice?.segments?.length ?? 1) - 1

    const airline     = seg?.operating_carrier?.name ?? seg?.marketing_carrier?.name ?? 'Unknown'
    const airlineCode = seg?.marketing_carrier?.iata_code ?? ''

    const depTime = seg?.departing_at?.slice(11, 16) ?? '--:--'
    const arrTime = lastSeg?.arriving_at?.slice(11, 16) ?? '--:--'

    const price        = parseFloat(offer.total_amount ?? 0)
    const currency     = offer.total_currency ?? 'EUR'
    const adults       = offer.passengers?.length ?? 1
    const pricePerPerson = adults > 0 ? Math.round(price / adults) : price

    // Duration from slice (ISO 8601: P1DT2H30M or PT2H30M)
    const rawDur  = slice?.duration ?? 'PT0H'
    const durMatch = rawDur.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/)
    const durDays = parseInt(durMatch?.[1] ?? '0', 10)
    const durH = parseInt(durMatch?.[2] ?? '0', 10) + (durDays * 24)
    const durM = parseInt(durMatch?.[3] ?? '0', 10)
    const duration = `${durH}h${durM > 0 ? ` ${durM}m` : ''}`

    const cabin = offer.slices?.[0]?.fare_brand_name
      ?? offer.passengers?.[0]?.cabin_class_marketing_name
      ?? 'Economy'

    return {
      id: offer.id,
      airline,
      airlineCode,
      airlineLogo: '✈️',
      departure: depTime,
      arrival: arrTime,
      duration,
      durationMins: durH * 60 + durM,
      stops,
      stopsLabel: stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`,
      price,
      pricePerPerson,
      currency,
      cabin,
      isMock: false,
    }
  } catch {
    return null
  }
}

// GET /api/transport/iata?city=Bucharest
app.get('/api/transport/iata', async (req, res) => {
  const { city } = req.query
  if (!city) return res.status(400).json({ error: 'city is required' })

  // Static mapping for common cities (avoids API call, always works)
  const KNOWN = {
    'bucharest': 'OTP', 'london': 'LHR', 'paris': 'CDG', 'new york': 'JFK',
    'berlin': 'BER', 'rome': 'FCO', 'madrid': 'MAD', 'barcelona': 'BCN',
    'amsterdam': 'AMS', 'vienna': 'VIE', 'brussels': 'BRU', 'athens': 'ATH',
    'istanbul': 'IST', 'dubai': 'DXB', 'tokyo': 'NRT', 'bangkok': 'BKK',
    'singapore': 'SIN', 'sydney': 'SYD', 'toronto': 'YYZ', 'los angeles': 'LAX',
    'chicago': 'ORD', 'miami': 'MIA', 'lisbon': 'LIS', 'prague': 'PRG',
    'warsaw': 'WAW', 'budapest': 'BUD', 'sofia': 'SOF', 'zagreb': 'ZAG',
    'belgrade': 'BEG', 'kiev': 'KBP', 'kyiv': 'KBP', 'moscow': 'SVO',
    'milan': 'MXP', 'naples': 'NAP', 'frankfurt': 'FRA', 'munich': 'MUC',
    'zurich': 'ZRH', 'geneva': 'GVA', 'oslo': 'OSL', 'stockholm': 'ARN',
    'copenhagen': 'CPH', 'helsinki': 'HEL', 'dublin': 'DUB', 'edinburgh': 'EDI',
    'porto': 'OPO', 'seville': 'SVQ', 'valencia': 'VLC', 'krakow': 'KRK',
    'cluj-napoca': 'CLJ', 'timisoara': 'TSR', 'iasi': 'IAS', 'constanta': 'CND',
  }

  const cityLower = city.toLowerCase().split(',')[0].trim()
  const known = KNOWN[cityLower]
  if (known) return res.json({ iata: known, source: 'static' })

  // If no Duffel credentials, return derived code
  if (!duffelHasCredentials()) {
    const derived = cityLower.slice(0, 3).toUpperCase()
    return res.json({ iata: derived, source: 'derived', warning: 'No Duffel credentials — derived IATA code may be inaccurate' })
  }

  // Try Duffel Airports lookup
  try {
    const r = await fetch(
      `${DUFFEL_BASE}/air/airports?iata_city_code=&iata_country_code=&iata_code=&name=${encodeURIComponent(cityLower)}&limit=1`,
      { headers: duffelHeaders() }
    )
    if (!r.ok) throw new Error(`Duffel IATA lookup failed: ${r.status}`)
    const data = await r.json()
    const iata = data.data?.[0]?.iata_code ?? cityLower.slice(0, 3).toUpperCase()
    return res.json({ iata, source: 'duffel' })
  } catch (err) {
    console.error('/api/transport/iata error:', err.message)
    const derived = cityLower.slice(0, 3).toUpperCase()
    return res.json({ iata: derived, source: 'derived', warning: err.message })
  }
})

// GET /api/transport/flights?from=OTP&to=CDG&date=2026-06-15&adults=2
app.get('/api/transport/flights', async (req, res) => {
  const { from, to, date, adults = '1' } = req.query
  if (!from || !to) return res.status(400).json({ error: 'from and to are required' })

  const searchDate = date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const adultsNum  = Math.max(1, parseInt(adults, 10))

  if (!duffelHasCredentials()) {
    return res.json({ flights: [], source: 'none', warning: 'Duffel API key missing' })
  }

  try {
    // Step 1 — Create an offer request
    const offerReqBody = {
      data: {
        slices: [{ origin: from, destination: to, departure_date: searchDate }],
        passengers: Array.from({ length: adultsNum }, () => ({ type: 'adult' })),
        cabin_class: 'economy',
      }
    }
    const orRes = await fetch(`${DUFFEL_BASE}/air/offer_requests?return_offers=true`, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify(offerReqBody),
    })
    if (!orRes.ok) {
      const errText = await orRes.text()
      throw new Error(`Duffel offer_requests error ${orRes.status}: ${errText.slice(0, 300)}`)
    }
    const orData = await orRes.json()

    // Offers come back inline when return_offers=true
    const rawOffers = orData.data?.offers ?? []
    
    const parsedFlights = rawOffers
      .map(duffelOfferToShape)
      .filter(Boolean)
      .sort((a, b) => a.price - b.price)

    const uniqueFlights = []
    const seen = new Set()
    for (const f of parsedFlights) {
      const sig = `${f.airlineCode}-${f.departure}-${f.arrival}-${f.stops}`
      if (!seen.has(sig)) {
        seen.add(sig)
        uniqueFlights.push(f)
      }
      if (uniqueFlights.length >= 6) break
    }

    if (uniqueFlights.length === 0) {
      return res.json({ flights: [], source: 'none', reason: 'No flights found for this route.' })
    }
    return res.json({ flights: uniqueFlights, source: 'duffel' })
  } catch (err) {
    console.error('/api/transport/flights error:', err.message)
    return res.json({ flights: [], source: 'error', error: err.message })
  }
})

// GET /api/transport/ground?from=Paris&to=Lyon&mode=train (or bus or all)
app.get('/api/transport/ground', async (req, res) => {
  const { from = '', to = '', mode = 'all' } = req.query
  if (!from || !to) return res.status(400).json({ error: 'from and to are required' })

  let options = []
  if (mode === 'train' || mode === 'all') {
    const trainOpts = await getGoogleTransitOptions(from, to, 'train')
    options = options.concat(trainOpts)
  }
  if (mode === 'bus' || mode === 'all') {
    const busOpts = await getGoogleTransitOptions(from, to, 'bus')
    options = options.concat(busOpts)
  }

  // Google Maps doesn't provide reliable intercity prices, so we leave price null
  return res.json({ options, source: 'google', note: 'Data provided by Google Maps. Prices are unavailable for this route.' })
})

// GET /api/transport/directions?origin=...&destination=...&mode=transit
app.get('/api/transport/directions', async (req, res) => {
  const { origin, destination, mode = 'transit' } = req.query
  if (!origin || !destination) return res.status(400).json({ error: 'origin and destination are required' })

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${GOOGLE_API_KEY}`

  try {
    const r = await fetch(url)
    const data = await r.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
       throw new Error(`Google Directions API error: ${data.status} — ${data.error_message || ''}`)
    }
    return res.json(data)
  } catch(err) {
    console.error('/api/transport/directions error:', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// ─────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Places + Transport proxy running at http://localhost:${PORT}`)
  if (!duffelHasCredentials()) {
    console.warn('⚠  Duffel API key not set — Transport will use mock data. Add DUFFEL_API_KEY to .env')
  } else {
    console.log('✓  Duffel API key detected — real flight data enabled')
  }
})