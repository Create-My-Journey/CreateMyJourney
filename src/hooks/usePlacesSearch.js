import { useState, useEffect, useRef } from 'react'
import { searchPlaces, normaliseAttraction, normaliseAccommodation, normaliseRestaurant } from '../services/placesApi'

const NORMALISERS = {
  tourist_attraction: normaliseAttraction,
  lodging: normaliseAccommodation,
  restaurant: normaliseRestaurant,
}

/**
 * Fetches real Google Places data for a location.
 *
 * @param {string} location   - e.g. "Tokyo, Japan"
 * @param {'tourist_attraction'|'lodging'|'restaurant'} type
 * @param {number} limit
 * @returns {{ places, loading, error }}
 */
export function usePlacesSearch(location, type, limit = 12) {
  const [places, setPlaces]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // track the last fetch so stale results don't overwrite newer ones
  const fetchId = useRef(0)

  useEffect(() => {
    if (!location || !type) return

    const id = ++fetchId.current
    setLoading(true)
    setError(null)
    setPlaces([])

    searchPlaces(location, type, limit)
      .then(data => {
        if (id !== fetchId.current) return // stale
        const normalise = NORMALISERS[type] ?? normaliseAttraction
        setPlaces((data.results ?? []).map(normalise))
      })
      .catch(err => {
        if (id !== fetchId.current) return
        console.error('usePlacesSearch error:', err)
        setError(err.message ?? 'Failed to load places.')
      })
      .finally(() => {
        if (id === fetchId.current) setLoading(false)
      })
  }, [location, type, limit])

  return { places, loading, error }
}
