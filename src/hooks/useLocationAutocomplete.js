import { useState, useEffect, useRef } from 'react'
import { autocompleteLocation } from '../services/placesApi'

const DEBOUNCE_MS = 300

/**
 * Hook that provides debounced Google Places location autocomplete.
 *
 * @param {string} input - the raw text the user is typing
 * @returns {{
 *   suggestions: Array<{ placeId: string, description: string }>,
 *   loading: boolean,
 *   error: string | null,
 *   clearSuggestions: () => void,
 * }}
 */
export function useLocationAutocomplete(input) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  // Cancel stale fetches
  const fetchId = useRef(0)
  // Hold the debounce timer
  const timer   = useRef(null)

  useEffect(() => {
    // Clear previous timer on every keystroke
    clearTimeout(timer.current)

    if (!input || input.trim().length < 2) {
      setSuggestions([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)

    timer.current = setTimeout(async () => {
      const id = ++fetchId.current

      try {
        const results = await autocompleteLocation(input)
        if (id !== fetchId.current) return // stale response, ignore
        setSuggestions(results)
        setError(null)
      } catch (err) {
        if (id !== fetchId.current) return
        console.error('useLocationAutocomplete error:', err)
        setError(err.message ?? 'Autocomplete failed.')
        setSuggestions([])
      } finally {
        if (id === fetchId.current) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer.current)
  }, [input])

  const clearSuggestions = () => {
    setSuggestions([])
    setError(null)
  }

  return { suggestions, loading, error, clearSuggestions }
}