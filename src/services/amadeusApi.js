/**
 * amadeusApi.js
 * Client-side service that calls our Express proxy for Duffel flight data.
 * The proxy handles authentication and falls back to mock data when
 * credentials aren't configured.
 */

const BASE = '/api/transport'

async function requestJson(url, errorPrefix = 'Request failed') {
  const res = await fetch(url)
  const text = await res.text()
  if (!res.ok) {
    let details = text
    try {
      const parsed = JSON.parse(text)
      if (parsed?.error) details = parsed.error
    } catch { /* keep raw text */ }
    throw new Error(`${errorPrefix}: ${res.status} — ${details}`)
  }
  return text ? JSON.parse(text) : {}
}

/**
 * Resolve a city/place name to its IATA airport code.
 * @param {string} cityName  e.g. "Paris, France"
 * @returns {Promise<string>} e.g. "CDG"
 */
export async function getCityIata(cityName) {
  if (!cityName) return ''
  try {
    const data = await requestJson(
      `${BASE}/iata?city=${encodeURIComponent(cityName)}`,
      'IATA lookup failed'
    )
    return data.iata ?? ''
  } catch (err) {
    console.warn('getCityIata failed:', err.message)
    return cityName.slice(0, 3).toUpperCase()
  }
}

/**
 * Search for flight offers between two cities.
 * @param {object} params
 * @param {string} params.from          Origin city name (will be resolved to IATA)
 * @param {string} params.to            Destination city name
 * @param {string} [params.date]        YYYY-MM-DD, defaults to 30 days from now
 * @param {number} [params.adults]      Number of passengers, default 1
 * @returns {Promise<{ flights: FlightOffer[], source: string }>}
 */
export async function searchFlights({ from, to, date, adults = 1 }) {
  if (!from || !to) return { flights: [], source: 'none' }

  // Resolve both city names to IATA codes in parallel
  const [fromIata, toIata] = await Promise.all([
    getCityIata(from),
    getCityIata(to),
  ])

  const params = new URLSearchParams({
    from: fromIata,
    to: toIata,
    adults: String(adults),
  })
  if (date) params.set('date', date)

  try {
    return await requestJson(`${BASE}/flights?${params}`, 'Flight search failed')
  } catch (err) {
    console.error('searchFlights error:', err.message)
    return { flights: [], source: 'error', error: err.message }
  }
}

/**
 * Get ground transport options (train or bus) between two cities.
 * These are always estimated — real booking requires Amadeus Enterprise.
 * @param {object} params
 * @param {string} params.from   Origin city name
 * @param {string} params.to     Destination city name
 * @param {'train'|'bus'|'all'} [params.mode]  Default 'all'
 * @returns {Promise<{ options: GroundOption[], source: string }>}
 */
export async function searchGroundTransport({ from, to, mode = 'all' }) {
  if (!from || !to) return { options: [], source: 'none' }

  const params = new URLSearchParams({ from, to, mode })
  try {
    return await requestJson(`${BASE}/ground?${params}`, 'Ground transport search failed')
  } catch (err) {
    console.error('searchGroundTransport error:', err.message)
    return { options: [], source: 'error', error: err.message }
  }
}
